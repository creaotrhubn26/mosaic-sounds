# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Mosaic Beats** — multicultural wedding & event music planning platform. Repo dir is `mosaic-sounds`; README title is "Sound-Planner"; the user-facing brand is **Mosaic Beats**. The most thorough product-level doc lives in `replit.md` at the repo root (548-song DB, 9 event types, 32+ cultures, 6 UI languages, feature list, AsyncStorage keys, key file paths). Read it before making product-shaped decisions.

## Package manager — pnpm only

The root `preinstall` hook deletes `package-lock.json`/`yarn.lock` and exits non-zero if invoked by anything other than pnpm. Always use `pnpm`. Node 24, TypeScript 5.9, pnpm workspaces.

Shared dependency versions are pinned via `catalog:` in `pnpm-workspace.yaml` (React 19, Vite 7, Tailwind 4, drizzle-orm, zod, framer-motion, lucide-react, tanstack/react-query, etc.). When adding a shared dep, prefer adding it to the catalog and referencing `catalog:` from the artifact's `package.json` rather than pinning a separate version. `minimumReleaseAge: 1440` (24h) is enforced — brand-new package versions are rejected.

TypeScript uses `customConditions: ["workspace"]`, so workspace packages export `.ts` sources directly; the build does not pre-compile lib/* before consuming them. `noEmitOnError` is on; strict null checks are on; `strictFunctionTypes` and `noUnusedLocals` are off.

## Repo layout

```
artifacts/             apps — each is an installable pnpm package, scripts live here
  mobile/              Expo SDK 54 / React Native 0.81 / Expo Router v6 (port 18115)
  dj-dashboard/        React 19 + Vite 7 + Tailwind 4, full-screen DJ console (port 19966)
  api-server/          Express 5 + Drizzle + Postgres + Zod, esbuild-bundled (port 3001)
  mockup-sandbox/      Vite design/component preview (port 5173)
  commercial-video/    Vite marketing site (port 3003)
lib/                   shared workspace packages
  db/                  Drizzle schema + pool, single source of truth for SQL
  api-spec/            openapi.yaml — source of truth for the API contract
  api-zod/             GENERATED zod validators (orval output, do not hand-edit)
  api-client-react/    GENERATED TanStack Query hooks + fetch client (orval output)
scripts/               internal repo automation (post-merge hook, etc.)
```

## Common commands

### Root

```bash
pnpm install                  # bootstrap (post-merge hook also pushes db schema)
pnpm typecheck                # lib/* (via tsc --build) + artifacts (--if-present)
pnpm build                    # typecheck, then recursive build of every artifact
```

### Per-artifact (use `--filter`)

```bash
pnpm --filter @workspace/mobile dev          # Expo dev — requires Replit env vars (see below)
pnpm --filter @workspace/dj-dashboard dev    # Vite dev on 0.0.0.0
pnpm --filter @workspace/api-server dev      # esbuild bundle then run dist/index.mjs (needs PORT, DATABASE_URL)
pnpm --filter @workspace/mockup-sandbox dev
pnpm --filter @workspace/commercial-video dev

pnpm --filter @workspace/<name> typecheck    # tsc --noEmit for one artifact
pnpm --filter @workspace/<name> build        # build that artifact
```

API server `dev` is `pnpm run build && pnpm run start` — it does NOT hot-reload; re-run on changes. The build output is a single bundled `dist/index.mjs`; native/optional modules are externalized (`build.mjs`). Mobile `dev` reads `EXPO_PACKAGER_PROXY_URL`, `EXPO_PUBLIC_DOMAIN`, `EXPO_PUBLIC_REPL_ID`, `REACT_NATIVE_PACKAGER_HOSTNAME`, `PORT` — set these when running off Replit.

### Database

Drizzle, dialect `postgresql`. `DATABASE_URL` required.

```bash
pnpm --filter db push          # apply schema (safe, interactive on destructive changes)
pnpm --filter db push-force    # apply schema with --force (skip prompts — destructive ok)
```

The post-merge hook (`scripts/post-merge.sh`) runs `pnpm install --frozen-lockfile && pnpm --filter db push` automatically.

### API codegen

`lib/api-spec/openapi.yaml` is the API contract. Regenerate both client and validators with:

```bash
pnpm --filter @workspace/api-spec codegen
```

This writes to `lib/api-client-react/src/generated/` (TanStack Query hooks, react-query mode, baseUrl `/api`, custom-fetch mutator) and `lib/api-zod/src/generated/` (zod schemas with coerce for query/param, `useDates: true`). Both `generated/` dirs are deleted and rewritten on each run — never hand-edit them. When adding an endpoint, edit `openapi.yaml` first, run codegen, then implement the route in `artifacts/api-server/src/routes/`.

### Tests

There is no test runner configured anywhere in this repo. `typecheck` is the only automated quality gate.

## Architecture notes

### Three-layer API contract

`openapi.yaml` (lib/api-spec) → orval → `@workspace/api-zod` + `@workspace/api-client-react` → consumed by mobile and web. The orval config (`lib/api-spec/orval.config.ts`) forces the API title to `"Api"` because exports assume `generated/api.ts`. The mobile and dj-dashboard apps both depend on `@workspace/api-client-react` and call the same hooks; the API server validates inbound payloads against the same OpenAPI spec via the zod schemas.

### API server

Express 5 mounted under `/api` (`src/app.ts`). Routes are registered in `src/routes/index.ts`: `health`, `ai`, `auth`, `youtube`, `app-state`, `song-preview`, `guest-requests`, `privacy`, `push`, `spotify`. Logger is pino with HTTP middleware. Entry point (`src/index.ts`) loads env via `load-env.ts`, then dynamically imports `app` + `logger` to ensure env is hydrated first.

Auth uses **Clerk** (`@clerk/express`). `src/lib/auth.ts` verifies the Clerk session JWT in the `Authorization: Bearer` header via `verifyToken(token, { secretKey })`, then loads the Clerk user via the Backend SDK. Required env: `CLERK_SECRET_KEY`. There is no local users/sessions table — Clerk is the source of truth for identity. A parallel anonymous-user track is keyed by `clientId` (cookie/header from the mobile app). `POST /api/auth/sync` calls `mergeClientStateIntoAccount` to attach anon profile state to a Clerk user on first sign-in. `POST /api/clerk/webhook` (mounted before global JSON parser in `app.ts` because Svix needs raw body) verifies the Svix signature with `CLERK_WEBHOOK_SIGNING_SECRET` and handles `user.deleted` cleanup.

### Database schema

One Postgres schema, `mosaic_beats`, defined entirely in `lib/db/src/schema/mosaic-beats.ts`. Three tables: `client_profiles` (anon, keyed by clientId), `account_profiles` (keyed by Clerk user ID, no FK), `youtube_connections` (keyed by Clerk user ID, no FK). Both profile tables store the entire app state as a `jsonb` blob with a `state_version` integer — schema migrations of the profile blob happen in app code, not SQL. `lib/db/sql/` holds reference SQL dumps; they are not authoritative.

### Mobile app — Expo Router v6

Entry: `app/_layout.tsx`. Provider order from the outside in: `ClerkProvider` (token cache via `expo-secure-store`) → `SafeAreaProvider` → `ErrorBoundary` → `QueryClientProvider` → `GestureHandlerRootView` → `AppProvider` → `SubscriptionProvider` (RevenueCat) → `ThemeProvider` → `PlaybackProvider`. `MiniPlayer` and `TutorialOverlay` are rendered as siblings to the navigator. Search index (`constants/searchIndex.ts`) is warmed once after first paint. Requires `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.

`context/AppContext.tsx` is the master state hub: preferences, sets, likes, played, custom songs, custom moments, folders, avoid list, request log, AI suggestion cache. It hydrates from AsyncStorage on mount, migrates legacy keys (`LEGACY_STORAGE_KEYS` in `lib/profile-state.ts`) into the single profile-state blob, and syncs to the API server. Clerk hooks (`useAuth`, `useUser`, `useOAuth({ strategy: "oauth_google" })`) are mirrored through a `clerkRef` so derived callbacks (`getToken`, `persistNow`) keep stable identities — without this, bootstrap fires on every render. **When changing AsyncStorage shape, update the migration in `profile-state.ts` (`APP_STATE_VERSION`, `normalizeProfileState`) — do not silently change the schema; older installs in the wild rely on this.**

Sign-in: `signInWithGoogle()` calls Clerk's `startOAuthFlow()` → `setActive({ session })` → `POST /api/auth/sync` (merges anon clientId state into authenticated account state). Sign-out: `clerkSignOut()` then re-fetches anon state. YouTube linking (`app/auth/youtube.tsx`) is a separate third-party-API OAuth flow, NOT user authentication — still uses the API server's `/youtube/start` → `/youtube/callback` flow.

### Data files

`artifacts/mobile/constants/data.ts` (songs s1–s303, WEDDING_MOMENTS, CULTURES, EventType, helpers) and `data-extended.ts` (s304–s548) are hand-curated. New songs must follow the same `Song` shape (id, title, artist, youtubeVideoId, energyScore, dholScore, danceability, moments[], cultureTags[], languageTags[], tags[], familyFriendly, bpmRange?). The 6 UI languages (`en`, `nb`, `hi`, `pa`, `ur`, `ta`) and all 9 event types are translated in `constants/i18n.ts` — adding a new event type or language requires updates across `i18n.ts`, `data.ts`'s moment helpers, and the onboarding screens.

`EventType` is defined once in `constants/data.ts` and re-exported from `lib/profile-state.ts`. Don't redeclare it.

### DJ Dashboard ↔ mobile handoff

Mobile's "Open in DJ Dashboard" share encodes the set as base64 JSON into the URL hash: `https://.../#<base64 JSON>`. The web app parses `location.hash` on load. Don't break the encoding/decoding contract on either side; either both apps update, or neither does.

### Replit specifics

`.replit` declares Node 24, the deployment target (`autoscale`), and shared env (RevenueCat API keys live there). The `runButton` workflow runs `commercial-video: web` only — other artifacts are started manually. `userenv.development` includes `SPOTIFY_CALLBACK_HOST` (the Replit dev domain). When running outside Replit, supply these env vars yourself.

## Conventions worth following

- Generated code lives only in `lib/api-zod/src/generated/` and `lib/api-client-react/src/generated/`. Treat them as build output; regenerate via the codegen command, never edit by hand.
- New API endpoints: edit `openapi.yaml` → `pnpm --filter @workspace/api-spec codegen` → implement in `artifacts/api-server/src/routes/` and register in `routes/index.ts`. Routes that need raw request body (e.g. webhook signature verification) must be mounted in `app.ts` BEFORE the global `express.json()` middleware.
- New shared dep: add to `pnpm-workspace.yaml` `catalog:` and reference `catalog:` from artifact `package.json` unless there's a reason to pin per-artifact.
- New AsyncStorage data: extend `AppProfileState` in `lib/profile-state.ts`, bump `APP_STATE_VERSION` if migration is needed, update `normalizeProfileState`.
- Authenticated calls from mobile: take a `getToken: GetToken` parameter (from `useApp().getToken` → wraps Clerk's `useAuth().getToken`). Don't read tokens from AsyncStorage — Clerk owns session lifetime.
- API server Vercel deploy: `artifacts/api-server/build-vercel.mjs` bundles the Express app as `api/index.mjs` for serverless Functions; deployed as the separate `mosaicbeats-api` Vercel project (not the Next.js `mosaicbeats-web` project).
- Brand colors are tokenized (`#0F0708` bg, `#C8102E` crimson, `#D4A017` gold, `#FAF0E6` warm-white text). Use the existing tokens rather than introducing new hex values.
