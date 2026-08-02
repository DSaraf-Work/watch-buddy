import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, userContentStatus, watchHistory, watchlistItems } from '@/lib/db/schema/app'
import { getWatchlistAccess } from '@/lib/watchlists/access'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string; itemId: string }> }

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id, itemId } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [item] = await db
    .select({ item: watchlistItems, contentRow: content })
    .from(watchlistItems)
    .leftJoin(content, eq(watchlistItems.contentId, content.id))
    .where(and(eq(watchlistItems.id, itemId), eq(watchlistItems.watchlistId, id)))
    .limit(1)

  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const now = new Date()
  const historyId = crypto.randomUUID()

  await db.insert(watchHistory).values({
    id: historyId,
    userId: user.id,
    contentId: item.item.contentId,
    platformId: null,
    watchedAt: now,
    rating: null,
    review: null,
    isRewatch: false,
    createdAt: now,
    updatedAt: now,
  })

  await db
    .insert(userContentStatus)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      contentId: item.item.contentId,
      status: 'watched',
      rating: null,
      notes: null,
      startedAt: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userContentStatus.userId, userContentStatus.contentId],
      set: {
        status: 'watched',
        completedAt: now,
        updatedAt: now,
      },
    })

  await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.id, itemId), eq(watchlistItems.watchlistId, id)))

  return NextResponse.json({
    success: true,
    history_id: historyId,
    content: item.contentRow
      ? {
          id: item.contentRow.id,
          tmdb_id: item.contentRow.tmdbId,
          title: item.contentRow.title,
          content_type: item.contentRow.contentType,
        }
      : null,
  })
}
