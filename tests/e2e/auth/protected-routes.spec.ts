import { test, expect } from '@playwright/test'

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Should have redirectTo parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('redirectTo')).toBe('/dashboard')
  })

  test('should redirect to login when accessing profile without auth', async ({ page }) => {
    await page.goto('/profile')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect to login when accessing search without auth', async ({ page }) => {
    await page.goto('/search')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect to login when accessing watchlist without auth', async ({ page }) => {
    await page.goto('/watchlist')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect to login when accessing history without auth', async ({ page }) => {
    await page.goto('/history')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect to login when accessing insights without auth', async ({ page }) => {
    await page.goto('/insights')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should allow access to public pages', async ({ page }) => {
    // Home page should be accessible
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Watch-Buddy')).toBeVisible()

    // Auth pages should be accessible
    await page.goto('/auth/login')
    await expect(page).toHaveURL('/auth/login')
    
    await page.goto('/auth/signup')
    await expect(page).toHaveURL('/auth/signup')
    
    await page.goto('/auth/forgot-password')
    await expect(page).toHaveURL('/auth/forgot-password')
  })
})

