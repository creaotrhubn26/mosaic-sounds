import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

export type SpotifyTrack = {
  id: string;
  title: string;
  artist: string;
  previewUrl?: string;
  spotifyUrl: string;
};

export async function connectSpotify(clientId: string): Promise<boolean> {
  try {
    const redirectUri = Linking.createURL("/spotify-callback");
    const serverUrl = `${API_BASE}/api/spotify/connect?clientId=${encodeURIComponent(clientId)}&redirectUri=${encodeURIComponent(redirectUri)}`;
    const result = await WebBrowser.openAuthSessionAsync(serverUrl, redirectUri);
    if (result.type === "success") {
      const url = new URL(result.url);
      return url.searchParams.get("spotify_connected") === "1";
    }
    return false;
  } catch (err) {
    console.warn("Spotify connect error:", err);
    return false;
  }
}

export async function disconnectSpotify(clientId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/spotify/disconnect`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
  } catch {}
}

export async function checkSpotifyStatus(clientId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/spotify/status?clientId=${encodeURIComponent(clientId)}`);
    const data = await res.json() as { connected?: boolean };
    return data.connected ?? false;
  } catch {
    return false;
  }
}

export async function searchSpotify(
  clientId: string,
  query: string,
): Promise<SpotifyTrack[]> {
  try {
    const params = new URLSearchParams({ clientId, q: query });
    const res = await fetch(`${API_BASE}/api/spotify/search?${params}`);
    const data = await res.json() as { tracks?: SpotifyTrack[] };
    return data.tracks ?? [];
  } catch {
    return [];
  }
}

export async function connectAppleMusic(
  clientId: string,
  userToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/apple-music/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, userToken }),
    });
    const data = await res.json() as { ok?: boolean };
    return data.ok ?? false;
  } catch {
    return false;
  }
}

export async function disconnectAppleMusic(clientId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/apple-music/disconnect`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
  } catch {}
}

export async function checkAppleMusicStatus(clientId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/apple-music/status?clientId=${encodeURIComponent(clientId)}`);
    const data = await res.json() as { connected?: boolean };
    return data.connected ?? false;
  } catch {
    return false;
  }
}
