# Feature: Watchlist Management

**Stack**: D1 + Drizzle · Better Auth · Cloudflare Workers  
**Schema**: `src/lib/db/schema/app.ts` (`watchlists`, `watchlist_members`, `watchlist_items`)

## Implementation status

| Area | Status |
|------|--------|
| List/create watchlists | Done |
| Watchlist detail, rename, delete | Done |
| Add/remove items | Done |
| Shared members (invite by email) | Done |
| Add from content detail | Done |
| Sort/filter on detail page | Done — query params + UI |
| Mark as watched from watchlist | Done — `POST .../mark-watched` |
| `/watchlist/shared` page + overlap API | Done |
| Priority/notes UI | Not implemented |

## API Routes
- `GET /api/watchlists/shared-items?min_users=2` — overlap query
- `POST /api/watchlists/[id]/items/[itemId]/mark-watched` — mark watched, add history, remove item
- `GET /api/watchlists/[id]?sort=&order=&type=&genre=` — filtered/sorted items

## UI Routes
- `/watchlist` — list watchlists
- `/watchlist/shared` — shared lists + overlap items
- `/watchlist/[id]` — detail with sort/filter and mark watched
