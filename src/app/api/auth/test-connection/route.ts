import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await supabaseServer()
    
    // Test 1: Check if we can get the auth instance
    const authInstance = supabase.auth
    
    // Test 2: Try to get current session (should work even if no user)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Test 3: Check environment variables
    const hasUrl = !!process.env.SUPABASE_URL
    const hasAnonKey = !!process.env.SUPABASE_ANON_KEY
    const hasPublicUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasPublicAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      success: true,
      connection: {
        hasAuthInstance: !!authInstance,
        sessionCheck: {
          success: !sessionError,
          error: sessionError?.message || null,
          hasSession: !!sessionData?.session,
        },
        environment: {
          SUPABASE_URL: hasUrl ? '✅ Set' : '❌ Missing',
          SUPABASE_ANON_KEY: hasAnonKey ? '✅ Set' : '❌ Missing',
          NEXT_PUBLIC_SUPABASE_URL: hasPublicUrl ? '✅ Set' : '❌ Missing',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: hasPublicAnonKey ? '✅ Set' : '❌ Missing',
        },
        // Don't expose actual values, just confirm they exist
        urlPreview: process.env.SUPABASE_URL 
          ? `${process.env.SUPABASE_URL.substring(0, 30)}...` 
          : 'Not set',
      },
      recommendations: [
        !hasUrl && 'Set SUPABASE_URL in .env.local',
        !hasAnonKey && 'Set SUPABASE_ANON_KEY in .env.local',
        !hasPublicUrl && 'Set NEXT_PUBLIC_SUPABASE_URL in .env.local',
        !hasPublicAnonKey && 'Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
      ].filter(Boolean),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

