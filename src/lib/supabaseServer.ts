import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Cache Supabase client per request using React's cache() for request-scoped memoization
// This avoids recreating the client multiple times within the same request
const getCachedSupabaseClient = cache(async () => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    // During build time, environment variables might not be available
    // Return a stub client that will fail gracefully when used
    const errorMessage =
      'Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are not set. ' +
      'Make sure they are configured in your Vercel environment variables. ' +
      'This error occurs when Supabase is accessed at runtime.'

    return new Proxy({} as ReturnType<typeof createServerClient>, {
      get(_target, prop) {
        if (prop === 'then' || prop === Symbol.toStringTag || prop === 'constructor') {
          return undefined
        }
        return new Proxy(
          {},
          {
            get(_nestedTarget, nestedProp) {
              if (nestedProp === 'then' || nestedProp === Symbol.toStringTag || nestedProp === 'constructor') {
                return undefined
              }
              return function stubFunction() {
                return Promise.resolve({ data: { session: null, user: null }, error: null })
              }
            },
            apply() {
              return Promise.resolve({ data: { session: null, user: null }, error: null })
            },
          },
        )
      },
    }) as ReturnType<typeof createServerClient>
  }

  let cookieStore: Awaited<ReturnType<typeof cookies>>
  try {
    cookieStore = await cookies()
  } catch (error) {
    // During prerendering, cookies() may reject. Return a client that won't work
    // but won't crash. This should only happen during build-time prerendering.
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    })
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, {
            ...options,
            sameSite: 'lax',
          })
        } catch (err) {
          // Ignore cookie errors
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete(name)
        } catch (err) {
          // Ignore cookie errors
        }
      },
    },
  })
})

export async function supabaseServer() {
  // Use cached client (request-scoped via React's cache())
  // This ensures we only create one client per request, even if called multiple times
  return getCachedSupabaseClient()
}

