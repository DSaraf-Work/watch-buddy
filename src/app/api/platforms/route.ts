import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all platforms
    const { data: platforms, error } = await supabase
      .from('ott_platforms')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return NextResponse.json({ platforms })
  } catch (error) {
    console.error('Platforms API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

