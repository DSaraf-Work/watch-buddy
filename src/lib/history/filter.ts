export type HistorySort = 'watched_at' | 'rating' | 'title'
export type HistoryOrder = 'asc' | 'desc'
export type HistoryTypeFilter = 'all' | 'movie' | 'series'
export type HistoryRewatchFilter = 'all' | 'yes' | 'no'

export interface HistoryFilters {
  q?: string | null
  type?: HistoryTypeFilter
  platform_id?: string | null
  sort?: HistorySort
  order?: HistoryOrder
  min_rating?: number | null
  rewatch?: HistoryRewatchFilter
  from?: string | null
  to?: string | null
}

export interface HistoryRow {
  id: string
  watched_at: string
  rating: number | null
  review: string | null
  is_rewatch: boolean
  platform_id: string | null
  content: {
    title: string
    content_type: 'movie' | 'series'
  } | null
}

export function filterAndSortHistory(
  rows: HistoryRow[],
  filters: HistoryFilters
): HistoryRow[] {
  const sort = filters.sort ?? 'watched_at'
  const order = filters.order ?? 'desc'
  const type = filters.type ?? 'all'
  const rewatch = filters.rewatch ?? 'all'
  const query = filters.q?.trim().toLowerCase() ?? ''
  const minRating = filters.min_rating ?? null

  let result = [...rows]

  if (query) {
    result = result.filter((row) => {
      const title = row.content?.title?.toLowerCase() ?? ''
      const review = row.review?.toLowerCase() ?? ''
      return title.includes(query) || review.includes(query)
    })
  }

  if (type !== 'all') {
    result = result.filter((row) => row.content?.content_type === type)
  }

  if (filters.platform_id) {
    result = result.filter((row) => row.platform_id === filters.platform_id)
  }

  if (minRating != null) {
    result = result.filter((row) => row.rating != null && row.rating >= minRating)
  }

  if (rewatch === 'yes') {
    result = result.filter((row) => row.is_rewatch)
  } else if (rewatch === 'no') {
    result = result.filter((row) => !row.is_rewatch)
  }

  if (filters.from) {
    const fromMs = new Date(filters.from).getTime()
    result = result.filter((row) => new Date(row.watched_at).getTime() >= fromMs)
  }

  if (filters.to) {
    const toMs = new Date(filters.to).getTime()
    result = result.filter((row) => new Date(row.watched_at).getTime() <= toMs)
  }

  const direction = order === 'asc' ? 1 : -1

  result.sort((a, b) => {
    if (sort === 'title') {
      const titleA = a.content?.title?.toLowerCase() ?? ''
      const titleB = b.content?.title?.toLowerCase() ?? ''
      return titleA.localeCompare(titleB) * direction
    }

    if (sort === 'rating') {
      const ratingA = a.rating ?? 0
      const ratingB = b.rating ?? 0
      return (ratingA - ratingB) * direction
    }

    return (new Date(a.watched_at).getTime() - new Date(b.watched_at).getTime()) * direction
  })

  return result
}

export function parseHistoryFilters(url: URL): HistoryFilters {
  const sort = url.searchParams.get('sort')
  const order = url.searchParams.get('order')
  const type = url.searchParams.get('type')
  const rewatch = url.searchParams.get('rewatch')
  const minRatingRaw = url.searchParams.get('min_rating')

  return {
    q: url.searchParams.get('q'),
    type: type === 'movie' || type === 'series' || type === 'all' ? type : undefined,
    platform_id: url.searchParams.get('platform_id'),
    sort: sort === 'watched_at' || sort === 'rating' || sort === 'title' ? sort : undefined,
    order: order === 'asc' || order === 'desc' ? order : undefined,
    min_rating: minRatingRaw ? Number(minRatingRaw) : null,
    rewatch: rewatch === 'yes' || rewatch === 'no' || rewatch === 'all' ? rewatch : undefined,
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  }
}
