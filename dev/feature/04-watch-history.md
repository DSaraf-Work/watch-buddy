# Feature: Watch History Tracking

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers

## Implementation status

| Area | Status |
|------|--------|
| List + manual entry | Done |
| Statistics page | Done |
| Edit/delete entries | Done — API + card UI |
| CSV import | Done — `POST /api/history/import` |
| Filters/sort/search in UI | Not implemented |

## API Routes
- `POST /api/history/import` — multipart CSV (`content_id`, `watched_at`, optional columns)

## UI
- Edit/delete controls on each history card
- CSV import section on `/history`
