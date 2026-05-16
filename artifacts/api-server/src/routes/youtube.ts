import { Router, type IRouter, type Request } from "express";
import {
  AuthenticationError,
  getAccountFromAuthorizationHeader,
  resolveAuthRedirectUri,
} from "../lib/auth";
import {
  buildYouTubeOauthErrorRedirect,
  buildYouTubeOauthStartUrl,
  buildYouTubeOauthSuccessRedirect,
  completeYouTubeOauth,
  createYouTubePlaylistForAccount,
  getYouTubeConnectionStatus,
  tryResolveYouTubeRedirectUriFromState,
  YouTubeIntegrationError,
} from "../lib/youtube";

const router: IRouter = Router();

async function requireAuthenticatedAccount(req: Request) {
  const account = await getAccountFromAuthorizationHeader(req.header("authorization") ?? undefined);
  if (!account) {
    throw new AuthenticationError("Missing authorization header");
  }
  return account;
}

function firstHeaderValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function normalizeHttpProtocol(value: string | null | undefined): "http" | "https" | null {
  if (!value) return null;
  const normalized = value.trim().replace(/:$/, "").toLowerCase();
  return normalized === "http" || normalized === "https" ? normalized : null;
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized === "[::1]";
}

function getYouTubeCallbackUri(req: Request): string {
  const configured = process.env.YOUTUBE_REDIRECT_URI?.trim() || process.env.GOOGLE_REDIRECT_URI?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (!isLocalHostname(parsed.hostname)) {
        return parsed.toString();
      }
    } catch {
      throw new Error("YOUTUBE_REDIRECT_URI must be a valid URL");
    }
  }

  const host = firstHeaderValue(req.header("x-forwarded-host")) ?? firstHeaderValue(req.header("host"));
  if (!host) {
    throw new Error("Could not resolve YouTube OAuth callback URI");
  }

  let hostname: string | null = null;
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    hostname = null;
  }

  const protocol =
    firstHeaderValue(req.header("x-forwarded-proto")) ??
    (hostname && isLocalHostname(hostname) ? normalizeHttpProtocol(req.protocol) ?? "http" : "https");

  return new URL("/api/youtube/callback", `${protocol}://${host}`).toString();
}

router.get("/youtube/status", async (req, res) => {
  try {
    const account = await requireAuthenticatedAccount(req);
    const status = await getYouTubeConnectionStatus(account.accountId);
    res.json(status);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (error instanceof YouTubeIntegrationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.post("/youtube/start", async (req, res) => {
  try {
    const account = await requireAuthenticatedAccount(req);
    const redirectUri = resolveAuthRedirectUri(req.body?.redirectUri);
    const startUrl = buildYouTubeOauthStartUrl(
      account.accountId,
      redirectUri,
      getYouTubeCallbackUri(req),
    );

    res.json({ startUrl });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (error instanceof YouTubeIntegrationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

router.get("/youtube/callback", async (req, res) => {
  const rawState = typeof req.query.state === "string" ? req.query.state : undefined;
  const redirectUri = tryResolveYouTubeRedirectUriFromState(rawState);

  try {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const providerError = typeof req.query.error === "string" ? req.query.error : "";

    if (providerError) {
      throw new YouTubeIntegrationError(providerError);
    }

    if (!code || !rawState) {
      throw new YouTubeIntegrationError("Missing YouTube OAuth response");
    }

    const connection = await completeYouTubeOauth(code, rawState, getYouTubeCallbackUri(req));
    res.redirect(
      buildYouTubeOauthSuccessRedirect(
        redirectUri ?? resolveAuthRedirectUri("mosaicbeats://auth/youtube"),
        connection,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (redirectUri) {
      res.redirect(buildYouTubeOauthErrorRedirect(redirectUri, message));
      return;
    }

    const statusCode = error instanceof YouTubeIntegrationError ? error.statusCode : 500;
    res.status(statusCode).json({ error: message });
  }
});

router.post("/youtube/playlists", async (req, res) => {
  try {
    const account = await requireAuthenticatedAccount(req);
    const title = typeof req.body?.title === "string" ? req.body.title : "";
    const description = typeof req.body?.description === "string" ? req.body.description : undefined;
    const privacyStatus =
      typeof req.body?.privacyStatus === "string" ? req.body.privacyStatus : undefined;
    const videoIds = Array.isArray(req.body?.videoIds)
      ? req.body.videoIds.filter((videoId: unknown): videoId is string => typeof videoId === "string")
      : [];

    const playlist = await createYouTubePlaylistForAccount(account.accountId, {
      title,
      description,
      privacyStatus,
      videoIds,
    });

    res.json(playlist);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (error instanceof YouTubeIntegrationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
