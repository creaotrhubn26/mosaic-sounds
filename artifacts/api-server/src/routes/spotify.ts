import { Router } from "express";

const router = Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const APPLE_MUSIC_KEY_ID = process.env.APPLE_MUSIC_KEY_ID ?? "";
const APPLE_MUSIC_TEAM_ID = process.env.APPLE_MUSIC_TEAM_ID ?? "";

const spotifyTokenStore = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number }>();
const appleMusicTokenStore = new Map<string, { userToken: string }>();

// ─── Spotify OAuth ────────────────────────────────────────────────────────────

function buildServerCallbackUrl(req: import("express").Request): string {
  if (process.env.SPOTIFY_CALLBACK_HOST) {
    const base = process.env.SPOTIFY_CALLBACK_HOST.replace(/\/$/, "");
    return `${base}/api/spotify/callback`;
  }
  const proto = req.get("x-forwarded-proto") ?? req.protocol ?? "https";
  const host = req.get("x-forwarded-host") ?? req.get("host") ?? "";
  return `${proto}://${host}/api/spotify/callback`;
}

router.get("/spotify/connect", (req, res) => {
  if (!SPOTIFY_CLIENT_ID) {
    return res.status(503).json({ error: "Spotify integration not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to environment." });
  }
  const { clientId, redirectUri } = req.query as Record<string, string>;
  if (!clientId || !redirectUri) {
    return res.status(400).json({ error: "clientId and redirectUri required" });
  }

  const serverCallbackUrl = buildServerCallbackUrl(req);
  const scopes = ["user-read-private", "playlist-read-private", "playlist-modify-private", "user-library-read"].join(" ");
  const state = Buffer.from(JSON.stringify({ clientId, appRedirectUri: redirectUri, serverCallbackUrl })).toString("base64url");
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: serverCallbackUrl,
    scope: scopes,
    state,
  });
  return res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get("/spotify/callback", async (req, res) => {
  if (!SPOTIFY_CLIENT_ID) return res.status(503).send("Spotify not configured");
  const { code, state, error } = req.query as Record<string, string>;
  if (error) return res.status(400).send(`Spotify auth error: ${error}`);

  let clientId: string;
  let appRedirectUri: string;
  let serverCallbackUrl: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    clientId = decoded.clientId;
    appRedirectUri = decoded.appRedirectUri;
    serverCallbackUrl = decoded.serverCallbackUrl ?? buildServerCallbackUrl(req);
  } catch {
    return res.status(400).send("Invalid state");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: serverCallbackUrl }),
  });
  const data = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string };
  if (!data.access_token) return res.status(400).send(`Token error: ${data.error}`);

  spotifyTokenStore.set(clientId, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });

  return res.send(`<html><head><script>window.location.href="${appRedirectUri}?spotify_connected=1";</script></head><body>Connected! Redirecting…</body></html>`);
});

router.get("/spotify/status", (req, res) => {
  const { clientId } = req.query as Record<string, string>;
  const stored = clientId ? spotifyTokenStore.get(clientId) : null;
  res.json({ connected: !!stored && stored.expiresAt > Date.now() });
});

router.delete("/spotify/disconnect", (req, res) => {
  const { clientId } = req.body ?? {};
  if (clientId) spotifyTokenStore.delete(String(clientId));
  res.json({ ok: true });
});

router.get("/spotify/playlists", async (req, res) => {
  const { clientId } = req.query as Record<string, string>;
  const stored = clientId ? spotifyTokenStore.get(clientId) : null;
  if (!stored) return res.status(401).json({ error: "Not connected to Spotify" });

  const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
    headers: { Authorization: `Bearer ${stored.accessToken}` },
  });
  const data = await response.json() as { items?: { id: string; name: string; tracks: { total: number } }[] };
  return res.json({ playlists: data.items ?? [] });
});

router.get("/spotify/search", async (req, res) => {
  const { clientId, q } = req.query as Record<string, string>;
  const stored = clientId ? spotifyTokenStore.get(clientId) : null;
  if (!stored) return res.status(401).json({ error: "Not connected to Spotify" });
  if (!q) return res.status(400).json({ error: "q required" });

  const params = new URLSearchParams({ q, type: "track", limit: "10", market: "US" });
  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${stored.accessToken}` },
  });
  const data = await response.json() as { tracks?: { items?: { id: string; name: string; artists: { name: string }[]; preview_url?: string; external_urls: { spotify: string } }[] } };
  const tracks = (data.tracks?.items ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    previewUrl: t.preview_url,
    spotifyUrl: t.external_urls.spotify,
  }));
  return res.json({ tracks });
});

// ─── Apple Music ──────────────────────────────────────────────────────────────

router.get("/apple-music/status", (req, res) => {
  const { clientId } = req.query as Record<string, string>;
  const stored = clientId ? appleMusicTokenStore.get(clientId) : null;
  res.json({
    connected: !!stored,
    configured: !!(APPLE_MUSIC_KEY_ID && APPLE_MUSIC_TEAM_ID),
  });
});

router.post("/apple-music/connect", (req, res) => {
  const { clientId, userToken } = req.body ?? {};
  if (!clientId || !userToken) {
    res.status(400).json({ error: "clientId and userToken required" });
    return;
  }
  appleMusicTokenStore.set(String(clientId), { userToken: String(userToken) });
  res.json({ ok: true });
});

router.delete("/apple-music/disconnect", (req, res) => {
  const { clientId } = req.body ?? {};
  if (clientId) appleMusicTokenStore.delete(String(clientId));
  res.json({ ok: true });
});

export default router;
