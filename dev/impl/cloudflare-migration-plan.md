# Watch-Buddy: Cloudflare-Native Migration Plan

**Status**: Complete  
**Started**: 2026-08-03  
**Completed**: 2026-08-03  
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
| 0 | Cloudflare foundation (OpenNext, wrangler, Drizzle scaffold) | Complete | `95edffb` |
| 1 | Auth + Profiles (Better Auth, middleware, auth pages) | Complete | `ee3324d` |
| 2 | TMDB + Search + Content Detail (D1 schema, KV cache, APIs) | Complete | pending |
| 3 | User Content Status + Preferences | Complete | pending |
| 4 | Watchlist Management (schema + APIs) | Complete | pending |
| 5 | Watch History (schema + APIs) | Complete | pending |
| 6 | Insights schema stub + architecture docs | Complete | pending |
| 7 | Cleanup (remove Supabase, R2 helpers, polish) | Complete | pending |

---

## User-Owned Tasks (not automated)

- [ ] Create Cloudflare account resources (D1, KV, R2) and fill IDs in `wrangler.jsonc`
- [ ] Copy `.dev.vars.example` → `.dev.vars` and set secrets
- [ ] Run `npm run db:migrate:local` and `npm run db:seed:platforms:local`
- [ ] Configure Resend domain for password-reset emails
- [ ] Run `npm run preview` or `npm run deploy` and smoke test
- [ ] Run Playwright E2E suite against new auth flows
- [ ] Configure custom domain on Cloudflare Pages

---

## Phase 0: Cloudflare Foundation ✅

- [x] OpenNext + wrangler + Drizzle scaffold
- [x] Next.js 15 + React 19 upgrade
- [x] `/api/health` endpoint
- [x] Removed `vercel.json`

---

## Phase 1: Auth + Profiles ✅

- [x] Better Auth on D1 with KV sessions
- [x] `profiles` table + signup hook
- [x] Auth middleware + protected routes
- [x] Login/signup/forgot/reset forms
- [x] `/api/profile` route
- [x] Migration `0001_auth_profiles.sql`

---

## Phase 2: TMDB + Search + Content ✅

- [x] D1 tables: `content`, `ott_platforms`, `content_availability`
- [x] KV cache layer (`src/lib/cache/kv.ts`)
- [x] Rewrote `src/lib/tmdb/cache.ts` (KV + D1)
- [x] API routes: search, content, platforms, person
- [x] Platform seed script (`scripts/seed-platforms.sql`)
- [x] Migration `0002_app_tables.sql`

---

## Phase 3: User Content Status + Preferences ✅

- [x] D1 tables: `user_content_status`, `user_status_preferences`
- [x] API routes rewritten with Drizzle + `requireUser()`

---

## Phase 4: Watchlist Management ✅

- [x] D1 tables: `watchlists`, `watchlist_members`, `watchlist_items`
- [x] `/api/watchlists` GET + POST

---

## Phase 5: Watch History ✅

- [x] D1 tables: `watch_history`, `watch_sessions`
- [x] `/api/history` GET + POST

---

## Phase 6: Insights + Documentation ✅

- [x] D1 tables: `user_preferences`, `recommendations` (stub)
- [x] `/api/insights` GET stub
- [x] Rewrote `docs/architecture.md`

---

## Phase 7: Cleanup + Polish ✅

- [x] Removed `@supabase/*` packages and `src/lib/supabase/`
- [x] Removed legacy `supabase/migrations/`
- [x] Added R2 avatar helper (`src/lib/storage/r2.ts`)
- [x] Updated `AGENTS.md` for Cloudflare workflow

---

## Notes

- Authorization replaces Supabase RLS via `requireUser()` + scoped queries.
- TMDB cache: KV primary (24h TTL), D1 for relational FK anchor.
- IDs are TEXT UUIDs (`crypto.randomUUID()`).
