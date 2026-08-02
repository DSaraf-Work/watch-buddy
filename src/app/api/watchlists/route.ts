import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { watchlistMembers, watchlists } from '@/lib/db/schema/app'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const owned = await db.select().from(watchlists).where(eq(watchlists.ownerId, user.id))

  const memberRows = await db
    .select({ watchlist: watchlists })
    .from(watchlistMembers)
    .innerJoin(watchlists, eq(watchlistMembers.watchlistId, watchlists.id))
    .where(eq(watchlistMembers.userId, user.id))

  const shared = memberRows.map((r) => r.watchlist)
  const all = [...owned, ...shared.filter((s) => !owned.find((o) => o.id === s.id))]

  return NextResponse.json({
    watchlists: all.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      owner_id: w.ownerId,
      is_shared: w.isShared,
      created_at: new Date(w.createdAt).toISOString(),
      updated_at: new Date(w.updatedAt).toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const body = (await request.json()) as {
    name?: string
    description?: string
    is_shared?: boolean
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const now = new Date()
  const watchlistId = crypto.randomUUID()
  const db = await getDb()

  await db.insert(watchlists).values({
    id: watchlistId,
    name: body.name.trim(),
    description: body.description ?? null,
    ownerId: user.id,
    isShared: body.is_shared ?? false,
    createdAt: now,
    updatedAt: now,
  })

  if (body.is_shared) {
    await db.insert(watchlistMembers).values({
      id: crypto.randomUUID(),
      watchlistId,
      userId: user.id,
      role: 'owner',
      joinedAt: now,
    })
  }

  const [created] = await db
    .select()
    .from(watchlists)
    .where(eq(watchlists.id, watchlistId))
    .limit(1)

  return NextResponse.json(
    {
      watchlist: created
        ? {
            id: created.id,
            name: created.name,
            description: created.description,
            owner_id: created.ownerId,
            is_shared: created.isShared,
            created_at: new Date(created.createdAt).toISOString(),
            updated_at: new Date(created.updatedAt).toISOString(),
          }
        : null,
    },
    { status: 201 }
  )
}
