import { getCloudflareContext } from '@opennextjs/cloudflare'

const TMDB_CONTENT_TTL = 60 * 60 * 24 // 24 hours
const TMDB_SEARCH_TTL = 60 * 60 // 1 hour

export async function getKv() {
  const { env } = await getCloudflareContext({ async: true })
  return env.KV
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  try {
    const kv = await getKv()
    return kv.get<T>(key, 'json')
  } catch {
    return null
  }
}

export async function kvPutJson(key: string, value: unknown, ttlSeconds: number) {
  try {
    const kv = await getKv()
    await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds })
  } catch (error) {
    console.warn('KV cache write failed:', error)
  }
}

export function contentCacheKey(tmdbId: number, contentType: string) {
  return `tmdb:content:${tmdbId}:${contentType}`
}

export function searchCacheKey(query: string, page: number, type?: string | null) {
  return `tmdb:search:${query}:${page}:${type ?? 'all'}`
}

export function providersCacheKey(tmdbId: number, contentType: string, region = 'IN') {
  return `tmdb:providers:${tmdbId}:${contentType}:${region}`
}

export { TMDB_CONTENT_TTL, TMDB_SEARCH_TTL }
