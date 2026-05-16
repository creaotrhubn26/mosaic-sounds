import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import {
  LEGACY_STORAGE_KEYS,
  defaultProfileState,
  normalizeProfileState,
  type AppProfileState,
} from "@/lib/profile-state";

WebBrowser.maybeCompleteAuthSession();

export type GetToken = () => Promise<string | null>;

type AppStateEnvelope = {
  clientId: string;
  accountId?: string;
  email?: string;
  state: AppProfileState;
};

export type YouTubeConnectionStatus = {
  connected: boolean;
  channelId: string | null;
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

function generateClientId(): string {
  return `mb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error.trim();
      }
    } catch {
      // Fall back to plain text parsing below.
    }
  }

  try {
    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function buildUrl(path: string): string {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  return path.startsWith("http") ? path : `${baseUrl}${path}`;
}

export function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit && explicit.trim().length > 0) {
    return trimTrailingSlash(explicit.trim());
  }

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain && domain.trim().length > 0) {
    return `https://${trimTrailingSlash(domain.trim())}`;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }

  return "";
}

export async function getOrCreateClientId(): Promise<string> {
  const existing = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.clientId);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const clientId = generateClientId();
  await AsyncStorage.setItem(LEGACY_STORAGE_KEYS.clientId, clientId);
  return clientId;
}

async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
  options?: {
    clientId?: string;
    getToken?: GetToken | null;
  },
): Promise<Response> {
  const resolvedClientId = options?.clientId ?? (await getOrCreateClientId());
  const authToken = options?.getToken ? await options.getToken() : null;

  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  headers.set("x-client-id", resolvedClientId);
  if (authToken) {
    headers.set("authorization", `Bearer ${authToken}`);
  }

  return fetch(buildUrl(path), {
    ...init,
    headers,
  });
}

async function requestAppState(
  path: string,
  init: RequestInit = {},
  clientId?: string,
  getToken?: GetToken | null,
): Promise<AppStateEnvelope> {
  const resolvedClientId = clientId ?? (await getOrCreateClientId());
  const response = await authenticatedFetch(path, init, {
    clientId: resolvedClientId,
    getToken,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `App state request failed with ${response.status}`);
  }

  const raw = (await response.json()) as {
    clientId?: string;
    accountId?: string;
    email?: string;
    state?: unknown;
  };

  return {
    clientId: raw.clientId ?? resolvedClientId,
    accountId: typeof raw.accountId === "string" ? raw.accountId : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
    state: normalizeProfileState(raw.state ?? defaultProfileState),
  };
}

function getYouTubeAuthReturnUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${trimTrailingSlash(window.location.origin)}/auth/youtube`;
  }

  return Linking.createURL("/auth/youtube");
}

export function parseYouTubeConnectionStatusFromCallbackUrl(url: string): YouTubeConnectionStatus {
  const callbackUrl = new URL(url);
  const error = callbackUrl.searchParams.get("error");
  if (error) {
    throw new Error(error);
  }

  return {
    connected: callbackUrl.searchParams.get("connected") === "1",
    channelId: callbackUrl.searchParams.get("channelId"),
    channelTitle: callbackUrl.searchParams.get("channelTitle"),
    channelThumbnailUrl: callbackUrl.searchParams.get("channelThumbnailUrl"),
  };
}

// Called right after Clerk signs a user in. Merges the anonymous client_profile (state
// accumulated while signed out) into the authenticated account_profile.
export async function syncProfileAfterSignIn(
  getToken: GetToken,
  clientId?: string,
): Promise<AppStateEnvelope> {
  const resolvedClientId = clientId ?? (await getOrCreateClientId());
  const response = await authenticatedFetch(
    "/api/auth/sync",
    { method: "POST" },
    { clientId: resolvedClientId, getToken },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Auth sync failed with ${response.status}`),
    );
  }

  const raw = (await response.json()) as {
    clientId?: string;
    accountId?: string;
    email?: string;
    state?: unknown;
  };

  return {
    clientId: raw.clientId ?? resolvedClientId,
    accountId: typeof raw.accountId === "string" ? raw.accountId : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
    state: normalizeProfileState(raw.state ?? defaultProfileState),
  };
}

export async function fetchYouTubeStatus(
  getToken: GetToken,
): Promise<YouTubeConnectionStatus> {
  const response = await authenticatedFetch(
    "/api/youtube/status",
    { method: "GET" },
    { getToken },
  );

  if (response.status === 401) {
    throw new Error("Sign in first");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `YouTube status request failed with ${response.status}`),
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return {
    connected: raw.connected === true,
    channelId: typeof raw.channelId === "string" ? raw.channelId : null,
    channelTitle: typeof raw.channelTitle === "string" ? raw.channelTitle : null,
    channelThumbnailUrl:
      typeof raw.channelThumbnailUrl === "string" ? raw.channelThumbnailUrl : null,
  };
}

export async function connectYouTubeAccount(
  getToken: GetToken,
): Promise<YouTubeConnectionStatus> {
  const redirectUri = getYouTubeAuthReturnUrl();
  const response = await authenticatedFetch(
    "/api/youtube/start",
    {
      method: "POST",
      body: JSON.stringify({ redirectUri }),
    },
    { getToken },
  );

  if (response.status === 401) {
    throw new Error("Sign in first");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `YouTube connect failed with ${response.status}`),
    );
  }

  const payload = (await response.json()) as { startUrl?: string };
  const startUrl = typeof payload.startUrl === "string" ? payload.startUrl : "";
  if (!startUrl) {
    throw new Error("YouTube connect URL is missing");
  }

  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);
  if (result.type !== "success" || !result.url) {
    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("YouTube connect was cancelled");
    }

    throw new Error("YouTube connect failed");
  }
  return parseYouTubeConnectionStatusFromCallbackUrl(result.url);
}

export async function createYouTubePlaylist(
  input: CreateYouTubePlaylistInput,
  getToken: GetToken,
): Promise<CreateYouTubePlaylistResult> {
  const response = await authenticatedFetch(
    "/api/youtube/playlists",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { getToken },
  );

  if (response.status === 401) {
    throw new Error("Your YouTube connection expired. Reconnect your account.");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `YouTube playlist creation failed with ${response.status}`),
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const playlistId = typeof raw.playlistId === "string" ? raw.playlistId : "";
  const playlistUrl = typeof raw.playlistUrl === "string" ? raw.playlistUrl : "";
  const title = typeof raw.title === "string" ? raw.title : input.title;
  const failedVideoIds = Array.isArray(raw.failedVideoIds)
    ? raw.failedVideoIds.filter((videoId): videoId is string => typeof videoId === "string")
    : [];
  const addedCount = typeof raw.addedCount === "number" ? raw.addedCount : 0;

  if (!playlistId || !playlistUrl) {
    throw new Error("YouTube playlist response was incomplete");
  }

  return {
    playlistId,
    playlistUrl,
    title,
    addedCount,
    failedVideoIds,
  };
}

export async function fetchRemoteProfileState(
  clientId?: string,
  getToken?: GetToken | null,
): Promise<AppStateEnvelope> {
  return requestAppState("/api/app-state", { method: "GET" }, clientId, getToken);
}

export async function saveRemoteProfileState(
  state: AppProfileState,
  clientId?: string,
  getToken?: GetToken | null,
): Promise<AppStateEnvelope> {
  return requestAppState(
    "/api/app-state",
    {
      method: "PUT",
      body: JSON.stringify(state),
    },
    clientId,
    getToken,
  );
}
