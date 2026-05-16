import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { pool } from "@workspace/db";
import { resolveAuthRedirectUri } from "./auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_OAUTH_SCOPE = "https://www.googleapis.com/auth/youtube";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

type Queryable = Pick<typeof pool, "query">;

type YouTubeOauthStatePayload = {
  v: 1;
  flow: "youtube";
  accountId: string;
  redirectUri: string;
  issuedAt: number;
  nonce: string;
};

type YouTubeTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
};

type YouTubeChannelsResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
        high?: { url?: string };
      };
    };
  }>;
  error?: {
    message?: string;
  };
};

type YouTubePlaylistResponse = {
  id?: string;
  snippet?: {
    title?: string;
  };
  error?: {
    message?: string;
  };
};

type YouTubeConnectionRow = {
  account_id: string;
  encrypted_refresh_token: string;
  granted_scopes: string | null;
  channel_id: string | null;
  channel_title: string | null;
  channel_thumbnail_url: string | null;
};

export class YouTubeIntegrationError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
  }
}

export type YouTubeConnectionStatus = {
  connected: boolean;
  channelId: string | null;
  channelTitle: string | null;
  channelThumbnailUrl: string | null;
};

export type ConnectedYouTubeAccount = {
  channelId: string;
  channelTitle: string | null;
  channelThumbnailUrl: string | null;
};

export type CreateYouTubePlaylistInput = {
  title: string;
  description?: string;
  privacyStatus?: "private" | "unlisted" | "public";
  videoIds: string[];
};

export type CreateYouTubePlaylistResult = {
  playlistId: string;
  playlistUrl: string;
  title: string;
  addedCount: number;
  failedVideoIds: string[];
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

function getStateSigningSecret(): string {
  return process.env.SESSION_SECRET?.trim() || process.env.JWT_SECRET?.trim() || requiredEnv("SESSION_SECRET");
}

function encodeStatePayload(payload: YouTubeOauthStatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function signStatePayload(encodedPayload: string): string {
  return createHmac("sha256", getStateSigningSecret()).update(encodedPayload).digest("base64url");
}

function createYouTubeOauthState(accountId: string, redirectUri: string): string {
  const payload: YouTubeOauthStatePayload = {
    v: 1,
    flow: "youtube",
    accountId: accountId.trim(),
    redirectUri: resolveAuthRedirectUri(redirectUri),
    issuedAt: Date.now(),
    nonce: randomBytes(12).toString("base64url"),
  };

  const encodedPayload = encodeStatePayload(payload);
  return `${encodedPayload}.${signStatePayload(encodedPayload)}`;
}

function parseYouTubeOauthState(rawState: string): YouTubeOauthStatePayload {
  const [encodedPayload, signature] = rawState.split(".");
  if (!encodedPayload || !signature) {
    throw new YouTubeIntegrationError("Invalid YouTube OAuth state");
  }

  const expectedSignature = signStatePayload(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new YouTubeIntegrationError("Invalid YouTube OAuth state");
  }

  let payload: YouTubeOauthStatePayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as YouTubeOauthStatePayload;
  } catch {
    throw new YouTubeIntegrationError("Invalid YouTube OAuth state");
  }

  if (
    payload.v !== 1 ||
    payload.flow !== "youtube" ||
    !payload.accountId?.trim() ||
    Date.now() - payload.issuedAt > OAUTH_STATE_TTL_MS
  ) {
    throw new YouTubeIntegrationError("Expired YouTube OAuth state");
  }

  return {
    ...payload,
    accountId: payload.accountId.trim(),
    redirectUri: resolveAuthRedirectUri(payload.redirectUri),
  };
}

function getTokenEncryptionKey(): Buffer {
  const raw =
    process.env.TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.ENCRYPTION_KEY?.trim() ||
    getStateSigningSecret();

  try {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // Fall through to hash-based derivation.
  }

  return createHash("sha256").update(raw, "utf8").digest();
}

function encryptRefreshToken(refreshToken: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getTokenEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(refreshToken, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

function decryptRefreshToken(encryptedValue: string): string {
  const payload = Buffer.from(encryptedValue, "base64url");
  if (payload.length < 29) {
    throw new YouTubeIntegrationError("Stored YouTube token is invalid", 500);
  }

  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", getTokenEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function getChannelThumbnailUrl(channel: NonNullable<YouTubeChannelsResponse["items"]>[number]): string | null {
  return (
    channel.snippet?.thumbnails?.high?.url ??
    channel.snippet?.thumbnails?.medium?.url ??
    channel.snippet?.thumbnails?.default?.url ??
    null
  );
}

function normalizePlaylistPrivacyStatus(value: string | undefined): "private" | "unlisted" | "public" {
  return value === "private" || value === "public" || value === "unlisted" ? value : "unlisted";
}

function normalizePlaylistTitle(value: string): string {
  const title = value.trim();
  if (!title) {
    throw new YouTubeIntegrationError("Playlist title is required");
  }
  return title.slice(0, 150);
}

function normalizePlaylistDescription(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 5000);
}

function normalizeVideoIds(videoIds: string[]): string[] {
  const normalized = videoIds
    .map((videoId) => videoId.trim())
    .filter((videoId) => /^[A-Za-z0-9_-]{11}$/.test(videoId));

  if (normalized.length === 0) {
    throw new YouTubeIntegrationError("No valid YouTube video IDs were provided");
  }

  return normalized;
}

async function exchangeCodeForYouTubeTokens(
  code: string,
  googleRedirectUri: string,
): Promise<Required<Pick<YouTubeTokenResponse, "access_token">> & YouTubeTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as YouTubeTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new YouTubeIntegrationError(
      data.error_description || data.error || "YouTube token exchange failed",
    );
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    scope: data.scope,
  };
}

