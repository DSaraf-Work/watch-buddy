// TMDB API Types

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number
  genres: TMDBGenre[]
  vote_average: number
  vote_count: number
  imdb_id?: string
}

export interface TMDBTVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  episode_run_time: number[]
  genres: TMDBGenre[]
  vote_average: number
  vote_count: number
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TMDBCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TMDBCredits {
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

export interface TMDBVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface TMDBSearchResult {
  page: number
  results: TMDBSearchItem[]
  total_pages: number
  total_results: number
}

export interface TMDBSearchItem {
  id: number
  media_type: 'movie' | 'tv'
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  genre_ids: number[]
}

export interface ContentData {
  id: string
  tmdb_id: number
  imdb_id: string | null
  title: string
  original_title: string
  content_type: 'movie' | 'series'
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: Date | null
  runtime: number | null
  genres: TMDBGenre[]
  cast_data: TMDBCastMember[]
  crew_data: TMDBCrewMember[]
  ratings: {
    tmdb: number
    imdb?: number
  }
  trailer_url: string | null
}

