import { test, expect } from '@playwright/test'

test.describe('Reset Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/reset-password')
  })

  test('should display reset password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()
    await expect(page.getByLabel('New Password')).toBeVisible()
    await expect(page.getByLabel('Confirm New Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible()
  })

  test('should require both password fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Reset Password' })
    await submitButton.click()

    // HTML5 validation should prevent submission
    const newPasswordInput = page.getByLabel('New Password')
    await expect(newPasswordInput).toHaveAttribute('required')
    
    const confirmPasswordInput = page.getByLabel('Confirm New Password')
    await expect(confirmPasswordInput).toHaveAttribute('required')
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('New Password').fill('12345')
    await page.getByLabel('Confirm New Password').fill('12345')
    await page.getByRole('button', { name: 'Reset Password' }).click()

    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
  })

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel('New Password').fill('password123')
    await page.getByLabel('Confirm New Password').fill('password456')
    await page.getByRole('button', { name: 'Reset Password' }).click()

    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('should disable form during submission', async ({ page }) => {
    await page.getByLabel('New Password').fill('password123')
    await page.getByLabel('Confirm New Password').fill('password123')
    
    const submitButton = page.getByRole('button', { name: 'Reset Password' })
    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.getByLabel('New Password').fill('password123')
    await page.getByLabel('Confirm New Password').fill('password123')
    
    await page.getByRole('button', { name: 'Reset Password' }).click()

    // Should show loading text
    await expect(page.getByText('Loading...')).toBeVisible()
  })

  test('should have helper text for password requirements', async ({ page }) => {
    await expect(page.getByText(/minimum 6 characters/i)).toBeVisible()
  })
})

