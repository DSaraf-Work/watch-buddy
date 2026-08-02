'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fetchJson } from '@/lib/utils/fetch-json'

interface HistoryEntryFormProps {
  onCreated: () => void
}

export function HistoryEntryForm({ onCreated }: HistoryEntryFormProps) {
  const [contentId, setContentId] = useState('')
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState('')
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentId.trim()) return

    setLoading(true)
    setError(null)

    try {
      await fetchJson('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId.trim(),
          watched_at: new Date(watchedAt).toISOString(),
          rating: rating ? Number(rating) : undefined,
          review: review.trim() || undefined,
        }),
      })
      setContentId('')
      setReview('')
      setRating('')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add history entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Log a watch</h2>
      <p className="mb-4 text-sm text-gray-600">
        Use the content ID from a title&apos;s detail page (shown when you add to watchlist).
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          label="Content ID"
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
          placeholder="UUID from content API"
          required
        />
        <Input
          label="Watched on"
          type="date"
          value={watchedAt}
          onChange={(e) => setWatchedAt(e.target.value)}
          required
        />
        <Input
          label="Rating (1-5)"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <Input
          label="Review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Optional thoughts"
        />
        <div className="md:col-span-2">
          <Button type="submit" isLoading={loading}>
            Add to history
          </Button>
        </div>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  )
}
