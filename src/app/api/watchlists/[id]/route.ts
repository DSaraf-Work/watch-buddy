import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, watchlistItems, watchlistMembers, watchlists } from '@/lib/db/schema/app'
import { profiles } from '@/lib/db/schema/profiles'
import { getWatchlistAccess, canManageWatchlist } from '@/lib/watchlists/access'
import {
  serializeMember,
  serializeWatchlist,
  serializeWatchlistItem,
} from '@/lib/watchlists/serialize'
import {
  filterAndSortWatchlistItems,
  type WatchlistItemFilters,
} from '@/lib/watchlists/sort-filter'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

type RouteParams = { params: Promise<{ id: string }> }

function parseFilters(request: Request): WatchlistItemFilters {
  const url = new URL(request.url)
  const sort = url.searchParams.get('sort')
  const order = url.searchParams.get('order')
  const type = url.searchParams.get('type')
  const genre = url.searchParams.get('genre')
  const priority = url.searchParams.get('priority')

  return {
    sort:
      sort === 'title' || sort === 'added_at' || sort === 'release_date' || sort === 'priority'
        ? sort
        : undefined,
    order: order === 'asc' || order === 'desc' ? order : undefined,
    type: type === 'movie' || type === 'series' || type === 'all' ? type : undefined,
    genre,
    priority:
      priority === 'high' ||
      priority === 'medium' ||
      priority === 'low' ||
      priority === 'unset' ||
      priority === 'all'
        ? priority
        : undefined,
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = await db
    .select({ item: watchlistItems, contentRow: content })
    .from(watchlistItems)
    .leftJoin(content, eq(watchlistItems.contentId, content.id))
    .where(eq(watchlistItems.watchlistId, id))

  const members = await db
    .select({ member: watchlistMembers, profile: profiles })
    .from(watchlistMembers)
    .leftJoin(profiles, eq(watchlistMembers.userId, profiles.id))
    .where(eq(watchlistMembers.watchlistId, id))

  const serialized = items.map((row) => serializeWatchlistItem(row.item, row.contentRow))
  const filters = parseFilters(request)
  const filtered = filterAndSortWatchlistItems(
    serialized.map((item) => ({
      id: item.id,
      content_id: item.content_id,
      added_at: item.added_at,
      priority: item.priority,
      content: item.content
        ? {
            title: item.content.title,
            content_type: item.content.content_type,
            release_date: item.content.release_date,
            genres: item.content.genres ?? [],
          }
        : null,
    })),
    filters
  )

  const filteredIds = new Set(filtered.map((item) => item.id))
  const orderedItems = serialized.filter((item) => filteredIds.has(item.id))
  orderedItems.sort((a, b) => filtered.findIndex((f) => f.id === a.id) - filtered.findIndex((f) => f.id === b.id))

  return NextResponse.json({
    watchlist: serializeWatchlist(access.watchlist),
    role: access.role,
    items: orderedItems,
    members: members.map((row) => serializeMember(row.member, row.profile)),
    filters,
  })
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access || !canManageWatchlist(access.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as {
    name?: string
    description?: string | null
    is_shared?: boolean
  }

  const now = new Date()
  await db
    .update(watchlists)
    .set({
      name: body.name?.trim() ?? access.watchlist.name,
      description: body.description ?? access.watchlist.description,
      isShared: body.is_shared ?? access.watchlist.isShared,
      updatedAt: now,
    })
    .where(eq(watchlists.id, id))

  if (body.is_shared && access.watchlist.ownerId === user.id) {
    const [existingOwnerMember] = await db
      .select()
      .from(watchlistMembers)
      .where(eq(watchlistMembers.watchlistId, id))
      .limit(1)

    if (!existingOwnerMember) {
      await db.insert(watchlistMembers).values({
        id: crypto.randomUUID(),
        watchlistId: id,
        userId: user.id,
        role: 'owner',
        joinedAt: now,
      })
    }
  }

  const [updated] = await db.select().from(watchlists).where(eq(watchlists.id, id)).limit(1)
  return NextResponse.json({ watchlist: updated ? serializeWatchlist(updated) : null })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const db = await getDb()
  const access = await getWatchlistAccess(db, user.id, id)
  if (!access || access.watchlist.ownerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.delete(watchlists).where(eq(watchlists.id, id))
  return NextResponse.json({ success: true })
}
