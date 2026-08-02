import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getR2Object } from '@/lib/storage/assets'

export async function uploadAvatar(
  userId: string,
  file: ArrayBuffer,
  contentType: string
): Promise<string> {
  const { env } = await getCloudflareContext({ async: true })
  const key = `avatars/${userId}/${crypto.randomUUID()}`
  await env.R2.put(key, file, {
    httpMetadata: { contentType },
  })
  return key
}

export async function getAvatarUrl(key: string): Promise<string | null> {
  const object = await getR2Object(key)
  if (!object) return null
  return `/api/assets/${key.split('/').map(encodeURIComponent).join('/')}`
}
