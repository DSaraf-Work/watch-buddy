import { getCloudflareContext } from '@opennextjs/cloudflare'

const ALLOWED_PREFIXES = ['avatars/'] as const

function isAllowedAssetKey(key: string): boolean {
  const decoded = decodeURIComponent(key)
  if (decoded.includes('..')) return false
  return ALLOWED_PREFIXES.some((prefix) => decoded.startsWith(prefix))
}

export async function getR2Object(key: string) {
  const { env } = await getCloudflareContext({ async: true })
  return env.R2.get(key)
}

export async function getAssetResponse(key: string): Promise<Response> {
  if (!isAllowedAssetKey(key)) {
    return new Response('Not found', { status: 404 })
  }

  const object = await getR2Object(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, {
    status: 200,
    headers,
  })
}
