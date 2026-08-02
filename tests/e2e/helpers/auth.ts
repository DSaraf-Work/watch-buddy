import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test'
import {
  BETTER_AUTH_SESSION_COOKIE,
  E2E_TEST_USER,
} from '../../../src/lib/auth/constants'

async function ensureSignedIn(request: APIRequestContext) {
  const signInResponse = await request.post('/api/auth/sign-in/email', {
    data: {
      email: E2E_TEST_USER.email,
      password: E2E_TEST_USER.password,
    },
  })

  if (signInResponse.ok()) {
    return signInResponse
  }

  const signUpResponse = await request.post('/api/auth/sign-up/email', {
    data: {
      email: E2E_TEST_USER.email,
      password: E2E_TEST_USER.password,
      name: E2E_TEST_USER.name,
    },
  })

  if (!signUpResponse.ok() && signUpResponse.status() !== 422) {
    const body = await signUpResponse.text()
    throw new Error(`Failed to create E2E test user (${signUpResponse.status()}): ${body}`)
  }

  const retrySignIn = await request.post('/api/auth/sign-in/email', {
    data: {
      email: E2E_TEST_USER.email,
      password: E2E_TEST_USER.password,
    },
  })

  expect(retrySignIn.ok()).toBeTruthy()
  return retrySignIn
}

export async function loginWithBetterAuthCookies(
  context: BrowserContext,
  page?: Page
) {
  const signInResponse = await ensureSignedIn(context.request)
  expect(signInResponse.ok()).toBeTruthy()

  const cookies = await context.cookies()
  const sessionCookie = cookies.find((cookie) => cookie.name === BETTER_AUTH_SESSION_COOKIE)

  expect(sessionCookie).toBeDefined()
  expect(sessionCookie?.httpOnly).toBe(true)

  if (page) {
    await page.goto('/dashboard')
  }

  return sessionCookie
}

export async function expectNoBetterAuthSessionCookie(context: BrowserContext) {
  const cookies = await context.cookies()
  const sessionCookie = cookies.find((cookie) => cookie.name === BETTER_AUTH_SESSION_COOKIE)
  expect(sessionCookie).toBeUndefined()
}
