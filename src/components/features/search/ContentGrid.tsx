'use client'

import { ContentCard } from './ContentCard'

interface SearchResult {
  id: number
  tmdb_id: number
  title: string
  original_title: string
  content_type: 'movie' | 'series'
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

interface ContentGridProps {
  results: SearchResult[]
}

export function ContentGrid({ results }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {results.map((result) => (
        <ContentCard key={`${result.tmdb_id}-${result.content_type}`} content={result} />
      ))}
    </div>
  )
}

