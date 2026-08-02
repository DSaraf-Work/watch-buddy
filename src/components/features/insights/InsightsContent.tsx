'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  ContentMixPieChart,
  GenreBarChart,
  MonthlyTrendChart,
  PlatformBarChart,
} from '@/components/charts/InsightsCharts'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'
import type { InsightsData } from '@/lib/db/schema/app'

interface InsightsResponse {
  preferences: {
    favorite_genres: string[]
    favorite_platforms: string[]
    avg_rating: number | null
    total_watched: number
    total_watch_time: number
    insights_data: InsightsData | null
    computed_at: string | null
  } | null
  recommendations: Array<{
    id: string
    score: number
    reason: string | null
    content: {
      id: string
      tmdb_id: number
      title: string
      content_type: 'movie' | 'series'
      poster_path: string | null
    }
  }>
  job?: {
    status: 'idle' | 'pending' | 'running' | 'completed' | 'failed'
    error?: string
  }
}

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

export function InsightsContent() {
  const [data, setData] = useState<InsightsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInsights = useCallback(async () => {
    try {
      const response = await fetchJson<InsightsResponse>('/api/insights')
      setData(response)
      setError(null)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  const pollJob = useCallback(async () => {
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const status = await fetchJson<{ job: InsightsResponse['job'] }>('/api/insights/compute-status')
      if (status.job?.status === 'completed') {
        await loadInsights()
        return
      }
      if (status.job?.status === 'failed') {
        throw new Error(status.job.error ?? 'Background compute failed')
      }
    }
    throw new Error('Insights compute timed out')
  }, [loadInsights])

  const handleCompute = async (asyncMode = true) => {
    setComputing(true)
    setError(null)
    try {
      if (asyncMode) {
        await fetchJson('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ async: true }),
        })
        await pollJob()
      } else {
        await fetchJson('/api/insights', { method: 'POST' })
        await loadInsights()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute insights')
    } finally {
      setComputing(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Loading insights...</p>
  }

  const prefs = data?.preferences
  const insights = prefs?.insights_data
  const jobRunning = data?.job?.status === 'pending' || data?.job?.status === 'running'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {prefs?.computed_at ? (
            <p className="text-sm text-gray-600">
              Last updated {new Date(prefs.computed_at).toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              No insights computed yet. Generate them from your watch history.
            </p>
          )}
          {jobRunning && (
            <p className="text-sm text-blue-700 mt-1">Computing insights in the background…</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCompute(true)} isLoading={computing || jobRunning}>
            {prefs ? 'Refresh Insights' : 'Compute Insights'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Watched" value={String(prefs?.total_watched ?? 0)} />
        <StatCard label="Watch Time" value={formatWatchTime(prefs?.total_watch_time ?? 0)} />
        <StatCard
          label="Avg Rating"
          value={prefs?.avg_rating != null ? `${prefs.avg_rating}/5` : '—'}
        />
        <StatCard
          label="Top Genres"
          value={prefs?.favorite_genres?.length ? String(prefs.favorite_genres.length) : '0'}
        />
      </section>

      {insights && (
        <div className="grid gap-6 lg:grid-cols-2">
          <BreakdownCard title="Genre Breakdown">
            <GenreBarChart
              items={insights.genre_breakdown.slice(0, 8).map((item) => ({
                label: item.genre,
                value: item.count,
              }))}
            />
          </BreakdownCard>

          <BreakdownCard title="Platform Usage">
            <PlatformBarChart
              items={insights.platform_breakdown.slice(0, 8).map((item) => ({
                label: item.platform_name,
                value: item.count,
              }))}
            />
          </BreakdownCard>

          <BreakdownCard title="Monthly Activity">
            <MonthlyTrendChart
              items={insights.monthly_activity.slice(-12).map((item) => ({
                label: item.month,
                value: item.count,
              }))}
            />
          </BreakdownCard>

          <BreakdownCard title="Content Mix">
            <ContentMixPieChart
              movies={insights.content_type_breakdown.movies}
              series={insights.content_type_breakdown.series}
            />
          </BreakdownCard>
        </div>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          <Link href={ROUTES.RECOMMENDATIONS} className="text-sm text-blue-700 hover:underline">
            View all →
          </Link>
        </div>
        {!data?.recommendations.length ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            Compute insights to get personalized recommendations.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.recommendations.map((rec) => {
              const contentPath = ROUTES.CONTENT(`${rec.content.tmdb_id}-${rec.content.content_type}`)
              return (
                <article
                  key={rec.id}
                  className="flex gap-4 rounded-lg bg-white p-4 shadow-sm border border-gray-200"
                >
                  <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                    {rec.content.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${rec.content.poster_path}`}
                        alt={rec.content.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link href={contentPath} className="font-semibold text-gray-900 hover:text-blue-700">
                      {rec.content.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Score: {rec.score}</p>
                    {rec.reason && <p className="text-sm text-gray-700 mt-1">{rec.reason}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function BreakdownCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}
