'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface ProfileContentProps {
  user: User
  profile: Profile | null
}

export function ProfileContent({ user, profile }: ProfileContentProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(ROUTES.HOME)
    router.refresh()
  }

  const handleSave = async () => {
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '')
    setIsEditing(false)
    setError('')
    setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="border-b border-primary-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-700">
              Watch-Buddy
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href={ROUTES.DASHBOARD}
              className="text-sm text-gray-600 hover:text-primary-700 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-primary-700 transition"
            >
              Settings
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Form */}
          <div className="rounded-lg bg-white p-8 shadow-lg">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800">
                  Profile updated successfully!
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500"
                />
                <p className="mt-1.5 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Display Name */}
              <div>
                {isEditing ? (
                  <Input
                    label="Display Name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    disabled={isLoading}
                  />
                ) : (
                  <>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <p className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900">
                      {profile?.display_name || 'Not set'}
                    </p>
                  </>
                )}
              </div>

              {/* Member Since */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <p className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      isLoading={isLoading}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} fullWidth>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 rounded-lg border-2 border-red-200 bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            <p className="mt-2 text-sm text-red-700">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="danger" size="sm" className="mt-4">
              Delete Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

