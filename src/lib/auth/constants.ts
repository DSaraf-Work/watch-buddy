export const BETTER_AUTH_COOKIE_PREFIX = 'better-auth'
export const BETTER_AUTH_SESSION_COOKIE = `${BETTER_AUTH_COOKIE_PREFIX}.session_token`

export const E2E_TEST_USER = {
  email: 'e2e-test@watch-buddy.local',
  password: 'E2eTestPassword123',
  name: 'E2E Test User',
} as const

export function isE2eTestMode(): boolean {
  return process.env.E2E_TEST_MODE === 'true'
}
