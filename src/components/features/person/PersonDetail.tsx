'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface PersonDetailProps {
  personId: number
}

interface PersonData {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
}

interface Credit {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv'
  character?: string
  job?: string
  department?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  vote_count: number
  popularity: number
}

export function PersonDetail({ personId }: PersonDetailProps) {
  const [person, setPerson] = useState<PersonData | null>(null)
  const [castCredits, setCastCredits] = useState<Credit[]>([])
  const [crewCredits, setCrewCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast')
  const itemsPerPage = 20

  useEffect(() => {
    async function fetchPerson() {
      try {
        const response = await fetch(`/api/person/${personId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch person details')
        }

        const data = await response.json()
        setPerson(data.person)
        setCastCredits(data.credits.cast || [])
        setCrewCredits(data.credits.crew || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPerson()
  }, [personId])

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (error || !person) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || 'Person not found'}</p>
        <Link href="/search" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Search
        </Link>
      </div>
    )
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : '/placeholder-avatar.png'

  const activeCredits = activeTab === 'cast' ? castCredits : crewCredits
  const totalPages = Math.ceil(activeCredits.length / itemsPerPage)
  const paginatedCredits = activeCredits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/search" className="text-blue-600 hover:underline">
            ← Back to Search
          </Link>
        </div>
      </header>

      {/* Person Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={profileUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {person.known_for_department && (
                  <p>
                    <span className="font-semibold">Known For:</span>{' '}
                    {person.known_for_department}
                  </p>
                )}
                {person.birthday && (
                  <p>
                    <span className="font-semibold">Born:</span>{' '}
                    {new Date(person.birthday).toLocaleDateString()}
                  </p>
                )}
                {person.deathday && (
                  <p>
                    <span className="font-semibold">Died:</span>{' '}
                    {new Date(person.deathday).toLocaleDateString()}
                  </p>
                )}
                {person.place_of_birth && (
                  <p>
                    <span className="font-semibold">Place of Birth:</span>{' '}
                    {person.place_of_birth}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{person.name}</h1>
            </div>

            {person.biography && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Biography</h2>
                <p className="text-gray-700 whitespace-pre-line">{person.biography}</p>
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="border-b border-gray-200 mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setActiveTab('cast')
                      setCurrentPage(1)
                    }}
                    className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'cast'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Acting ({castCredits.length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('crew')
                      setCurrentPage(1)
                    }}
                    className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'crew'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Crew ({crewCredits.length})
                  </button>
                </div>
              </div>

              {/* Credits Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginatedCredits.map((credit) => {
                  const title = credit.title || credit.name || 'Unknown'
                  const year = credit.release_date || credit.first_air_date
                  const contentId = `${credit.id}-${credit.media_type === 'tv' ? 'series' : 'movie'}`
                  const posterUrl = credit.poster_path
                    ? `https://image.tmdb.org/t/p/w500${credit.poster_path}`
                    : '/placeholder-poster.png'

                  return (
                    <Link
                      key={`${credit.id}-${credit.character || credit.job}`}
                      href={`/content/${contentId}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
                        <Image
                          src={posterUrl}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                        {credit.vote_average > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                            ⭐ {credit.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600">
                          {title}
                        </h3>
                        {year && (
                          <p className="text-xs text-gray-600">
                            {new Date(year).getFullYear()}
                          </p>
                        )}
                        {activeTab === 'cast' && credit.character && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            as {credit.character}
                          </p>
                        )}
                        {activeTab === 'crew' && credit.job && (
                          <p className="text-xs text-gray-500">{credit.job}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

