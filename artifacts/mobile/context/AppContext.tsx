import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SONG_DATABASE, getRecommendations } from "@/constants/data";
import type { Song } from "@/constants/data";
import {
  fetchRemoteProfileState,
  getOrCreateClientId,
  saveRemoteProfileState,
  syncProfileAfterSignIn,
  type GetToken,
} from "@/lib/app-profile-api";
import {
  LEGACY_STORAGE_KEYS,
  defaultProfileState,
  isProfileStateMeaningful,
  normalizeProfileState,
  type AISuggestionsMeta,
  type AppProfileState,
  type AvoidEntry,
  type CustomMoment,
  type FavoriteFolder,
  type MomentData,
  type RequestEntry,
  type UserPreferences,
  type WeddingSet,
} from "@/lib/profile-state";

export type {
  AISuggestionsMeta,
  AvoidEntry,
  CustomMoment,
  FavoriteFolder,
  MomentData,
  RequestEntry,
  UserPreferences,
  WeddingSet,
} from "@/lib/profile-state";

const SEARCH_HISTORY_LIMIT = 8;

type AppContextType = {
  clientId: string | null;
  accountId: string | null;
  accountEmail: string | null;
  isAuthenticated: boolean;
  isAuthBusy: boolean;
  signInWithGoogle: () => Promise<void>;
  logoutAccount: () => Promise<void>;
  getToken: GetToken;
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;

  sets: WeddingSet[];
  createSet: (name: string, moment: string, songs: Song[]) => WeddingSet;
  updateSet: (id: string, updates: Partial<WeddingSet>) => void;
  deleteSet: (id: string) => void;
  duplicateSet: (id: string) => WeddingSet;
  addSongToSet: (setId: string, song: Song) => void;
  removeSongFromSet: (setId: string, songId: string) => void;
  reorderSongsInSet: (setId: string, songs: Song[]) => void;
  updateSongNote: (setId: string, songId: string, note: string) => void;
  updateSetColor: (setId: string, color: string) => void;
  mergeSets: (setId1: string, setId2: string, name: string) => WeddingSet;
  autoGenerateSet: (momentId: string, name: string) => WeddingSet;

  customSongs: Song[];
  addCustomSong: (song: Omit<Song, "id">) => Song;
  removeCustomSong: (id: string) => void;

  likedSongIds: string[];
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;

  alreadyPlayedSongIds: string[];
  markAsPlayed: (songId: string) => void;
  unmarkAsPlayed: (songId: string) => void;
  isPlayed: (songId: string) => boolean;

  customMoments: CustomMoment[];
  createCustomMoment: (m: Omit<CustomMoment, "id" | "createdAt">) => CustomMoment;
  deleteCustomMoment: (id: string) => void;

  momentData: Record<string, MomentData>;
  updateMomentData: (momentId: string, updates: Partial<MomentData>) => void;

  favoriteFolders: FavoriteFolder[];
  createFavoriteFolder: (name: string, emoji: string) => FavoriteFolder;
  deleteFavoriteFolder: (id: string) => void;
  addSongToFolder: (folderId: string, songId: string) => void;
  removeSongFromFolder: (folderId: string, songId: string) => void;

  avoidList: AvoidEntry[];
  addToAvoidList: (songId: string, note?: string) => void;
  removeFromAvoidList: (songId: string) => void;
  isAvoided: (songId: string) => boolean;

  requestLog: RequestEntry[];
  addToRequestLog: (songId: string, note?: string) => void;
  removeFromRequestLog: (songId: string) => void;
  isRequested: (songId: string) => boolean;

  searchHistory: string[];
  saveSearchQuery: (query: string) => Promise<void>;
  removeSearchQuery: (query: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;

  onboardingDraftStep: number | null;
  setOnboardingDraftStep: (step: number) => Promise<void>;
  clearOnboardingDraftStep: () => Promise<void>;

  aiSuggestionsMeta: AISuggestionsMeta | null;
  setAISuggestionsMeta: (meta: AISuggestionsMeta | null) => Promise<void>;

  todaysPick: Song | null;
  isLoaded: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildNextProfileState(
  current: AppProfileState,
  overrides: Partial<AppProfileState>,
): AppProfileState {
  return normalizeProfileState({
    ...current,
    ...overrides,
    preferences: overrides.preferences ?? current.preferences,
    ui: overrides.ui ? { ...current.ui, ...overrides.ui } : current.ui,
  });
}

async function loadLegacyLocalState(): Promise<AppProfileState | null> {
  const [
    preferences,
    sets,
    likedSongIds,
    alreadyPlayedSongIds,
    customMoments,
    momentData,
    favoriteFolders,
    customSongs,
    searchHistory,
    aiSuggestionsMeta,
    onboardingDraftStep,
  ] = await Promise.all([
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.preferences),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.sets),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.likes),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.played),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.customMoments),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.momentData),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.folders),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.customSongs),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.searchHistory),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.aiSuggestions),
    AsyncStorage.getItem(LEGACY_STORAGE_KEYS.onboardingStep),
  ]);

  const hasLegacyData = [
    preferences,
    sets,
    likedSongIds,
    alreadyPlayedSongIds,
    customMoments,
    momentData,
    favoriteFolders,
    customSongs,
    searchHistory,
    aiSuggestionsMeta,
    onboardingDraftStep,
  ].some(Boolean);

  if (!hasLegacyData) {
    return null;
  }

  return normalizeProfileState({
    preferences: parseJson(preferences),
    sets: parseJson(sets),
    likedSongIds: parseJson(likedSongIds),
    alreadyPlayedSongIds: parseJson(alreadyPlayedSongIds),
    customMoments: parseJson(customMoments),
    momentData: parseJson(momentData),
    favoriteFolders: parseJson(favoriteFolders),
    customSongs: parseJson(customSongs),
    ui: {
      searchHistory: parseJson(searchHistory) ?? [],
      aiSuggestionsMeta: parseJson(aiSuggestionsMeta),
      onboardingDraftStep:
        onboardingDraftStep && Number.isFinite(Number(onboardingDraftStep))
          ? Number(onboardingDraftStep)
          : null,
    },
  });
}

