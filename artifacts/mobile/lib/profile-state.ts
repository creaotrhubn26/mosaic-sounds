import type { EventType, Song } from "@/constants/data";

export type { EventType };

export const APP_STATE_VERSION = 1;

export const LEGACY_STORAGE_KEYS = {
  version: "@mosaicbeats_schema_version",
  preferences: "@mosaicbeats_prefs",
  sets: "@mosaicbeats_sets",
  likes: "@mosaicbeats_likes",
  played: "@mosaicbeats_played",
  customMoments: "@mosaicbeats_custom_moments",
  momentData: "@mosaicbeats_moment_data",
  folders: "@mosaicbeats_folders",
  customSongs: "@mosaicbeats_custom_songs",
  onboardingStep: "@mosaicbeats_onboarding_step",
  searchHistory: "@mosaicbeats_search_history",
  aiSuggestions: "@mosaicbeats_ai_suggestions",
  clientId: "@mosaicbeats_client_id",
  authToken: "@mosaicbeats_auth_token",
  accountEmail: "@mosaicbeats_account_email",
  accountId: "@mosaicbeats_account_id",
} as const;

export type AvoidEntry = { songId: string; note: string; addedAt: string };
export type RequestEntry = { songId: string; note: string; addedAt: string };
export type PlaybackMode = "preview_only" | "full_when_available" | "youtube";

export type UserPreferences = {
  cultures: string[];
  languages: string[];
  vibe: number;
  energy: number;
  cleanLyrics: boolean;
  onboardingComplete: boolean;
  eventType?: EventType;
  weddingDate?: string;
  coupleNames?: string;
  themeMode?: "dark" | "light";
  accentColor?: string;
  hapticLevel?: "none" | "light" | "full";
  collapseUnplanned?: boolean;
  playbackMode?: PlaybackMode;
  appLanguage?: "en" | "nb" | "hi" | "pa" | "ur" | "ta";
  languageMix?: Record<string, number>;
  avoidList?: AvoidEntry[];
  requestLog?: RequestEntry[];
};

export type WeddingSet = {
  id: string;
  name: string;
  moment: string;
  songs: Song[];
  songNotes: Record<string, string>;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomMoment = {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  emoji: string;
  createdAt: string;
};

export type MomentData = {
  notes: string;
  completed: boolean;
  durationMin?: number;
};

export type FavoriteFolder = {
  id: string;
  name: string;
  emoji: string;
  songIds: string[];
  createdAt: string;
};

export type AISuggestionsMeta = {
  cultures: string[];
  ts: number;
};

export type AppUiState = {
  onboardingDraftStep: number | null;
  searchHistory: string[];
  aiSuggestionsMeta: AISuggestionsMeta | null;
};

export type AppProfileState = {
  schemaVersion: number;
  preferences: UserPreferences;
  sets: WeddingSet[];
  likedSongIds: string[];
  alreadyPlayedSongIds: string[];
  customMoments: CustomMoment[];
  momentData: Record<string, MomentData>;
  favoriteFolders: FavoriteFolder[];
  customSongs: Song[];
  ui: AppUiState;
};

export const defaultPreferences: UserPreferences = {
  cultures: [],
  languages: [],
  vibe: 0.5,
  energy: 0.7,
  cleanLyrics: true,
  onboardingComplete: false,
  eventType: "wedding",
  themeMode: "dark",
  hapticLevel: "full",
  collapseUnplanned: false,
  playbackMode: "preview_only",
  avoidList: [],
  requestLog: [],
};

export const defaultUiState: AppUiState = {
  onboardingDraftStep: null,
  searchHistory: [],
  aiSuggestionsMeta: null,
};

export const defaultProfileState: AppProfileState = {
  schemaVersion: APP_STATE_VERSION,
  preferences: defaultPreferences,
  sets: [],
  likedSongIds: [],
  alreadyPlayedSongIds: [],
  customMoments: [],
  momentData: {},
  favoriteFolders: [],
  customSongs: [],
  ui: defaultUiState,
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asNumberOr<T extends number | null>(value: unknown, fallback: T): number | T {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asObject<T extends object>(value: unknown, fallback: T): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : fallback;
}

function asSongArray(value: unknown): Song[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Song => Boolean(item && typeof item === "object"));
}

function asSetArray(value: unknown): WeddingSet[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<WeddingSet> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : `set_${Date.now()}`,
      name: typeof item.name === "string" ? item.name : "Untitled Set",
      moment: typeof item.moment === "string" ? item.moment : "custom",
      songs: asSongArray(item.songs),
      songNotes: asObject<Record<string, string>>(item.songNotes, {}),
      color: typeof item.color === "string" ? item.color : undefined,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
    }));
}

function asCustomMomentArray(value: unknown): CustomMoment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<CustomMoment> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : `custom_${Date.now()}`,
      label: typeof item.label === "string" ? item.label : "Custom Moment",
      subtitle: typeof item.subtitle === "string" ? item.subtitle : "Custom Moment",
      description:
        typeof item.description === "string" ? item.description : item.label ?? "Custom Moment",
      emoji: typeof item.emoji === "string" ? item.emoji : "🎵",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }));
}

function asMomentDataRecord(value: unknown): Record<string, MomentData> {
  const input = asObject<Record<string, unknown>>(value, {});
  return Object.fromEntries(
    Object.entries(input).map(([key, raw]) => {
      const item = asObject<Record<string, unknown>>(raw, {});
      return [
        key,
        {
          notes: typeof item.notes === "string" ? item.notes : "",
          completed: item.completed === true,
          durationMin:
            typeof item.durationMin === "number" && Number.isFinite(item.durationMin)
              ? item.durationMin
              : undefined,
        },
      ];
    }),
  );
}

