import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchHistory } from '@/lib/db/schema/app'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string }> }

function serializeHistory(
  row: typeof watchHistory.$inferSelect,
  contentRow: typeof content.$inferSelect | null
) {
  return {
    id: row.id,
    user_id: row.userId,
    content_id: row.contentId,
    platform_id: row.platformId,
    watched_at: new Date(row.watchedAt).toISOString(),
    rating: row.rating,
    review: row.review,
    is_rewatch: row.isRewatch,
    content: contentRow
      ? {
          id: contentRow.id,
          tmdb_id: contentRow.tmdbId,
          title: contentRow.title,
          content_type: contentRow.contentType,
          poster_path: contentRow.posterPath,
        }
      : null,
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = (await request.json()) as {
    rating?: number | null
    review?: string | null
    watched_at?: string
    is_rewatch?: boolean
  }

  const db = await getDb()
  const [existing] = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.id, id))
    .limit(1)

  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const now = new Date()
  await db
    .update(watchHistory)
    .set({
      rating: body.rating !== undefined ? body.rating : existing.rating,
      review: body.review !== undefined ? body.review : existing.review,
      watchedAt: body.watched_at ? new Date(body.watched_at) : existing.watchedAt,
      isRewatch: body.is_rewatch ?? existing.isRewatch,
      updatedAt: now,
    })
    .where(eq(watchHistory.id, id))

  const [updated] = await db
    .select({ history: watchHistory, contentRow: content })
    .from(watchHistory)
    .leftJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.id, id))
    .limit(1)

  return NextResponse.json({
    history: updated ? serializeHistory(updated.history, updated.contentRow) : null,
  })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const [existing] = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.id, id))
    .limit(1)

  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.delete(watchHistory).where(eq(watchHistory.id, id))
  return NextResponse.json({ success: true })
}
