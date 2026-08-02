import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { ROUTES } from '@/constants/routes'
import { ProfileContent } from '@/components/features/profile/ProfileContent'
import { requireUser } from '@/lib/auth/server'
import { getDb } from '@/lib/db'
import { profiles } from '@/lib/db/schema/profiles'

export const metadata = {
  title: 'Profile - Watch-Buddy',
  description: 'Manage your profile settings',
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

export default async function ProfilePage() {
  const user = await requireUser()
  if (!user) redirect(ROUTES.AUTH.LOGIN)

  const db = await getDb()
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  return <ProfileContent user={user} profile={profile ? serializeProfile(profile) : null} />
}