function asFavoriteFolderArray(value: unknown): FavoriteFolder[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<FavoriteFolder> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : `folder_${Date.now()}`,
      name: typeof item.name === "string" ? item.name : "Folder",
      emoji: typeof item.emoji === "string" ? item.emoji : "⭐",
      songIds: asStringArray(item.songIds),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }));
}

function asAvoidEntryArray(value: unknown): AvoidEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<AvoidEntry> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      songId: typeof item.songId === "string" ? item.songId : "",
      note: typeof item.note === "string" ? item.note : "",
      addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
    }))
    .filter((item) => item.songId.length > 0);
}

function asRequestEntryArray(value: unknown): RequestEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<RequestEntry> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      songId: typeof item.songId === "string" ? item.songId : "",
      note: typeof item.note === "string" ? item.note : "",
      addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
    }))
    .filter((item) => item.songId.length > 0);
}

function normalizePreferences(value: unknown): UserPreferences {
  const input = asObject<Record<string, unknown>>(value, {});
  return {
    cultures: asStringArray(input.cultures),
    languages: asStringArray(input.languages),
    vibe: asNumberOr(input.vibe, defaultPreferences.vibe),
    energy: asNumberOr(input.energy, defaultPreferences.energy),
    cleanLyrics:
      typeof input.cleanLyrics === "boolean"
        ? input.cleanLyrics
        : defaultPreferences.cleanLyrics,
    onboardingComplete:
      typeof input.onboardingComplete === "boolean"
        ? input.onboardingComplete
        : defaultPreferences.onboardingComplete,
    eventType:
      input.eventType === "wedding" ||
      input.eventType === "birthday" ||
      input.eventType === "corporate" ||
      input.eventType === "party"
        ? input.eventType
        : "wedding",
    weddingDate: typeof input.weddingDate === "string" ? input.weddingDate : undefined,
    coupleNames: typeof input.coupleNames === "string" ? input.coupleNames : undefined,
    themeMode:
      input.themeMode === "light" || input.themeMode === "dark"
        ? input.themeMode
        : defaultPreferences.themeMode,
    accentColor: typeof input.accentColor === "string" ? input.accentColor : undefined,
    hapticLevel:
      input.hapticLevel === "none" || input.hapticLevel === "light" || input.hapticLevel === "full"
        ? input.hapticLevel
        : defaultPreferences.hapticLevel,
    collapseUnplanned:
      typeof input.collapseUnplanned === "boolean"
        ? input.collapseUnplanned
        : defaultPreferences.collapseUnplanned,
    playbackMode:
      input.playbackMode === "preview_only" ||
      input.playbackMode === "full_when_available" ||
      input.playbackMode === "youtube"
        ? input.playbackMode
        : defaultPreferences.playbackMode,
    languageMix: asObject<Record<string, number>>(input.languageMix, {}),
    appLanguage:
      input.appLanguage === "en" || input.appLanguage === "nb"
        ? input.appLanguage
        : "en",
    avoidList: asAvoidEntryArray(input.avoidList),
    requestLog: asRequestEntryArray(input.requestLog),
  };
}

function normalizeUiState(value: unknown): AppUiState {
  const input = asObject<Record<string, unknown>>(value, {});
  const aiMeta = asObject<Record<string, unknown>>(input.aiSuggestionsMeta, {});

  return {
    onboardingDraftStep:
      typeof input.onboardingDraftStep === "number" && input.onboardingDraftStep >= 0
        ? input.onboardingDraftStep
        : null,
    searchHistory: asStringArray(input.searchHistory),
    aiSuggestionsMeta:
      typeof aiMeta.ts === "number"
        ? {
            cultures: asStringArray(aiMeta.cultures),
            ts: aiMeta.ts,
          }
        : null,
  };
}

export function normalizeProfileState(value: unknown): AppProfileState {
  const input = asObject<Record<string, unknown>>(value, {});

  return {
    schemaVersion: asNumberOr(input.schemaVersion, APP_STATE_VERSION),
    preferences: normalizePreferences(input.preferences),
    sets: asSetArray(input.sets),
    likedSongIds: asStringArray(input.likedSongIds),
    alreadyPlayedSongIds: asStringArray(input.alreadyPlayedSongIds),
    customMoments: asCustomMomentArray(input.customMoments),
    momentData: asMomentDataRecord(input.momentData),
    favoriteFolders: asFavoriteFolderArray(input.favoriteFolders),
    customSongs: asSongArray(input.customSongs),
    ui: normalizeUiState(input.ui),
  };
}

export function isProfileStateMeaningful(state: AppProfileState): boolean {
  return Boolean(
    state.preferences.onboardingComplete ||
      state.preferences.cultures.length > 0 ||
      state.preferences.languages.length > 0 ||
      state.preferences.coupleNames ||
      state.preferences.weddingDate ||
      state.preferences.avoidList?.length ||
      state.preferences.requestLog?.length ||
      state.sets.length > 0 ||
      state.likedSongIds.length > 0 ||
      state.alreadyPlayedSongIds.length > 0 ||
      state.customMoments.length > 0 ||
      Object.keys(state.momentData).length > 0 ||
      state.favoriteFolders.length > 0 ||
      state.customSongs.length > 0 ||
      state.ui.searchHistory.length > 0 ||
      state.ui.onboardingDraftStep !== null ||
      state.ui.aiSuggestionsMeta,
  );
}