async function exchangeRefreshTokenForAccessToken(encryptedRefreshToken: string): Promise<string> {
  const refreshToken = decryptRefreshToken(encryptedRefreshToken);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as YouTubeTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    if (data.error === "invalid_grant" || data.error === "unauthorized_client") {
      throw new YouTubeIntegrationError("YouTube connection expired. Reconnect your account.", 401);
    }

    throw new YouTubeIntegrationError(
      data.error_description || data.error || "Could not refresh YouTube access token",
    );
  }

  return data.access_token;
}

async function fetchConnectedChannel(accessToken: string): Promise<ConnectedYouTubeAccount> {
  const response = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=id,snippet&mine=true`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as YouTubeChannelsResponse;
  if (!response.ok) {
    throw new YouTubeIntegrationError(data.error?.message || "Could not fetch YouTube channel");
  }

  const channel = data.items?.[0];
  if (!channel?.id) {
    throw new YouTubeIntegrationError("No YouTube channel is available for this Google account");
  }

  return {
    channelId: channel.id,
    channelTitle: channel.snippet?.title ?? null,
    channelThumbnailUrl: getChannelThumbnailUrl(channel),
  };
}

async function getYouTubeConnection(
  accountId: string,
  queryable: Queryable = pool,
): Promise<YouTubeConnectionRow | null> {
  const result = await queryable.query<YouTubeConnectionRow>(
    `
      select
        account_id,
        encrypted_refresh_token,
        granted_scopes,
        channel_id,
        channel_title,
        channel_thumbnail_url
      from mosaic_beats.youtube_connections
      where account_id = $1
      limit 1
    `,
    [accountId],
  );

  return result.rows[0] ?? null;
}

async function upsertYouTubeConnection(
  queryable: Queryable,
  accountId: string,
  input: {
    refreshToken: string;
    grantedScopes: string | null;
    channel: ConnectedYouTubeAccount;
  },
): Promise<void> {
  await queryable.query(
    `
      insert into mosaic_beats.youtube_connections (
        account_id,
        encrypted_refresh_token,
        granted_scopes,
        channel_id,
        channel_title,
        channel_thumbnail_url
      )
      values ($1, $2, $3, $4, $5, $6)
      on conflict (account_id)
      do update set
        encrypted_refresh_token = excluded.encrypted_refresh_token,
        granted_scopes = excluded.granted_scopes,
        channel_id = excluded.channel_id,
        channel_title = excluded.channel_title,
        channel_thumbnail_url = excluded.channel_thumbnail_url,
        updated_at = now()
    `,
    [
      accountId,
      encryptRefreshToken(input.refreshToken),
      input.grantedScopes,
      input.channel.channelId,
      input.channel.channelTitle,
      input.channel.channelThumbnailUrl,
    ],
  );
}

function buildRedirectUrl(url: string, params: Record<string, string>): string {
  const redirectUrl = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    redirectUrl.searchParams.set(key, value);
  }
  return redirectUrl.toString();
}

async function insertPlaylistItems(
  accessToken: string,
  playlistId: string,
  videoIds: string[],
): Promise<{ addedCount: number; failedVideoIds: string[] }> {
  const failedVideoIds: string[] = [];
  let addedCount = 0;

  for (const videoId of videoIds) {
    const response = await fetch(`${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId,
          },
        },
      }),
    });

    if (!response.ok) {
      failedVideoIds.push(videoId);
      continue;
    }

    addedCount += 1;
  }

  return { addedCount, failedVideoIds };
}

