# Watch-Buddy: Cloudflare-Native Migration Plan

**Status**: In Progress  
**Started**: 2026-08-03  
**Target**: Fully Cloudflare-native stack (Pages + Workers + D1 + KV + R2 + Better Auth)

---

## Stack Target

| Layer | Technology |
|-------|------------|
| Hosting | Cloudflare Pages + Workers (OpenNext) |
| Auth | Better Auth + better-auth-cloudflare |
| Database | D1 + Drizzle ORM |
| Cache | KV (TMDB hot cache) |
| Storage | R2 (avatars) |
| External API | TMDB |

---

## Phase Tracker

| Phase | Scope | Status | Commit |
|-------|-------|--------|--------|
| 0 | Cloudflare foundation (OpenNext, wrangler, Drizzle scaffold) | Complete | pending |
| 1 | Auth + Profiles (Better Auth, middleware, auth pages) | In Progress | — |
| 2 | TMDB + Search + Content Detail (D1 schema, KV cache, APIs) | Pending | — |
| 3 | User Content Status + Preferences | Pending | — |
| 4 | Watchlist Management (schema + APIs) | Pending | — |
| 5 | Watch History (schema + APIs) | Pending | — |
| 6 | Insights schema stub + architecture docs | Pending | — |
| 7 | Cleanup (remove Supabase, R2 helpers, polish) | Pending | — |

---

## User-Owned Tasks (not automated)

- [ ] Create Cloudflare account resources (D1, KV, R2) and fill IDs in `wrangler.jsonc`
- [ ] Set secrets: `BETTER_AUTH_SECRET`, `TMDB_API_KEY`, `RESEND_API_KEY`
- [ ] Configure custom domain on Cloudflare Pages
- [ ] Run E2E verification with Playwright
- [ ] Configure Resend domain for password-reset emails
- [ ] Production deploy and smoke test

---

## Phase 0: Cloudflare Foundation

**Goal**: Project builds and deploys to Cloudflare with D1/KV/R2 bindings scaffolded.

### Tasks
- [x] Create this plan document
- [x] Add `@opennextjs/cloudflare`, `wrangler`, Drizzle dependencies
- [x] Upgrade Next.js 15 + React 19 for OpenNext compatibility
- [x] Add `wrangler.jsonc`, `open-next.config.ts`, `drizzle.config.ts`
- [x] Scaffold `src/lib/db/` with Drizzle + D1 access
- [x] Add `/api/health` route
- [x] Update `package.json` scripts for CF dev/build/deploy
- [x] Add `.dev.vars.example` for Cloudflare env vars
- [x] Remove `vercel.json`
- [x] Fix Next.js 15 async route params across API routes and pages

### Exit criteria
- `npm run build` succeeds
- `wrangler dev` starts (user verifies with real bindings)
- Health endpoint returns `{ status: "ok" }`

---

## Phase 1: Auth + Profiles

**Goal**: Replace Supabase Auth with Better Auth on D1.

### Tasks
- [ ] Better Auth + Drizzle auth schema on D1
- [ ] `profiles` table + signup hook
- [ ] `/api/auth/[...all]` route
- [ ] Rewrite middleware for session guard
- [ ] Rewrite auth forms, hooks, AuthProvider
- [ ] Profile API route

### Exit criteria
- Signup → profile created → dashboard
- Login/logout/session persistence
- Protected routes redirect unauthenticated users

---

## Phase 2: TMDB + Search + Content

**Goal**: Search and content pages with KV + D1 caching.

### Tasks
- [ ] D1 tables: `content`, `ott_platforms`, `content_availability`
- [ ] KV cache layer for TMDB
- [ ] Rewrite API routes: search, content, platforms, person
- [ ] Seed script for OTT platforms
- [ ] Port pages unchanged where possible

### Exit criteria
- Search → detail flow works on Cloudflare stack

---

## Phase 3: User Content Status + Preferences

**Goal**: Status tracking (to_watch / watching / watched).

### Tasks
- [ ] D1 tables: `user_content_status`, `user_status_preferences`
- [ ] Repository + API routes
- [ ] Wire existing UI components

---

## Phase 4: Watchlist Management

**Goal**: Personal and shared watchlists.

### Tasks
- [ ] D1 tables: `watchlists`, `watchlist_members`, `watchlist_items`
- [ ] Authorization helpers
- [ ] Full CRUD API routes

---

## Phase 5: Watch History

**Goal**: Manual history tracking and stats.

### Tasks
- [ ] D1 tables: `watch_history`, `watch_sessions`
- [ ] API routes + stats endpoint

---

## Phase 6: Insights + Documentation

**Goal**: Schema stub for v2 insights; update architecture docs.

### Tasks
- [ ] D1 tables: `user_preferences`, `recommendations` (stub)
- [ ] Rewrite `docs/architecture.md`
- [ ] Update `AGENTS.md` for Cloudflare workflow

---

## Phase 7: Cleanup + Polish

**Goal**: Remove all Supabase remnants; add R2 avatar helper.

### Tasks
- [ ] Remove `@supabase/*` packages and `src/lib/supabase/`
- [ ] Remove `supabase/migrations/`
- [ ] Add R2 upload helper for avatars
- [ ] Update README, SETUP.md

---

## Notes

- Authorization replaces Supabase RLS via repository-layer `userId` checks.
- TMDB cache: KV primary (24h TTL), D1 for relational FK anchor.
- IDs are TEXT UUIDs (`crypto.randomUUID()`).
