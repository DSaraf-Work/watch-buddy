import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/constants/routes'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/search',
  '/watchlist',
  '/history',
  '/insights',
  '/profile',
  '/admin',
]

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = pathname.startsWith('/auth/')

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const sessionResponse = await fetch(
    new URL('/api/auth/get-session', request.nextUrl.origin),
    {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  )

  const session = sessionResponse.ok
    ? ((await sessionResponse.json()) as { user?: { id: string } } | null)
    : null
  const isAuthenticated = !!session?.user

  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.AUTH.LOGIN
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.DASHBOARD
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
