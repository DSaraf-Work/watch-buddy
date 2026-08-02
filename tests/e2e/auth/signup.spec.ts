import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test('should redirect signup to login', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page).toHaveURL('/auth/login')
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  })
})
