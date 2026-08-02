import { test, expect } from '@playwright/test'
import { loginWithBetterAuthCookies } from '../helpers/auth'

test.describe('Watchlist', () => {
  test('should create a watchlist and open detail page', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await page.goto('/watchlist')
    await expect(page.getByRole('heading', { name: 'Watchlists' })).toBeVisible()

    const name = `E2E List ${Date.now()}`
    await page.getByLabel('Name').fill(name)
    await page.getByRole('button', { name: 'Create Watchlist' }).click()

    const watchlistLink = page.getByRole('link', { name })
    await expect(watchlistLink).toBeVisible({ timeout: 10000 })

    await Promise.all([
      page.waitForURL(/\/watchlist\/[0-9a-f-]+$/i),
      watchlistLink.click(),
    ])

    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Items (0)' })).toBeVisible()
  })
})
