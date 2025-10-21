import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get content ID from database
    const [tmdbIdStr, contentType] = params.id.split('-')
    const tmdbId = parseInt(tmdbIdStr)

    const { data: content } = await supabase
      .from('content')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .eq('content_type', contentType)
      .single()

    if (!content) {
      return NextResponse.json({ status: null })
    }

    // Get user's status for this content
    const { data: status } = await supabase
      .from('user_content_status')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', content.id)
      .single()

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Get status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, rating, notes } = body

    if (!status || !['to_watch', 'watching', 'watched'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get content ID from database
    const [tmdbIdStr, contentType] = params.id.split('-')
    const tmdbId = parseInt(tmdbIdStr)

    const { data: content } = await supabase
      .from('content')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .eq('content_type', contentType)
      .single()

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Upsert status
    const statusData: any = {
      user_id: user.id,
      content_id: content.id,
      status,
    }

    if (rating) statusData.rating = rating
    if (notes) statusData.notes = notes

    // Set timestamps based on status
    if (status === 'watching' && !statusData.started_at) {
      statusData.started_at = new Date().toISOString()
    }
    if (status === 'watched') {
      statusData.completed_at = new Date().toISOString()
      if (!statusData.started_at) {
        statusData.started_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('user_content_status')
      .upsert(statusData, {
        onConflict: 'user_id,content_id',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ status: data })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get content ID from database
    const [tmdbIdStr, contentType] = params.id.split('-')
    const tmdbId = parseInt(tmdbIdStr)

    const { data: content } = await supabase
      .from('content')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .eq('content_type', contentType)
      .single()

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('user_content_status')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', content.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete status error:', error)
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 })
  }
}

