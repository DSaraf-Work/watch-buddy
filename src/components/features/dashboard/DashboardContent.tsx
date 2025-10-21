'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
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

interface DashboardContentProps {
  user: User
  profile: Profile | null
}

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(ROUTES.HOME)
    router.refresh()
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
              href={ROUTES.PROFILE}
              className="text-sm text-gray-600 hover:text-primary-700 transition"
            >
              Profile
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Welcome Section */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.display_name || 'there'}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Ready to track your watch history and discover new content?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-600">Watchlist</h3>
              <p className="mt-2 text-3xl font-bold text-primary-700">0</p>
              <p className="mt-1 text-sm text-gray-500">items to watch</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-600">Watched</h3>
              <p className="mt-2 text-3xl font-bold text-primary-700">0</p>
              <p className="mt-1 text-sm text-gray-500">items completed</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-sm font-medium text-gray-600">Watch Time</h3>
              <p className="mt-2 text-3xl font-bold text-primary-700">0h</p>
              <p className="mt-1 text-sm text-gray-500">total hours</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Quick Actions
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/search" className="rounded-lg border-2 border-primary-200 p-6 text-left transition hover:border-primary-400 hover:bg-primary-50 block">
                <h3 className="font-semibold text-gray-900">Search Content</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Find movies and series to add to your watchlist
                </p>
              </Link>
              <button className="rounded-lg border-2 border-primary-200 p-6 text-left transition hover:border-primary-400 hover:bg-primary-50">
                <h3 className="font-semibold text-gray-900">View Watchlist</h3>
                <p className="mt-1 text-sm text-gray-600">
                  See what you&apos;ve planned to watch
                </p>
              </button>
              <button className="rounded-lg border-2 border-primary-200 p-6 text-left transition hover:border-primary-400 hover:bg-primary-50">
                <h3 className="font-semibold text-gray-900">Watch History</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Track what you&apos;ve already watched
                </p>
              </button>
              <button className="rounded-lg border-2 border-primary-200 p-6 text-left transition hover:border-primary-400 hover:bg-primary-50">
                <h3 className="font-semibold text-gray-900">Get Insights</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Analyze your viewing habits
                </p>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Account Information
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt>
                <dd className="font-medium text-gray-900">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Display Name:</dt>
                <dd className="font-medium text-gray-900">
                  {profile?.display_name || 'Not set'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Member Since:</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}

