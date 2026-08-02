# Watch-Buddy Architecture

**Last Updated**: 2026-08-03  
**Version**: 2.0.0 (Cloudflare-native)

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 App Router, React 19, Tailwind |
| Hosting | Cloudflare Pages + Workers via OpenNext |
| Auth | Better Auth + D1 + KV sessions |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Cache | Cloudflare KV (TMDB metadata, 24h TTL) |
| Storage | Cloudflare R2 (user avatars) |
| External | TMDB API |

---

## Authorization

Supabase RLS is replaced by **application-level authorization**:
- `requireUser()` on every protected API route
- Repository queries always include `userId` in `WHERE` clauses
- Shared watchlist access checked via `watchlist_members` membership

---

## Data Model

### Auth (Better Auth)
- `users`, `sessions`, `accounts`, `verifications`

### App
- `profiles` — extends user with display name, avatar
- `content` — TMDB metadata cache (D1 anchor for FKs)
- `ott_platforms`, `content_availability`
- `user_content_status`, `user_status_preferences`
- `watchlists`, `watchlist_members`, `watchlist_items`
- `watch_history`, `watch_sessions`
- `user_preferences`, `recommendations` (insights + recommendations)

---

## Caching Strategy

1. **KV** — hot TMDB content JSON (`tmdb:content:{id}:{type}`, 24h TTL)
2. **D1** — canonical content rows for relational joins (status, watchlists, history)

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/auth/[...all]` | Better Auth handler |
| `/api/health` | Platform health check |
| `/api/profile` | User profile CRUD |
| `/api/search` | TMDB search |
| `/api/content/[id]` | Content detail + India providers |
| `/api/content/[id]/status` | User content status |
| `/api/platforms` | OTT platform list |
| `/api/person/[id]` | Person filmography |
| `/api/user/status-preferences` | Status label customization |
| `/api/watchlists` | Watchlist CRUD (list/create) |
| `/api/history` | Watch history (list/create) |
| `/api/insights` | GET preferences/recommendations; POST compute insights |
| `/api/assets/[[...key]]` | Serve public R2 assets (avatars) |

---

## Deployment

```bash
npm run preview   # local Workers runtime
npm run deploy    # Cloudflare Pages
```

### Required secrets (user configures)
- `BETTER_AUTH_SECRET` (session signing — still required with Google OAuth)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Google OAuth app login)
- `TMDB_API_KEY`

Google Cloud OAuth client redirect URI:
- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://watch-buddy.geass.workers.dev/api/auth/callback/google`

See `dev/reference/google-oauth-credentials.md` for full setup.

### Required bindings (`wrangler.jsonc`)
- D1: `DATABASE`
- KV: `KV`
- R2: `R2`

---

## Local Development

```bash
cp .dev.vars.example .dev.vars   # fill secrets
npm run db:migrate:local
npm run db:seed:platforms:local
npm run dev                      # Next.js with CF bindings via initOpenNextCloudflareForDev
# OR
npm run preview                  # full Workers runtime
```

---

See `dev/impl/cloudflare-migration-plan.md` for migration history and phase tracker.
