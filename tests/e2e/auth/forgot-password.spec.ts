import { test, expect } from '@playwright/test'

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
  })

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Forgot Password?' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible()
  })

  test('should have link back to login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /back to login/i })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  test('should require email', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Send Reset Link' })
    await submitButton.click()

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('required')
  })

  test('should disable form during submission', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    
    const submitButton = page.getByRole('button', { name: 'Send Reset Link' })
    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    
    await page.getByRole('button', { name: 'Send Reset Link' }).click()

    // Should show loading text
    await expect(page.getByText('Loading...')).toBeVisible()
  })

  test('should have helper text', async ({ page }) => {
    await expect(page.getByText(/we'll send you a password reset link/i)).toBeVisible()
  })
})

