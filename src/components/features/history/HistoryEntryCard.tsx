'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fetchJson } from '@/lib/utils/fetch-json'

interface HistoryEntryCardProps {
  entry: {
    id: string
    watched_at: string
    rating: number | null
    review: string | null
    is_rewatch: boolean
    content: { title: string } | null
  }
  onUpdated: () => void
  onDeleted: () => void
}

export function HistoryEntryCard({ entry, onUpdated, onDeleted }: HistoryEntryCardProps) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(entry.rating?.toString() ?? '')
  const [review, setReview] = useState(entry.review ?? '')
  const [watchedAt, setWatchedAt] = useState(entry.watched_at.slice(0, 10))
  const [isRewatch, setIsRewatch] = useState(entry.is_rewatch)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await fetchJson(`/api/history/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating ? Number(rating) : null,
          review: review || null,
          watched_at: watchedAt,
          is_rewatch: isRewatch,
        }),
      })
      setEditing(false)
      onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this history entry?')) return
    setDeleting(true)
    setError(null)
    try {
      await fetchJson(`/api/history/${entry.id}`, { method: 'DELETE' })
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
      {editing ? (
        <div className="w-full space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <Input label="Watched on" type="date" value={watchedAt} onChange={(e) => setWatchedAt(e.target.value)} />
          <Input
            label="Rating (1-5)"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <Input label="Review" value={review} onChange={(e) => setReview(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isRewatch} onChange={(e) => setIsRewatch(e.target.checked)} />
            Rewatch
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={handleDelete} isLoading={deleting}>
            Delete
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
