import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { content, contentAvailability, ottPlatforms } from '@/lib/db/schema/app'
import type { ContentData } from '@/lib/tmdb/types'
import {
  contentCacheKey,
  kvGetJson,
  kvPutJson,
  TMDB_CONTENT_TTL,
} from '@/lib/cache/kv'
import { getTMDBClient, getYouTubeTrailerUrl } from '@/lib/tmdb/client'
import type { TMDBMovie, TMDBTVShow, TMDBCredits, TMDBVideo } from '@/lib/tmdb/types'

function rowToContentData(row: typeof content.$inferSelect): ContentData {
  return {
    id: row.id,
    tmdb_id: row.tmdbId,
    imdb_id: row.imdbId,
    title: row.title,
    original_title: row.originalTitle || row.title,
    content_type: row.contentType,
    overview: row.overview || '',
    poster_path: row.posterPath,
    backdrop_path: row.backdropPath,
    release_date: row.releaseDate ? new Date(row.releaseDate) : null,
    runtime: row.runtime,
    genres: row.genres || [],
    cast_data: (row.castData as ContentData['cast_data']) || [],
    crew_data: (row.crewData as ContentData['crew_data']) || [],
    ratings: row.ratings || { tmdb: 0 },
    trailer_url: row.trailerUrl,
  }
}

export async function getContentById(
  tmdbId: number,
  contentType: 'movie' | 'series'
): Promise<ContentData | null> {
  const cacheKey = contentCacheKey(tmdbId, contentType)
  const cachedKv = await kvGetJson<ContentData>(cacheKey)
  if (cachedKv?.id) {
    return cachedKv
  }

  const db = await getDb()
  const [existing] = await db
    .select()
    .from(content)
    .where(and(eq(content.tmdbId, tmdbId), eq(content.contentType, contentType)))
    .limit(1)

  if (existing) {
    const cacheAge = Date.now() - new Date(existing.updatedAt).getTime()
    if (cacheAge < TMDB_CONTENT_TTL * 1000) {
      const data = rowToContentData(existing)
      await kvPutJson(cacheKey, data, TMDB_CONTENT_TTL)
      return data
    }
  }

  const tmdbClient = getTMDBClient()
  if (!tmdbClient) {
    throw new Error('TMDB client not initialized. Please set TMDB_API_KEY.')
  }

  try {
    let contentData: ContentData

    if (contentType === 'movie') {
      const movie = await tmdbClient.getMovie(tmdbId)
      const credits = await tmdbClient.getMovieCredits(tmdbId)
      const videos = await tmdbClient.getMovieVideos(tmdbId)
      contentData = transformMovieData(movie, credits, videos.results)
    } else {
      const tvShow = await tmdbClient.getTVShow(tmdbId)
      const credits = await tmdbClient.getTVCredits(tmdbId)
      const videos = await tmdbClient.getTVVideos(tmdbId)
      contentData = transformTVShowData(tvShow, credits, videos.results)
    }

    const id = await upsertContent(contentData)
    if (id) contentData.id = id

    await kvPutJson(cacheKey, contentData, TMDB_CONTENT_TTL)
    return contentData
  } catch (error) {
    console.error('Error fetching content from TMDB:', error)
    return existing ? rowToContentData(existing) : null
  }
}

async function upsertContent(data: ContentData): Promise<string | null> {
  const db = await getDb()
  const id = data.id || crypto.randomUUID()
  const now = new Date()

  await db
    .insert(content)
    .values({
      id,
      tmdbId: data.tmdb_id,
      imdbId: data.imdb_id,
      title: data.title,
      originalTitle: data.original_title,
      contentType: data.content_type,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date ? data.release_date.toISOString().slice(0, 10) : null,
      runtime: data.runtime,
      genres: data.genres,
      castData: data.cast_data,
      crewData: data.crew_data,
      ratings: data.ratings,
      trailerUrl: data.trailer_url,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [content.tmdbId, content.contentType],
      set: {
        imdbId: data.imdb_id,
        title: data.title,
        originalTitle: data.original_title,
        overview: data.overview,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        releaseDate: data.release_date ? data.release_date.toISOString().slice(0, 10) : null,
        runtime: data.runtime,
        genres: data.genres,
        castData: data.cast_data,
        crewData: data.crew_data,
        ratings: data.ratings,
        trailerUrl: data.trailer_url,
        updatedAt: now,
      },
    })

  const [row] = await db
    .select()
    .from(content)
    .where(and(eq(content.tmdbId, data.tmdb_id), eq(content.contentType, data.content_type)))
    .limit(1)

  return row?.id ?? id
}

export async function getContentAvailability(contentId: string) {
  const db = await getDb()
  const rows = await db
    .select({
      id: contentAvailability.id,
      content_id: contentAvailability.contentId,
      platform_id: contentAvailability.platformId,
      available_from: contentAvailability.availableFrom,
      available_until: contentAvailability.availableUntil,
      content_url: contentAvailability.contentUrl,
      platform: ottPlatforms,
    })
    .from(contentAvailability)
    .innerJoin(ottPlatforms, eq(contentAvailability.platformId, ottPlatforms.id))
    .where(eq(contentAvailability.contentId, contentId))

  return rows.map((row) => ({
    id: row.id,
    content_id: row.content_id,
    platform_id: row.platform_id,
    available_from: row.available_from,
    available_until: row.available_until,
    content_url: row.content_url,
    platform: {
      id: row.platform.id,
      name: row.platform.name,
      logo_url: row.platform.logoUrl,
      website_url: row.platform.websiteUrl,
    },
  }))
}

function transformMovieData(
  movie: TMDBMovie,
  credits: TMDBCredits,
  videos: TMDBVideo[]
): ContentData {
  return {
    id: '',
    tmdb_id: movie.id,
    imdb_id: movie.imdb_id || null,
    title: movie.title,
    original_title: movie.original_title,
    content_type: 'movie',
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date ? new Date(movie.release_date) : null,
    runtime: movie.runtime,
    genres: movie.genres,
    cast_data: credits.cast.slice(0, 20),
    crew_data: credits.crew.filter((c) => ['Director', 'Writer', 'Producer'].includes(c.job)),
    ratings: { tmdb: movie.vote_average },
    trailer_url: getYouTubeTrailerUrl(videos),
  }
}

function transformTVShowData(
  tvShow: TMDBTVShow,
  credits: TMDBCredits,
  videos: TMDBVideo[]
): ContentData {
  return {
    id: '',
    tmdb_id: tvShow.id,
    imdb_id: null,
    title: tvShow.name,
    original_title: tvShow.original_name,
    content_type: 'series',
    overview: tvShow.overview,
    poster_path: tvShow.poster_path,
    backdrop_path: tvShow.backdrop_path,
    release_date: tvShow.first_air_date ? new Date(tvShow.first_air_date) : null,
    runtime: tvShow.episode_run_time?.[0] || null,
    genres: tvShow.genres,
    cast_data: credits.cast.slice(0, 20),
    crew_data: credits.crew.filter((c) =>
      ['Director', 'Writer', 'Producer', 'Creator'].includes(c.job)
    ),
    ratings: { tmdb: tvShow.vote_average },
    trailer_url: getYouTubeTrailerUrl(videos),
  }
}
