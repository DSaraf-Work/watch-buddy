import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSharedWatchlistItems } from '@/lib/watchlists/shared-items'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const minUsers = Math.max(2, Number(request.nextUrl.searchParams.get('min_users') ?? 2))
  const db = await getDb()
  const items = await getSharedWatchlistItems(db, user.id, minUsers)

  return NextResponse.json({ items, min_users: minUsers })
}
