import { NextResponse } from 'next/server'
import { getHistoryStats } from '@/lib/history/stats'
import { getDb } from '@/lib/db'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const stats = await getHistoryStats(db, user.id)
  return NextResponse.json({ stats })
}
