import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchHistory } from '@/lib/db/schema/app'
import { parseHistoryCsv } from '@/lib/history/import-csv'
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
    content: contentRow
      ? {
          id: contentRow.id,
          tmdb_id: contentRow.tmdbId,
          title: contentRow.title,
          content_type: contentRow.contentType,
        }
      : null,
  }
}

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const contentType = request.headers.get('content-type') ?? ''
  let csvText = ''

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 })
    }
    csvText = await file.text()
  } else {
    csvText = await request.text()
  }

  const { rows, errors: parseErrors } = parseHistoryCsv(csvText)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows', errors: parseErrors }, { status: 400 })
  }

  const db = await getDb()
  const now = new Date()
  let imported = 0
  let skipped = 0
  const errors = [...parseErrors]
  const created: ReturnType<typeof serializeHistory>[] = []

  for (const row of rows) {
    const [contentRow] = await db
      .select()
      .from(content)
      .where(eq(content.id, row.content_id))
      .limit(1)

    if (!contentRow) {
      skipped += 1
      errors.push(`Skipped unknown content_id: ${row.content_id}`)
      continue
    }

    const id = crypto.randomUUID()
    await db.insert(watchHistory).values({
      id,
      userId: user.id,
      contentId: row.content_id,
      platformId: row.platform_id ?? null,
      watchedAt: new Date(row.watched_at),
      rating: row.rating ?? null,
      review: row.review ?? null,
      isRewatch: row.is_rewatch ?? false,
      createdAt: now,
      updatedAt: now,
    })

    created.push(serializeHistory(
      {
        id,
        userId: user.id,
        contentId: row.content_id,
        platformId: row.platform_id ?? null,
        watchedAt: new Date(row.watched_at),
        rating: row.rating ?? null,
        review: row.review ?? null,
        isRewatch: row.is_rewatch ?? false,
        createdAt: now,
        updatedAt: now,
      },
      contentRow
    ))
    imported += 1
  }

  return NextResponse.json({ imported, skipped, errors, history: created })
}
