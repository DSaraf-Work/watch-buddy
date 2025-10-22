import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: preferences, error } = await supabase
      .from('user_status_preferences')
      .select('*')
      .eq('user_id', user.id)
      .order('status_key')

    if (error) {
      console.error('Error fetching status preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error in GET /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status_key, custom_label, icon, color } = body

    // Validate input
    if (!status_key || !custom_label || !icon || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['to_watch', 'watching', 'watched'].includes(status_key)) {
      return NextResponse.json({ error: 'Invalid status_key' }, { status: 400 })
    }

    if (!custom_label.trim()) {
      return NextResponse.json({ error: 'Label cannot be empty' }, { status: 400 })
    }

    // Upsert preference
    const { data: preference, error } = await supabase
      .from('user_status_preferences')
      .upsert(
        {
          user_id: user.id,
          status_key,
          custom_label: custom_label.trim(),
          icon,
          color,
        },
        {
          onConflict: 'user_id,status_key',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving status preference:', error)
      return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 })
    }

    return NextResponse.json({ preference })
  } catch (error) {
    console.error('Error in POST /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all preferences for the user (reset to defaults)
    const { error } = await supabase
      .from('user_status_preferences')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting status preferences:', error)
      return NextResponse.json({ error: 'Failed to delete preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/user/status-preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

