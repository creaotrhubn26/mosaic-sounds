import { pool } from "@workspace/db";

export const APP_STATE_VERSION = 1;

const SEARCH_HISTORY_LIMIT = 8;

export class InvalidRequestError extends Error {}

type Queryable = Pick<typeof pool, "query">;

type StoredStateRow = {
  state: unknown;
  state_version: number;
};

export type AppState = {
  schemaVersion: number;
  preferences: Record<string, unknown> & {
    cultures: string[];
    languages: string[];
    vibe: number;
    energy: number;
    cleanLyrics: boolean;
    onboardingComplete: boolean;
    avoidList: Array<Record<string, unknown>>;
    requestLog: Array<Record<string, unknown>>;
  };
  sets: Array<Record<string, unknown>>;
  likedSongIds: string[];
  alreadyPlayedSongIds: string[];
  customMoments: Array<Record<string, unknown>>;
  momentData: Record<string, Record<string, unknown>>;
  favoriteFolders: Array<Record<string, unknown>>;
  customSongs: Array<Record<string, unknown>>;
  ui: {
    onboardingDraftStep: number | null;
    searchHistory: string[];
    aiSuggestionsMeta: Record<string, unknown> | null;
  };
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asObjectArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    : [];
}

function asMomentDataRecord(value: unknown): Record<string, Record<string, unknown>> {
  const input = asObject(value);
  return Object.fromEntries(Object.entries(input).map(([key, raw]) => [key, asObject(raw)]));
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function trimToUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function timestampValue(value: unknown): number {
  if (typeof value !== "string") return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function chooseScalarPreference<T>(base: T, incoming: T, defaultValue: T): T {
  if (base !== defaultValue) return base;
  if (incoming !== defaultValue) return incoming;
  return base;
}

function mergeEntriesBySongId(
  base: Array<Record<string, unknown>>,
  incoming: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const bySongId = new Map<string, Record<string, unknown>>();

  for (const entry of base) {
    const songId = trimToUndefined(entry.songId);
    if (!songId) continue;
    bySongId.set(songId, entry);
  }

  for (const entry of incoming) {
    const songId = trimToUndefined(entry.songId);
    if (!songId) continue;
    const existing = bySongId.get(songId);
    if (!existing) {
      bySongId.set(songId, entry);
      continue;
    }

    const existingTs = timestampValue(existing.addedAt);
    const incomingTs = timestampValue(entry.addedAt);
    bySongId.set(songId, incomingTs >= existingTs ? entry : existing);
  }

  return [...bySongId.values()].sort(
    (left, right) => timestampValue(right.addedAt) - timestampValue(left.addedAt),
  );
}

function mergeRecordsById(
  base: Array<Record<string, unknown>>,
  incoming: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const byId = new Map<string, Record<string, unknown>>();

  for (const item of base) {
    const id = trimToUndefined(item.id);
    if (!id) continue;
    byId.set(id, item);
  }

  for (const item of incoming) {
    const id = trimToUndefined(item.id);
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, item);
      continue;
    }

    const existingTs = Math.max(timestampValue(existing.updatedAt), timestampValue(existing.createdAt));
    const incomingTs = Math.max(timestampValue(item.updatedAt), timestampValue(item.createdAt));
    byId.set(id, incomingTs >= existingTs ? { ...existing, ...item } : existing);
  }

  return [...byId.values()];
}

function mergeSets(
  base: Array<Record<string, unknown>>,
  incoming: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const byId = new Map<string, Record<string, unknown>>();

  for (const item of base) {
    const id = trimToUndefined(item.id);
    if (!id) continue;
    byId.set(id, item);
  }

  for (const item of incoming) {
    const id = trimToUndefined(item.id);
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, item);
      continue;
    }

    const existingTs = Math.max(timestampValue(existing.updatedAt), timestampValue(existing.createdAt));
    const incomingTs = Math.max(timestampValue(item.updatedAt), timestampValue(item.createdAt));
    byId.set(id, incomingTs >= existingTs ? { ...existing, ...item } : existing);
  }

  return [...byId.values()].sort(
    (left, right) =>
      Math.max(timestampValue(right.updatedAt), timestampValue(right.createdAt)) -
      Math.max(timestampValue(left.updatedAt), timestampValue(left.createdAt)),
  );
}

