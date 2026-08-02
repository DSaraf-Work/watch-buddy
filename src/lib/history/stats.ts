import { eq } from 'drizzle-orm'
import type { Database } from '@/lib/db'
import { content, ottPlatforms, watchHistory } from '@/lib/db/schema/app'

export async function getHistoryStats(db: Database, userId: string) {
  const rows = await db
    .select({
      history: watchHistory,
      contentRow: content,
      platformName: ottPlatforms.name,
    })
    .from(watchHistory)
    .leftJoin(content, eq(watchHistory.contentId, content.id))
    .leftJoin(ottPlatforms, eq(watchHistory.platformId, ottPlatforms.id))
    .where(eq(watchHistory.userId, userId))

  const ratings: number[] = []
  const genreCounts = new Map<string, number>()
  const platformCounts = new Map<string, { name: string; count: number }>()
  let movies = 0
  let series = 0
  let totalWatchTime = 0
  const monthlyCounts = new Map<string, number>()

  for (const row of rows) {
    const { history, contentRow, platformName } = row
    if (contentRow?.contentType === 'movie') movies += 1
    else if (contentRow?.contentType === 'series') series += 1

    if (contentRow?.runtime) totalWatchTime += contentRow.runtime

    if (history.rating != null) ratings.push(history.rating)

    for (const genre of contentRow?.genres ?? []) {
      genreCounts.set(genre.name, (genreCounts.get(genre.name) ?? 0) + 1)
    }

    if (history.platformId) {
      const existing = platformCounts.get(history.platformId)
      if (existing) existing.count += 1
      else platformCounts.set(history.platformId, { name: platformName ?? 'Unknown', count: 1 })
    }

    const month = new Date(history.watchedAt).toISOString().slice(0, 7)
    monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1)
  }

  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
      : null

  return {
    total_watched: rows.length,
    total_watch_time: totalWatchTime,
    avg_rating: avgRating,
    content_type_breakdown: { movies, series },
    top_genres: [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count })),
    top_platforms: [...platformCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([platform_id, { name, count }]) => ({ platform_id, platform_name: name, count })),
    monthly_activity: [...monthlyCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
  }
}
