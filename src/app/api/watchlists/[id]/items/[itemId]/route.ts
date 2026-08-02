import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchlistItems } from '@/lib/db/schema/app'
import { getWatchlistAccess } from '@/lib/watchlists/access'
import { serializeWatchlistItem } from '@/lib/watchlists/serialize'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string; itemId: string }> }

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id, itemId } = await params
  const body = (await request.json()) as {
    priority?: 'high' | 'medium' | 'low' | null
    notes?: string | null
  }

  if (
    body.priority !== undefined &&
    body.priority !== null &&
    !['high', 'medium', 'low'].includes(body.priority)
  ) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [existing] = await db
    .select()
    .from(watchlistItems)
    .where(and(eq(watchlistItems.id, itemId), eq(watchlistItems.watchlistId, id)))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  await db
    .update(watchlistItems)
    .set({
      priority: body.priority !== undefined ? body.priority : existing.priority,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    })
    .where(eq(watchlistItems.id, itemId))

  const [updated] = await db
    .select({ item: watchlistItems, contentRow: content })
    .from(watchlistItems)
    .leftJoin(content, eq(watchlistItems.contentId, content.id))
    .where(eq(watchlistItems.id, itemId))
    .limit(1)

  return NextResponse.json({
    item: updated ? serializeWatchlistItem(updated.item, updated.contentRow) : null,
  })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id, itemId } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.id, itemId), eq(watchlistItems.watchlistId, id)))

  return NextResponse.json({ success: true })
}
