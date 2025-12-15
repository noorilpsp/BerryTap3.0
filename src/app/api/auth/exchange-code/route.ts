import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({}))

  if (!code) {
    return NextResponse.json(
      { message: 'Missing code' },
      { status: 400 },
    )
  }

  const supabase = await supabaseServer()

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('Code exchange error:', {
      error: error?.message,
      hasSession: !!data.session,
    })
    return NextResponse.json(
      { message: error?.message || 'Invalid or expired reset link' },
      { status: 401 },
    )
  }

  console.log('Code exchange successful, session created')
  return NextResponse.json({ success: true })
}

