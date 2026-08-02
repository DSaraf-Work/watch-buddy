import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, recommendations, userPreferences } from '@/lib/db/schema/app'
import { computeUserInsights } from '@/lib/insights/compute'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

function serializePreferences(prefs: typeof userPreferences.$inferSelect) {
  return {
    id: prefs.id,
    user_id: prefs.userId,
    favorite_genres: prefs.favoriteGenres ?? [],
    favorite_platforms: prefs.favoritePlatforms ?? [],
    avg_rating: prefs.avgRating,
    total_watched: prefs.totalWatched,
    total_watch_time: prefs.totalWatchTime,
    insights_data: prefs.insightsData,
    computed_at: prefs.computedAt ? new Date(prefs.computedAt).toISOString() : null,
  }
}

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
    .select({ rec: recommendations, contentRow: content })
    .from(recommendations)
    .innerJoin(content, eq(recommendations.contentId, content.id))
    .where(eq(recommendations.userId, user.id))
    .limit(20)

  return NextResponse.json({
    preferences: prefs ? serializePreferences(prefs) : null,
    recommendations: recs.map((row) => ({
      id: row.rec.id,
      user_id: row.rec.userId,
      content_id: row.rec.contentId,
      score: row.rec.score,
      reason: row.rec.reason,
      content: {
        id: row.contentRow.id,
        tmdb_id: row.contentRow.tmdbId,
        title: row.contentRow.title,
        content_type: row.contentRow.contentType,
        poster_path: row.contentRow.posterPath,
      },
    })),
  })
}

export async function POST() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const result = await computeUserInsights(db, user.id)

  return NextResponse.json(result)
}
