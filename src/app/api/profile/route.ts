import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { profiles } from '@/lib/db/schema/profiles'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

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

export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const db = await getDb()
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ profile: serializeProfile(profile) })
}

export async function PATCH(request: Request) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const body = (await request.json()) as {
    display_name?: string | null
    avatar_url?: string | null
  }

  const db = await getDb()
  await db
    .update(profiles)
    .set({
      displayName: body.display_name,
      avatarUrl: body.avatar_url,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id))

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ profile: serializeProfile(profile) })
}
