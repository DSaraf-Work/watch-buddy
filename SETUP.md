# Watch-Buddy Setup Guide

This guide walks through local development for the Cloudflare-native Watch-Buddy stack.

## Prerequisites

- Node.js 18+
- npm
- A Cloudflare account (free tier works)
- A Google Cloud OAuth client (for sign-in)
- A TMDB API account (free)

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Configure Cloudflare Bindings

Watch-Buddy runs on **OpenNext for Cloudflare** with local D1, KV, and R2 bindings via Wrangler.

1. Review `wrangler.jsonc` and confirm your Cloudflare account / resource IDs.
2. Copy local secrets:

```bash
cp .dev.vars.example .dev.vars
```

3. Fill in `.dev.vars`:

```env
BETTER_AUTH_SECRET=generate-a-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
TMDB_API_KEY=your-tmdb-api-key
```

See `dev/reference/google-oauth-credentials.md` for Google OAuth redirect URI setup:
- Local: `http://localhost:3000/api/auth/callback/google`

---

## Step 3: Run Database Migrations

Apply D1 migrations to the local SQLite database:

```bash
npm run db:migrate:local
```

Optional: seed OTT platforms

```bash
npm run db:seed:platforms:local
```

---

## Step 4: Set Up TMDB API

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Request a developer API key under **Settings → API**
3. Add the key to `.dev.vars` as `TMDB_API_KEY`

---

## Step 5: Start the Development Server

Always use port **3000**:

```bash
npm run dev:clean
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with Google using an account you control.

---

## Step 6: Verify Setup

1. Visit `/api/health` — should return a healthy response
2. Sign in at `/auth/login` with Google
3. Visit `/dashboard`, `/search`, `/watchlist`, `/history`, and `/insights`

---

## Step 7: Playwright E2E Tests (Optional)

```bash
npx playwright install chromium
npm test
```

E2E tests enable `E2E_TEST_MODE=true` automatically (see `playwright.config.ts`) so Playwright can create Better Auth sessions via email/password without completing Google OAuth.

---

## Common Issues

### Port 3000 already in use

```bash
npm run dev:clean
```

### Google sign-in fails locally

- Confirm `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.dev.vars`
- Confirm redirect URI: `http://localhost:3000/api/auth/callback/google`
- Confirm `BETTER_AUTH_URL` matches `http://localhost:3000`

### Database errors after pulling new migrations

```bash
npm run db:migrate:local
```

### Build fails with SQLite locked

Stop other dev servers using the local D1 database, then retry:

```bash
npm run dev:clean
npm run build
```

---

## Useful Commands

```bash
# Development
npm run dev:clean       # Free port 3000 and start dev server
npm run dev             # Start dev server
npm run build           # Production build
npm run preview         # OpenNext local Workers preview

# Database
npm run db:migrate:local
npm run db:migrate:remote
npm run db:seed:platforms:local

# Deploy
npm run deploy

# Quality
npm run lint
npm run type-check
npm test
```

---

## Project Structure

```
watch-buddy/
├── src/                    # Next.js app source
├── drizzle/migrations/     # D1 SQL migrations
├── tests/e2e/              # Playwright tests
├── dev/                    # Feature + implementation docs
├── docs/                   # Architecture
├── wrangler.jsonc          # Cloudflare bindings
└── .dev.vars               # Local secrets (not committed)
```

---

## Further Reading

- `docs/architecture.md` — system architecture
- `AGENTS.md` — agent/developer guidelines
- `dev/impl/cloudflare-migration-plan.md` — migration history

---

**Happy coding!**
