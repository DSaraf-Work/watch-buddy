'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ContentCardProps {
  content: {
    id: number
    tmdb_id: number
    title: string
    content_type: 'movie' | 'series'
    poster_path: string | null
    release_date: string
    vote_average: number
  }
}

export function ContentCard({ content }: ContentCardProps) {
  const posterUrl = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : '/placeholder-poster.png'

  const year = content.release_date ? new Date(content.release_date).getFullYear() : 'N/A'
  const rating = content.vote_average ? content.vote_average.toFixed(1) : 'N/A'

  return (
    <Link
      href={`/content/${content.tmdb_id}-${content.content_type}`}
      className="group block"
    >
      <div className="space-y-2">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-200">
          <Image
            src={posterUrl}
            alt={content.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          
          {/* Rating Badge */}
          {content.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
              ⭐ {rating}
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
            {content.content_type === 'movie' ? 'Movie' : 'Series'}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600">{year}</p>
        </div>
      </div>
    </Link>
  )
}

