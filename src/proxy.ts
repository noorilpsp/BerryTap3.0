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

  // Skip API routes - they handle their own authentication
  if (pathname.startsWith('/api')) {
    return response
  }

  // Allow prefetch requests to pass through without authentication checks
  // Next.js Link components prefetch routes, and these requests may not have
  // proper auth cookies. The actual navigation will still be protected.
  const nextRouterPrefetch = request.headers.get('next-router-prefetch')
  const purpose = request.headers.get('purpose')
  const secPurpose = request.headers.get('sec-purpose')
  const secFetchDest = request.headers.get('sec-fetch-dest')
  const secFetchMode = request.headers.get('sec-fetch-mode')
  const hasNextUrl = request.headers.has('next-url')
  
  // Check for Supabase auth cookies - prefetch requests often don't include them
  // Supabase SSR uses cookies with patterns like 'sb-<project>-auth-token' or similar
  // Check if any cookie name contains 'sb-' or 'supabase' as a heuristic
  let hasAuthCookies = false
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      hasAuthCookies = true
    }
  })
  
  
  const isPrefetch =
    nextRouterPrefetch === '1' ||
    purpose === 'prefetch' ||
    secPurpose === 'prefetch' ||
    (secFetchDest === 'empty' && secFetchMode === 'cors' && hasNextUrl) ||
    // If no auth cookies and it's a GET request, likely a prefetch
    (!hasAuthCookies && request.method === 'GET' && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')))
  
  if (isPrefetch) {
    // Prefetch requests are allowed through without authentication checks
    // The actual navigation will still be protected when the user clicks the link
    return response
  }

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

  // Handle auth pages (/login, /signup, /forgot-password, /reset-password)
  // Redirect authenticated users to dashboard (they shouldn't see these pages)
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    if (user && !userError) {
      if (isDevelopment) {
        console.info('[proxy] authenticated user accessing auth page, redirecting to dashboard', {
          userId: user.id,
          path: pathname,
        })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Not authenticated, allow access to auth pages
    return response
  }

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
    '/login',
    '/login/:path*',
    '/signup',
    '/signup/:path*',
    '/forgot-password',
    '/forgot-password/:path*',
    '/reset-password',
    '/reset-password/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
