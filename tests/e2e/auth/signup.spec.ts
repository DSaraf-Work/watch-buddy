import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('should display signup form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Get Started' })).toBeVisible()
    await expect(page.getByLabel('Display Name')).toBeVisible()
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('12345')
    await page.getByLabel('Confirm Password').fill('12345')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
  })

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('password456')
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /sign in/i })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  test('should disable form during submission', async ({ page }) => {
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('password123')
    
    const submitButton = page.getByRole('button', { name: 'Create Account' })
    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.getByLabel('Email', { exact: true }).fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('password123')
    
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show loading text
    await expect(page.getByText('Loading...')).toBeVisible()
  })
})

