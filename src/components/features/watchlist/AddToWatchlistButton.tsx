'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { fetchJson } from '@/lib/utils/fetch-json'

interface WatchlistOption {
  id: string
  name: string
}

interface AddToWatchlistButtonProps {
  contentUuid: string
}

export function AddToWatchlistButton({ contentUuid }: AddToWatchlistButtonProps) {
  const [watchlists, setWatchlists] = useState<WatchlistOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJson<{ watchlists: WatchlistOption[] }>('/api/watchlists')
        setWatchlists(data.watchlists)
        if (data.watchlists[0]) setSelectedId(data.watchlists[0].id)
      } catch {
        setWatchlists([])
      }
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!selectedId) return
    setLoading(true)
    setMessage(null)
    try {
      await fetchJson(`/api/watchlists/${selectedId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentUuid }),
      })
      setMessage('Added to watchlist')
    } catch {
      setMessage('Could not add to watchlist')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 2500)
    }
  }

  if (watchlists.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Create a watchlist first to save titles here.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Add to watchlist</label>
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {watchlists.map((watchlist) => (
            <option key={watchlist.id} value={watchlist.id}>
              {watchlist.name}
            </option>
          ))}
        </select>
        <Button type="button" size="sm" onClick={handleAdd} isLoading={loading}>
          Add
        </Button>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  )
}
