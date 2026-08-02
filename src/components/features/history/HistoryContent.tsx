'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'
import { HistoryEntryForm } from './HistoryEntryForm'
import { HistoryEntryCard } from './HistoryEntryCard'
import { HistoryImportForm } from './HistoryImportForm'
import {
  HistoryFiltersBar,
  buildHistoryQuery,
  type HistoryFilterState,
} from './HistoryFiltersBar'

interface HistoryEntry {
  id: string
  user_id: string
  content_id: string
  platform_id: string | null
  watched_at: string
  rating: number | null
  review: string | null
  is_rewatch: boolean
  content: {
    id: string
    tmdb_id: number
    title: string
    content_type: 'movie' | 'series'
    poster_path: string | null
    runtime: number | null
  } | null
}

const DEFAULT_FILTERS: HistoryFilterState = {
  q: '',
  type: 'all',
  platformId: '',
  sort: 'watched_at',
  order: 'desc',
  minRating: '',
  rewatch: 'all',
  from: '',
  to: '',
}

export function HistoryContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [total, setTotal] = useState(0)
  const [platforms, setPlatforms] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<HistoryFilterState>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const query = buildHistoryQuery(filters)
      const url = query ? `/api/history?${query}` : '/api/history'
      const data = await fetchJson<{ history: HistoryEntry[]; total: number }>(url)
      setHistory(data.history)
      setTotal(data.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchJson<{ platforms: Array<{ id: string; name: string }> }>('/api/platforms')
      .then((data) => setPlatforms(data.platforms))
      .catch(() => setPlatforms([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-gray-600">Loading watch history...</p>
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Link href={ROUTES.HISTORY.STATS} className="text-sm font-medium text-blue-700 hover:underline">
          View watch stats →
        </Link>
      </div>

      <HistoryEntryForm onCreated={load} />
      <HistoryImportForm onImported={load} />
      <HistoryFiltersBar filters={filters} platforms={platforms} onChange={setFilters} />

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          {total === 0 ? (
            <>
              <p className="text-gray-600 mb-4">No watch history yet.</p>
              <Link href={ROUTES.SEARCH} className="text-blue-700 hover:underline font-medium">
                Search for something to watch
              </Link>
            </>
          ) : (
            <p className="text-gray-600">No entries match your filters.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Showing {history.length} of {total} entries
          </p>
          <div className="space-y-4">
            {history.map((entry) => {
              const content = entry.content
              const contentPath = content
                ? ROUTES.CONTENT(`${content.tmdb_id}-${content.content_type}`)
                : null

              return (
                <article
                  key={entry.id}
                  className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm border border-gray-200 lg:flex-row"
                >
                  <div className="flex flex-1 gap-4 min-w-0">
                    <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                      {content?.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${content.poster_path}`}
                          alt={content.title}
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
                    <div className="flex-1 min-w-0">
                      {contentPath ? (
                        <Link href={contentPath} className="font-semibold text-gray-900 hover:text-blue-700">
                          {content?.title}
                        </Link>
                      ) : (
                        <p className="font-semibold text-gray-900">Unknown title</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Watched {new Date(entry.watched_at).toLocaleDateString()}
                        {entry.is_rewatch ? ' · Rewatch' : ''}
                      </p>
                      {entry.rating && (
                        <p className="text-sm text-gray-600 mt-1">Rating: {entry.rating}/5</p>
                      )}
                      {entry.review && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{entry.review}</p>
                      )}
                    </div>
                  </div>
                  <HistoryEntryCard entry={entry} onUpdated={load} onDeleted={load} />
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
