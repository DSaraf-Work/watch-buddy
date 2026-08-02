'use client'

import { Input } from '@/components/ui/Input'

export interface HistoryFilterState {
  q: string
  type: string
  platformId: string
  sort: string
  order: string
  minRating: string
  rewatch: string
  from: string
  to: string
}

interface Platform {
  id: string
  name: string
}

interface HistoryFiltersBarProps {
  filters: HistoryFilterState
  platforms: Platform[]
  onChange: (filters: HistoryFilterState) => void
}

export function HistoryFiltersBar({ filters, platforms, onChange }: HistoryFiltersBarProps) {
  const update = (patch: Partial<HistoryFilterState>) => {
    onChange({ ...filters, ...patch })
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Filter & sort</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Title or review"
        />
        <label className="text-sm text-gray-700">
          Type
          <select
            value={filters.type}
            onChange={(e) => update({ type: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Platform
          <select
            value={filters.platformId}
            onChange={(e) => update({ platformId: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Rewatch
          <select
            value={filters.rewatch}
            onChange={(e) => update({ rewatch: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Rewatches only</option>
            <option value="no">First watches only</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Sort
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="watched_at">Watch date</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Order
          <select
            value={filters.order}
            onChange={(e) => update({ order: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <Input
          label="Min rating"
          type="number"
          min={1}
          max={5}
          value={filters.minRating}
          onChange={(e) => update({ minRating: e.target.value })}
          placeholder="1-5"
        />
        <Input
          label="From date"
          type="date"
          value={filters.from}
          onChange={(e) => update({ from: e.target.value })}
        />
        <Input
          label="To date"
          type="date"
          value={filters.to}
          onChange={(e) => update({ to: e.target.value })}
        />
      </div>
    </section>
  )
}

export function buildHistoryQuery(filters: HistoryFilterState): string {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.type !== 'all') params.set('type', filters.type)
  if (filters.platformId) params.set('platform_id', filters.platformId)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)
  if (filters.minRating) params.set('min_rating', filters.minRating)
  if (filters.rewatch !== 'all') params.set('rewatch', filters.rewatch)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  return params.toString()
}
