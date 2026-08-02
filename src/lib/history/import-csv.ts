export interface CsvHistoryRow {
  content_id: string
  watched_at: string
  rating?: number | null
  review?: string | null
  is_rewatch?: boolean
  platform_id?: string | null
}

export interface CsvImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export function parseHistoryCsv(text: string): { rows: CsvHistoryRow[]; errors: string[] } {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV is empty'] }
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const contentIdx = header.indexOf('content_id')
  const watchedIdx = header.indexOf('watched_at')

  if (contentIdx === -1 || watchedIdx === -1) {
    return { rows: [], errors: ['CSV must include content_id and watched_at columns'] }
  }

  const ratingIdx = header.indexOf('rating')
  const reviewIdx = header.indexOf('review')
  const rewatchIdx = header.indexOf('is_rewatch')
  const platformIdx = header.indexOf('platform_id')

  const rows: CsvHistoryRow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const contentId = cols[contentIdx]?.trim()
    const watchedAt = cols[watchedIdx]?.trim()

    if (!contentId || !watchedAt) {
      errors.push(`Row ${i + 1}: missing content_id or watched_at`)
      continue
    }

    if (Number.isNaN(Date.parse(watchedAt))) {
      errors.push(`Row ${i + 1}: invalid watched_at`)
      continue
    }

    const ratingRaw = ratingIdx >= 0 ? cols[ratingIdx]?.trim() : ''
    const rating = ratingRaw ? Number(ratingRaw) : null
    if (rating != null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
      errors.push(`Row ${i + 1}: rating must be 1-5`)
      continue
    }

    rows.push({
      content_id: contentId,
      watched_at: watchedAt,
      rating,
      review: reviewIdx >= 0 ? cols[reviewIdx]?.trim() || null : null,
      is_rewatch: rewatchIdx >= 0 ? cols[rewatchIdx]?.trim().toLowerCase() === 'true' : false,
      platform_id: platformIdx >= 0 ? cols[platformIdx]?.trim() || null : null,
    })
  }

  return { rows, errors }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }
    current += char
  }

  result.push(current)
  return result
}
