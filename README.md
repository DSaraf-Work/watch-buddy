# Watch-Buddy

Your personal OTT companion — centralize watch history and watchlists across major streaming platforms.

---

## Overview

Watch-Buddy helps you:

- **Search & discover** movies and series with TMDB metadata and India OTT availability
- **Track watchlists** — personal and shared lists
- **Log watch history** with ratings and reviews
- **Get insights** — viewing stats and recommendations from your history

---

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (D1, KV, R2)
- Google OAuth credentials
- TMDB API key

### Installation

```bash
git clone <your-repo-url>
cd watch-buddy
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your secrets (see SETUP.md)
npm run db:migrate:local
npm run dev:clean
```

Open [http://localhost:3000](http://localhost:3000).

For full setup (Google OAuth, Cloudflare bindings, migrations), see [SETUP.md](SETUP.md).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind |
| Hosting | Cloudflare Pages + Workers (OpenNext) |
| Database | Cloudflare D1 + Drizzle ORM |
| Auth | Better Auth + Google OAuth |
| Cache | Cloudflare KV (TMDB hot cache) |
| Storage | Cloudflare R2 (avatars via `/api/assets`) |
| External API | TMDB |
| Testing | Playwright |

---

## Project Structure

```
watch-buddy/
├── src/
│   ├── app/               # Next.js App Router (pages + API routes)
│   ├── components/        # UI components
│   ├── lib/               # DB, auth, TMDB, storage utilities
│   └── constants/         # Routes and app constants
├── drizzle/migrations/    # D1 schema migrations
├── tests/e2e/             # Playwright E2E tests
├── dev/                   # Feature specs and implementation plans
└── docs/                  # Architecture documentation
```

---

## Documentation

- [SETUP.md](SETUP.md) — local development setup
- [AGENTS.md](AGENTS.md) — development guidelines
- [docs/architecture.md](docs/architecture.md) — architecture reference
- [dev/impl/cloudflare-migration-plan.md](dev/impl/cloudflare-migration-plan.md) — Cloudflare migration plan

---

## Features

- Google OAuth sign-in (Better Auth)
- TMDB search and content detail pages
- Personal watchlists and watch history
- User content status (to watch / watching / watched)
- Insights dashboard with computed stats and recommendations
- Profile management with R2 avatar storage

---

## Testing

```bash
npx playwright install chromium
npm test
```

Auth E2E tests use Better Auth session cookies. Playwright starts the dev server with `E2E_TEST_MODE=true` for programmatic test sign-in.

---

## Development

```bash
npm run dev:clean    # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Local Workers preview
npm run deploy       # Deploy to Cloudflare
npm run lint
npm run type-check
```

---

## Deployment

Deploy to Cloudflare Pages/Workers:

```bash
npm run deploy
```

Configure secrets in the Cloudflare dashboard (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TMDB_API_KEY`) and apply remote migrations:

```bash
npm run db:migrate:remote
```

---

## License

MIT
