import { test, expect } from '@playwright/test'
import {
  loginWithBetterAuthCookies,
  expectNoBetterAuthSessionCookie,
} from '../helpers/auth'
import { BETTER_AUTH_SESSION_COOKIE } from '../../../src/lib/auth/constants'

test.describe('Authenticated Session (Better Auth cookies)', () => {
  test('should set better-auth session cookie after email sign-in', async ({ context }) => {
    await loginWithBetterAuthCookies(context)

    const cookies = await context.cookies()
    const sessionCookie = cookies.find((cookie) => cookie.name === BETTER_AUTH_SESSION_COOKIE)

    expect(sessionCookie).toMatchObject({
      name: BETTER_AUTH_SESSION_COOKIE,
      httpOnly: true,
      path: '/',
    })
  })

  test('should access protected routes with session cookie', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

    await page.goto('/watchlist')
    await expect(page).toHaveURL('/watchlist')
    await expect(page.getByRole('heading', { name: 'Watchlists' })).toBeVisible()

    await page.goto('/history')
    await expect(page).toHaveURL('/history')
    await expect(page.getByRole('heading', { name: 'Watch History' })).toBeVisible()
  })

  test('should redirect authenticated users away from login', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context)

    await page.goto('/auth/login')
    await expect(page).toHaveURL('/dashboard')
  })
})

test.describe('Unauthenticated Session', () => {
  test('should not set better-auth session cookie before login', async ({ context, page }) => {
    await page.goto('/auth/login')
    await expectNoBetterAuthSessionCookie(context)
  })
})
