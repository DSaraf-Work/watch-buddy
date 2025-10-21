import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    await page.goto('/')

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Watch-Buddy' })).toBeVisible()

    // Check for tagline
    await expect(page.getByText('Your Personal OTT Companion')).toBeVisible()

    // Check for CTA buttons
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()

    // Check for feature cards
    await expect(page.getByText('Search & Discover')).toBeVisible()
    await expect(page.getByText('Track Your Watchlist')).toBeVisible()
    await expect(page.getByText('Watch History')).toBeVisible()
  })

  test('should navigate to signup page when clicking Get Started', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: 'Get Started' }).click()
    
    await expect(page).toHaveURL('/auth/signup')
  })

  test('should navigate to login page when clicking Sign In', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: 'Sign In' }).click()
    
    await expect(page).toHaveURL('/auth/login')
  })
})

