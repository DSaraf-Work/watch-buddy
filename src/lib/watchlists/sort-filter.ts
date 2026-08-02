export type WatchlistItemSort = 'title' | 'added_at' | 'release_date' | 'priority'
export type WatchlistItemOrder = 'asc' | 'desc'
export type WatchlistContentTypeFilter = 'all' | 'movie' | 'series'
export type WatchlistPriorityFilter = 'all' | 'high' | 'medium' | 'low' | 'unset'

const PRIORITY_RANK: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export interface WatchlistItemFilters {
  sort?: WatchlistItemSort
  order?: WatchlistItemOrder
  type?: WatchlistContentTypeFilter
  genre?: string | null
  priority?: WatchlistPriorityFilter
}

export interface WatchlistItemRow {
  id: string
  content_id: string
  added_at: string
  priority: 'high' | 'medium' | 'low' | null
  content: {
    title: string
    content_type: 'movie' | 'series'
    release_date: string | null
    genres?: Array<{ id: number; name: string }> | null
  } | null
}

export function filterAndSortWatchlistItems(
  items: WatchlistItemRow[],
  filters: WatchlistItemFilters
): WatchlistItemRow[] {
  const sort = filters.sort ?? 'added_at'
  const order = filters.order ?? 'desc'
  const type = filters.type ?? 'all'
  const genre = filters.genre?.trim().toLowerCase()
  const priorityFilter = filters.priority ?? 'all'

  let result = [...items]

  if (type !== 'all') {
    result = result.filter((item) => item.content?.content_type === type)
  }

  if (genre) {
    result = result.filter((item) =>
      (item.content?.genres ?? []).some((g) => g.name.toLowerCase().includes(genre))
    )
  }

  if (priorityFilter !== 'all') {
    if (priorityFilter === 'unset') {
      result = result.filter((item) => !item.priority)
    } else {
      result = result.filter((item) => item.priority === priorityFilter)
    }
  }

  const direction = order === 'asc' ? 1 : -1

  result.sort((a, b) => {
    if (sort === 'priority') {
      const rankA = a.priority ? PRIORITY_RANK[a.priority] : 0
      const rankB = b.priority ? PRIORITY_RANK[b.priority] : 0
      return (rankA - rankB) * direction
    }

    if (sort === 'title') {
      const titleA = a.content?.title?.toLowerCase() ?? ''
      const titleB = b.content?.title?.toLowerCase() ?? ''
      return titleA.localeCompare(titleB) * direction
    }

    if (sort === 'release_date') {
      const dateA = a.content?.release_date ?? ''
      const dateB = b.content?.release_date ?? ''
      return dateA.localeCompare(dateB) * direction
    }

    return (new Date(a.added_at).getTime() - new Date(b.added_at).getTime()) * direction
  })

  return result
}

export const PRIORITY_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const PRIORITY_STYLES: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-700',
}
