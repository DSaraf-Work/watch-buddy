import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { ProfileContent } from '@/components/features/profile/ProfileContent'

export const metadata = {
  title: 'Profile - Watch-Buddy',
  description: 'Manage your profile settings',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.AUTH.LOGIN)
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <ProfileContent user={user} profile={profile} />
}

