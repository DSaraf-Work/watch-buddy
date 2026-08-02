import { test, expect } from '@playwright/test'
import { loginWithBetterAuthCookies } from '../helpers/auth'

test.describe('History', () => {
  test('should show history page and stats navigation', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await page.goto('/history')
    await expect(page.getByRole('heading', { name: 'Watch History' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Log a watch' })).toBeVisible()

    await Promise.all([
      page.waitForURL('/history/stats'),
      page.locator('a[href="/history/stats"]').click(),
    ])

    await expect(page.getByRole('heading', { name: 'Watch Statistics' })).toBeVisible()
  })
})
