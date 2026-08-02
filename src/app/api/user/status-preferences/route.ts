import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { userStatusPreferences } from '@/lib/db/schema/app'
import { requireUser, unauthorizedResponse } from '@/lib/auth/server'

function serializePreference(row: typeof userStatusPreferences.$inferSelect) {
  return {
    id: row.id,
    user_id: row.userId,
    status_key: row.statusKey,
    custom_label: row.customLabel,
    icon: row.icon,
    color: row.color,
    created_at: new Date(row.createdAt).toISOString(),
    updated_at: new Date(row.updatedAt).toISOString(),
  }
}

export async function GET() {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const db = await getDb()
    const preferences = await db
      .select()
      .from(userStatusPreferences)
      .where(eq(userStatusPreferences.userId, user.id))
      .orderBy(asc(userStatusPreferences.statusKey))

    return NextResponse.json({
      preferences: preferences.map(serializePreference),
    })
  } catch (error) {
    console.error('Error in GET /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const body = (await request.json()) as {
      status_key?: string
      custom_label?: string
      icon?: string
      color?: string
    }
    const { status_key, custom_label, icon, color } = body

    if (!status_key || !custom_label || !icon || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['to_watch', 'watching', 'watched'].includes(status_key)) {
      return NextResponse.json({ error: 'Invalid status_key' }, { status: 400 })
    }

    if (!custom_label.trim()) {
      return NextResponse.json({ error: 'Label cannot be empty' }, { status: 400 })
    }

    const now = new Date()
    const db = await getDb()
    const id = crypto.randomUUID()

    await db
      .insert(userStatusPreferences)
      .values({
        id,
        userId: user.id,
        statusKey: status_key as 'to_watch' | 'watching' | 'watched',
        customLabel: custom_label.trim(),
        icon,
        color,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userStatusPreferences.userId, userStatusPreferences.statusKey],
        set: {
          customLabel: custom_label.trim(),
          icon,
          color,
          updatedAt: now,
        },
      })

    const [preference] = await db
      .select()
      .from(userStatusPreferences)
      .where(
        and(
          eq(userStatusPreferences.userId, user.id),
          eq(userStatusPreferences.statusKey, status_key as 'to_watch' | 'watching' | 'watched')
        )
      )
      .limit(1)

    return NextResponse.json({
      preference: preference ? serializePreference(preference) : null,
    })
  } catch (error) {
    console.error('Error in POST /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await requireUser()
    if (!user) return unauthorizedResponse()

    const db = await getDb()
    await db.delete(userStatusPreferences).where(eq(userStatusPreferences.userId, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
