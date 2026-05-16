# Mosaic Beats

## Overview

A multicultural wedding & event music planning platform:
- **Mobile app** (Expo React Native) — couples plan music for multicultural weddings/events
- **DJ Dashboard** (React + Vite web app) — full-screen DJ console for live performance

Cultures supported: Punjabi, Pakistani, North Indian, South Indian, Sikh, Muslim, Norwegian, Arabic, Turkish, Nigerian, Ghanaian, Latin, Brazilian, West African, and 18+ more.

## Artifacts

| Artifact | Kind | Path | Port |
|---|---|---|---|
| Music Match for Weddings | mobile | `artifacts/mobile/` | 18115 |
| API Server | api | `artifacts/api-server/` | 3001 |
| DJ Dashboard | web | `artifacts/dj-dashboard/` | 19966 |
| Component Preview Server | design | `artifacts/mockup-sandbox/` | 5173 |

## Song Database

**548 curated songs** (s1–s548, extended in `data-extended.ts`):
- Punjabi Bhangra, Bollywood, Pakistani Sufi/Urdu, South Indian (Tamil/Telugu)
- Norwegian, English/Mixed, Mehndi folk, Haldi folk, Walima Sufi
- **Arabic (50)**: Amr Diab, Nancy Ajram, Saad Lamjarred, Fairuz, Maher Zain, Balti, Cheb Khaled, Aseel Abou Bakr, etc.
- **Turkish (30)**: Tarkan, Sertab Erener, Hadise, Sezen Aksu, Mustafa Sandal, etc.
- **West African / Afrobeats (45)**: Wizkid, Burna Boy, Davido, Rema, CKay, Fela Kuti, Yemi Alade, etc.
- **Latin (45)**: Bad Bunny, J Balvin, Daddy Yankee, Marc Anthony, Shakira, Luis Fonsi, Celia Cruz, etc.

Each song has: `id, title, artist, youtubeVideoId, energyScore, dholScore, danceability, moments[], cultureTags[], languageTags[], tags[], familyFriendly, bpmRange?`

## Event Types

9 event types: `"wedding" | "birthday" | "corporate" | "party" | "mehendi" | "sangeet" | "nikkah" | "sweet16" | "graduation"`

Each has full moment arrays and is translated in all 6 UI languages.

## UI Languages

6 languages: `"en" | "nb" | "hi" | "pa" | "ur" | "ta"` (English, Norwegian, Hindi, Punjabi, Urdu, Tamil)

## Mobile App — Implemented Features

### Core UX
- Animated mosaic splash screen + logo reveal
- **Onboarding step 0**: 9 event type cards (Wedding/Birthday/Corporate/Party/Mehendi/Sangeet/Nikkah/Sweet16/Graduation) with icon fallback for types without photos
- **Onboarding step 1**: 2-column visual image cards (32 cultures, AI-generated scene photos)
- Culture/Language/Vibe/Energy/Family-friendly sliders; non-wedding types skip to Preview
- **6-language UI**: All labels, onboarding text, event names, moment labels translated in EN/NB/HI/PA/UR/TA

### Music Features
- **21+ wedding moments** per event type; culture-filtered (restrictedTo field)
- **Smart recommendations**: culture + language + energy + vibe + clean-lyrics scoring
- **AI moment suggestions**: culture-aware scoring matrix (17 moments × culture aliases), Essential/Recommended/Optional/Skip tiers
- **SongCard**: BPM pulse dot, 3D flip animation revealing back metadata
- **Sort & filter**: Recommended / Energy / Dhol; tag filter pills
- **Search**: AsyncStorage history, filter pills, Levenshtein "Did you mean?", predictive autocomplete, decade filter pills (70s–2020s)
- **Pre-computed search index**: Lazy singleton, warmed on startup

### Playlist Sets
- Create/edit named sets, add/remove/reorder (drag) songs, DJ notes per song
- Auto energy arc sort, add all N songs bulk action, cross-set duplicate warnings
- Set total runtime (via SONG_META), large set pagination (25 at a time)
- **Swipe-left to remove** — `ReanimatedSwipeable` on each song row (guard-imported)
- **Long-press on set card** — shows duplicate/delete action sheet
- **Event template wizard** (`/template-wizard`) — pick event type → preview pre-filled moments → create all sets at once
- **First-launch tutorial overlay** (`TutorialOverlay.tsx`) — 4-step feature walkthrough, AsyncStorage gated, skip/next controls

### Share / Export
- Standard text, WhatsApp format, DJ brief (text)
- **Open in DJ Dashboard** — encodes set as base64 JSON and opens the web DJ console
- Instagram Story card (react-native-view-shot)
- PDF DJ brief (expo-print, dark HTML template)
- Create YouTube Playlist (YouTube Data API v3)
- Guest voting QR code
- NFC tag write (react-native-nfc-manager)

### DJ Mode (Mobile)
- Full-screen swipe L/R navigation in `app/set/dj/[id].tsx`
- BPM display, energy bars, DJ notes, phase badge, YouTube tap-to-open

### Other
- Favourites (liked songs) with sort by Recent / Energy / Dhol
- Avoid list, Song request log
- Custom song entry (`/song/add`) with **Spotify / Apple Music import shell** (UI placeholder, alerts "coming soon")
- **MosaicSpinner** (`components/ui/MosaicSpinner.tsx`) — branded 3-dot pulsing spinner with ring
- **EmptyState** (`components/ui/EmptyState.tsx`) — branded empty-state component with icon ring + optional CTA
- Offline thumbnail caching (expo-image disk cache)
- Deep link: `mosaicbeats://set/[id]`, `mosaicbeats://moment/[id]`
- AsyncStorage schema migration (v2), phased startup loading, mounted-ref memory guard
- RevenueCat monetization: Free / Pro / Wedding Pack; entitlement = `"pro"`

