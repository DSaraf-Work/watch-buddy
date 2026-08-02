import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { initAuth } from '@/auth'

export async function getSession() {
  const auth = await initAuth()
  return auth.api.getSession({ headers: await headers() })
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }
  return session.user
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
