import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { watchlistItems } from '@/lib/db/schema/app'
import { getWatchlistAccess } from '@/lib/watchlists/access'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string; itemId: string }> }

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id, itemId } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.id, itemId), eq(watchlistItems.watchlistId, id)))

  return NextResponse.json({ success: true })
}
