import { test, expect } from '@playwright/test'
import { loginWithBetterAuthCookies } from '../helpers/auth'

test.describe('Dashboard', () => {
  test('should load live stats for authenticated user', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByText('Watchlist items')).toBeVisible()
    await expect(page.getByText('Watch time')).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Watchlist' })).toBeVisible()
  })
})
