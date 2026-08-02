'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_not_configured: 'Google sign-in is not configured for this environment yet.',
  access_denied: 'Google sign-in was cancelled. Please try again.',
}

function LoginFormContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ROUTES.DASHBOARD
  const routeErrorCode = searchParams.get('error') || ''

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const routeError = AUTH_ERROR_MESSAGES[routeErrorCode] || ''

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      })

      if (signInError) {
        setError(signInError.message || 'Failed to start Google sign-in')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Google sign-in error:', err)
      setIsLoading(false)
    }
  }

  const visibleError = error || routeError

  return (
    <div className="space-y-4">
      {visibleError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{visibleError}</p>
        </div>
      )}

      <Button
        type="button"
        fullWidth
        isLoading={isLoading}
        onClick={handleGoogleSignIn}
      >
        {isLoading ? 'Redirecting to Google...' : 'Continue with Google'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Watch-Buddy uses Google-only sign-in. New accounts are created automatically on first login.
      </p>
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
