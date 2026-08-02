'use client'

import { useAuthContext } from '@/lib/auth/AuthProvider'

export function useAuth() {
  const { user, session, loading, signOut } = useAuthContext()

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signOut,
  }
}
