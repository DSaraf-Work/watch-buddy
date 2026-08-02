import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchlistItems } from '@/lib/db/schema/app'
import { getWatchlistAccess } from '@/lib/watchlists/access'
import { serializeWatchlistItem } from '@/lib/watchlists/serialize'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = (await request.json()) as {
    content_id?: string
    priority?: 'high' | 'medium' | 'low'
    notes?: string
  }

  if (!body.content_id) {
    return NextResponse.json({ error: 'content_id is required' }, { status: 400 })
  }

  const [contentRow] = await db
    .select()
    .from(content)
    .where(eq(content.id, body.content_id))
    .limit(1)

  if (!contentRow) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  const itemId = crypto.randomUUID()
  const now = new Date()

  try {
    await db.insert(watchlistItems).values({
      id: itemId,
      watchlistId: id,
      contentId: body.content_id,
      addedBy: user.id,
      priority: body.priority ?? null,
      notes: body.notes ?? null,
      addedAt: now,
    })
  } catch {
    return NextResponse.json({ error: 'Item already in watchlist' }, { status: 409 })
  }

  return NextResponse.json(
    {
      item: serializeWatchlistItem(
        {
          id: itemId,
          watchlistId: id,
          contentId: body.content_id,
          addedBy: user.id,
          priority: body.priority ?? null,
          notes: body.notes ?? null,
          addedAt: now,
        },
        contentRow
      ),
    },
    { status: 201 }
  )
}
