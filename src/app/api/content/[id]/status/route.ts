import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, userContentStatus } from '@/lib/db/schema/app'
import { getContentById } from '@/lib/tmdb/cache'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'
import type { RouteParams } from '@/lib/utils/route-params'

function serializeStatus(row: typeof userContentStatus.$inferSelect) {
  return {
    id: row.id,
    user_id: row.userId,
    content_id: row.contentId,
    status: row.status,
    rating: row.rating,
    notes: row.notes,
    started_at: row.startedAt ? new Date(row.startedAt).toISOString() : null,
    completed_at: row.completedAt ? new Date(row.completedAt).toISOString() : null,
    created_at: new Date(row.createdAt).toISOString(),
    updated_at: new Date(row.updatedAt).toISOString(),
  }
}

async function resolveContentId(tmdbId: number, contentType: 'movie' | 'series') {
  const db = await getDb()
  const [existing] = await db
    .select({ id: content.id })
    .from(content)
    .where(and(eq(content.tmdbId, tmdbId), eq(content.contentType, contentType)))
    .limit(1)

  if (existing) return existing.id

  const contentData = await getContentById(tmdbId, contentType)
  return contentData?.id ?? null
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams<{ id: string }>
) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const [tmdbIdStr, contentType] = id.split('-')
    const tmdbId = parseInt(tmdbIdStr)
    const contentId = await resolveContentId(tmdbId, contentType as 'movie' | 'series')

    if (!contentId) {
      return NextResponse.json({ status: null })
    }

    const db = await getDb()
    const [status] = await db
      .select()
      .from(userContentStatus)
      .where(
        and(eq(userContentStatus.userId, user.id), eq(userContentStatus.contentId, contentId))
      )
      .limit(1)

    return NextResponse.json({ status: status ? serializeStatus(status) : null })
  } catch (error) {
    console.error('Get status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams<{ id: string }>
) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const body = (await request.json()) as {
      status?: string
      rating?: number
      notes?: string
    }
    const { status, rating, notes } = body

    if (!status || !['to_watch', 'watching', 'watched'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const [tmdbIdStr, contentType] = id.split('-')
    const tmdbId = parseInt(tmdbIdStr)
    const contentId = await resolveContentId(tmdbId, contentType as 'movie' | 'series')

    if (!contentId) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const now = new Date()
    const db = await getDb()
    const recordId = crypto.randomUUID()

    const values = {
      id: recordId,
      userId: user.id,
      contentId,
      status: status as 'to_watch' | 'watching' | 'watched',
      rating: rating ?? null,
      notes: notes ?? null,
      startedAt: status === 'watching' || status === 'watched' ? now : null,
      completedAt: status === 'watched' ? now : null,
      createdAt: now,
      updatedAt: now,
    }

    await db
      .insert(userContentStatus)
      .values(values)
      .onConflictDoUpdate({
        target: [userContentStatus.userId, userContentStatus.contentId],
        set: {
          status: values.status,
          rating: values.rating,
          notes: values.notes,
          startedAt: values.startedAt,
          completedAt: values.completedAt,
          updatedAt: now,
        },
      })

    const [saved] = await db
      .select()
      .from(userContentStatus)
      .where(
        and(eq(userContentStatus.userId, user.id), eq(userContentStatus.contentId, contentId))
      )
      .limit(1)

    return NextResponse.json({ status: saved ? serializeStatus(saved) : null })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams<{ id: string }>
) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const [tmdbIdStr, contentType] = id.split('-')
    const tmdbId = parseInt(tmdbIdStr)
    const contentId = await resolveContentId(tmdbId, contentType as 'movie' | 'series')

    if (!contentId) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const db = await getDb()
    await db
      .delete(userContentStatus)
      .where(
        and(eq(userContentStatus.userId, user.id), eq(userContentStatus.contentId, contentId))
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete status error:', error)
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 })
  }
}
