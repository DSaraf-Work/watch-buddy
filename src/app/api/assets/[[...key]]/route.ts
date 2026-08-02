import { getAssetResponse } from '@/lib/storage/assets'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key?: string[] }> }
) {
  const { key } = await params

  if (!key?.length) {
    return new Response('Not found', { status: 404 })
  }

  const objectKey = key.map((segment) => decodeURIComponent(segment)).join('/')
  return getAssetResponse(objectKey)
}
