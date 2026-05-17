import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { resolveApiBaseUrl } from "./app-profile-api";

const STORAGE_KEY = "@mosaicbeats_album_art_v1";
const HIT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type CacheEntry = { url: string | null; fetchedAt: number };
type CacheMap = Record<string, CacheEntry>;

// In-memory mirror of the AsyncStorage cache to avoid hitting the disk for every render
let memoryCache: CacheMap | null = null;
let loadPromise: Promise<CacheMap> | null = null;
const inflight = new Map<string, Promise<string | null>>();

async function loadCache(): Promise<CacheMap> {
  if (memoryCache) return memoryCache;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      memoryCache = raw ? (JSON.parse(raw) as CacheMap) : {};
    } catch {
      memoryCache = {};
    }
    return memoryCache;
  })();
  return loadPromise;
}

async function saveCache(cache: CacheMap) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Best-effort
  }
}

function buildKey(artist: string, title: string): string {
  return `${artist.toLowerCase().trim()}|${title.toLowerCase().trim()}`;
}

function isFresh(entry: CacheEntry): boolean {
  const ttl = entry.url == null ? MISS_TTL_MS : HIT_TTL_MS;
  return Date.now() - entry.fetchedAt < ttl;
}

async function fetchFromServer(artist: string, title: string): Promise<string | null> {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) return null;
  try {
    const url = `${baseUrl}/api/album-art?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = (await r.json()) as { artworkUrl?: string | null };
    return j.artworkUrl ?? null;
  } catch {
    return null;
  }
}

async function getAlbumArt(artist: string, title: string): Promise<string | null> {
  const key = buildKey(artist, title);
  const cache = await loadCache();

  const existing = cache[key];
  if (existing && isFresh(existing)) return existing.url;

  if (inflight.has(key)) return inflight.get(key)!;

  const promise = (async () => {
    const url = await fetchFromServer(artist, title);
    cache[key] = { url, fetchedAt: Date.now() };
    void saveCache(cache);
    inflight.delete(key);
    return url;
  })();
  inflight.set(key, promise);
  return promise;
}

export function useAlbumArt(artist: string, title: string): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    // Synchronous read from in-memory cache when warm to avoid initial flicker
    if (memoryCache) {
      const entry = memoryCache[buildKey(artist, title)];
      if (entry && isFresh(entry)) return entry.url;
    }
    return null;
  });

  useEffect(() => {
    if (!artist || !title) return;
    let cancelled = false;
    void getAlbumArt(artist, title).then((result) => {
      if (!cancelled) setUrl(result);
    });
    return () => {
      cancelled = true;
    };
  }, [artist, title]);

  return url;
}
