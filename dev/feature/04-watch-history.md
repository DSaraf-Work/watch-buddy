# Feature: Watch History Tracking

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers  
**Schema**: `src/lib/db/schema/app.ts` (`watch_history`)

## Overview
Track and display user's watch history across OTT platforms.

## Implementation status

| Area | Status |
|------|--------|
| List history | Done — `GET /api/history` |
| Manual entry (date, rating, review, rewatch) | Done — `POST /api/history` + `HistoryEntryForm` |
| Edit/delete entries | API done — `PUT/DELETE /api/history/[id]`; no edit UI yet |
| Statistics page | Done — `GET /api/history/stats`, `/history/stats` |
| Filters/sort/search in UI | Not implemented |
| CSV/import API | Not implemented |
| Chrome extension sync | Future — see `dev/reference/chrome-extension-watch-tracking.md` |

Authorization: `requireUser()` + `user_id` scoping on all queries.

## API Routes (implemented)
- `GET /api/history` — paginated history
- `POST /api/history` — add entry
- `PUT /api/history/[id]` — update entry
- `DELETE /api/history/[id]` — delete entry
- `GET /api/history/stats` — aggregates (totals, by platform/genre/month)

## UI Routes
- `/history` — history list + manual entry form
- `/history/stats` — statistics dashboard

## Future
- Edit/delete controls on history cards
- `POST /api/history/import`
- Extension-based automatic sync
