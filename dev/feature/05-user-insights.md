# Feature: User Insights & Analytics

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers  
**Schema**: `user_preferences`, `recommendations` in `src/lib/db/schema/app.ts`

## Overview
Personalized insights into viewing habits and basic recommendations.

## Implementation status

| Area | Status |
|------|--------|
| Compute insights from history | Done — `POST /api/insights` |
| Preferences + recommendations | Done — `GET /api/insights` |
| Stats alias | Done — `GET /api/insights/stats` |
| Insights UI (stat cards, bar charts) | Done — `/insights` |
| Recommendations page | Done — `/recommendations` |
| Separate trends/genres/platforms APIs | Not implemented (bundled in `insights_data` JSON) |
| Background/async compute | Sync POST only |
| Chart library | CSS `BarChart` component |

## API Routes (implemented)
- `GET /api/insights` — preferences + top recommendations
- `POST /api/insights` — recompute preferences and recommendations
- `GET /api/insights/stats` — history stats alias

## UI Routes
- `/insights` — dashboard with compute button and charts
- `/recommendations` — full recommendation list

## Future
- Async/queued recompute for large histories
- Dedicated trend/genre/platform endpoints
- Richer charting (Recharts/Chart.js)
- Achievements and period comparisons
