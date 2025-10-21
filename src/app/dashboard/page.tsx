import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { DashboardContent } from '@/components/features/dashboard/DashboardContent'

export const metadata = {
  title: 'Dashboard - Watch-Buddy',
  description: 'Your personal watch tracking dashboard',
}

export default async function DashboardPage() {
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

  return <DashboardContent user={user} profile={profile} />
}

