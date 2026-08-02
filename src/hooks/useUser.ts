'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { fetchJson } from '@/lib/utils/fetch-json'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function useUser() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const data = await fetchJson<{ profile: Profile }>('/api/profile')
        setProfile(data.profile)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const data = await fetchJson<{ profile: Profile }>('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      setProfile(data.profile)
      return { data: data.profile, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      return { data: null, error: errorMessage }
    }
  }

  return {
    user,
    profile,
    loading: authLoading || loading,
    error,
    updateProfile,
  }
}