export function buildYouTubeOauthStartUrl(
  accountId: string,
  redirectUri: string,
  googleRedirectUri: string,
): string {
  const state = createYouTubeOauthState(accountId, redirectUri);
  const oauthUrl = new URL(GOOGLE_AUTH_URL);

  oauthUrl.searchParams.set("client_id", requiredEnv("GOOGLE_CLIENT_ID"));
  oauthUrl.searchParams.set("redirect_uri", googleRedirectUri);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("scope", YOUTUBE_OAUTH_SCOPE);
  oauthUrl.searchParams.set("access_type", "offline");
  oauthUrl.searchParams.set("include_granted_scopes", "true");
  oauthUrl.searchParams.set("prompt", "consent");
  oauthUrl.searchParams.set("state", state);

  return oauthUrl.toString();
}

export async function getYouTubeConnectionStatus(accountId: string): Promise<YouTubeConnectionStatus> {
  const connection = await getYouTubeConnection(accountId);
  if (!connection) {
    return {
      connected: false,
      channelId: null,
      channelTitle: null,
      channelThumbnailUrl: null,
    };
  }

  return {
    connected: true,
    channelId: connection.channel_id,
    channelTitle: connection.channel_title,
    channelThumbnailUrl: connection.channel_thumbnail_url,
  };
}

export async function completeYouTubeOauth(
  code: string,
  rawState: string,
  googleRedirectUri: string,
): Promise<ConnectedYouTubeAccount> {
  const state = parseYouTubeOauthState(rawState);
  const tokenData = await exchangeCodeForYouTubeTokens(code, googleRedirectUri);
  const refreshToken = tokenData.refresh_token?.trim();
  const client = await pool.connect();
  let didBegin = false;

  try {
    const existingConnection = await getYouTubeConnection(state.accountId, client);
    const fallbackRefreshToken = existingConnection
      ? decryptRefreshToken(existingConnection.encrypted_refresh_token)
      : "";
    const usableRefreshToken = refreshToken || fallbackRefreshToken;

    if (!usableRefreshToken) {
      throw new YouTubeIntegrationError("Google did not return a YouTube refresh token. Try reconnecting.");
    }

    const channel = await fetchConnectedChannel(tokenData.access_token);

    await client.query("begin");
    didBegin = true;
    await upsertYouTubeConnection(client, state.accountId, {
      refreshToken: usableRefreshToken,
      grantedScopes: tokenData.scope ?? existingConnection?.granted_scopes ?? null,
      channel,
    });
    await client.query("commit");
    didBegin = false;

    return channel;
  } catch (error) {
    if (didBegin) {
      await client.query("rollback");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function createYouTubePlaylistForAccount(
  accountId: string,
  input: CreateYouTubePlaylistInput,
): Promise<CreateYouTubePlaylistResult> {
  const connection = await getYouTubeConnection(accountId);
  if (!connection) {
    throw new YouTubeIntegrationError("YouTube account is not connected", 404);
  }

  const accessToken = await exchangeRefreshTokenForAccessToken(connection.encrypted_refresh_token);
  const videoIds = normalizeVideoIds(input.videoIds);
  const response = await fetch(`${YOUTUBE_API_BASE_URL}/playlists?part=snippet,status`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        title: normalizePlaylistTitle(input.title),
        description: normalizePlaylistDescription(input.description),
      },
      status: {
        privacyStatus: normalizePlaylistPrivacyStatus(input.privacyStatus),
      },
    }),
  });

  const data = (await response.json()) as YouTubePlaylistResponse;
  if (!response.ok || !data.id) {
    throw new YouTubeIntegrationError(data.error?.message || "Could not create YouTube playlist");
  }

  const insertion = await insertPlaylistItems(accessToken, data.id, videoIds);

  return {
    playlistId: data.id,
    playlistUrl: `https://www.youtube.com/playlist?list=${data.id}`,
    title: data.snippet?.title ?? normalizePlaylistTitle(input.title),
    addedCount: insertion.addedCount,
    failedVideoIds: insertion.failedVideoIds,
  };
}

export function buildYouTubeOauthSuccessRedirect(
  redirectUri: string,
  channel: ConnectedYouTubeAccount,
): string {
  return buildRedirectUrl(redirectUri, {
    connected: "1",
    channelId: channel.channelId,
    channelTitle: channel.channelTitle ?? "",
    channelThumbnailUrl: channel.channelThumbnailUrl ?? "",
  });
}

export function buildYouTubeOauthErrorRedirect(redirectUri: string, message: string): string {
  return buildRedirectUrl(redirectUri, { error: message });
}

export function tryResolveYouTubeRedirectUriFromState(rawState: string | undefined): string | null {
  if (!rawState) return null;
  try {
    return parseYouTubeOauthState(rawState).redirectUri;
  } catch {
    return null;
  }
}
