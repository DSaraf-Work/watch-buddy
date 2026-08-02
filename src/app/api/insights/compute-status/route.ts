import { NextResponse } from 'next/server'
import { getInsightsComputeJob } from '@/lib/insights/job'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const job = await getInsightsComputeJob(user.id)
  return NextResponse.json({ job })
}
