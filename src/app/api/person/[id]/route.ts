import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personId = parseInt(params.id)

    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 })
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
    }

    // Fetch person details
    const personResponse = await fetch(
      `${TMDB_API_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!personResponse.ok) {
      throw new Error('Failed to fetch person details')
    }

    const personData = await personResponse.json()

    // Fetch combined credits (movies and TV shows)
    const creditsResponse = await fetch(
      `${TMDB_API_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 86400 } }
    )

    if (!creditsResponse.ok) {
      throw new Error('Failed to fetch credits')
    }

    const creditsData = await creditsResponse.json()

    // Sort credits by popularity and vote_average
    const sortedCast = creditsData.cast
      ?.filter((item: any) => item.vote_count > 10) // Filter out items with few votes
      .sort((a: any, b: any) => {
        // Sort by popularity first, then by vote average
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity
        }
        return (b.vote_average || 0) - (a.vote_average || 0)
      }) || []

    const sortedCrew = creditsData.crew
      ?.filter((item: any) => item.vote_count > 10)
      .sort((a: any, b: any) => {
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity
        }
        return (b.vote_average || 0) - (a.vote_average || 0)
      }) || []

    return NextResponse.json({
      person: personData,
      credits: {
        cast: sortedCast,
        crew: sortedCrew,
      },
    })
  } catch (error) {
    console.error('Person API error:', error)
    return NextResponse.json({ error: 'Failed to fetch person details' }, { status: 500 })
  }
}

