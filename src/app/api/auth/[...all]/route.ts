import { initAuth } from '@/auth'

export async function GET(request: Request) {
  const auth = await initAuth()
  return auth.handler(request)
}

export async function POST(request: Request) {
  const auth = await initAuth()
  return auth.handler(request)
}
