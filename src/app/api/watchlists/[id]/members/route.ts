import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { watchlistMembers } from '@/lib/db/schema/app'
import { profiles } from '@/lib/db/schema/profiles'
import { getWatchlistAccess, canManageWatchlist } from '@/lib/watchlists/access'
import { serializeMember } from '@/lib/watchlists/serialize'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access || !canManageWatchlist(access.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!access.watchlist.isShared) {
    return NextResponse.json({ error: 'Watchlist is not shared' }, { status: 400 })
  }

  const body = (await request.json()) as { email?: string }
  if (!body.email?.trim()) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const normalizedEmail = body.email.trim().toLowerCase()
  const [profile] = await db
    .select()
    .from(profiles)
    .where(sql`lower(${profiles.email}) = ${normalizedEmail}`)
    .limit(1)

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (profile.id === access.watchlist.ownerId) {
    return NextResponse.json({ error: 'Owner is already on the watchlist' }, { status: 400 })
  }

  const memberId = crypto.randomUUID()
  const now = new Date()

  try {
    await db.insert(watchlistMembers).values({
      id: memberId,
      watchlistId: id,
      userId: profile.id,
      role: 'member',
      joinedAt: now,
    })
  } catch {
    return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
  }

  return NextResponse.json(
    {
      member: serializeMember(
        {
          id: memberId,
          watchlistId: id,
          userId: profile.id,
          role: 'member',
          joinedAt: now,
        },
        profile
      ),
    },
    { status: 201 }
  )
}
