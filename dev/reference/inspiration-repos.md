# Inspiration Repositories & Stack Migration Reference

**Purpose**: Document the GitHub repos that inspired WatchBuddy's product direction, what each contributes (and does not), and a phased checklist for migrating off the current Vercel + Supabase stack toward a Cloudflare-native architecture.

**Last Updated**: 2026-08-03

---

## Table of Contents

1. [Inspiration Repositories](#1-inspiration-repositories)
2. [WatchBuddy vs Inspirations](#2-watchbuddy-vs-inspirations)
3. [Current WatchBuddy Stack (Migration Baseline)](#3-current-watchbuddy-stack-migration-baseline)
4. [Target Cloudflare-Native Stack](#4-target-cloudflare-native-stack)
5. [Patterns to Borrow](#5-patterns-to-borrow)
6. [What Inspirations Do Not Solve](#6-what-inspirations-do-not-solve)
7. [Phased Migration Checklist](#7-phased-migration-checklist)
8. [Reference Docs to Keep](#8-reference-docs-to-keep)
9. [Decision Log](#9-decision-log)

---

## 1. Inspiration Repositories

### MoViZ — [github.com/sd12832/MoViZ](https://github.com/sd12832/MoViZ)

| Aspect | Detail |
|--------|--------|
| **What it is** | 2017 SJSU class project — D3.js force-directed graph of TMDB movie metadata |
| **Stack** | JavaScript (ES6), Webpack 1, D3 v4, Express dev server |
| **Data** | Static JSON/CSV bundled at build time (Kaggle TMDB dataset) |
| **Auth / DB** | None |
| **Deployment** | Local dev only (`npm start` on port 8888); no production config |
| **Key docs** | `README.md` only (no `AGENTS.md` or `agent.md`) |

**Relevant to WatchBuddy:**
- TMDB metadata field shapes (genres, keywords, revenue, runtime, vote_average)
- D3 force-graph patterns for relationship visualization
- Inspiration for Phase 3 **Insights** features

**Not relevant:**
- Backend, auth, deployment, or multi-user data patterns

---

### nothing-to-watch — [github.com/gnovotny/nothing-to-watch](https://github.com/gnovotny/nothing-to-watch)

| Aspect | Detail |
|--------|--------|
| **What it is** | Experimental film discovery SPA with custom WebGL Voroforce engine |
| **Stack** | React 19, TypeScript, Vite 7, Tailwind 4, Radix/Shadcn, Zustand, Biome |
| **Data** | Static JSON batches in `public/json/`; TMDB used for image CDN URLs only |
| **Auth / DB** | None — favorites and prefs in `localStorage` with versioned migrations |
| **Deployment** | Static SPA (`bun build` → `dist/`); likely Cloudflare Pages at [nothing-to-watch.port80.ch](https://nothing-to-watch.port80.ch/) |
| **Edge** | `functions/_middleware.js` (Cloudflare Pages Functions) for COEP headers on iOS |
| **Key docs** | `README.md`, `CLAUDE.md` (no `AGENTS.md` or `agent.md`) |

**Relevant to WatchBuddy:**
- Static-first metadata loading (batched JSON instead of live API on every browse)
- Zustand slice architecture for client state
- Versioned `localStorage` settings migrations
- Cloudflare Pages + Functions deployment model
- TMDB poster/backdrop CDN URL patterns
- Radix + Shadcn + Tailwind UI direction
- Vitest + Playwright test split

**Not relevant:**
- User authentication, shared watchlists, watch history, or server-side sync

---

## 2. WatchBuddy vs Inspirations

```
MoViZ              → "How to visualize movie relationships"
nothing-to-watch   → "How to browse films beautifully at scale"
WatchBuddy         → "How to own your watch data across OTT services"
```

| Capability | MoViZ | nothing-to-watch | WatchBuddy (current) |
|------------|-------|------------------|----------------------|
| Movie metadata | Static TMDB JSON | Static JSON batches | TMDB API + Postgres cache |
| Discovery UX | D3 force graph | WebGL Voronoi grid | Search + content detail pages |
| User accounts | — | — | Supabase Auth |
| Watchlists / history | — | localStorage favorites only | Supabase Postgres (planned) |
| Multi-user sync | — | — | Planned (shared wishlists) |
| OTT availability | — | Custom outbound links | India watch providers (TMDB) |
| Hosting | Local dev | Cloudflare Pages (static) | Vercel |

WatchBuddy is a **full product** with auth and persistent user data. The inspiration repos cover **discovery and visualization** only.

---

## 3. Current WatchBuddy Stack (Migration Baseline)

Documented in [`docs/architecture.md`](../../docs/architecture.md). Summary:

| Layer | Technology | Key touchpoints in codebase |
|-------|------------|----------------------------|
| App | Next.js 14 App Router | `src/app/`, 6 API routes, middleware |
| Hosting | Vercel (`vercel.json`, region `bom1`) | Git push → auto deploy |
| Database | Supabase PostgreSQL | `profiles`, `content`, `user_content_status`, `ott_platforms`, etc. |
| Auth | Supabase Auth | `src/lib/supabase/*`, auth forms, `AuthProvider`, middleware |
| Security | Supabase RLS + triggers | `auth.uid()` policies, `on_auth_user_created` trigger |
| External API | TMDB | `src/lib/tmdb/*`, cached in `content` table |
| Testing | Playwright | `tests/e2e/` |

**Supabase coupling (~35+ files):** browser/server/middleware/service clients, all auth flows, TMDB cache writes, API route queries.

**Not in use:** Supabase Storage, Realtime, Edge Functions.

---

## 4. Target Cloudflare-Native Stack

Proposed mapping when removing Vercel + Supabase:

| Current | Cloudflare-native target | Notes |
|---------|--------------------------|-------|
| Vercel | Cloudflare Pages + Workers (OpenNext) | Replace `vercel.json` with `wrangler.toml` |
| Supabase PostgreSQL | D1 (SQLite) **or** Hyperdrive → external Postgres | D1 = fully native; Hyperdrive = less rewrite |
| Supabase Auth | Better Auth / Auth.js / Clerk | Must replace all auth flows and session middleware |
| RLS (`auth.uid()`) | Application-level authorization in Workers/API | No DB-level RLS on D1 |
| DB triggers | Worker hooks on signup + migration scripts | e.g. profile creation on register |
| TMDB cache in Postgres | KV (TTL) or D1 | Inspired by nothing-to-watch static batches |
| Vercel CDN | Cloudflare CDN | Built into Pages |
| Env secrets | Workers Secrets / `wrangler.toml` | |

### Recommended hybrid target architecture

```
Cloudflare Pages (static + Workers via OpenNext)
├── Discovery / browse layer     ← nothing-to-watch patterns (static JSON, client state)
├── Auth + API (Workers)         ← new (not in either inspiration repo)
├── User data (D1 or Hyperdrive)  ← new
└── Insights visualization       ← MoViZ-style D3 (Phase 3, optional)
```

### Migration path options

| Path | Scope | Effort | Trade-off |
|------|-------|--------|-----------|
| **1. Hosting only** | Vercel → CF Pages; keep Supabase | ~2–3 weeks | Lowest risk; not fully CF-native |
| **2. Hybrid** | CF hosting + Hyperdrive/Neon + new auth + KV cache | ~4–6 weeks | Drops Supabase platform; keeps SQL |
| **3. Fully native** | CF Pages + D1 + Better Auth + KV | ~6–10 weeks | Single vendor; largest rewrite |

---

## 5. Patterns to Borrow

### From nothing-to-watch

| Pattern | WatchBuddy application |
|---------|------------------------|
| Static JSON metadata batches | Pre-build or edge-cache TMDB browse data; reduce live API calls |
| `localStorage` with versioned migrations | UI prefs, filters, theme — avoid DB round-trips for non-sync data |
| Zustand slices | Replace/supplement React Context as features grow |
| Cloudflare Pages Functions | Edge middleware (headers, redirects, lightweight logic) |
| TMDB CDN URLs only for posters | Already partially done via `next/image` remote patterns |
| Biome (lint/format) | Optional tooling upgrade |
| Vitest + Playwright split | Unit tests for utils; E2E for auth flows |

### From MoViZ

| Pattern | WatchBuddy application |
|---------|------------------------|
| TMDB field schema | Reference for metadata model and insights aggregations |
| D3 force-directed graph | Phase 5 insights — genre/actor/collaboration visualizations |
| Node scaling by budget/revenue | Optional metric-driven viz in insights dashboard |

---

## 6. What Inspirations Do Not Solve

These must be designed and built for WatchBuddy independently:

- [ ] User signup, login, logout, password reset
- [ ] Session management and protected routes
- [ ] Profile creation on register (replaces Supabase `on_auth_user_created` trigger)
- [ ] Row-level / app-level authorization for user data
- [ ] Watchlist CRUD and shared watchlist membership
- [ ] Watch history tracking and import
- [ ] Multi-device sync
- [ ] Server-side TMDB cache invalidation strategy on CF
- [ ] Database schema migration from Supabase Postgres to D1/Hyperdrive
- [ ] E2E test updates for new auth and API surfaces

---

## 7. Phased Migration Checklist

Use this when actively planning the stack removal. Check off items as completed.

### Phase 0 — Preparation (before any migration)

- [ ] Freeze feature scope; complete in-flight Phase 2 work on current stack
- [ ] Export Supabase schema, RLS policies, and seed data
- [ ] Document all env vars (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `TMDB_*`)
- [ ] Inventory all Supabase client call sites (`src/lib/supabase/`, API routes, hooks)
- [ ] Choose migration path (1: hosting only, 2: hybrid, 3: fully native)
- [ ] Spike OpenNext on Cloudflare with a minimal Next.js 14 deploy

### Phase 1 — Hosting (Vercel → Cloudflare Pages)

- [ ] Add `@opennextjs/cloudflare` and `wrangler.toml`
- [ ] Validate: middleware, `next/image`, API routes, cookie handling
- [ ] Port `vercel.json` settings (build command, region preferences)
- [ ] Set up Cloudflare env secrets and preview deployments
- [ ] Run Playwright suite against CF preview URL
- [ ] Cut over DNS; keep Supabase unchanged

### Phase 2 — Auth (Supabase Auth → chosen provider)

- [ ] Select auth library (Better Auth recommended for Workers + D1)
- [ ] Implement signup, login, logout, forgot/reset password
- [ ] Replace `AuthProvider`, `useAuth`, middleware session checks
- [ ] Replace `src/app/auth/callback/route.ts` if using OAuth later
- [ ] Migrate existing users (or plan clean break / re-registration)
- [ ] Update Playwright auth specs

### Phase 3 — Database (Supabase Postgres → D1 or Hyperdrive)

- [ ] Translate schema: Postgres → target (watch for `uuid-ossp`, triggers, RLS)
- [ ] Choose ORM/query layer (Drizzle recommended for D1)
- [ ] Replace all `createClient()` / `createServiceClient()` call sites
- [ ] Reimplement authorization checks previously enforced by RLS
- [ ] Migrate data from Supabase (profiles, content cache, user status, platforms)
- [ ] Replace profile creation trigger with app-level hook on signup

### Phase 4 — Caching & metadata (inspired by nothing-to-watch)

- [ ] Move TMDB response cache from Postgres to KV or static JSON batches
- [ ] Define TTL and invalidation policy (current: 24h in `src/lib/tmdb/cache.ts`)
- [ ] Optional: pre-build browse grids as `public/json/` batches for discovery
- [ ] Keep live TMDB API for search and on-demand detail fetches

### Phase 5 — Client architecture (optional, from nothing-to-watch)

- [ ] Introduce Zustand slices for search, content detail, and UI state
- [ ] Move non-sync prefs to versioned `localStorage` (theme, filters, layout)
- [ ] Evaluate Biome vs ESLint/Prettier

### Phase 6 — Insights visualization (optional, from MoViZ)

- [ ] Add D3 (or similar) for viewing-habit graphs in Phase 5 feature
- [ ] Define which metrics to visualize (genres, platforms, time spent, etc.)

### Phase 7 — Decommission Supabase & Vercel

- [ ] Remove `@supabase/ssr`, `@supabase/supabase-js` dependencies
- [ ] Delete `src/lib/supabase/` and Supabase-specific middleware
- [ ] Remove Supabase env vars and `vercel.json`
- [ ] Archive Supabase project after data verification
- [ ] Update `docs/architecture.md`, `AGENTS.md`, `SETUP.md`, `README.md`

---

## 8. Reference Docs to Keep

When removing the current stack, retain these alongside WatchBuddy's own docs:

| Source | File(s) | Keep for |
|--------|---------|----------|
| **nothing-to-watch** | `README.md` | Stack, Voroforce architecture, static deploy |
| **nothing-to-watch** | `CLAUDE.md` | Dev commands, project conventions |
| **MoViZ** | `README.md` | TMDB data model, visualization goals |
| **WatchBuddy** | `docs/architecture.md` | What we migrated *from* |
| **WatchBuddy** | `AGENTS.md` | Project conventions (update stack section after migration) |
| **WatchBuddy** | This file | Migration mapping and checklist |

---

## 9. Decision Log

Record decisions here as migration planning progresses.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-03 | Document created | Capture inspiration repo context and migration checklist before stack change |
| | Migration path TBD | Choose between hosting-only, hybrid, or fully native |
| | Auth provider TBD | Better Auth, Auth.js, or Clerk |
| | Database target TBD | D1 vs Hyperdrive + external Postgres |

---

**Related docs:**
- [`docs/architecture.md`](../../docs/architecture.md) — current system architecture
- [`dev/impl/master-implementation-plan.md`](../impl/master-implementation-plan.md) — feature roadmap
- [`AGENTS.md`](../../AGENTS.md) — development guidelines