function mergeFavoriteFolders(
  base: Array<Record<string, unknown>>,
  incoming: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const byId = new Map<string, Record<string, unknown>>();

  for (const folder of base) {
    const id = trimToUndefined(folder.id);
    if (!id) continue;
    byId.set(id, folder);
  }

  for (const folder of incoming) {
    const id = trimToUndefined(folder.id);
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, folder);
      continue;
    }

    byId.set(id, {
      ...existing,
      ...folder,
      songIds: uniqueStrings([
        ...asStringArray(existing.songIds),
        ...asStringArray(folder.songIds),
      ]),
    });
  }

  return [...byId.values()];
}

function mergeMomentData(
  base: Record<string, Record<string, unknown>>,
  incoming: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const mergedKeys = uniqueStrings([...Object.keys(base), ...Object.keys(incoming)]);

  return Object.fromEntries(
    mergedKeys.map((key) => {
      const left = asObject(base[key]);
      const right = asObject(incoming[key]);

      return [
        key,
        {
          ...left,
          ...right,
          notes: trimToUndefined(right.notes) ?? trimToUndefined(left.notes) ?? "",
          completed: left.completed === true || right.completed === true,
          durationMin:
            typeof right.durationMin === "number" && Number.isFinite(right.durationMin)
              ? right.durationMin
              : typeof left.durationMin === "number" && Number.isFinite(left.durationMin)
                ? left.durationMin
                : undefined,
        },
      ];
    }),
  );
}

function mergeAiSuggestionsMeta(
  base: Record<string, unknown> | null,
  incoming: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!base) return incoming;
  if (!incoming) return base;
  const baseTs = asNumber(base.ts, 0);
  const incomingTs = asNumber(incoming.ts, 0);
  return incomingTs >= baseTs ? incoming : base;
}

