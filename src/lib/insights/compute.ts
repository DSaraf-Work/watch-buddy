import { and, eq, notInArray, sql } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'
import {
  content,
  ottPlatforms,
  recommendations,
  userPreferences,
  watchHistory,
  type InsightsData,
} from '@/lib/db/schema/app'

type AppDb = DrizzleD1Database<typeof schema>

export interface ComputedInsights {
  preferences: {
    favorite_genres: string[]
    favorite_platforms: string[]
    avg_rating: number | null
    total_watched: number
    total_watch_time: number
    computed_at: string
    insights_data: InsightsData
  }
  recommendations: Array<{
    content_id: string
    score: number
    reason: string
    content: {
      id: string
      tmdb_id: number
      title: string
      content_type: 'movie' | 'series'
      poster_path: string | null
    }
  }>
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function computeUserInsights(db: AppDb, userId: string): Promise<ComputedInsights> {
  const rows = await db
    .select({
      history: watchHistory,
      contentRow: content,
      platformName: ottPlatforms.name,
    })
    .from(watchHistory)
    .innerJoin(content, eq(watchHistory.contentId, content.id))
    .leftJoin(ottPlatforms, eq(watchHistory.platformId, ottPlatforms.id))
    .where(eq(watchHistory.userId, userId))

  const genreCounts = new Map<string, number>()
  const platformCounts = new Map<string, { name: string; count: number }>()
  const monthlyCounts = new Map<string, number>()
  const ratings: number[] = []
  let totalWatchTime = 0
  let moviesWatched = 0
  let seriesWatched = 0
  const watchedContentIds = new Set<string>()

  for (const row of rows) {
    const { history, contentRow, platformName } = row
    watchedContentIds.add(contentRow.id)

    if (contentRow.contentType === 'movie') moviesWatched += 1
    else seriesWatched += 1

    if (contentRow.runtime) {
      totalWatchTime += contentRow.runtime
    }

    if (history.rating != null) {
      ratings.push(history.rating)
    }

    const genres = contentRow.genres ?? []
    for (const genre of genres) {
      genreCounts.set(genre.name, (genreCounts.get(genre.name) ?? 0) + 1)
    }

    if (history.platformId) {
      const existing = platformCounts.get(history.platformId)
      if (existing) {
        existing.count += 1
      } else {
        platformCounts.set(history.platformId, {
          name: platformName ?? 'Unknown',
          count: 1,
        })
      }
    }

    const key = monthKey(new Date(history.watchedAt))
    monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1)
  }

  const favoriteGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre)

  const favoritePlatforms = [...platformCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([platformId]) => platformId)

  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 100) / 100
      : null

  const insightsData: InsightsData = {
    monthly_activity: [...monthlyCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    genre_breakdown: [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count })),
    platform_breakdown: [...platformCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([platform_id, { name, count }]) => ({
        platform_id,
        platform_name: name,
        count,
      })),
    content_type_breakdown: { movies: moviesWatched, series: seriesWatched },
  }

  const now = new Date()
  const prefsId = crypto.randomUUID()

  const [existingPrefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  if (existingPrefs) {
    await db
      .update(userPreferences)
      .set({
        favoriteGenres,
        favoritePlatforms,
        avgRating,
        totalWatched: rows.length,
        totalWatchTime,
        insightsData,
        computedAt: now,
        updatedAt: now,
      })
      .where(eq(userPreferences.userId, userId))
  } else {
    await db.insert(userPreferences).values({
      id: prefsId,
      userId,
      favoriteGenres,
      favoritePlatforms,
      avgRating,
      totalWatched: rows.length,
      totalWatchTime,
      insightsData,
      computedAt: now,
      createdAt: now,
      updatedAt: now,
    })
  }

  await db.delete(recommendations).where(eq(recommendations.userId, userId))

  const watchedIds = [...watchedContentIds]
  const candidateQuery = db.select().from(content)

  const candidates =
    watchedIds.length > 0
      ? await candidateQuery.where(notInArray(content.id, watchedIds)).limit(100)
      : await candidateQuery.limit(100)

  const scored = candidates
    .map((item) => {
      const itemGenres = (item.genres ?? []).map((g) => g.name)
      const overlap = itemGenres.filter((g) => favoriteGenres.includes(g)).length
      if (overlap === 0 && favoriteGenres.length > 0) return null

      const score = favoriteGenres.length > 0 ? overlap * 20 + (item.ratings?.tmdb ?? 0) : item.ratings?.tmdb ?? 50
      const matchedGenre = itemGenres.find((g) => favoriteGenres.includes(g))

      return {
        content: item,
        score: Math.round(score),
        reason: matchedGenre
          ? `Because you enjoy ${matchedGenre}`
          : 'Popular on TMDB',
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  if (scored.length > 0) {
    await db.insert(recommendations).values(
      scored.map((item) => ({
        id: crypto.randomUUID(),
        userId,
        contentId: item.content.id,
        score: item.score,
        reason: item.reason,
        createdAt: now,
      }))
    )
  }

  const recRows = await db
    .select({ rec: recommendations, contentRow: content })
    .from(recommendations)
    .innerJoin(content, eq(recommendations.contentId, content.id))
    .where(eq(recommendations.userId, userId))
    .orderBy(sql`${recommendations.score} desc`)
    .limit(10)

  return {
    preferences: {
      favorite_genres: favoriteGenres,
      favorite_platforms: favoritePlatforms,
      avg_rating: avgRating,
      total_watched: rows.length,
      total_watch_time: totalWatchTime,
      computed_at: now.toISOString(),
      insights_data: insightsData,
    },
    recommendations: recRows.map((row) => ({
      content_id: row.rec.contentId,
      score: row.rec.score,
      reason: row.rec.reason ?? '',
      content: {
        id: row.contentRow.id,
        tmdb_id: row.contentRow.tmdbId,
        title: row.contentRow.title,
        content_type: row.contentRow.contentType,
        poster_path: row.contentRow.posterPath,
      },
    })),
  }
}
