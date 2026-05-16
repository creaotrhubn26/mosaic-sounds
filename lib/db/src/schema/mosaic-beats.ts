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

export type ClientProfile = typeof clientProfilesTable.$inferSelect;
export type InsertClientProfile = typeof clientProfilesTable.$inferInsert;
export type AccountProfile = typeof accountProfilesTable.$inferSelect;
export type InsertAccountProfile = typeof accountProfilesTable.$inferInsert;
export type YouTubeConnection = typeof youtubeConnectionsTable.$inferSelect;
export type InsertYouTubeConnection = typeof youtubeConnectionsTable.$inferInsert;
