'use client'

import { createContext, useContext } from 'react'
import { authClient } from '@/lib/auth/client'

type AuthContextType = {
  user: ReturnType<typeof authClient.useSession>['data'] extends infer D
    ? D extends { user: infer U }
      ? U | null
      : null
    : null
  session: ReturnType<typeof authClient.useSession>['data']
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session: session ?? null,
        loading: isPending,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
