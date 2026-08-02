import { test, expect } from '@playwright/test'

test.describe('Reset Password Flow', () => {
  test('should redirect reset password to login', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page).toHaveURL('/auth/login')
  })
})
