import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBCredits,
  TMDBVideo,
  TMDBSearchResult,
} from './types'

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

if (!TMDB_API_KEY) {
  console.warn('TMDB_API_KEY is not set. Movie search will not work.')
}

class TMDBClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Search for movies and TV shows
  async searchMulti(query: string, page: number = 1): Promise<TMDBSearchResult> {
    return this.fetch<TMDBSearchResult>('/search/multi', {
      query,
      page: page.toString(),
      include_adult: 'false',
    })
  }

  // Get movie details
  async getMovie(id: number): Promise<TMDBMovie> {
    return this.fetch<TMDBMovie>(`/movie/${id}`, {
      append_to_response: 'credits,videos',
    })
  }

  // Get TV show details
  async getTVShow(id: number): Promise<TMDBTVShow> {
    return this.fetch<TMDBTVShow>(`/tv/${id}`, {
      append_to_response: 'credits,videos',
    })
  }

  // Get movie credits (cast and crew)
  async getMovieCredits(id: number): Promise<TMDBCredits> {
    return this.fetch<TMDBCredits>(`/movie/${id}/credits`)
  }

  // Get TV show credits
  async getTVCredits(id: number): Promise<TMDBCredits> {
    return this.fetch<TMDBCredits>(`/tv/${id}/credits`)
  }

  // Get movie videos (trailers, teasers, etc.)
  async getMovieVideos(id: number): Promise<{ results: TMDBVideo[] }> {
    return this.fetch<{ results: TMDBVideo[] }>(`/movie/${id}/videos`)
  }

  // Get TV show videos
  async getTVVideos(id: number): Promise<{ results: TMDBVideo[] }> {
    return this.fetch<{ results: TMDBVideo[] }>(`/tv/${id}/videos`)
  }

  // Get similar movies
  async getSimilarMovies(id: number, page: number = 1): Promise<TMDBSearchResult> {
    return this.fetch<TMDBSearchResult>(`/movie/${id}/similar`, {
      page: page.toString(),
    })
  }

  // Get similar TV shows
  async getSimilarTVShows(id: number, page: number = 1): Promise<TMDBSearchResult> {
    return this.fetch<TMDBSearchResult>(`/tv/${id}/similar`, {
      page: page.toString(),
    })
  }

  // Helper: Get image URL
  getImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }

  // Helper: Get YouTube trailer URL
  getTrailerUrl(videos: TMDBVideo[]): string | null {
    const trailer = videos.find(
      (video) =>
        video.site === 'YouTube' &&
        (video.type === 'Trailer' || video.type === 'Teaser') &&
        video.official
    )
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
  }
}

// Export singleton instance
export const tmdbClient = TMDB_API_KEY ? new TMDBClient(TMDB_API_KEY) : null

// Export helper functions
export function getTMDBImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export function getYouTubeTrailerUrl(videos: TMDBVideo[]): string | null {
  const trailer = videos.find(
    (video) =>
      video.site === 'YouTube' &&
      (video.type === 'Trailer' || video.type === 'Teaser') &&
      video.official
  )
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
}