function areStatesEqual(left: AppState, right: AppState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function resolveClientId(value: string | undefined): string {
  const clientId = value?.trim() ?? "";
  if (!/^[A-Za-z0-9._:-]{1,200}$/.test(clientId)) {
    throw new InvalidRequestError("Invalid client id");
  }
  return clientId;
}

export function getDefaultAppState(): AppState {
  return {
    schemaVersion: APP_STATE_VERSION,
    preferences: {
      cultures: [],
      languages: [],
      vibe: 0.5,
      energy: 0.7,
      cleanLyrics: true,
      onboardingComplete: false,
      themeMode: "dark",
      hapticLevel: "full",
      collapseUnplanned: false,
      languageMix: {},
      avoidList: [],
      requestLog: [],
    },
    sets: [],
    likedSongIds: [],
    alreadyPlayedSongIds: [],
    customMoments: [],
    momentData: {},
    favoriteFolders: [],
    customSongs: [],
    ui: {
      onboardingDraftStep: null,
      searchHistory: [],
      aiSuggestionsMeta: null,
    },
  };
}

export function normalizeAppState(input: unknown): AppState {
  const defaults = getDefaultAppState();
  const data = asObject(input);
  const preferences = asObject(data.preferences);
  const ui = asObject(data.ui);

  return {
    schemaVersion: asNumber(data.schemaVersion, APP_STATE_VERSION),
    preferences: {
      ...defaults.preferences,
      ...preferences,
      cultures: asStringArray(preferences.cultures),
      languages: asStringArray(preferences.languages),
      vibe: asNumber(preferences.vibe, defaults.preferences.vibe),
      energy: asNumber(preferences.energy, defaults.preferences.energy),
      cleanLyrics:
        typeof preferences.cleanLyrics === "boolean"
          ? preferences.cleanLyrics
          : defaults.preferences.cleanLyrics,
      onboardingComplete:
        typeof preferences.onboardingComplete === "boolean"
          ? preferences.onboardingComplete
          : defaults.preferences.onboardingComplete,
      avoidList: asObjectArray(preferences.avoidList),
      requestLog: asObjectArray(preferences.requestLog),
    },
    sets: asObjectArray(data.sets),
    likedSongIds: asStringArray(data.likedSongIds),
    alreadyPlayedSongIds: asStringArray(data.alreadyPlayedSongIds),
    customMoments: asObjectArray(data.customMoments),
    momentData: asMomentDataRecord(data.momentData),
    favoriteFolders: asObjectArray(data.favoriteFolders),
    customSongs: asObjectArray(data.customSongs),
    ui: {
      onboardingDraftStep: asNullableNumber(ui.onboardingDraftStep),
      searchHistory: asStringArray(ui.searchHistory).slice(0, SEARCH_HISTORY_LIMIT),
      aiSuggestionsMeta:
        ui.aiSuggestionsMeta && typeof ui.aiSuggestionsMeta === "object"
          ? asObject(ui.aiSuggestionsMeta)
          : null,
    },
  };
}

export function isAppStateMeaningful(stateInput: unknown): boolean {
  const state = normalizeAppState(stateInput);

  return Boolean(
    state.preferences.onboardingComplete ||
      state.preferences.cultures.length > 0 ||
      state.preferences.languages.length > 0 ||
      trimToUndefined(state.preferences.coupleNames) ||
      trimToUndefined(state.preferences.weddingDate) ||
      state.preferences.avoidList.length > 0 ||
      state.preferences.requestLog.length > 0 ||
      state.sets.length > 0 ||
      state.likedSongIds.length > 0 ||
      state.alreadyPlayedSongIds.length > 0 ||
      state.customMoments.length > 0 ||
      Object.keys(state.momentData).length > 0 ||
      state.favoriteFolders.length > 0 ||
      state.customSongs.length > 0 ||
      state.ui.searchHistory.length > 0 ||
      state.ui.onboardingDraftStep !== null ||
      state.ui.aiSuggestionsMeta
  );
}

export function mergeAppStates(baseInput: unknown, incomingInput: unknown): AppState {
  const defaults = getDefaultAppState();
  const base = normalizeAppState(baseInput);
  const incoming = normalizeAppState(incomingInput);

  if (!isAppStateMeaningful(base)) return incoming;
  if (!isAppStateMeaningful(incoming)) return base;

  return normalizeAppState({
    schemaVersion: APP_STATE_VERSION,
    preferences: {
      ...base.preferences,
      ...incoming.preferences,
      cultures: uniqueStrings([...base.preferences.cultures, ...incoming.preferences.cultures]),
      languages: uniqueStrings([...base.preferences.languages, ...incoming.preferences.languages]),
      vibe: chooseScalarPreference(base.preferences.vibe, incoming.preferences.vibe, defaults.preferences.vibe),
      energy: chooseScalarPreference(
        base.preferences.energy,
        incoming.preferences.energy,
        defaults.preferences.energy,
      ),
      cleanLyrics: chooseScalarPreference(
        base.preferences.cleanLyrics,
        incoming.preferences.cleanLyrics,
        defaults.preferences.cleanLyrics,
      ),
      onboardingComplete:
        base.preferences.onboardingComplete || incoming.preferences.onboardingComplete,
      weddingDate:
        trimToUndefined(base.preferences.weddingDate) ?? trimToUndefined(incoming.preferences.weddingDate),
      coupleNames:
        trimToUndefined(base.preferences.coupleNames) ?? trimToUndefined(incoming.preferences.coupleNames),
      themeMode:
        chooseScalarPreference(base.preferences.themeMode, incoming.preferences.themeMode, defaults.preferences.themeMode),
      accentColor:
        trimToUndefined(base.preferences.accentColor) ?? trimToUndefined(incoming.preferences.accentColor),
      hapticLevel:
        chooseScalarPreference(
          base.preferences.hapticLevel,
          incoming.preferences.hapticLevel,
          defaults.preferences.hapticLevel,
        ),
      collapseUnplanned: chooseScalarPreference(
        base.preferences.collapseUnplanned,
        incoming.preferences.collapseUnplanned,
        defaults.preferences.collapseUnplanned,
      ),
      languageMix: {
        ...asObject(base.preferences.languageMix),
        ...asObject(incoming.preferences.languageMix),
      },
      avoidList: mergeEntriesBySongId(base.preferences.avoidList, incoming.preferences.avoidList),
      requestLog: mergeEntriesBySongId(base.preferences.requestLog, incoming.preferences.requestLog),
    },
    sets: mergeSets(base.sets, incoming.sets),
    likedSongIds: uniqueStrings([...base.likedSongIds, ...incoming.likedSongIds]),
    alreadyPlayedSongIds: uniqueStrings([
      ...base.alreadyPlayedSongIds,
      ...incoming.alreadyPlayedSongIds,
    ]),
    customMoments: mergeRecordsById(base.customMoments, incoming.customMoments),
    momentData: mergeMomentData(base.momentData, incoming.momentData),
    favoriteFolders: mergeFavoriteFolders(base.favoriteFolders, incoming.favoriteFolders),
    customSongs: mergeRecordsById(base.customSongs, incoming.customSongs),
    ui: {
      onboardingDraftStep: incoming.ui.onboardingDraftStep ?? base.ui.onboardingDraftStep,
      searchHistory: uniqueStrings([
        ...incoming.ui.searchHistory,
        ...base.ui.searchHistory,
      ]).slice(0, SEARCH_HISTORY_LIMIT),
      aiSuggestionsMeta: mergeAiSuggestionsMeta(base.ui.aiSuggestionsMeta, incoming.ui.aiSuggestionsMeta),
    },
  });
}

async function normalizeStoredRow(
  row: StoredStateRow,
  persistNormalized: (normalizedState: AppState) => Promise<void>,
): Promise<AppState> {
  const normalizedState = normalizeAppState(row.state);
  const rawState = asObject(row.state) as AppState;

  if (row.state_version !== APP_STATE_VERSION || !areStatesEqual(normalizedState, rawState)) {
    await persistNormalized(normalizedState);
  }

  return normalizedState;
}

export async function getStoredClientAppState(
  clientId: string,
  queryable: Queryable = pool,
): Promise<AppState | null> {
  const result = await queryable.query<StoredStateRow>(
    `
      select state, state_version
      from mosaic_beats.client_profiles
      where client_id = $1
      limit 1
    `,
    [clientId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return normalizeStoredRow(row, async (normalizedState) => {
    await queryable.query(
      `
        update mosaic_beats.client_profiles
        set state_version = $2,
            state = $3::jsonb
        where client_id = $1
      `,
      [clientId, APP_STATE_VERSION, JSON.stringify(normalizedState)],
    );
  });
}

export async function getOrCreateClientAppState(
  clientId: string,
  queryable: Queryable = pool,
): Promise<AppState> {
  const existing = await getStoredClientAppState(clientId, queryable);
  if (existing) return existing;

  const state = getDefaultAppState();

  await queryable.query(
    `
      insert into mosaic_beats.client_profiles (client_id, state_version, state)
      values ($1, $2, $3::jsonb)
    `,
    [clientId, APP_STATE_VERSION, JSON.stringify(state)],
  );

  return state;
}

export async function saveClientAppState(
  clientId: string,
  input: unknown,
  queryable: Queryable = pool,
): Promise<AppState> {
  const state = normalizeAppState(input);

  await queryable.query(
    `
      insert into mosaic_beats.client_profiles (client_id, state_version, state)
      values ($1, $2, $3::jsonb)
      on conflict (client_id)
      do update set
        state_version = excluded.state_version,
        state = excluded.state
    `,
    [clientId, APP_STATE_VERSION, JSON.stringify(state)],
  );

  return state;
}

export async function getStoredAccountAppState(
  accountId: string,
  queryable: Queryable = pool,
): Promise<AppState | null> {
  const result = await queryable.query<StoredStateRow>(
    `
      select state, state_version
      from mosaic_beats.account_profiles
      where account_id = $1
      limit 1
    `,
    [accountId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return normalizeStoredRow(row, async (normalizedState) => {
    await queryable.query(
      `
        update mosaic_beats.account_profiles
        set state_version = $2,
            state = $3::jsonb
        where account_id = $1
      `,
      [accountId, APP_STATE_VERSION, JSON.stringify(normalizedState)],
    );
  });
}

export async function getOrCreateAccountAppState(
  accountId: string,
  queryable: Queryable = pool,
): Promise<AppState> {
  const existing = await getStoredAccountAppState(accountId, queryable);
  if (existing) return existing;

  const state = getDefaultAppState();

  await queryable.query(
    `
      insert into mosaic_beats.account_profiles (account_id, state_version, state)
      values ($1, $2, $3::jsonb)
    `,
    [accountId, APP_STATE_VERSION, JSON.stringify(state)],
  );

  return state;
}

export async function saveAccountAppState(
  accountId: string,
  input: unknown,
  queryable: Queryable = pool,
): Promise<AppState> {
  const state = normalizeAppState(input);

  await queryable.query(
    `
      insert into mosaic_beats.account_profiles (account_id, state_version, state)
      values ($1, $2, $3::jsonb)
      on conflict (account_id)
      do update set
        state_version = excluded.state_version,
        state = excluded.state
    `,
    [accountId, APP_STATE_VERSION, JSON.stringify(state)],
  );

  return state;
}

export async function mergeClientStateIntoAccount(
  accountId: string,
  clientId: string,
  queryable: Queryable = pool,
): Promise<AppState> {
  const [accountState, clientState] = await Promise.all([
    getOrCreateAccountAppState(accountId, queryable),
    getStoredClientAppState(clientId, queryable),
  ]);

  if (!clientState || !isAppStateMeaningful(clientState)) {
    return accountState;
  }

  const mergedState = mergeAppStates(accountState, clientState);
  await saveAccountAppState(accountId, mergedState, queryable);
  return mergedState;
}
