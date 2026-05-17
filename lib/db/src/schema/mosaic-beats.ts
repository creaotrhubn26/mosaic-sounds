import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const mosaicBeatsSchema = pgSchema("mosaic_beats");

export const clientProfilesTable = mosaicBeatsSchema.table(
  "client_profiles",
  {
    clientId: text("client_id").primaryKey(),
    stateVersion: integer("state_version").notNull().default(1),
    state: jsonb("state")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    updatedAtIdx: index("client_profiles_updated_at_idx").on(table.updatedAt),
  }),
);

// account_id is a Clerk user ID (e.g. "user_2abc..."). No FK — Clerk is the source of truth for users.
export const accountProfilesTable = mosaicBeatsSchema.table(
  "account_profiles",
  {
    accountId: text("account_id").primaryKey(),
    stateVersion: integer("state_version").notNull().default(1),
    state: jsonb("state")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    updatedAtIdx: index("account_profiles_updated_at_idx").on(table.updatedAt),
  }),
);

// account_id is a Clerk user ID. No FK to a local accounts table.
export const youtubeConnectionsTable = mosaicBeatsSchema.table(
  "youtube_connections",
  {
    accountId: text("account_id").primaryKey(),
    encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
    grantedScopes: text("granted_scopes"),
    channelId: text("channel_id"),
    channelTitle: text("channel_title"),
    channelThumbnailUrl: text("channel_thumbnail_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    channelIdIdx: index("youtube_connections_channel_id_idx").on(table.channelId),
    updatedAtIdx: index("youtube_connections_updated_at_idx").on(table.updatedAt),
  }),
);

// cache_key is sha256(lower(normalize(artist) + "|" + normalize(title))). null artwork_url
// is cached too (so we don't re-hit iTunes for unknown songs every request) — refreshed when
// fetched_at exceeds the configured TTL.
export const albumArtCacheTable = mosaicBeatsSchema.table(
  "album_art_cache",
  {
    cacheKey: text("cache_key").primaryKey(),
    artist: text("artist").notNull(),
    title: text("title").notNull(),
    artworkUrl: text("artwork_url"),
    source: text("source").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    fetchedAtIdx: index("album_art_cache_fetched_at_idx").on(table.fetchedAt),
  }),
);

// 30-sec preview from iTunes. cache_key = sha256(normalize(title) + "|" + normalize(artist)).
// preview_url null = iTunes had no match. confidence reflects fuzzy match quality.
export const songPreviewCacheTable = mosaicBeatsSchema.table(
  "song_preview_cache",
  {
    cacheKey: text("cache_key").primaryKey(),
    title: text("title").notNull(),
    artist: text("artist"),
    previewUrl: text("preview_url"),
    artworkUrl: text("artwork_url"),
    durationMs: integer("duration_ms"),
    matchedTitle: text("matched_title"),
    matchedArtist: text("matched_artist"),
    confidence: text("confidence"),
    source: text("source").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    fetchedAtIdx: index("song_preview_cache_fetched_at_idx").on(table.fetchedAt),
  }),
);

// Per-song YouTube ID overrides. Populated by a daily cron that quota-bounded-searches
// up to ~95 songs per run (YouTube Data API daily quota / 100-unit search cost).
// `youtube_video_id` null = still needs to be fixed. `source` is the provenance:
// 'bootstrap' (imported from data.ts), 'youtube_search' (cron filled it in), 'manual'.
export const songYoutubeOverridesTable = mosaicBeatsSchema.table(
  "song_youtube_overrides",
  {
    songId: text("song_id").primaryKey(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    originalYtId: text("original_yt_id").notNull(),
    youtubeVideoId: text("youtube_video_id"),
    matchedTitle: text("matched_title"),
    matchedChannel: text("matched_channel"),
    source: text("source").notNull(),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    checkedAtIdx: index("song_youtube_overrides_checked_at_idx").on(table.checkedAt),
  }),
);

export type ClientProfile = typeof clientProfilesTable.$inferSelect;
export type InsertClientProfile = typeof clientProfilesTable.$inferInsert;
export type AccountProfile = typeof accountProfilesTable.$inferSelect;
export type InsertAccountProfile = typeof accountProfilesTable.$inferInsert;
export type YouTubeConnection = typeof youtubeConnectionsTable.$inferSelect;
export type InsertYouTubeConnection = typeof youtubeConnectionsTable.$inferInsert;
export type AlbumArtCache = typeof albumArtCacheTable.$inferSelect;
export type InsertAlbumArtCache = typeof albumArtCacheTable.$inferInsert;
export type SongPreviewCache = typeof songPreviewCacheTable.$inferSelect;
export type InsertSongPreviewCache = typeof songPreviewCacheTable.$inferInsert;
export type SongYoutubeOverride = typeof songYoutubeOverridesTable.$inferSelect;
export type InsertSongYoutubeOverride = typeof songYoutubeOverridesTable.$inferInsert;
