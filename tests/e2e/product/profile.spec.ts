import { test, expect } from '@playwright/test'
import { loginWithBetterAuthCookies } from '../helpers/auth'

test.describe('Profile', () => {
  test('should show profile settings and avatar upload control', async ({ context, page }) => {
    await loginWithBetterAuthCookies(context, page)

    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Upload avatar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()
  })
})