## DJ Dashboard Web App (`artifacts/dj-dashboard/`)

Full-screen dark DJ console for live performance:
- **Load screen**: Paste set JSON or click Load Demo Set
- **URL hash loading**: `#<base64 JSON>` — mobile app "Open in DJ Dashboard" encodes and opens directly
- **Left panel**: Song queue with played/current/next status, BPM display, mark-played toggle
- **Right panel**:
  - Now-playing with shimmer gold title animation
  - BPM card with live CSS pulse animation (speed tied to actual BPM)
  - Energy / Danceability / Dhol animated bar charts
  - Family-friendly badge
  - Tag pills (culture, language)
  - DJ Notes panel (gold border, multi-line)
  - Controls: Prev / Next Track / YouTube link
  - "Up Next" preview bar with mini energy indicator
- **Timer**: Click to start/stop, resets on track change
- **Keyboard shortcuts**: ← → navigate, Space = next, P = timer toggle
- **Cue markers**: Timestamps parsed from DJ's notes (regex `\d:\d\d`) shown as gold dots on the track progress bar
- **Tap-BPM**: Gold "TAP" button on the BPM card — click to detect live tempo; overrides static BPM display in gold
- **Streaming panel**: "Streaming" button in toolbar opens Spotify / Apple Music / Rekordbox XML connect panel
- **Long-press on set cards (mobile)**: Duplicate/Delete action sheet on 450ms long-press
- Mosaic Beats branding: `#0F0708` bg, `#C8102E` crimson, `#D4A017` gold

## Color Theme

| Token | Value | Usage |
|---|---|---|
| `--mb-bg` | `#0F0708` | Background |
| `--mb-card` | `#1A0B0C` | Card bg |
| `--mb-crimson` | `#C8102E` | Primary accent |
| `--mb-gold` | `#D4A017` | Secondary accent |
| `--mb-text` | `#FAF0E6` | Warm white text |
| `--mb-muted` | `#6B5F5A` | Muted text |

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **Mobile**: Expo SDK 53, Expo Router v6, React Native, Hermes JS engine
- **Web**: React 19 + Vite 7, Tailwind CSS v4, Wouter router
- **API**: Express 5 + Drizzle ORM + PostgreSQL + Zod
- **Fonts**: Poppins (mobile), Inter (web)
- **State (mobile)**: React Context + AsyncStorage
- **Monetization**: RevenueCat (revenuecat integration installed)

## Key Files

- `artifacts/mobile/constants/data.ts` — Song DB (s1–s303 core), WEDDING_MOMENTS, CULTURES, EventType, getMomentsForEventType
- `artifacts/mobile/constants/data-extended.ts` — Songs s304–s548 (245 songs: Bollywood, K-pop, Greek, Nigerian, Persian, Jewish, Caribbean, Filipino, Brazilian, Classical, Dhol, Raga, Gospel, Reggaeton, Lo-fi)
- `artifacts/mobile/constants/i18n.ts` — Translations for EN/NB/HI/PA/UR/TA, all 9 event types
- `artifacts/mobile/lib/profile-state.ts` — WeddingSet, UserPreferences, AppProfileState types
- `artifacts/mobile/lib/revenuecat.tsx` — RevenueCat hook, paywall helpers
- `artifacts/mobile/app/set/[id].tsx` — Set detail (reorder, notes, share, DJ export, BpmTapper)
- `artifacts/mobile/app/template-wizard.tsx` — Event template wizard (9 event types → pre-filled moment list)
- `artifacts/mobile/components/TutorialOverlay.tsx` — First-launch tutorial overlay (6 steps, AsyncStorage key)
- `artifacts/mobile/components/BpmTapper.tsx` — Pure-JS tap tempo component (3+ taps, rolling avg, haptics)
- `artifacts/mobile/components/YouTubePlayerModal.tsx` — In-app YouTube embed via WebView
- `artifacts/mobile/components/AlternativesModal.tsx` — Broken-link recovery: top-5 scored alternatives
- `artifacts/mobile/components/ui/MosaicSpinner.tsx` — Animated Mosaic Beats logo spinner
- `artifacts/mobile/components/ui/EmptyState.tsx` — Branded empty state component
- `artifacts/mobile/components/ui/ShimmerCard.tsx` — Shimmer loading skeleton
- `artifacts/mobile/lib/push-notifications.ts` — Expo push notification registration + listeners
- `artifacts/mobile/lib/spotify.ts` — Spotify OAuth / Apple Music connect helpers
- `artifacts/mobile/app/set/dj/[id].tsx` — Mobile DJ mode full-screen
- `artifacts/mobile/app/onboarding.tsx` — Onboarding (9 event types, 32 cultures)
- `artifacts/mobile/app/(tabs)/settings.tsx` — Settings (language picker, stats, avoid/request lists)
- `artifacts/dj-dashboard/src/App.tsx` — Full DJ console web app

## AsyncStorage Keys

- `@mosaicbeats_prefs` — UserPreferences
- `@mosaicbeats_sets` — WeddingSet[]
- `@mosaicbeats_likes` — string[] liked song IDs
- `@mosaicbeats_played` — string[] played song IDs
- `@mosaicbeats_custom_songs` — Song[] user-added songs
- `@mosaicbeats_custom_moments` — CustomMoment[]
- `@mosaicbeats_moment_data` — Record<momentId, MomentData>
- `@mosaicbeats_folders` — FavoriteFolder[]
- `@mosaicbeats_storage_version` — schema version

## API Endpoints

- `GET /api/healthz` — Health check
- `GET/POST /api/app-state` — Sync app profile state (sets, prefs, likes)
