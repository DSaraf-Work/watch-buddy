import { and, count, eq } from 'drizzle-orm'
import type { Database } from '@/lib/db'
import {
  content,
  userContentStatus,
  userPreferences,
  watchHistory,
  watchlistItems,
  watchlists,
} from '@/lib/db/schema/app'

export async function getDashboardStats(db: Database, userId: string) {
  const [watchlistCount] = await db
    .select({ count: count() })
    .from(watchlistItems)
    .innerJoin(watchlists, eq(watchlistItems.watchlistId, watchlists.id))
    .where(eq(watchlists.ownerId, userId))

  const [toWatchCount] = await db
    .select({ count: count() })
    .from(userContentStatus)
    .where(
      and(eq(userContentStatus.userId, userId), eq(userContentStatus.status, 'to_watch'))
    )

  const historyRows = await db
    .select({ history: watchHistory, contentRow: content })
    .from(watchHistory)
    .leftJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.userId, userId))

  const watchedCount = historyRows.length
  const totalWatchTime = historyRows.reduce(
    (sum, row) => sum + (row.contentRow?.runtime ?? 0),
    0
  )

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  return {
    watchlist_items: watchlistCount?.count ?? 0,
    to_watch: toWatchCount?.count ?? 0,
    watched: watchedCount,
    total_watch_time: prefs?.totalWatchTime ?? totalWatchTime,
    avg_rating: prefs?.avgRating ?? null,
    insights_computed_at: prefs?.computedAt
      ? new Date(prefs.computedAt).toISOString()
      : null,
  }
}

export function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}
