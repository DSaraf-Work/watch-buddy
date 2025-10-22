import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTMDBClient } from '@/lib/tmdb/client'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const type = searchParams.get('type') // 'movie', 'series', or null for all

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Get TMDB client instance
    const tmdbClient = getTMDBClient()
    if (!tmdbClient) {
      console.error('TMDB client is null. TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'SET' : 'NOT SET')
      return NextResponse.json(
        { error: 'TMDB API is not configured. Please set TMDB_API_KEY.' },
        { status: 500 }
      )
    }

    // Search TMDB
    console.log('Searching TMDB for:', query)
    const results = await tmdbClient.searchMulti(query, page)
    console.log('TMDB search results:', results.results?.length || 0, 'items')

    // Filter by type if specified
    let filteredResults = results.results
    if (type === 'movie') {
      filteredResults = results.results.filter((item) => item.media_type === 'movie')
    } else if (type === 'series') {
      filteredResults = results.results.filter((item) => item.media_type === 'tv')
    }

    // Transform results to our format
    const transformedResults = filteredResults
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item) => ({
        id: item.id,
        tmdb_id: item.id,
        title: item.media_type === 'movie' ? item.title : item.name,
        original_title: item.media_type === 'movie' ? item.original_title : item.original_name,
        content_type: item.media_type === 'movie' ? 'movie' : 'series',
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.media_type === 'movie' ? item.release_date : item.first_air_date,
        vote_average: item.vote_average,
        genre_ids: item.genre_ids,
      }))

    return NextResponse.json({
      results: transformedResults,
      page: results.page,
      total_pages: results.total_pages,
      total_results: filteredResults.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Failed to search content', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

