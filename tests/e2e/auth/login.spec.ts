import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display Google sign-in', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to Watch-Buddy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
    await expect(page.getByText(/google-only sign-in/i)).toBeVisible()
  })

  test('should disable button while starting Google sign-in', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: 'Continue with Google' })
    await googleButton.click()

    await expect(googleButton).toBeDisabled()
    await expect(page.getByText('Redirecting to Google...')).toBeVisible()
  })
})
