import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { watchlistMembers } from '@/lib/db/schema/app'
import { getWatchlistAccess, canManageWatchlist } from '@/lib/watchlists/access'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string; userId: string }> }

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id, userId: memberUserId } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access || !canManageWatchlist(access.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (memberUserId === access.watchlist.ownerId) {
    return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
  }

  await db
    .delete(watchlistMembers)
    .where(
      and(eq(watchlistMembers.watchlistId, id), eq(watchlistMembers.userId, memberUserId))
    )

  return NextResponse.json({ success: true })
}
