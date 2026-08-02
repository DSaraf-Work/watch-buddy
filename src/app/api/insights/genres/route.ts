import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUserInsightsData } from '@/lib/insights/read'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const insights = await getUserInsightsData(db, user.id)

  return NextResponse.json({
    genres: insights?.genre_breakdown ?? [],
  })
}
