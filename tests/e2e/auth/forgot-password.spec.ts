import { test, expect } from '@playwright/test'

test.describe('Forgot Password Flow', () => {
  test('should redirect forgot password to login', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page).toHaveURL('/auth/login')
  })
})
