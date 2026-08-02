# Feature: Watchlist Management

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers  
**Schema**: `src/lib/db/schema/app.ts` (`watchlists`, `watchlist_members`, `watchlist_items`)

## Overview
Personal and shared watchlists for tracking content users want to watch.

## Implementation status

| Area | Status |
|------|--------|
| List/create watchlists | Done — `GET/POST /api/watchlists` |
| Watchlist detail, rename, delete | Done — `GET/PUT/DELETE /api/watchlists/[id]` |
| Add/remove items | Done — items routes + detail UI |
| Shared members (invite by email) | Done — members routes + detail UI |
| Add from content detail | Done — `AddToWatchlistButton` |
| Sort/filter UI | Not implemented |
| Mark as watched from watchlist | Not implemented |
| Multi-user shared-items query | Not implemented (`/api/watchlists/shared-items`) |
| `/watchlist/shared` page | Not implemented |

Authorization: `requireUser()` + scoped queries in `src/lib/watchlists/access.ts` (no RLS).

## API Routes (implemented)
- `GET /api/watchlists` — list user's watchlists
- `POST /api/watchlists` — create watchlist
- `GET /api/watchlists/[id]` — detail with items and members
- `PUT /api/watchlists/[id]` — update name/description
- `DELETE /api/watchlists/[id]` — delete (owner only)
- `POST /api/watchlists/[id]/items` — add item
- `DELETE /api/watchlists/[id]/items/[itemId]` — remove item
- `POST /api/watchlists/[id]/members` — invite by email
- `DELETE /api/watchlists/[id]/members/[userId]` — remove member

## UI Routes
- `/watchlist` — list watchlists
- `/watchlist/[id]` — watchlist detail (items + members)

## Future
- Shared watchlists hub at `/watchlist/shared`
- Priority, notes, notifications
- `GET /api/watchlists/shared-items` for overlap queries
