import { test, expect } from '@playwright/test'
import { expectNoBetterAuthSessionCookie } from '../helpers/auth'
import { BETTER_AUTH_SESSION_COOKIE } from '../../../src/lib/auth/constants'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display Google sign-in', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to Watch-Buddy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
    await expect(page.getByText(/google-only sign-in/i)).toBeVisible()
  })

  test('should not set better-auth session cookie before sign-in', async ({ context }) => {
    await expectNoBetterAuthSessionCookie(context)

    const cookies = await context.cookies()
    expect(cookies.some((cookie) => cookie.name === BETTER_AUTH_SESSION_COOKIE)).toBe(false)
  })

  test('should enter loading state while Google sign-in request is pending', async ({ page }) => {
    await page.route('**/api/auth/sign-in/social', async () => {
      await new Promise(() => {})
    })

    const googleButton = page.getByRole('button', { name: /continue with google|loading/i })
    await googleButton.click()

    await expect(page.getByRole('button', { name: 'Loading...' })).toBeDisabled()
  })
})
