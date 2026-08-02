'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'

interface SharedItem {
  content_id: string
  user_count: number
  users: Array<{ user_id: string; display_name: string | null; email: string | null }>
  content: {
    id: string
    tmdb_id: number
    title: string
    content_type: 'movie' | 'series'
    poster_path: string | null
  } | null
}

interface Watchlist {
  id: string
  name: string
  description: string | null
  is_shared: boolean
}

export function SharedWatchlistsContent() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchJson<{ watchlists: Watchlist[] }>('/api/watchlists'),
      fetchJson<{ items: SharedItem[] }>('/api/watchlists/shared-items?min_users=2'),
    ])
      .then(([lists, overlap]) => {
        setWatchlists(lists.watchlists.filter((w) => w.is_shared))
        setSharedItems(overlap.items)
        setError(null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load shared watchlists'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-600">Loading shared watchlists...</p>

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">{error}</div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared watchlists</h2>
        {watchlists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No shared watchlists yet. Create one from{' '}
            <Link href={ROUTES.WATCHLIST.INDEX} className="text-blue-700 hover:underline">
              your watchlists
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {watchlists.map((watchlist) => (
              <Link
                key={watchlist.id}
                href={ROUTES.WATCHLIST.DETAIL(watchlist.id)}
                className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300"
              >
                <h3 className="font-semibold text-gray-900">{watchlist.name}</h3>
                {watchlist.description && (
                  <p className="mt-2 text-sm text-gray-600">{watchlist.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Wishlisted by multiple people</h2>
        <p className="text-sm text-gray-600 mb-4">
          Titles that appear on watchlists from two or more people you share lists with.
        </p>
        {sharedItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No overlapping wishlist items yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sharedItems.map((item) => {
              const content = item.content
              const contentPath = content
                ? ROUTES.CONTENT(`${content.tmdb_id}-${content.content_type}`)
                : null
              return (
                <article
                  key={item.content_id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                    {content?.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${content.poster_path}`}
                        alt={content.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    {contentPath && content ? (
                      <Link href={contentPath} className="font-semibold text-gray-900 hover:text-blue-700">
                        {content.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900">Unknown title</p>
                    )}
                    <p className="mt-1 text-sm text-gray-600">
                      {item.user_count} people ·{' '}
                      {item.users.map((u) => u.display_name || u.email || 'User').join(', ')}
                    </p>
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
