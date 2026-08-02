# Feature: Watch History Tracking

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers

## Implementation status

| Area | Status |
|------|--------|
| List + manual entry | Done |
| Statistics page | Done |
| Edit/delete entries | Done — API + card UI |
| CSV import | Done — `POST /api/history/import` |
| Filters/sort/search in UI | Done — query params on `GET /api/history` + filter bar |

## API Routes
- `GET /api/history?q=&type=&platform_id=&sort=&order=&min_rating=&rewatch=&from=&to=` — filtered list

## UI
- Edit/delete controls on each history card
- CSV import section on `/history`
