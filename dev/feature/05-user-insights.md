# Feature: User Insights & Analytics

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers · Recharts

## Implementation status

| Area | Status |
|------|--------|
| Compute insights | Done — sync or async (`POST { async: true }`) |
| Dedicated trend endpoints | Done — `/api/insights/trends`, `genres`, `platforms` |
| Async background compute | Done — Next.js `after()` + KV job status |
| Rich charts | Done — Recharts bar/line/pie on `/insights` |
| Recommendations page | Done |

## API Routes
- `GET /api/insights/trends` — monthly activity
- `GET /api/insights/genres` — genre breakdown
- `GET /api/insights/platforms` — platform breakdown
- `GET /api/insights/compute-status` — poll async job
- `POST /api/insights` with `{ async: true }` — background compute (202)
