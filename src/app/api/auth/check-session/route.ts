import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return NextResponse.json({ hasSession: !!user })
}