async function clearLegacyLocalState(): Promise<void> {
  await AsyncStorage.multiRemove([
    LEGACY_STORAGE_KEYS.version,
    LEGACY_STORAGE_KEYS.preferences,
    LEGACY_STORAGE_KEYS.sets,
    LEGACY_STORAGE_KEYS.likes,
    LEGACY_STORAGE_KEYS.played,
    LEGACY_STORAGE_KEYS.customMoments,
    LEGACY_STORAGE_KEYS.momentData,
    LEGACY_STORAGE_KEYS.folders,
    LEGACY_STORAGE_KEYS.customSongs,
    LEGACY_STORAGE_KEYS.onboardingStep,
    LEGACY_STORAGE_KEYS.searchHistory,
    LEGACY_STORAGE_KEYS.aiSuggestions,
  ]);
}

function todaysPickSong(prefs: UserPreferences): Song | null {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Moments pool varies by event type so Today's Pick always fits the occasion
  const momentsByEvent: Record<string, string[]> = {
    wedding: ["baraat", "sangeet", "couple_entry", "first_dance", "afterparty", "ceremony", "wedding_march", "guest_arrival", "cocktail_hour"],
    birthday: ["guest_arrival", "cocktail_hour", "cake_cutting", "first_dance", "afterparty", "family_dance", "toast_speeches"],
    corporate: ["guest_arrival", "cocktail_hour", "dinner", "toast_speeches"],
    party: ["couple_entry", "afterparty", "family_dance", "cocktail_hour", "cake_cutting"],
  };

  const eventType = prefs.eventType ?? "wedding";
  const allMoments = momentsByEvent[eventType] ?? momentsByEvent.wedding;

  // For weddings with South Asian cultures, also include cultural moments
  const hasSouthAsian = prefs.cultures.some(c =>
    ["punjabi", "north_indian", "south_indian", "bengali", "gujarati", "marathi", "tamil", "telugu", "malayali", "sikh", "hindu"].includes(c)
  );
  const hasMuslim = prefs.cultures.some(c =>
    ["pakistani", "arabic", "moroccan", "turkish", "persian", "muslim"].includes(c)
  );
  const finalMoments = eventType === "wedding"
    ? [
        ...allMoments,
        ...(hasSouthAsian ? ["baraat", "sangeet", "mehndi", "haldi", "pheras", "vidaai"] : []),
        ...(hasMuslim ? ["nikah", "walima", "mehndi_groom"] : []),
      ]
    : allMoments;

  const momentIdx = seed % finalMoments.length;
  const picks = getRecommendations(
    finalMoments[momentIdx],
    prefs.cultures,
    prefs.languages,
    prefs.vibe,
    prefs.energy,
    prefs.cleanLyrics,
  );

  if (picks.length === 0) return SONG_DATABASE[seed % SONG_DATABASE.length] ?? null;
  return picks[seed % Math.min(picks.length, 5)] ?? picks[0];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: isClerkLoaded, userId: clerkUserId, getToken: clerkGetToken, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const accountId = clerkUserId ?? null;
  const accountEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress ?? null;

  // Clerk's hook return values can have new identities on every render, which would cascade
  // through useCallback chains and re-fire effects. Mirror them through refs so the callbacks
  // below stay stable across renders.
  const clerkRef = useRef({ getToken: clerkGetToken, userId: clerkUserId, signOut: clerkSignOut, startOAuthFlow });
  clerkRef.current.getToken = clerkGetToken;
  clerkRef.current.userId = clerkUserId;
  clerkRef.current.signOut = clerkSignOut;
  clerkRef.current.startOAuthFlow = startOAuthFlow;

  const getToken = useCallback<GetToken>(async () => {
    if (!clerkRef.current.userId) return null;
    try {
      return await clerkRef.current.getToken();
    } catch {
      return null;
    }
  }, []);

  const [clientId, setClientId] = useState<string | null>(null);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [preferences, setPreferencesState] = useState(defaultProfileState.preferences);
  const [sets, setSets] = useState<WeddingSet[]>(defaultProfileState.sets);
  const [likedSongIds, setLikedSongIds] = useState<string[]>(defaultProfileState.likedSongIds);
  const [alreadyPlayedSongIds, setAlreadyPlayedSongIds] = useState<string[]>(
    defaultProfileState.alreadyPlayedSongIds,
  );
  const [customMoments, setCustomMomentsState] = useState<CustomMoment[]>(
    defaultProfileState.customMoments,
  );
  const [momentData, setMomentDataState] = useState<Record<string, MomentData>>(
    defaultProfileState.momentData,
  );
  const [favoriteFolders, setFavoriteFoldersState] = useState<FavoriteFolder[]>(
    defaultProfileState.favoriteFolders,
  );
  const [customSongs, setCustomSongs] = useState<Song[]>(defaultProfileState.customSongs);
  const [searchHistory, setSearchHistoryState] = useState<string[]>(
    defaultProfileState.ui.searchHistory,
  );
  const [onboardingDraftStep, setOnboardingDraftStepState] = useState<number | null>(
    defaultProfileState.ui.onboardingDraftStep,
  );
  const [aiSuggestionsMeta, setAISuggestionsMetaState] = useState<AISuggestionsMeta | null>(
    defaultProfileState.ui.aiSuggestionsMeta,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const isMounted = useRef(true);
  const clientIdRef = useRef<string | null>(null);
  const appStateRef = useRef<AppProfileState>(defaultProfileState);
  const scheduledPersistRef = useRef<AppProfileState | null>(null);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBootstrapped = useRef(false);

  const applyProfileState = useCallback((nextState: AppProfileState) => {
    appStateRef.current = nextState;
    setPreferencesState(nextState.preferences);
    setSets(nextState.sets);
    setLikedSongIds(nextState.likedSongIds);
    setAlreadyPlayedSongIds(nextState.alreadyPlayedSongIds);
    setCustomMomentsState(nextState.customMoments);
    setMomentDataState(nextState.momentData);
    setFavoriteFoldersState(nextState.favoriteFolders);
    setCustomSongs(nextState.customSongs);
    setSearchHistoryState(nextState.ui.searchHistory);
    setOnboardingDraftStepState(nextState.ui.onboardingDraftStep);
    setAISuggestionsMetaState(nextState.ui.aiSuggestionsMeta);
  }, []);

  const persistNow = useCallback(async (nextState: AppProfileState) => {
      const activeClientId = clientIdRef.current;
      if (!activeClientId) return;

      try {
        const saved = await saveRemoteProfileState(nextState, activeClientId, getToken);
        if (!isMounted.current) return;
        appStateRef.current = saved.state;
      } catch (error) {
        console.error("[AppContext] Failed to persist remote state:", error);
      }
    }, [getToken]); // getToken is stable, so persistNow is stable

  const flushPendingPersist = useCallback(async () => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    const snapshot = scheduledPersistRef.current;
    scheduledPersistRef.current = null;
    if (snapshot) {
      await persistNow(snapshot);
    }
  }, [persistNow]);

  const schedulePersist = useCallback(
    (nextState: AppProfileState) => {
      scheduledPersistRef.current = nextState;
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);

      persistTimerRef.current = setTimeout(() => {
        persistTimerRef.current = null;
        const snapshot = scheduledPersistRef.current;
        scheduledPersistRef.current = null;
        if (snapshot) {
          void persistNow(snapshot);
        }
      }, 300);
    },
    [persistNow],
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isClerkLoaded || hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    async function bootstrap() {
      let initialState = defaultProfileState;

      try {
        const resolvedClientId = await getOrCreateClientId();
        if (!isMounted.current) return;
        clientIdRef.current = resolvedClientId;
        setClientId(resolvedClientId);

        try {
          const remote = await fetchRemoteProfileState(resolvedClientId, getToken);
          initialState = remote.state;
        } catch (error) {
          console.error("[AppContext] Remote load failed, checking legacy state:", error);
        }

        const legacyState = await loadLegacyLocalState();
        const shouldMigrateLegacy =
          legacyState &&
          isProfileStateMeaningful(legacyState) &&
          !isProfileStateMeaningful(initialState);

        if (shouldMigrateLegacy) {
          initialState = legacyState;
          await persistNow(initialState);
          await clearLegacyLocalState();
        }
      } catch (error) {
        console.error("[AppContext] Bootstrap failed:", error);
        const legacyState = await loadLegacyLocalState();
        if (legacyState) {
          initialState = legacyState;
        }
      } finally {
        if (!isMounted.current) return;
        applyProfileState(initialState);
        setIsLoaded(true);
      }
    }

    void bootstrap();
  }, [applyProfileState, getToken, isClerkLoaded, persistNow]);

  const updateProfileState = useCallback(
    (overrides: Partial<AppProfileState>, persistMode: "immediate" | "scheduled" = "immediate") => {
      const nextState = buildNextProfileState(appStateRef.current, overrides);
      applyProfileState(nextState);
      if (persistMode === "scheduled") {
        schedulePersist(nextState);
      } else {
        void persistNow(nextState);
      }
      return nextState;
    },
    [applyProfileState, persistNow, schedulePersist],
  );

  const setPreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      const updatedPreferences: UserPreferences = {
        ...appStateRef.current.preferences,
        ...prefs,
        avoidList: prefs.avoidList ?? appStateRef.current.preferences.avoidList ?? [],
        requestLog: prefs.requestLog ?? appStateRef.current.preferences.requestLog ?? [],
      };

      const nextState = buildNextProfileState(appStateRef.current, {
        preferences: updatedPreferences,
      });
      applyProfileState(nextState);
      await persistNow(nextState);
    },
    [applyProfileState, persistNow],
  );

  const createSet = useCallback(
    (name: string, moment: string, songs: Song[]): WeddingSet => {
      const newSet: WeddingSet = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        name,
        moment,
        songs,
        songNotes: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateProfileState({ sets: [...appStateRef.current.sets, newSet] });
      return newSet;
    },
    [updateProfileState],
  );

  const updateSet = useCallback(
    (id: string, updates: Partial<WeddingSet>) => {
      updateProfileState({
        sets: appStateRef.current.sets.map((set) =>
          set.id === id ? { ...set, ...updates, updatedAt: new Date().toISOString() } : set,
        ),
      });
    },
    [updateProfileState],
  );

  const deleteSet = useCallback(
    (id: string) => {
      updateProfileState({ sets: appStateRef.current.sets.filter((set) => set.id !== id) });
    },
    [updateProfileState],
  );

  const duplicateSet = useCallback(
    (id: string): WeddingSet => {
      const original = appStateRef.current.sets.find((set) => set.id === id);
      if (!original) throw new Error("Set not found");

      const copy: WeddingSet = {
        ...original,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateProfileState({ sets: [...appStateRef.current.sets, copy] });
      return copy;
    },
    [updateProfileState],
  );

  const mergeSets = useCallback(
    (setId1: string, setId2: string, name: string): WeddingSet => {
      const set1 = appStateRef.current.sets.find((set) => set.id === setId1);
      const set2 = appStateRef.current.sets.find((set) => set.id === setId2);

      if (!set1 || !set2) throw new Error("Set not found");

      const seenIds = new Set<string>();
      const mergedSongs: Song[] = [];

      [...set1.songs, ...set2.songs].forEach((song) => {
        if (!seenIds.has(song.id)) {
          seenIds.add(song.id);
          mergedSongs.push(song);
        }
      });

      const mergedSet: WeddingSet = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        name,
        moment: set1.moment,
        songs: mergedSongs,
        songNotes: { ...set1.songNotes, ...set2.songNotes },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateProfileState({
        sets: [
          ...appStateRef.current.sets.filter((set) => set.id !== setId1 && set.id !== setId2),
          mergedSet,
        ],
      });

      return mergedSet;
    },
    [updateProfileState],
  );

  const autoGenerateSet = useCallback(
    (momentId: string, name: string): WeddingSet => {
      const songs = getRecommendations(
        momentId,
        appStateRef.current.preferences.cultures,
        appStateRef.current.preferences.languages,
        appStateRef.current.preferences.vibe,
        appStateRef.current.preferences.energy,
        appStateRef.current.preferences.cleanLyrics,
      ).slice(0, 10);

      return createSet(name, momentId, songs);
    },
    [createSet],
  );

  const addSongToSet = useCallback(
    (setId: string, song: Song) => {
      updateProfileState({
        sets: appStateRef.current.sets.map((set) => {
          if (set.id !== setId) return set;
          if (set.songs.some((item) => item.id === song.id)) return set;
          return {
            ...set,
            songs: [...set.songs, song],
            updatedAt: new Date().toISOString(),
          };
        }),
      });
    },
    [updateProfileState],
  );

  const removeSongFromSet = useCallback(
    (setId: string, songId: string) => {
      updateProfileState({
        sets: appStateRef.current.sets.map((set) =>
          set.id === setId
            ? {
                ...set,
                songs: set.songs.filter((song) => song.id !== songId),
                updatedAt: new Date().toISOString(),
              }
            : set,
        ),
      });
    },
    [updateProfileState],
  );

  const reorderSongsInSet = useCallback(
    (setId: string, songs: Song[]) => {
      updateProfileState({
        sets: appStateRef.current.sets.map((set) =>
          set.id === setId ? { ...set, songs, updatedAt: new Date().toISOString() } : set,
        ),
      });
    },
    [updateProfileState],
  );

  const updateSongNote = useCallback(
    (setId: string, songId: string, note: string) => {
      updateProfileState(
        {
          sets: appStateRef.current.sets.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  songNotes: { ...set.songNotes, [songId]: note },
                  updatedAt: new Date().toISOString(),
                }
              : set,
          ),
        },
        "scheduled",
      );
    },
    [updateProfileState],
  );

  const updateSetColor = useCallback(
    (setId: string, color: string) => {
      updateProfileState({
        sets: appStateRef.current.sets.map((set) =>
          set.id === setId ? { ...set, color, updatedAt: new Date().toISOString() } : set,
        ),
      });
    },
    [updateProfileState],
  );

  const toggleLike = useCallback(
    (songId: string) => {
      const updated = appStateRef.current.likedSongIds.includes(songId)
        ? appStateRef.current.likedSongIds.filter((id) => id !== songId)
        : [...appStateRef.current.likedSongIds, songId];

      updateProfileState({ likedSongIds: updated });
    },
    [updateProfileState],
  );

  const isLiked = useCallback(
    (songId: string) => appStateRef.current.likedSongIds.includes(songId),
    [],
  );

  const markAsPlayed = useCallback(
    (songId: string) => {
      if (appStateRef.current.alreadyPlayedSongIds.includes(songId)) return;
      updateProfileState({
        alreadyPlayedSongIds: [...appStateRef.current.alreadyPlayedSongIds, songId],
      });
    },
    [updateProfileState],
  );

  const unmarkAsPlayed = useCallback(
    (songId: string) => {
      updateProfileState({
        alreadyPlayedSongIds: appStateRef.current.alreadyPlayedSongIds.filter(
          (id) => id !== songId,
        ),
      });
    },
    [updateProfileState],
  );

  const isPlayed = useCallback(
    (songId: string) => appStateRef.current.alreadyPlayedSongIds.includes(songId),
    [],
  );

  const createCustomMoment = useCallback(
    (moment: Omit<CustomMoment, "id" | "createdAt">): CustomMoment => {
      const newMoment: CustomMoment = {
        ...moment,
        id: `custom_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      updateProfileState({ customMoments: [...appStateRef.current.customMoments, newMoment] });
      return newMoment;
    },
    [updateProfileState],
  );

  const deleteCustomMoment = useCallback(
    (id: string) => {
      updateProfileState({
        customMoments: appStateRef.current.customMoments.filter((moment) => moment.id !== id),
      });
    },
    [updateProfileState],
  );

  const updateMomentData = useCallback(
    (momentId: string, updates: Partial<MomentData>) => {
      const current = appStateRef.current.momentData[momentId] ?? { notes: "", completed: false };
      updateProfileState(
        {
          momentData: {
            ...appStateRef.current.momentData,
            [momentId]: { ...current, ...updates },
          },
        },
        "scheduled",
      );
    },
    [updateProfileState],
  );

  const createFavoriteFolder = useCallback(
    (name: string, emoji: string): FavoriteFolder => {
      const folder: FavoriteFolder = {
        id: Date.now().toString(),
        name,
        emoji,
        songIds: [],
        createdAt: new Date().toISOString(),
      };

      updateProfileState({
        favoriteFolders: [...appStateRef.current.favoriteFolders, folder],
      });
      return folder;
    },
    [updateProfileState],
  );

  const deleteFavoriteFolder = useCallback(
    (id: string) => {
      updateProfileState({
        favoriteFolders: appStateRef.current.favoriteFolders.filter((folder) => folder.id !== id),
      });
    },
    [updateProfileState],
  );

  const addSongToFolder = useCallback(
    (folderId: string, songId: string) => {
      updateProfileState({
        favoriteFolders: appStateRef.current.favoriteFolders.map((folder) =>
          folder.id === folderId && !folder.songIds.includes(songId)
            ? { ...folder, songIds: [...folder.songIds, songId] }
            : folder,
        ),
      });
    },
    [updateProfileState],
  );

  const removeSongFromFolder = useCallback(
    (folderId: string, songId: string) => {
      updateProfileState({
        favoriteFolders: appStateRef.current.favoriteFolders.map((folder) =>
          folder.id === folderId
            ? { ...folder, songIds: folder.songIds.filter((id) => id !== songId) }
            : folder,
        ),
      });
    },
    [updateProfileState],
  );

  const addCustomSong = useCallback(
    (song: Omit<Song, "id">): Song => {
      const newSong: Song = {
        ...song,
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };

      updateProfileState({ customSongs: [...appStateRef.current.customSongs, newSong] });
      return newSong;
    },
    [updateProfileState],
  );

  const removeCustomSong = useCallback(
    (songId: string) => {
      updateProfileState({
        customSongs: appStateRef.current.customSongs.filter((song) => song.id !== songId),
      });
    },
    [updateProfileState],
  );

  const addToAvoidList = useCallback(
    (songId: string, note = "") => {
      const current = appStateRef.current.preferences.avoidList ?? [];
      if (current.some((entry) => entry.songId === songId)) return;
      void setPreferences({
        avoidList: [...current, { songId, note, addedAt: new Date().toISOString() }],
      });
    },
    [setPreferences],
  );

  const removeFromAvoidList = useCallback(
    (songId: string) => {
      void setPreferences({
        avoidList: (appStateRef.current.preferences.avoidList ?? []).filter(
          (entry) => entry.songId !== songId,
        ),
      });
    },
    [setPreferences],
  );

  const isAvoided = useCallback(
    (songId: string) =>
      (appStateRef.current.preferences.avoidList ?? []).some((entry) => entry.songId === songId),
    [],
  );

  const addToRequestLog = useCallback(
    (songId: string, note = "") => {
      const current = appStateRef.current.preferences.requestLog ?? [];
      if (current.some((entry) => entry.songId === songId)) return;
      void setPreferences({
        requestLog: [...current, { songId, note, addedAt: new Date().toISOString() }],
      });
    },
    [setPreferences],
  );

  const removeFromRequestLog = useCallback(
    (songId: string) => {
      void setPreferences({
        requestLog: (appStateRef.current.preferences.requestLog ?? []).filter(
          (entry) => entry.songId !== songId,
        ),
      });
    },
    [setPreferences],
  );

  const isRequested = useCallback(
    (songId: string) =>
      (appStateRef.current.preferences.requestLog ?? []).some((entry) => entry.songId === songId),
    [],
  );

  const saveSearchQuery = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 2) return;

      const updated = [
        trimmed,
        ...appStateRef.current.ui.searchHistory.filter((item) => item !== trimmed),
      ].slice(0, SEARCH_HISTORY_LIMIT);

      const nextState = buildNextProfileState(appStateRef.current, {
        ui: { ...appStateRef.current.ui, searchHistory: updated },
      });
      applyProfileState(nextState);
      await persistNow(nextState);
    },
    [applyProfileState, persistNow],
  );

  const removeSearchQuery = useCallback(
    async (query: string) => {
      const nextState = buildNextProfileState(appStateRef.current, {
        ui: {
          ...appStateRef.current.ui,
          searchHistory: appStateRef.current.ui.searchHistory.filter((item) => item !== query),
        },
      });
      applyProfileState(nextState);
      await persistNow(nextState);
    },
    [applyProfileState, persistNow],
  );

  const clearSearchHistory = useCallback(async () => {
    const nextState = buildNextProfileState(appStateRef.current, {
      ui: { ...appStateRef.current.ui, searchHistory: [] },
    });
    applyProfileState(nextState);
    await persistNow(nextState);
  }, [applyProfileState, persistNow]);

  const setOnboardingDraftStep = useCallback(
    async (step: number) => {
      const nextState = buildNextProfileState(appStateRef.current, {
        ui: { ...appStateRef.current.ui, onboardingDraftStep: step },
      });
      applyProfileState(nextState);
      await persistNow(nextState);
    },
    [applyProfileState, persistNow],
  );

  const clearOnboardingDraftStep = useCallback(async () => {
    const nextState = buildNextProfileState(appStateRef.current, {
      ui: { ...appStateRef.current.ui, onboardingDraftStep: null },
    });
    applyProfileState(nextState);
    await persistNow(nextState);
  }, [applyProfileState, persistNow]);

  const setAISuggestionsMeta = useCallback(
    async (meta: AISuggestionsMeta | null) => {
      const nextState = buildNextProfileState(appStateRef.current, {
        ui: { ...appStateRef.current.ui, aiSuggestionsMeta: meta },
      });
      applyProfileState(nextState);
      await persistNow(nextState);
    },
    [applyProfileState, persistNow],
  );

  const signInWithGoogle = useCallback(async () => {
    const activeClientId = clientIdRef.current;
    if (!activeClientId) {
      throw new Error("App is still loading");
    }

    setIsAuthBusy(true);

    try {
      await flushPendingPersist();
      await persistNow(appStateRef.current);

      const result = await clerkRef.current.startOAuthFlow();
      if (!isMounted.current) return;

      const createdSessionId = result?.createdSessionId;
      if (createdSessionId && result.setActive) {
        await result.setActive({ session: createdSessionId });
      }

      try {
        const synced = await syncProfileAfterSignIn(getToken, activeClientId);
        if (!isMounted.current) return;
        applyProfileState(synced.state);
      } catch (error) {
        console.error("[AppContext] /auth/sync failed:", error);
      }
    } finally {
      if (isMounted.current) {
        setIsAuthBusy(false);
      }
    }
  }, [applyProfileState, flushPendingPersist, getToken, persistNow]);

  const logoutAccount = useCallback(async () => {
    const activeClientId = clientIdRef.current;
    if (!activeClientId) {
      throw new Error("App is still loading");
    }

    setIsAuthBusy(true);

    try {
      await flushPendingPersist();

      try {
        await saveRemoteProfileState(appStateRef.current, activeClientId, getToken);
      } catch (error) {
        console.error("[AppContext] Failed to snapshot account state before logout:", error);
      }

      await clerkRef.current.signOut();
      if (!isMounted.current) return;

      try {
        const remote = await fetchRemoteProfileState(activeClientId, null);
        if (!isMounted.current) return;
        applyProfileState(remote.state);
      } catch (error) {
        console.error("[AppContext] Guest state load failed after logout:", error);
      }
    } finally {
      if (isMounted.current) {
        setIsAuthBusy(false);
      }
    }
  }, [applyProfileState, flushPendingPersist, getToken]);

  const avoidList = useMemo(
    () => appStateRef.current.preferences.avoidList ?? [],
    [preferences.avoidList],
  );

  const requestLog = useMemo(
    () => appStateRef.current.preferences.requestLog ?? [],
    [preferences.requestLog],
  );

  const todaysPick = useMemo(() => (isLoaded ? todaysPickSong(preferences) : null), [isLoaded, preferences]);

  return (
    <AppContext.Provider
      value={{
        clientId,
        accountId,
        accountEmail,
        isAuthenticated: Boolean(accountId),
        isAuthBusy,
        signInWithGoogle,
        logoutAccount,
        getToken,
        preferences,
        setPreferences,
        sets,
        createSet,
        updateSet,
        deleteSet,
        duplicateSet,
        addSongToSet,
        removeSongFromSet,
        reorderSongsInSet,
        updateSongNote,
        updateSetColor,
        mergeSets,
        autoGenerateSet,
        customSongs,
        addCustomSong,
        removeCustomSong,
        likedSongIds,
        toggleLike,
        isLiked,
        alreadyPlayedSongIds,
        markAsPlayed,
        unmarkAsPlayed,
        isPlayed,
        customMoments,
        createCustomMoment,
        deleteCustomMoment,
        momentData,
        updateMomentData,
        favoriteFolders,
        createFavoriteFolder,
        deleteFavoriteFolder,
        addSongToFolder,
        removeSongFromFolder,
        avoidList,
        addToAvoidList,
        removeFromAvoidList,
        isAvoided,
        requestLog,
        addToRequestLog,
        removeFromRequestLog,
        isRequested,
        searchHistory,
        saveSearchQuery,
        removeSearchQuery,
        clearSearchHistory,
        onboardingDraftStep,
        setOnboardingDraftStep,
        clearOnboardingDraftStep,
        aiSuggestionsMeta,
        setAISuggestionsMeta,
        todaysPick,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
