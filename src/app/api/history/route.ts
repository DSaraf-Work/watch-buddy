import { NextRequest, NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchHistory } from '@/lib/db/schema/app'
import { filterAndSortHistory, parseHistoryFilters } from '@/lib/history/filter'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

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
    created_at: new Date(row.createdAt).toISOString(),
    updated_at: new Date(row.updatedAt).toISOString(),
    content: contentRow
      ? {
          id: contentRow.id,
          tmdb_id: contentRow.tmdbId,
          title: contentRow.title,
          content_type: contentRow.contentType,
          poster_path: contentRow.posterPath,
          runtime: contentRow.runtime,
        }
      : null,
  }
}

export async function GET(request: NextRequest) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const filters = parseHistoryFilters(new URL(request.url))
  const db = await getDb()
  const rows = await db
    .select({ history: watchHistory, contentRow: content })
    .from(watchHistory)
    .leftJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.userId, user.id))
    .orderBy(desc(watchHistory.watchedAt))

  const serialized = rows.map((row) => serializeHistory(row.history, row.contentRow))
  const filtered = filterAndSortHistory(
    serialized.map((row) => ({
      id: row.id,
      watched_at: row.watched_at,
      rating: row.rating,
      review: row.review,
      is_rewatch: row.is_rewatch,
      platform_id: row.platform_id,
      content: row.content
        ? { title: row.content.title, content_type: row.content.content_type }
        : null,
    })),
    filters
  )

  const filteredIds = new Set(filtered.map((row) => row.id))
  const history = serialized
    .filter((row) => filteredIds.has(row.id))
    .sort((a, b) => filtered.findIndex((f) => f.id === a.id) - filtered.findIndex((f) => f.id === b.id))

  return NextResponse.json({
    history,
    total: serialized.length,
    filters,
  })
}

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const body = (await request.json()) as {
    content_id?: string
    platform_id?: string | null
    watched_at?: string
    rating?: number
    review?: string
    is_rewatch?: boolean
  }

  if (!body.content_id || !body.watched_at) {
    return NextResponse.json({ error: 'content_id and watched_at are required' }, { status: 400 })
  }

  const now = new Date()
  const id = crypto.randomUUID()
  const db = await getDb()

  await db.insert(watchHistory).values({
    id,
    userId: user.id,
    contentId: body.content_id,
    platformId: body.platform_id ?? null,
    watchedAt: new Date(body.watched_at),
    rating: body.rating ?? null,
    review: body.review ?? null,
    isRewatch: body.is_rewatch ?? false,
    createdAt: now,
    updatedAt: now,
  })

  const [created] = await db
    .select({ history: watchHistory, contentRow: content })
    .from(watchHistory)
    .leftJoin(content, eq(watchHistory.contentId, content.id))
    .where(eq(watchHistory.id, id))
    .limit(1)

  return NextResponse.json(
    {
      history: created ? serializeHistory(created.history, created.contentRow) : null,
    },
    { status: 201 }
  )
}
