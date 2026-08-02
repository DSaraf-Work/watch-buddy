import { test, expect } from '@playwright/test'
import { loginWithBetterAuthCookies } from '../helpers/auth'

test.describe('Insights', () => {
  test('should load insights and recommendations pages', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await page.goto('/insights')
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /compute insights|refresh insights/i })
    ).toBeVisible()

    await page.goto('/recommendations')
    await expect(page.getByRole('heading', { name: 'Recommendations' })).toBeVisible()
  })
})
