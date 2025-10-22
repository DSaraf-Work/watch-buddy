import { Suspense } from 'react'
import { StatusManagement } from '@/components/features/admin/StatusManagement'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Settings - Watch Buddy',
  description: 'Manage your Watch Buddy settings and preferences',
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Customize your Watch Buddy experience
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            <Suspense fallback={<SettingsSkeleton />}>
              <StatusManagement />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

