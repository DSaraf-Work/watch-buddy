import { and, eq } from 'drizzle-orm'
import type { Database } from '@/lib/db'
import { watchlistMembers, watchlists } from '@/lib/db/schema/app'

export async function getWatchlistAccess(
  db: Database,
  userId: string,
  watchlistId: string
) {
  const [watchlist] = await db
    .select()
    .from(watchlists)
    .where(eq(watchlists.id, watchlistId))
    .limit(1)

  if (!watchlist) return null

  if (watchlist.ownerId === userId) {
    return { watchlist, role: 'owner' as const }
  }

  const [member] = await db
    .select()
    .from(watchlistMembers)
    .where(
      and(eq(watchlistMembers.watchlistId, watchlistId), eq(watchlistMembers.userId, userId))
    )
    .limit(1)

  if (!member) return null

  return { watchlist, role: member.role }
}

export function canManageWatchlist(role: 'owner' | 'member') {
  return role === 'owner'
}
