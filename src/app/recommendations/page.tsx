'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/AppHeader'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'

interface Recommendation {
  id: string
  score: number
  reason: string | null
  content: {
    tmdb_id: number
    title: string
    content_type: 'movie' | 'series'
    poster_path: string | null
  }
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson<{ recommendations: Recommendation[] }>('/api/insights')
      .then((data) => setRecommendations(data.recommendations))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
        <p className="text-gray-600 mb-8">
          Personalized picks from your viewing history.{' '}
          <Link href={ROUTES.INSIGHTS} className="text-blue-700 hover:underline">
            Refresh insights
          </Link>
        </p>

        {loading ? (
          <p className="text-gray-600">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            Compute insights first to see recommendations.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <article
                key={rec.id}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                  {rec.content.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${rec.content.poster_path}`}
                      alt={rec.content.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div>
                  <Link
                    href={ROUTES.CONTENT(`${rec.content.tmdb_id}-${rec.content.content_type}`)}
                    className="font-semibold text-gray-900 hover:text-blue-700"
                  >
                    {rec.content.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">Score: {rec.score}</p>
                  {rec.reason && <p className="text-sm text-gray-700 mt-1">{rec.reason}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
