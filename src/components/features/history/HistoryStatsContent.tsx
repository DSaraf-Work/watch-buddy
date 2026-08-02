'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart } from '@/components/ui/BarChart'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'

interface HistoryStats {
  total_watched: number
  total_watch_time: number
  avg_rating: number | null
  content_type_breakdown: { movies: number; series: number }
  top_genres: Array<{ genre: string; count: number }>
  top_platforms: Array<{ platform_id: string; platform_name: string; count: number }>
  monthly_activity: Array<{ month: string; count: number }>
}

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

export function HistoryStatsContent() {
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson<{ stats: HistoryStats }>('/api/history/stats')
      .then((data) => setStats(data.stats))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-600">Loading stats...</p>
  if (!stats) return <p className="text-gray-600">No stats available.</p>

  return (
    <div className="space-y-8">
      <Link href={ROUTES.HISTORY.INDEX} className="text-sm text-blue-700 hover:underline">
        ← Back to history
      </Link>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total watched" value={String(stats.total_watched)} />
        <StatCard label="Watch time" value={formatWatchTime(stats.total_watch_time)} />
        <StatCard
          label="Avg rating"
          value={stats.avg_rating != null ? `${stats.avg_rating}/5` : '—'}
        />
        <StatCard
          label="Movies / Series"
          value={`${stats.content_type_breakdown.movies} / ${stats.content_type_breakdown.series}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top genres</h2>
          <BarChart
            items={stats.top_genres.map((g) => ({ label: g.genre, value: g.count }))}
          />
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platforms</h2>
          <BarChart
            items={stats.top_platforms.map((p) => ({
              label: p.platform_name,
              value: p.count,
            }))}
          />
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly activity</h2>
          <BarChart
            items={stats.monthly_activity.map((m) => ({ label: m.month, value: m.count }))}
          />
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
