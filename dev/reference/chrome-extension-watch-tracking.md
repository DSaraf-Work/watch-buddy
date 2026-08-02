# Chrome Extension: OTT Watch History Tracking (Optional)

**Status**: Future / optional — not in current implementation scope  
**Last Updated**: 2026-08-03  
**Related**: [Watch History feature](../feature/04-watch-history.md) · [Master implementation plan](../impl/master-implementation-plan.md) (Post-Launch Phase 4)

---

## Overview

Optional Chrome/Firefox extension to automatically track watch history and viewing time on Netflix, Amazon Prime Video, and Disney+ Hotstar, syncing progress to the Watch-Buddy library via the existing backend (Supabase).

**Feasibility**: Yes — 100% feasible. Extensions such as Language Reactor and various Trakt.tv sync plugins use the same approach.

Because streaming services use heavy DRM to protect the actual video stream, you cannot access the media file itself. You do not need to. Build this by injecting a script that reads the standard HTML5 `<video>` tag for timestamps and scrapes surrounding webpage text for the title.

---

## Goal

Build a browser extension that tracks Netflix, Prime, and Hotstar watch history/time and updates a personal library or watchlist in Watch-Buddy.

---

## Architecture Strategy

Because Netflix, Prime, and Hotstar use completely different website structures, you cannot write one universal scraper. Use a **modular architecture**:

1. **Platform-specific scrapers** — separate scripts per service
2. **Central brain** — background service worker that receives data from scrapers and standardizes it
3. **Storage** — local (`chrome.storage`) and/or Watch-Buddy backend (Supabase via authenticated API)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Content Scripts │────▶│ Service Worker   │────▶│ chrome.storage /    │
│ netflix.js      │     │ (aggregator)     │     │ Watch-Buddy API     │
│ prime.js        │     │                  │     │ (Supabase)          │
│ hotstar.js      │     └──────────────────┘     └─────────────────────┘
└─────────────────┘              │
                                 ▼
                        ┌──────────────────┐
                        │ Popup / Web UI   │
                        │ (library view)   │
                        └──────────────────┘
```

---

## Feasibility Analysis

| Factor | Assessment |
|--------|------------|
| **Overall** | Feasible — many extensions already do similar tracking via content scripts |
| **DRM** | Cannot access raw video stream; can read HTML5 `<video>` `currentTime` / `duration` and UI progress |
| **DOM obfuscation** | Netflix heavily obfuscates React class names (e.g. `.ltr-1j92n`); target element hierarchies or `<title>` tag |
| **SPA routing** | URL changes via History API without full reload; use `MutationObserver`, `popstate`, or `chrome.webNavigation` |
| **Cross-origin** | Requires `host_permissions` in Manifest V3 for each OTT domain |
| **Rate of updates** | Throttle heartbeats (e.g. every 30s) to avoid overloading browser and backend |

---

## High-Level Implementation Plan

### Phase 1: Configuration & Scaffolding (Manifest V3)

Create `manifest.json` with:

- `host_permissions` for Netflix, Prime, and Hotstar URLs
- `storage` — persist history locally
- `webNavigation` or `tabs` — detect URL/navigation changes when user clicks "Next Episode" without a full page reload

### Phase 2: Platform-Specific Scrapers (Content Scripts)

Create three separate JavaScript files: `netflix.js`, `prime.js`, `hotstar.js`. Configure each to inject only on its respective domain.

Each script must:

1. **Identify the media** — query the DOM for title, season, and episode (or parse `window.location` / `<title>`)
2. **Hook into the player** — find the `<video>` element and attach `timeupdate` (or equivalent) listeners
3. **Throttle & send** — send heartbeat messages to the service worker every ~30 seconds with progress (`currentTime` / `duration`); do not message every second

### Phase 3: The Aggregator (Service Worker)

Create `background.js` (Manifest V3 service worker):

- Listen for heartbeat messages from content scripts
- Standardize payloads (platform, title, episode, progress %, timestamp)
- Mark as **completed** when progress crosses a threshold (e.g. 90% to account for credits), or update **currently watching**

### Phase 4: State & Storage

**Local-only**: Service worker saves standardized JSON to `chrome.storage.local`.

**Watch-Buddy sync** (recommended for cross-device library): authenticated `fetch()` to Watch-Buddy API endpoints (e.g. `POST /api/history/import` or a dedicated extension sync route) backed by Supabase. Reuse existing `watch_history` schema and RLS policies where possible.

### Phase 5: Library UI (Popup or Standalone Web App)

- Extension popup (`popup.html`) — lightweight React or vanilla JS
- Optional: link to main Watch-Buddy Next.js app for full library, stats, and shared watchlists
- UI reads from `chrome.storage` and/or synced backend data

---

## Technical Hurdles

### DOM Obfuscation

Netflix obfuscates HTML. Instead of `<h1 class="movie-title">`, titles sit in dynamic React classes like `<div class="ltr-1j92n">`. Mitigations:

- Target stable element hierarchies rather than class names
- Scrape the page `<title>` tag as a fallback
- Maintain per-platform selector configs that can be updated when DOM changes

### Single Page Application (SPA) Routing

Netflix and Prime do not refresh the page when a new episode starts; they use the History API. Content scripts must:

- Use `MutationObserver` to detect player teardown and new player mount
- Listen to `popstate` / `pushState` overrides for URL changes
- Re-initialize scraper state on navigation events

---

## Watch-Buddy Integration Points

| Watch-Buddy surface | Extension use |
|---------------------|---------------|
| `POST /api/history` | Add or update watch entries from extension |
| `POST /api/history/import` | Bulk sync from extension storage |
| Supabase Auth | Extension OAuth or token-based auth for API calls |
| TMDB `content` table | Match scraped titles to cached metadata server-side |
| `watch_history` schema | Store `watched_at`, `rating`, platform, rewatch flag |

---

## Out of Scope (for initial extension)

- Firefox-specific packaging (Phase 4 mentions Chrome/Firefox; start with Chrome MV3)
- Offline-first sync conflict resolution
- Automatic rating/review capture from OTT UI
- Platforms beyond Netflix, Prime, Hotstar

---

## References

- [Watch History feature requirements](../feature/04-watch-history.md)
- [Master implementation plan — Post-Launch Phase 4](../impl/master-implementation-plan.md)
- [Architecture — External Integrations](../../docs/architecture.md#8-external-integrations)
