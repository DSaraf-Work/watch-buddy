import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getContentById } from '@/lib/tmdb/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse ID and type from params
    // Format: {tmdbId}-{type} e.g., "550-movie" or "1399-series"
    const [tmdbIdStr, contentType] = params.id.split('-')
    const tmdbId = parseInt(tmdbIdStr)

    if (isNaN(tmdbId) || !contentType || !['movie', 'series'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content ID format. Expected: {tmdbId}-{movie|series}' },
        { status: 400 }
      )
    }

    // Get content from cache or TMDB
    const content = await getContentById(tmdbId, contentType as 'movie' | 'series')

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Get OTT availability
    const { data: availability } = await supabase
      .from('content_availability')
      .select(`
        *,
        platform:ott_platforms(*)
      `)
      .eq('content_id', content.id)

    return NextResponse.json({
      ...content,
      availability: availability || [],
    })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content details' },
      { status: 500 }
    )
  }
}

