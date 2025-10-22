'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ContentHero } from './ContentHero'
import { ContentInfo } from './ContentInfo'
import { CastSection } from './CastSection'
import { PlatformBadges } from './PlatformBadges'
import { TrailerEmbed } from './TrailerEmbed'
import { IndiaWatchProviders } from './IndiaWatchProviders'
import Link from 'next/link'

interface ContentData {
  id: string
  tmdb_id: number
  imdb_id: string | null
  title: string
  original_title: string
  content_type: 'movie' | 'series'
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string | null
  runtime: number | null
  genres: Array<{ id: number; name: string }>
  cast_data: Array<{
    id: number
    name: string
    character: string
    profile_path: string | null
    order: number
  }>
  crew_data: Array<{
    id: number
    name: string
    job: string
    department: string
    profile_path: string | null
  }>
  ratings: {
    tmdb: number
    imdb?: number
  }
  trailer_url: string | null
  availability?: Array<{
    id: string
    platform: {
      id: string
      name: string
      logo_url: string | null
      website_url: string | null
    }
    content_url: string | null
  }>
  indiaWatchProviders?: {
    streamingPlatforms: Array<{
      logo_path: string
      provider_id: number
      provider_name: string
      display_priority: number
    }>
    rentPlatforms: Array<{
      logo_path: string
      provider_id: number
      provider_name: string
      display_priority: number
    }>
    buyPlatforms: Array<{
      logo_path: string
      provider_id: number
      provider_name: string
      display_priority: number
    }>
    link?: string
  } | null
}

interface ContentDetailProps {
  contentId: string
}

export function ContentDetail({ contentId }: ContentDetailProps) {
  const [content, setContent] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/content/${contentId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }

        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError('Failed to load content details')
        console.error('Content fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [contentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Content not found'}</p>
          <a href="/search" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Search
          </a>
        </div>
      </div>
    )
  }

  const backdropUrl = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : null

  const posterUrl = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : '/placeholder-poster.png'

  return (
    <div>
      {/* Hero Section with Backdrop */}
      <ContentHero
        title={content.title}
        backdropUrl={backdropUrl}
        rating={content.ratings.tmdb}
        year={content.release_date ? new Date(content.release_date).getFullYear() : null}
        contentType={content.content_type}
        contentId={contentId}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={posterUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* India Watch Providers */}
              <div className="mt-6">
                <IndiaWatchProviders
                  providers={content.indiaWatchProviders || null}
                  contentTitle={content.title}
                />
              </div>

              {/* OTT Availability */}
              {content.availability && content.availability.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Available On
                  </h3>
                  <PlatformBadges platforms={content.availability} />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            <ContentInfo content={content} />

            {/* Trailer */}
            {content.trailer_url && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Trailer</h3>
                <TrailerEmbed url={content.trailer_url} title={content.title} />
              </div>
            )}

            {/* Cast */}
            {content.cast_data && content.cast_data.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Cast</h3>
                <CastSection cast={content.cast_data.slice(0, 12)} />
              </div>
            )}

            {/* Crew */}
            {content.crew_data && content.crew_data.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Crew</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {content.crew_data.slice(0, 6).map((crew) => (
                    <Link
                      key={crew.id}
                      href={`/person/${crew.id}`}
                      className="text-sm group cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {crew.name}
                      </p>
                      <p className="text-gray-600">{crew.job}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

