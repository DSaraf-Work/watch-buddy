import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { profiles } from '@/lib/db/schema/profiles'
import { uploadAvatar } from '@/lib/storage/r2'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return unauthorizedResponse()

  const formData = await request.formData()
  const file = formData.get('avatar')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'avatar file is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: 'Image must be 2MB or smaller' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const key = await uploadAvatar(user.id, buffer, file.type)
  const avatarUrl = `/api/assets/${key.split('/').map(encodeURIComponent).join('/')}`

  const db = await getDb()
  await db
    .update(profiles)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(profiles.id, user.id))

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)

  return NextResponse.json({
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          display_name: profile.displayName,
          avatar_url: profile.avatarUrl,
          created_at: new Date(profile.createdAt).toISOString(),
          updated_at: new Date(profile.updatedAt).toISOString(),
        }
      : null,
  })
}
