import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Song } from "@/constants/data";
import { resolveApiBaseUrl } from "@/lib/app-profile-api";

const STORAGE_KEY = "@mosaicbeats_song_overrides_v1";
const FRESH_TTL_MS = 24 * 60 * 60 * 1000; // refetch once a day

type Stored = { overrides: Record<string, string>; fetchedAt: number };

let memory: Stored | null = null;
let loadPromise: Promise<Stored> | null = null;

async function loadFromStorage(): Promise<Stored> {
  if (memory) return memory;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      memory = raw ? (JSON.parse(raw) as Stored) : { overrides: {}, fetchedAt: 0 };
    } catch {
      memory = { overrides: {}, fetchedAt: 0 };
    }
    return memory;
  })();
  return loadPromise;
}

async function fetchFromServer(): Promise<Record<string, string>> {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) return {};
  try {
    const r = await fetch(`${baseUrl}/api/song-overrides`);
    if (!r.ok) return {};
    const j = (await r.json()) as { overrides?: Record<string, string> };
    return j.overrides ?? {};
  } catch {
    return {};
  }
}

// Loads overrides from disk immediately, then refreshes from server in the background
// once per day. Returns the latest known map synchronously after the first call.
export async function loadSongOverrides(): Promise<Record<string, string>> {
  const stored = await loadFromStorage();

  const isStale = Date.now() - stored.fetchedAt > FRESH_TTL_MS;
  if (isStale) {
    // Fire-and-forget refresh — don't block startup on it.
    void (async () => {
      const overrides = await fetchFromServer();
      if (Object.keys(overrides).length === 0) return;
      memory = { overrides, fetchedAt: Date.now() };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch {
        // Best-effort
      }
    })();
  }

  return stored.overrides;
}

export function getOverrideMap(): Record<string, string> {
  return memory?.overrides ?? {};
}

// Returns the song with youtubeVideoId swapped in if an override exists.
// All other fields preserved.
export function applyOverride(song: Song): Song {
  const overrides = getOverrideMap();
  const overrideId = overrides[song.id];
  if (!overrideId || overrideId === song.youtubeVideoId) return song;
  return { ...song, youtubeVideoId: overrideId };
}

// Shorthand for callers that only need the resolved YouTube ID for the given song.
export function getYouTubeVideoId(song: Song): string {
  const overrides = getOverrideMap();
  return overrides[song.id] ?? song.youtubeVideoId;
}
