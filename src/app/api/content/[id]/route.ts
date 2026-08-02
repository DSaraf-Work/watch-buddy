import { NextRequest, NextResponse } from 'next/server'
import { getContentById, getContentAvailability } from '@/lib/tmdb/cache'
import { getIndiaWatchProviders } from '@/lib/tmdb/watchProviders'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'
import type { RouteParams } from '@/lib/utils/route-params'

export async function GET(
  request: NextRequest,
  { params }: RouteParams<{ id: string }>
) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const [tmdbIdStr, contentType] = id.split('-')
    const tmdbId = parseInt(tmdbIdStr)

    if (isNaN(tmdbId) || !contentType || !['movie', 'series'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content ID format. Expected: {tmdbId}-{movie|series}' },
        { status: 400 }
      )
    }

    const contentData = await getContentById(tmdbId, contentType as 'movie' | 'series')

    if (!contentData) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const availability = contentData.id
      ? await getContentAvailability(contentData.id)
      : []

    const indiaProviders = await getIndiaWatchProviders(
      tmdbId,
      contentType as 'movie' | 'series'
    )

    return NextResponse.json({
      ...contentData,
      release_date: contentData.release_date?.toISOString() ?? null,
      availability,
      indiaWatchProviders: indiaProviders,
    })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Failed to fetch content details' }, { status: 500 })
  }
}
