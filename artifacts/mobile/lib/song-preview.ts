import type { Song } from "@/constants/data";
import { resolveApiBaseUrl } from "@/lib/app-profile-api";
import type { PlaybackMode } from "@/lib/profile-state";

export type ResolvedSongAudioSource = {
  url: string;
  artworkUrl: string | null;
  durationMs: number | null;
  label: string;
};

type SongPreviewLookupPayload = {
  previewUrl?: unknown;
  artworkUrl?: unknown;
  durationMs?: unknown;
};

const previewCache = new Map<string, ResolvedSongAudioSource | null>();
const inflightRequests = new Map<string, Promise<ResolvedSongAudioSource | null>>();

function getSongCacheKey(song: Song): string {
  return song.id || `${song.title}::${song.artist}`;
}

function buildPreviewLookupUrl(song: Song): string {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  const url = new URL("/api/song-preview", `${baseUrl}/`);
  url.searchParams.set("title", song.title);
  if (song.artist.trim().length > 0) {
    url.searchParams.set("artist", song.artist);
  }
  return url.toString();
}

export async function resolveSongAudioSource(
  song: Song,
  playbackMode: PlaybackMode = "preview_only",
): Promise<ResolvedSongAudioSource | null> {
  const fullTrack = song.audioUrl?.trim()
    ? {
        url: song.audioUrl.trim(),
        artworkUrl: song.artworkUrl?.trim() || null,
        durationMs: null,
        label: "Full track",
      }
    : null;

  if (playbackMode === "full_when_available" && fullTrack) {
    return fullTrack;
  }

  if (playbackMode === "youtube") {
    return null;
  }

  if (song.previewUrl?.trim()) {
    return {
      url: song.previewUrl.trim(),
      artworkUrl: song.artworkUrl?.trim() || null,
      durationMs: null,
      label: "Preview",
    };
  }

  const cacheKey = getSongCacheKey(song);
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) ?? null;
  }

  const existingRequest = inflightRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const response = await fetch(buildPreviewLookupUrl(song), {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Preview lookup failed with ${response.status}`);
    }

    const payload = (await response.json()) as SongPreviewLookupPayload;
    const previewUrl =
      typeof payload.previewUrl === "string" && payload.previewUrl.trim().length > 0
        ? payload.previewUrl.trim()
        : null;

    const resolved = previewUrl
      ? {
          url: previewUrl,
          artworkUrl:
            typeof payload.artworkUrl === "string" && payload.artworkUrl.trim().length > 0
              ? payload.artworkUrl.trim()
              : null,
          durationMs:
            typeof payload.durationMs === "number" && Number.isFinite(payload.durationMs)
              ? payload.durationMs
              : null,
          label: "30 sec preview",
        }
      : null;

    previewCache.set(cacheKey, resolved);
    return resolved;
  })();

  inflightRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}
