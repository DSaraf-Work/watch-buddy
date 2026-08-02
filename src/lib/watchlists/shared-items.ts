import { eq, inArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'
import { content, watchlistItems, watchlistMembers, watchlists } from '@/lib/db/schema/app'
import { profiles } from '@/lib/db/schema/profiles'

type AppDb = DrizzleD1Database<typeof schema>

export interface SharedWatchlistItem {
  content_id: string
  user_count: number
  users: Array<{ user_id: string; display_name: string | null; email: string | null }>
  content: {
    id: string
    tmdb_id: number
    title: string
    content_type: 'movie' | 'series'
    poster_path: string | null
  } | null
}

export async function getSharedWatchlistItems(
  db: AppDb,
  userId: string,
  minUsers = 2
): Promise<SharedWatchlistItem[]> {
  const owned = await db.select({ id: watchlists.id }).from(watchlists).where(eq(watchlists.ownerId, userId))

  const memberRows = await db
    .select({ watchlistId: watchlistMembers.watchlistId })
    .from(watchlistMembers)
    .where(eq(watchlistMembers.userId, userId))

  const watchlistIds = [...new Set([...owned.map((w) => w.id), ...memberRows.map((r) => r.watchlistId)])]
  if (watchlistIds.length === 0) return []

  const items = await db
    .select({
      item: watchlistItems,
      contentRow: content,
      watchlist: watchlists,
      profile: profiles,
    })
    .from(watchlistItems)
    .innerJoin(watchlists, eq(watchlistItems.watchlistId, watchlists.id))
    .leftJoin(content, eq(watchlistItems.contentId, content.id))
    .leftJoin(profiles, eq(watchlistItems.addedBy, profiles.id))
    .where(inArray(watchlistItems.watchlistId, watchlistIds))

  const byContent = new Map<
    string,
    {
      content: typeof content.$inferSelect | null
      users: Map<string, { user_id: string; display_name: string | null; email: string | null }>
    }
  >()

  for (const row of items) {
    const contentId = row.item.contentId
    if (!byContent.has(contentId)) {
      byContent.set(contentId, { content: row.contentRow, users: new Map() })
    }

    const bucket = byContent.get(contentId)!
    const contributorId = row.item.addedBy ?? row.watchlist.ownerId
    if (!bucket.users.has(contributorId)) {
      bucket.users.set(contributorId, {
        user_id: contributorId,
        display_name: row.profile?.displayName ?? null,
        email: row.profile?.email ?? null,
      })
    }
  }

  return [...byContent.entries()]
    .filter(([, value]) => value.users.size >= minUsers)
    .map(([contentId, value]) => ({
      content_id: contentId,
      user_count: value.users.size,
      users: [...value.users.values()],
      content: value.content
        ? {
            id: value.content.id,
            tmdb_id: value.content.tmdbId,
            title: value.content.title,
            content_type: value.content.contentType,
            poster_path: value.content.posterPath,
          }
        : null,
    }))
    .sort((a, b) => b.user_count - a.user_count)
}
