import { NextRequest, NextResponse } from 'next/server'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'
import type { RouteParams } from '@/lib/utils/route-params'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(
  request: NextRequest,
  { params }: RouteParams<{ id: string }>
) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const personId = parseInt(id)

    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 })
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
    }

    const personResponse = await fetch(
      `${TMDB_API_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 86400 } }
    )

    if (!personResponse.ok) {
      throw new Error('Failed to fetch person details')
    }

    const personData = await personResponse.json()

    const creditsResponse = await fetch(
      `${TMDB_API_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 86400 } }
    )

    if (!creditsResponse.ok) {
      throw new Error('Failed to fetch credits')
    }

    const creditsData = (await creditsResponse.json()) as {
      cast?: Array<{ vote_count: number; popularity: number; vote_average?: number }>
      crew?: Array<{ vote_count: number; popularity: number; vote_average?: number }>
    }

    const sortedCast =
      creditsData.cast
        ?.filter((item) => item.vote_count > 10)
        .sort((a, b) => {
          if (b.popularity !== a.popularity) return b.popularity - a.popularity
          return (b.vote_average || 0) - (a.vote_average || 0)
        }) || []

    const sortedCrew =
      creditsData.crew
        ?.filter((item) => item.vote_count > 10)
        .sort((a, b) => {
          if (b.popularity !== a.popularity) return b.popularity - a.popularity
          return (b.vote_average || 0) - (a.vote_average || 0)
        }) || []

    return NextResponse.json({
      person: personData,
      credits: { cast: sortedCast, crew: sortedCrew },
    })
  } catch (error) {
    console.error('Person API error:', error)
    return NextResponse.json({ error: 'Failed to fetch person details' }, { status: 500 })
  }
}
