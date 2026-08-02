export type WatchlistItemSort = 'title' | 'added_at' | 'release_date'
export type WatchlistItemOrder = 'asc' | 'desc'
export type WatchlistContentTypeFilter = 'all' | 'movie' | 'series'

export interface WatchlistItemFilters {
  sort?: WatchlistItemSort
  order?: WatchlistItemOrder
  type?: WatchlistContentTypeFilter
  genre?: string | null
}

export interface WatchlistItemRow {
  id: string
  content_id: string
  added_at: string
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

  let result = [...items]

  if (type !== 'all') {
    result = result.filter((item) => item.content?.content_type === type)
  }

  if (genre) {
    result = result.filter((item) =>
      (item.content?.genres ?? []).some((g) => g.name.toLowerCase().includes(genre))
    )
  }

  const direction = order === 'asc' ? 1 : -1

  result.sort((a, b) => {
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
