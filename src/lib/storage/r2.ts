import { getCloudflareContext } from '@opennextjs/cloudflare'

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
  const { env } = await getCloudflareContext({ async: true })
  const object = await env.R2.head(key)
  if (!object) return null
  // Serve via a future /api/assets route or public R2 custom domain
  return `/api/assets/${encodeURIComponent(key)}`
}
