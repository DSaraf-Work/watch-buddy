'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fetchJson } from '@/lib/utils/fetch-json'
import { PRIORITY_LABELS, PRIORITY_STYLES } from '@/lib/watchlists/sort-filter'

interface WatchlistItemMetaEditorProps {
  watchlistId: string
  itemId: string
  priority: 'high' | 'medium' | 'low' | null
  notes: string | null
  onSaved: () => void
}

export function WatchlistItemMetaEditor({
  watchlistId,
  itemId,
  priority,
  notes,
  onSaved,
}: WatchlistItemMetaEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draftPriority, setDraftPriority] = useState(priority ?? '')
  const [draftNotes, setDraftNotes] = useState(notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await fetchJson(`/api/watchlists/${watchlistId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: draftPriority || null,
          notes: draftNotes.trim() || null,
        }),
      })
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="mt-2 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {priority ? (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
            >
              {PRIORITY_LABELS[priority]} priority
            </span>
          ) : (
            <span className="text-xs text-gray-500">No priority set</span>
          )}
          <button
            type="button"
            onClick={() => {
              setDraftPriority(priority ?? '')
              setDraftNotes(notes ?? '')
              setEditing(true)
            }}
            className="text-xs text-blue-700 hover:underline"
          >
            Edit
          </button>
        </div>
        {notes && <p className="text-sm text-gray-600 line-clamp-2">{notes}</p>}
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      <label className="block text-xs font-medium text-gray-700">
        Priority
        <select
          value={draftPriority}
          onChange={(e) => setDraftPriority(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">None</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <Input
        label="Notes"
        value={draftNotes}
        onChange={(e) => setDraftNotes(e.target.value)}
        placeholder="Why you want to watch this"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} isLoading={saving}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
