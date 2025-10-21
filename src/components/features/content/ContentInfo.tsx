'use client'

interface ContentInfoProps {
  content: {
    title: string
    original_title: string
    overview: string
    runtime: number | null
    genres: Array<{ id: number; name: string }>
    release_date: string | null
  }
}

export function ContentInfo({ content }: ContentInfoProps) {
  const runtime = content.runtime
    ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
    : null

  const releaseDate = content.release_date
    ? new Date(content.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="space-y-6">
      {/* Original Title */}
      {content.original_title !== content.title && (
        <div>
          <p className="text-sm text-gray-600">Original Title</p>
          <p className="text-lg text-gray-900">{content.original_title}</p>
        </div>
      )}

      {/* Overview */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Overview</h3>
        <p className="text-gray-700 leading-relaxed">{content.overview}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {releaseDate && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Release Date</p>
            <p className="text-gray-900 font-medium">{releaseDate}</p>
          </div>
        )}

        {runtime && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Runtime</p>
            <p className="text-gray-900 font-medium">{runtime}</p>
          </div>
        )}
      </div>

      {/* Genres */}
      {content.genres && content.genres.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Genres</p>
          <div className="flex flex-wrap gap-2">
            {content.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

