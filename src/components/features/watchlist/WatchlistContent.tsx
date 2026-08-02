'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'

interface Watchlist {
  id: string
  name: string
  description: string | null
  owner_id: string
  is_shared: boolean
  created_at: string
  updated_at: string
}

export function WatchlistContent() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isShared, setIsShared] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadWatchlists = async () => {
    try {
      const data = await fetchJson<{ watchlists: Watchlist[] }>('/api/watchlists')
      setWatchlists(data.watchlists)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWatchlists()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    setError(null)

    try {
      await fetchJson('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          is_shared: isShared,
        }),
      })
      setName('')
      setDescription('')
      setIsShared(false)
      await loadWatchlists()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create watchlist')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Loading watchlists...</p>
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Watchlist</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Friday night picks"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded border-gray-300"
            />
            Shared watchlist — invite members on the watchlist page
          </label>
          <Button type="submit" isLoading={creating}>
            Create Watchlist
          </Button>
        </form>
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Watchlists</h2>
        {watchlists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No watchlists yet. Create one above or add titles from search.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {watchlists.map((watchlist) => (
              <Link
                key={watchlist.id}
                href={ROUTES.WATCHLIST.DETAIL(watchlist.id)}
                aria-label={watchlist.name}
                className="block rounded-lg bg-white p-5 shadow-sm border border-gray-200 transition hover:border-blue-300"
              >
                <article>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{watchlist.name}</h3>
                  {watchlist.is_shared && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Shared
                    </span>
                  )}
                </div>
                {watchlist.description && (
                  <p className="mt-2 text-sm text-gray-600">{watchlist.description}</p>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  Created {new Date(watchlist.created_at).toLocaleDateString()}
                </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
