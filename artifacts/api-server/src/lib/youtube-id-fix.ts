import { pool } from "@workspace/db";
import { logger } from "./logger";

// YouTube Data API v3 daily quota = 10,000 units.
// /videos costs 1 unit per call; /search costs 100 units per call.
// We verify up to 547 IDs (~11 batched /videos calls = ~11 quota) + search the unverified
// ones — at 100 quota/search, that leaves ~98 searches max in a single run.
const SEARCH_QUOTA_BUDGET = 90;

type CheckRow = {
  song_id: string;
  title: string;
  artist: string;
  original_yt_id: string;
  youtube_video_id: string | null;
};

type YtVideosResponse = { items?: Array<{ id?: string }> };
type YtSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: { title?: string; channelTitle?: string };
  }>;
};

function requireApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) throw new Error("YOUTUBE_API_KEY must be set");
  return key;
}

async function batchVerifyAlive(ids: string[], apiKey: string): Promise<Set<string>> {
  const alive = new Set<string>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=id&id=${batch.join(",")}&key=${apiKey}&maxResults=50`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) {
      logger.warn({ status: r.status }, "videos batch failed");
      continue;
    }
    const j = (await r.json()) as YtVideosResponse;
    for (const item of j.items ?? []) {
      if (item.id) alive.add(item.id);
    }
  }
  return alive;
}

async function searchYouTube(
  artist: string,
  title: string,
  apiKey: string,
): Promise<{ videoId: string; title: string | null; channel: string | null } | null> {
  const q = `${artist} ${title}`.replace(/—|–/g, " ").replace(/\s+/g, " ").trim();
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(q)}&maxResults=1&key=${apiKey}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!r.ok) {
    if (r.status === 403 || r.status === 429) {
      throw new YouTubeQuotaError();
    }
    return null;
  }
  const j = (await r.json()) as YtSearchResponse;
  const top = j.items?.[0];
  if (!top?.id?.videoId) return null;
  return {
    videoId: top.id.videoId,
    title: top.snippet?.title ?? null,
    channel: top.snippet?.channelTitle ?? null,
  };
}

export class YouTubeQuotaError extends Error {
  constructor() {
    super("YouTube Data API quota exhausted");
    this.name = "YouTubeQuotaError";
  }
}

export type CronRunResult = {
  scanned: number;
  alive: number;
  deadIdentified: number;
  searched: number;
  searchHits: number;
  searchMisses: number;
  quotaHit: boolean;
  budgetRemaining: number;
};

export async function runYouTubeIdFixCron(): Promise<CronRunResult> {
  const apiKey = requireApiKey();

  // Step 1: pick rows that have a current ID. Verify them with the cheap /videos endpoint.
  const candidates = await pool.query<CheckRow>(
    `select song_id, title, artist, original_yt_id, youtube_video_id
     from mosaic_beats.song_youtube_overrides
     where youtube_video_id is not null`,
  );
  const candidateIds = candidates.rows.map((r) => r.youtube_video_id!);
  const aliveIds = await batchVerifyAlive(candidateIds, apiKey);
  const deadRows = candidates.rows.filter((r) => !aliveIds.has(r.youtube_video_id!));

  // Mark dead rows: clear their youtube_video_id so the search step picks them up.
  if (deadRows.length > 0) {
    const ids = deadRows.map((r) => r.song_id);
    await pool.query(
      `update mosaic_beats.song_youtube_overrides
       set youtube_video_id = null, checked_at = now()
       where song_id = any($1::text[])`,
      [ids],
    );
  }

  // Step 2: rows needing search (originally-null OR just-marked dead).
  const needsSearch = await pool.query<CheckRow>(
    `select song_id, title, artist, original_yt_id, youtube_video_id
     from mosaic_beats.song_youtube_overrides
     where youtube_video_id is null
     order by checked_at asc
     limit $1`,
    [SEARCH_QUOTA_BUDGET],
  );

  let searched = 0;
  let searchHits = 0;
  let searchMisses = 0;
  let quotaHit = false;

  for (const row of needsSearch.rows) {
    let result: Awaited<ReturnType<typeof searchYouTube>>;
    try {
      result = await searchYouTube(row.artist, row.title, apiKey);
    } catch (err) {
      if (err instanceof YouTubeQuotaError) {
        quotaHit = true;
        break;
      }
      throw err;
    }
    searched++;
    if (result) {
      searchHits++;
      await pool.query(
        `update mosaic_beats.song_youtube_overrides
         set youtube_video_id = $1, matched_title = $2, matched_channel = $3,
             source = 'youtube_search', checked_at = now()
         where song_id = $4`,
        [result.videoId, result.title, result.channel, row.song_id],
      );
    } else {
      searchMisses++;
      // Keep youtube_video_id null but bump checked_at so we don't re-try until older rows turn over.
      await pool.query(
        `update mosaic_beats.song_youtube_overrides
         set checked_at = now() where song_id = $1`,
        [row.song_id],
      );
    }
  }

  return {
    scanned: candidates.rows.length,
    alive: aliveIds.size,
    deadIdentified: deadRows.length,
    searched,
    searchHits,
    searchMisses,
    quotaHit,
    budgetRemaining: SEARCH_QUOTA_BUDGET - searched,
  };
}

export async function getAllOverrides(): Promise<Record<string, string>> {
  const r = await pool.query<{ song_id: string; youtube_video_id: string | null }>(
    `select song_id, youtube_video_id from mosaic_beats.song_youtube_overrides where youtube_video_id is not null`,
  );
  const map: Record<string, string> = {};
  for (const row of r.rows) {
    if (row.youtube_video_id) map[row.song_id] = row.youtube_video_id;
  }
  return map;
}
