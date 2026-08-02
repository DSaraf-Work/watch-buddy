import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { ottPlatforms } from '@/lib/db/schema/app'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

export async function GET() {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const db = await getDb()
    const platforms = await db.select().from(ottPlatforms).orderBy(asc(ottPlatforms.name))

    return NextResponse.json({
      platforms: platforms.map((p) => ({
        id: p.id,
        name: p.name,
        logo_url: p.logoUrl,
        website_url: p.websiteUrl,
        created_at: new Date(p.createdAt).toISOString(),
      })),
    })
  } catch (error) {
    console.error('Platforms API error:', error)
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 })
  }
}
