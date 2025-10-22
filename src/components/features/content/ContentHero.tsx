'use client'

import { ContentStatusDropdown } from './ContentStatusDropdown'

interface ContentHeroProps {
  title: string
  backdropUrl: string | null
  rating: number
  year: number | null
  contentType: 'movie' | 'series'
  contentId: string
}

export function ContentHero({ title, backdropUrl, rating, year, contentType, contentId }: ContentHeroProps) {
  return (
    <div className="relative h-96 overflow-hidden">
      {/* Backdrop Image */}
      {backdropUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      )}

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-8">
        <div className="text-white w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-600 rounded text-sm font-semibold uppercase">
              {contentType === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {year && (
              <span className="text-gray-300 text-lg">{year}</span>
            )}
            {rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title and Status Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
            <div className="flex-shrink-0">
              <ContentStatusDropdown contentId={contentId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

