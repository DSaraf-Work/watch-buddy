import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { recommendations, userPreferences } from '@/lib/db/schema/app'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1)

  const recs = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.userId, user.id))
    .limit(20)

  return NextResponse.json({
    preferences: prefs
      ? {
          id: prefs.id,
          user_id: prefs.userId,
          favorite_genres: prefs.favoriteGenres,
          favorite_platforms: prefs.favoritePlatforms,
          computed_at: prefs.computedAt ? new Date(prefs.computedAt).toISOString() : null,
        }
      : null,
    recommendations: recs.map((r) => ({
      id: r.id,
      user_id: r.userId,
      content_id: r.contentId,
      score: r.score,
      reason: r.reason,
    })),
  })
}
