import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should have link to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /sign up/i })
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveAttribute('href', '/auth/signup')
  })

  test('should have link to forgot password page', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot password/i })
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password')
  })

  test('should require email and password', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    await submitButton.click()

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('required')
    
    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should disable form during submission', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    
    const submitButton = page.getByRole('button', { name: 'Sign In' })
    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show loading text
    await expect(page.getByText('Loading...')).toBeVisible()
  })

  test('should have proper autocomplete attributes', async ({ page }) => {
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('autocomplete', 'email')
    await expect(emailInput).toHaveAttribute('type', 'email')

    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

