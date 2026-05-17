import { createHash } from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "./logger";

// Cache misses (no iTunes result) for 7 days — long enough that we don't hammer iTunes,
// short enough that newly released songs eventually pick up their cover.
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Hits never expire — Apple's artwork URLs are stable and rotate via different paths
// (we'd need an explicit refresh trigger to bust them).
const HIT_TTL_MS = Infinity;

const ITUNES_COUNTRIES = ["US", "GB", "IN"];

type CacheRow = {
  artwork_url: string | null;
  source: string;
  fetched_at: Date;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[&/]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildCacheKey(artist: string, title: string): string {
  return createHash("sha256").update(`${normalize(artist)}|${normalize(title)}`).digest("hex");
}

function cleanSearchTerm(s: string): string {
  return s.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").replace(/[&]/g, " ").replace(/—|–|-/g, " ").replace(/\s+/g, " ").trim();
}

function firstArtist(artist: string): string {
  return artist.split(/[,/&]|ft\.|feat\.|and /i)[0].trim();
}

function upgradeArtworkResolution(url: string): string {
  // iTunes serves at NxNbb; replace any size with 600x600 for higher quality.
  return url.replace(/\/(\d+)x\1bb\./, "/600x600bb.");
}

type ItunesResult =
  | { kind: "hit"; artworkUrl: string }
  | { kind: "miss" }
  | { kind: "rate_limited" };

async function fetchFromItunes(artist: string, title: string): Promise<ItunesResult> {
  const isVarious = /various/i.test(artist);
  const cleanArtist = firstArtist(artist);
  const cleanTitle = cleanSearchTerm(title);
  const terms = isVarious
    ? [cleanTitle]
    : [cleanSearchTerm(`${cleanArtist} ${cleanTitle}`), cleanTitle];

  let sawRateLimit = false;
  let sawCleanMiss = false;

  for (const term of terms) {
    for (const country of ITUNES_COUNTRIES) {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1&country=${country}`;
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (r.status === 429 || r.status === 403) {
          sawRateLimit = true;
          continue;
        }
        if (!r.ok) continue;
        const j = (await r.json()) as { results?: Array<{ artworkUrl100?: string }> };
        const item = j.results?.[0];
        if (item?.artworkUrl100) {
          return { kind: "hit", artworkUrl: upgradeArtworkResolution(item.artworkUrl100) };
        }
        // Clean miss: iTunes responded but had nothing
        sawCleanMiss = true;
      } catch (err) {
        logger.warn({ err: err instanceof Error ? err.message : String(err), term, country }, "iTunes fetch failed");
      }
    }
  }

  // Only treat as a real miss if iTunes actually answered for at least one variant.
  // If every attempt was rate-limited, signal that so we don't poison the cache.
  if (!sawCleanMiss && sawRateLimit) return { kind: "rate_limited" };
  return { kind: "miss" };
}

function isStale(row: CacheRow): boolean {
  const age = Date.now() - new Date(row.fetched_at).getTime();
  const ttl = row.artwork_url == null ? MISS_TTL_MS : HIT_TTL_MS;
  return age > ttl;
}

export async function lookupAlbumArt(
  artist: string,
  title: string,
): Promise<{ artworkUrl: string | null; source: string; cached: boolean }> {
  const cacheKey = buildCacheKey(artist, title);
  const trimmedArtist = artist.trim();
  const trimmedTitle = title.trim();

  if (!trimmedArtist || !trimmedTitle) {
    return { artworkUrl: null, source: "invalid", cached: false };
  }

  const cached = await pool.query<CacheRow>(
    `select artwork_url, source, fetched_at from mosaic_beats.album_art_cache where cache_key = $1 limit 1`,
    [cacheKey],
  );

  if (cached.rows[0] && !isStale(cached.rows[0])) {
    return {
      artworkUrl: cached.rows[0].artwork_url,
      source: cached.rows[0].source,
      cached: true,
    };
  }

  const itunesResult = await fetchFromItunes(trimmedArtist, trimmedTitle);

  // Don't pollute the cache when iTunes was rate-limiting us — that's a transient
  // condition, not a real "this song has no album art" answer.
  if (itunesResult.kind === "rate_limited") {
    return { artworkUrl: null, source: "rate_limited", cached: false };
  }

  const artworkUrl = itunesResult.kind === "hit" ? itunesResult.artworkUrl : null;
  const source = itunesResult.kind === "hit" ? "itunes" : "itunes-miss";

  await pool.query(
    `
      insert into mosaic_beats.album_art_cache (cache_key, artist, title, artwork_url, source, fetched_at)
      values ($1, $2, $3, $4, $5, now())
      on conflict (cache_key)
      do update set
        artwork_url = excluded.artwork_url,
        source = excluded.source,
        fetched_at = now()
    `,
    [cacheKey, trimmedArtist, trimmedTitle, artworkUrl, source],
  );

  return { artworkUrl, source, cached: false };
}
