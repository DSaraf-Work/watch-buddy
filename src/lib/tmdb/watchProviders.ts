import { tmdbClient } from './client'

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
  provider_url?: string // Direct URL to content on this provider
}

interface WatchProvidersResponse {
  id: number
  results: {
    IN?: {
      link?: string
      flatrate?: WatchProvider[]
      rent?: WatchProvider[]
      buy?: WatchProvider[]
    }
  }
}

/**
 * Get OTT platforms where content is available in India
 */
export async function getIndiaWatchProviders(
  tmdbId: number,
  contentType: 'movie' | 'series'
): Promise<{
  streamingPlatforms: WatchProvider[]
  rentPlatforms: WatchProvider[]
  buyPlatforms: WatchProvider[]
  link?: string
} | null> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not set')
    return null
  }

  try {
    const endpoint = contentType === 'movie' ? 'movie' : 'tv'
    const url = `${TMDB_API_BASE_URL}/${endpoint}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error('Failed to fetch watch providers')
    }

    const data: WatchProvidersResponse = await response.json()

    // Get India (IN) providers
    const indiaProviders = data.results.IN

    if (!indiaProviders) {
      return null
    }

    return {
      streamingPlatforms: indiaProviders.flatrate || [],
      rentPlatforms: indiaProviders.rent || [],
      buyPlatforms: indiaProviders.buy || [],
      link: indiaProviders.link,
    }
  } catch (error) {
    console.error('Error fetching watch providers:', error)
    return null
  }
}

/**
 * Get TMDB image URL for provider logo
 */
export function getProviderLogoUrl(logoPath: string): string {
  return `https://image.tmdb.org/t/p/original${logoPath}`
}

/**
 * Map TMDB provider names to our database platform names
 */
export function mapProviderToPlatform(providerName: string): string {
  const mapping: Record<string, string> = {
    'Netflix': 'Netflix',
    'Amazon Prime Video': 'Amazon Prime Video',
    'Disney Plus': 'Disney+ Hotstar',
    'Disney+ Hotstar': 'Disney+ Hotstar',
    'Apple TV Plus': 'Apple TV+',
    'Apple TV': 'Apple TV+',
    'HBO Max': 'HBO Max',
    'Hulu': 'Hulu',
    'Paramount Plus': 'Paramount+',
    'YouTube': 'YouTube',
    'Sony Liv': 'Sony LIV',
    'SonyLIV': 'Sony LIV',
    'Zee5': 'Zee5',
    'ZEE5': 'Zee5',
    'Voot': 'Voot',
  }

  return mapping[providerName] || providerName
}

