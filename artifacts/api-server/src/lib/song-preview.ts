import { createHash } from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "./logger";

type AppleSongSearchResult = {
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackName?: string;
  trackTimeMillis?: number;
};

type AppleSongSearchResponse = {
  results?: AppleSongSearchResult[];
};

export type ResolvedSongPreview = {
  previewUrl: string;
  artworkUrl: string | null;
  durationMs: number | null;
  matchedTitle: string | null;
  matchedArtist: string | null;
  confidence: "high" | "medium" | "low";
};

export class PreviewRateLimitError extends Error {
  constructor() {
    super("iTunes rate limit");
    this.name = "PreviewRateLimitError";
  }
}

const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheRow = {
  preview_url: string | null;
  artwork_url: string | null;
  duration_ms: number | null;
  matched_title: string | null;
  matched_artist: string | null;
  confidence: string | null;
  fetched_at: Date;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildCacheKey(title: string, artist: string): string {
  return createHash("sha256").update(`${normalizeText(title)}|${normalizeText(artist)}`).digest("hex");
}

function getTokenOverlapScore(left: string, right: string): number {
  if (!left || !right) return 0;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return Math.round((overlap / Math.max(leftTokens.size, rightTokens.size)) * 100);
}

function getMatchScore(title: string, artist: string, candidate: AppleSongSearchResult): number {
  if (!candidate.previewUrl) return -1;
  const normalizedTitle = normalizeText(title);
  const normalizedArtist = normalizeText(artist);
  const candidateTitle = normalizeText(candidate.trackName ?? "");
  const candidateArtist = normalizeText(candidate.artistName ?? "");

  let score = 0;
  if (candidateTitle === normalizedTitle) score += 55;
  else if (normalizedTitle && candidateTitle && (candidateTitle.includes(normalizedTitle) || normalizedTitle.includes(candidateTitle))) score += 42;
  else score += Math.round(getTokenOverlapScore(normalizedTitle, candidateTitle) * 0.45);

  if (normalizedArtist && candidateArtist === normalizedArtist) score += 35;
  else if (normalizedArtist && candidateArtist && (candidateArtist.includes(normalizedArtist) || normalizedArtist.includes(candidateArtist))) score += 24;
  else score += Math.round(getTokenOverlapScore(normalizedArtist, candidateArtist) * 0.3);

  const combinedCandidate = `${candidateTitle} ${candidateArtist}`.trim();
  const combinedQuery = `${normalizedTitle} ${normalizedArtist}`.trim();
  if (combinedQuery && combinedCandidate && combinedCandidate === combinedQuery) score += 15;

  const hasExplicitVersion = /(remix|live|karaoke|instrumental|sped up|slowed)/.test(normalizedTitle);
  const candidateLooksLikeVariant = /(remix|live|karaoke|instrumental|sped up|slowed)/.test(candidateTitle);
  if (!hasExplicitVersion && candidateLooksLikeVariant) score -= 12;

  return score;
}

function toConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 78) return "high";
  if (score >= 56) return "medium";
  return "low";
}

function rowToResolved(row: CacheRow): ResolvedSongPreview | null {
  if (!row.preview_url) return null;
  return {
    previewUrl: row.preview_url,
    artworkUrl: row.artwork_url,
    durationMs: row.duration_ms,
    matchedTitle: row.matched_title,
    matchedArtist: row.matched_artist,
    confidence: (row.confidence as "high" | "medium" | "low" | null) ?? "low",
  };
}

function isStale(row: CacheRow): boolean {
  if (row.preview_url != null) return false; // hits never expire
  return Date.now() - new Date(row.fetched_at).getTime() > MISS_TTL_MS;
}

// Returns { kind: "hit"|"miss"|"rate_limited" } to let the caller decide whether to cache.
async function searchItunes(title: string, artist: string): Promise<
  | { kind: "hit"; preview: ResolvedSongPreview }
  | { kind: "miss" }
  | { kind: "rate_limited" }
> {
  const searchParams = new URLSearchParams({
    term: artist ? `${title} ${artist}` : title,
    entity: "song",
    limit: "10",
    country: "us",
  });

  let response: Response;
  try {
    response = await fetch(`https://itunes.apple.com/search?${searchParams.toString()}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    logger.warn({ err: err instanceof Error ? err.message : String(err), title, artist }, "iTunes fetch failed");
    return { kind: "miss" };
  }

  if (response.status === 429 || response.status === 403) return { kind: "rate_limited" };
  if (!response.ok) return { kind: "miss" };

  const payload = (await response.json().catch(() => ({}))) as AppleSongSearchResponse;
  const bestMatch = (payload.results ?? [])
    .map((candidate) => ({ candidate, score: getMatchScore(title, artist, candidate) }))
    .filter((result) => result.score >= 38)
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch?.candidate.previewUrl) return { kind: "miss" };

  return {
    kind: "hit",
    preview: {
      previewUrl: bestMatch.candidate.previewUrl,
      artworkUrl: bestMatch.candidate.artworkUrl100 ?? null,
      durationMs: typeof bestMatch.candidate.trackTimeMillis === "number" ? bestMatch.candidate.trackTimeMillis : null,
      matchedTitle: bestMatch.candidate.trackName ?? null,
      matchedArtist: bestMatch.candidate.artistName ?? null,
      confidence: toConfidence(bestMatch.score),
    },
  };
}

export async function resolveSongPreview(input: {
  title: string;
  artist?: string | null;
}): Promise<ResolvedSongPreview | null> {
  const title = input.title.trim();
  const artist = (input.artist?.trim() ?? "");
  if (!title) return null;

  const cacheKey = buildCacheKey(title, artist);

  const cached = await pool.query<CacheRow>(
    `select preview_url, artwork_url, duration_ms, matched_title, matched_artist, confidence, fetched_at
     from mosaic_beats.song_preview_cache where cache_key = $1 limit 1`,
    [cacheKey],
  );

  if (cached.rows[0] && !isStale(cached.rows[0])) {
    return rowToResolved(cached.rows[0]);
  }

  const result = await searchItunes(title, artist);

  // Surface rate-limit to caller so the HTTP layer can return 503 with Retry-After,
  // instead of poisoning the cache with a fake miss.
  if (result.kind === "rate_limited") {
    throw new PreviewRateLimitError();
  }

  const preview = result.kind === "hit" ? result.preview : null;
  const source = result.kind === "hit" ? "itunes" : "itunes-miss";

  await pool.query(
    `insert into mosaic_beats.song_preview_cache
       (cache_key, title, artist, preview_url, artwork_url, duration_ms, matched_title, matched_artist, confidence, source, fetched_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
     on conflict (cache_key)
     do update set
       preview_url = excluded.preview_url,
       artwork_url = excluded.artwork_url,
       duration_ms = excluded.duration_ms,
       matched_title = excluded.matched_title,
       matched_artist = excluded.matched_artist,
       confidence = excluded.confidence,
       source = excluded.source,
       fetched_at = now()`,
    [
      cacheKey,
      title,
      artist || null,
      preview?.previewUrl ?? null,
      preview?.artworkUrl ?? null,
      preview?.durationMs ?? null,
      preview?.matchedTitle ?? null,
      preview?.matchedArtist ?? null,
      preview?.confidence ?? null,
      source,
    ],
  );

  return preview;
}
