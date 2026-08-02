# Watch-Buddy: Cloudflare-Native Migration Plan

**Status**: Complete (core migration + post-migration product pass)  
**Target**: Fully Cloudflare-native stack (Pages + Workers + D1 + KV + R2 + Better Auth)

See [`docs/architecture.md`](../../docs/architecture.md) for the current system design.

---

## Stack (final)

| Layer | Technology |
|-------|------------|
| Hosting | Cloudflare Pages + Workers (OpenNext) |
| Auth | Better Auth + Google OAuth |
| Database | D1 + Drizzle ORM |
| Cache | KV (TMDB hot cache) |
| Storage | R2 (avatars via `/api/assets`) |
| External API | TMDB |

---

## Phase tracker (commits on `ds-main`)

| Phase | Scope | Commit |
|-------|-------|--------|
| 0–7 | Cloudflare foundation through Supabase removal | `95edffb` … `1be9791` |
| — | Watchlist/history UI | `912feeb` |
| — | Full insights computation | `6c11cb4` |
| — | Playwright Better Auth cookies | `bb22d07` |
| — | R2 assets route | `7a8d36d` |
| — | Docs + deploy pipeline | `4d069ae`, `4ad5d3f` |

---

## User-owned (completed by user)

- [x] Cloudflare D1/KV/R2 resources and secrets
- [x] Google OAuth redirect URIs
- [x] Production deploy + smoke test
- [x] Custom domain (optional)

---

## Post-migration product work (implemented)

- Watchlist items + shared members APIs and detail UI
- History manual entry, stats page, dashboard live stats
- Profile avatar upload (R2)
- Insights bar charts + `/recommendations` page
- Broader Playwright product E2E coverage
- Legacy Supabase/Vercel docs archived under `docs/archive/`

---

## Notes

- Authorization uses `requireUser()` + scoped queries (no RLS).
- TMDB cache: KV primary (24h TTL), D1 for relational joins.
- IDs are TEXT UUIDs (`crypto.randomUUID()`).
