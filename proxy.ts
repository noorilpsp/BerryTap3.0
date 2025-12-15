import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import {
  isPlatformAdmin,
  getAdminStatusFromCookie,
  getAdminStatusFromCache,
  setAdminStatusCookie,
} from '@/lib/permissions'

const isDevelopment = process.env.NODE_ENV === 'development'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } })
  const pathname = request.nextUrl.pathname

  if (isDevelopment) {
    console.info('[proxy] route protection check', { path: pathname })
  }

  // Create Supabase client for authentication
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.delete({ name, ...options })
        },
      },
    },
  )

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Handle /dashboard routes - require authentication only
  if (pathname.startsWith('/dashboard')) {
    if (userError || !user) {
      if (isDevelopment) {
        console.info('[proxy] dashboard access denied - not authenticated')
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isDevelopment) {
      console.info('[proxy] dashboard access granted', { userId: user.id })
    }
    return response
  }

  // Handle /admin routes - require platform admin role
  if (pathname.startsWith('/admin')) {
    if (isDevelopment) {
      console.info('[proxy] admin route check', {
        userId: user?.id,
        email: user?.email,
        userError: userError?.message,
      })
    }

    // First check authentication
    if (userError || !user) {
      if (isDevelopment) {
        console.info('[proxy] admin access denied - not authenticated')
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Ultra-fast path: Check in-memory cache first (<1ms)
    let isAdmin: boolean | null = getAdminStatusFromCache(user.id)

    if (isAdmin === null) {
      // Fast path: Check cookie second (no DB query needed, ~1ms)
      const cookieAdminStatus = getAdminStatusFromCookie(
        request.cookies.get('bt_admin_status')?.value,
        user.id, // Security: validate cookie belongs to this user
      )

      if (cookieAdminStatus !== null) {
        // Cookie is valid, use it and update in-memory cache
        isAdmin = cookieAdminStatus
        // Update in-memory cache for next request (async, don't await)
        isPlatformAdmin(user.id).catch(() => {}) // Populates cache in background
      } else {
        // Slow path: Cookie missing/expired, check database (~50-300ms)
        // This should rarely happen after first request
        isAdmin = await isPlatformAdmin(user.id)
        // Update cookie for future requests
        setAdminStatusCookie(response, user.id, isAdmin)
      }
    }

    if (!isAdmin) {
      if (isDevelopment) {
        console.info('[proxy] admin access denied - not platform admin')
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isDevelopment) {
      console.info('[proxy] admin access granted', { userId: user.id })
    }
    return response
  }

  // For other routes, allow through
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}

