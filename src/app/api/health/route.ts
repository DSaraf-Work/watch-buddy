import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  const payload: Record<string, unknown> = {
    status: 'ok',
    platform: 'cloudflare',
    timestamp: new Date().toISOString(),
  }

  try {
    const { env } = await getCloudflareContext({ async: true })
    const result = await env.DATABASE.prepare('SELECT 1 as ok').first<{ ok: number }>()
    payload.database = result?.ok === 1 ? 'connected' : 'error'
    payload.kv = env.KV ? 'bound' : 'missing'
    payload.r2 = env.R2 ? 'bound' : 'missing'
  } catch {
    payload.database = 'unavailable'
    payload.note = 'Cloudflare bindings not available — use wrangler preview or next dev with initOpenNextCloudflareForDev'
  }

  return NextResponse.json(payload)
}
