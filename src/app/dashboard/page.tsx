import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { ROUTES } from '@/constants/routes'
import { DashboardContent } from '@/components/features/dashboard/DashboardContent'
import { requireUser } from '@/lib/auth/server'
import { getDb } from '@/lib/db'
import { profiles } from '@/lib/db/schema/profiles'

export const metadata = {
  title: 'Dashboard - Watch-Buddy',
  description: 'Your personal watch tracking dashboard',
}

function serializeProfile(profile: typeof profiles.$inferSelect) {
  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    created_at: new Date(profile.createdAt).toISOString(),
    updated_at: new Date(profile.updatedAt).toISOString(),
  }
}

export default async function DashboardPage() {
  const user = await requireUser()
  if (!user) redirect(ROUTES.AUTH.LOGIN)

  const db = await getDb()
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  return <DashboardContent user={user} profile={profile ? serializeProfile(profile) : null} />
}
