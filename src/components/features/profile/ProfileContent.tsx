'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'
import Image from 'next/image'
import type { AppProfile, AppUser } from '@/types/user'
import { fetchJson } from '@/lib/utils/fetch-json'

interface ProfileContentProps {
  user: AppUser
  profile: AppProfile | null
}

export function ProfileContent({ user, profile }: ProfileContentProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  const handleLogout = async () => {
    await authClient.signOut()
    router.push(ROUTES.HOME)
    router.refresh()
  }

  const handleSave = async () => {
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      await fetchJson('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      })

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = (await response.json()) as { profile: { avatar_url: string | null } }
      setAvatarUrl(data.profile.avatar_url || '')
      setSuccess(true)
      router.refresh()
    } catch {
      setError('Failed to upload avatar')
    } finally {
      setAvatarLoading(false)
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
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl text-gray-500">
                      {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={avatarLoading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload avatar
                  </Button>
                </div>
              </div>

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
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
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

