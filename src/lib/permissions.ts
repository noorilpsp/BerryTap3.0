import { db } from '@/db'
import { merchantUsers } from '@/db/schema'
import { merchantLocations } from '@/db/schema'
import { platformPersonnel } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { unstable_cache } from '@/lib/unstable-cache'

export type MerchantUserRole = 'owner' | 'admin' | 'manager'

/**
 * Gets the role of a user for a specific merchant.
 * @param userId - The user ID (Supabase auth UUID)
 * @param merchantId - The merchant ID
 * @returns The user's role ('owner' | 'admin' | 'manager') or null if not found or inactive
 */
export async function getUserRole(
  userId: string,
  merchantId: string,
): Promise<MerchantUserRole | null> {
  // Direct DB query used in middleware-safe fallback
  const query = () =>
    db
      .select({
        role: merchantUsers.role,
        isActive: merchantUsers.isActive,
      })
      .from(merchantUsers)
      .where(
        and(
          eq(merchantUsers.userId, userId),
          eq(merchantUsers.merchantId, merchantId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null)

  // Use cache when available; fall back to direct query if incremental cache is missing
  try {
    const cached = unstable_cache(query, ['merchant-user-role', userId, merchantId], {
      revalidate: 7200,
    })
    const merchantUser = await cached()
    if (!merchantUser || !merchantUser.isActive) return null
    return merchantUser.role
  } catch {
    const merchantUser = await query()
    if (!merchantUser || !merchantUser.isActive) return null
    return merchantUser.role
  }
}

/**
 * Checks if a user can access a specific location.
 * - Owners and admins have access to all locations in their merchant
 * - Managers only have access to locations in their locationAccess array
 * @param userId - The user ID (Supabase auth UUID)
 * @param locationId - The location ID
 * @returns true if user can access the location, false otherwise
 */
export async function canAccessLocation(
  userId: string,
  locationId: string,
): Promise<boolean> {
  // Queries (middleware-safe fallback)
  const fetchLocation = () =>
    db
      .select({
        merchantId: merchantLocations.merchantId,
      })
      .from(merchantLocations)
      .where(eq(merchantLocations.id, locationId))
      .limit(1)
      .then((rows) => rows[0] ?? null)

  const fetchMerchantUser = (merchantId: string) =>
    db
      .select({
        role: merchantUsers.role,
        locationAccess: merchantUsers.locationAccess,
        isActive: merchantUsers.isActive,
      })
      .from(merchantUsers)
      .where(
        and(
          eq(merchantUsers.userId, userId),
          eq(merchantUsers.merchantId, merchantId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null)

  // Get location (cached when possible)
  let location: { merchantId: string } | null = null
  try {
    const cachedLocation = unstable_cache(fetchLocation, ['location-merchant', locationId], {
      revalidate: 7200,
    })
    location = await cachedLocation()
  } catch {
    location = await fetchLocation()
  }

  if (!location) {
    return false
  }

  // Get the user's merchant association (cached when possible)
  let merchantUser:
    | {
        role: MerchantUserRole
        locationAccess: string[] | null
        isActive: boolean
      }
    | null = null

  try {
    const cachedMerchantUser = unstable_cache(
      () => fetchMerchantUser(location!.merchantId),
      ['merchant-user-location-access', userId, location.merchantId],
      { revalidate: 7200 },
    )
    merchantUser = await cachedMerchantUser()
  } catch {
    merchantUser = await fetchMerchantUser(location.merchantId)
  }

  // User must be associated with the merchant and active
  if (!merchantUser || !merchantUser.isActive) {
    return false
  }

  // Owners and admins have access to all locations
  if (merchantUser.role === 'owner' || merchantUser.role === 'admin') {
    return true
  }

  // Managers need explicit location access
  if (merchantUser.role === 'manager') {
    const locationAccess = merchantUser.locationAccess ?? []
    return locationAccess.includes(locationId)
  }

  return false
}

// In-memory cache for middleware context (middleware doesn't benefit from React's cache)
// This provides fast lookups for repeated middleware checks
const platformAdminCache = new Map<
  string,
  { result: boolean; expiresAt: number }
>()

const PLATFORM_ADMIN_CACHE_TTL = 30 * 60 * 1000 // 30 minutes in milliseconds (admin status rarely changes)
const ADMIN_COOKIE_NAME = 'bt_admin_status'
const ADMIN_COOKIE_TTL = 30 * 60 // 30 minutes in seconds

/**
 * Gets admin status from cookie (fast path for middleware).
 * Optimized for speed - minimal parsing and validation.
 * @param cookieValue - The cookie value from request
 * @param expectedUserId - The user ID to validate against (security check)
 * @returns true if cookie indicates admin, false or null otherwise
 */
export function getAdminStatusFromCookie(
  cookieValue: string | undefined,
  expectedUserId: string,
): boolean | null {
  if (!cookieValue || cookieValue.length < 10) return null // Quick length check
  
  // Fast path: Cookie format is "userId:isAdmin:timestamp"
  // Find last colon (timestamp separator) - optimized parsing
  const lastColonIndex = cookieValue.lastIndexOf(':')
  if (lastColonIndex === -1 || lastColonIndex === cookieValue.length - 1) return null
  
  const secondColonIndex = cookieValue.lastIndexOf(':', lastColonIndex - 1)
  if (secondColonIndex === -1) return null
  
  // Extract parts without creating array
  const cookieUserId = cookieValue.slice(0, secondColonIndex)
  const timestampStr = cookieValue.slice(lastColonIndex + 1)
  const isAdminStr = cookieValue.slice(secondColonIndex + 1, lastColonIndex)
  
  // Security: Verify cookie belongs to current user
  if (cookieUserId !== expectedUserId) return null
  
  // Quick validation: isAdmin must be 'true' or 'false'
  if (isAdminStr !== 'true' && isAdminStr !== 'false') return null
  
  // Parse timestamp and check expiration (optimized)
  const cookieTime = +timestampStr // Faster than parseInt
  if (!cookieTime || cookieTime < 1000000000) return null // Invalid timestamp
  
  const now = Math.floor(Date.now() / 1000)
  if (now - cookieTime > ADMIN_COOKIE_TTL) return null // Expired
  
  return isAdminStr === 'true'
}

/**
 * Gets admin status from in-memory cache (fastest path).
 * @param userId - The user ID
 * @returns true if cached as admin, false if cached as non-admin, null if not cached
 */
export function getAdminStatusFromCache(userId: string): boolean | null {
  const cached = platformAdminCache.get(userId)
  if (!cached) return null
  
  const now = Date.now()
  if (cached.expiresAt <= now) {
    // Expired, remove from cache
    platformAdminCache.delete(userId)
    return null
  }
  
  return cached.result
}

/**
 * Sets admin status in cookie (for middleware fast-path).
 * @param response - NextResponse to set cookie on
 * @param userId - The user ID
 * @param isAdmin - Whether user is admin
 */
export function setAdminStatusCookie(
  response: { cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void } },
  userId: string,
  isAdmin: boolean,
): void {
  const timestamp = Math.floor(Date.now() / 1000)
  const cookieValue = `${userId}:${isAdmin}:${timestamp}`
  
  response.cookies.set(ADMIN_COOKIE_NAME, cookieValue, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_TTL,
    path: '/',
  })
}

/**
 * Pre-caches admin status for a user (useful after login).
 * This warms up the cache so the first admin page visit is fast.
 * @param userId - The user ID (Supabase auth UUID)
 * @returns The admin status (for setting in cookie)
 */
export async function preCacheAdminStatus(userId: string): Promise<boolean> {
  // Trigger the check which will populate the cache
  return await isPlatformAdmin(userId)
}

/**
 * Checks if a user is a platform admin (super_admin role).
 * Optimized with multi-layer caching:
 * 1. In-memory cache (30min TTL) for middleware/rapid requests
 * 2. Next.js unstable_cache (2hr revalidate) for server components/API routes
 * @param userId - The user ID (Supabase auth UUID)
 * @returns true if user is an active platform super_admin, false otherwise
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  // Check in-memory cache first (fast path for middleware)
  const cached = platformAdminCache.get(userId)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.result
  }

  // Query function - optimized to only fetch what we need
  const query = async (): Promise<boolean> => {
    const result = await db
      .select({
        role: platformPersonnel.role,
        isActive: platformPersonnel.isActive,
      })
      .from(platformPersonnel)
      .where(eq(platformPersonnel.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    return (
      result !== null &&
      result.role === 'super_admin' &&
      result.isActive === true
    )
  }

  let isAdmin: boolean

  // Try Next.js cache (works in server components/API routes)
  try {
    const cachedQuery = unstable_cache(query, ['platform-personnel', userId], {
      revalidate: 7200, // 2 hours
    })
    isAdmin = await cachedQuery()
  } catch {
    // Fallback to direct query (middleware context)
    isAdmin = await query()
  }

  // Update in-memory cache
  platformAdminCache.set(userId, {
    result: isAdmin,
    expiresAt: now + PLATFORM_ADMIN_CACHE_TTL,
  })

  // Clean up expired entries periodically (keep cache size manageable)
  if (platformAdminCache.size > 1000) {
    for (const [key, value] of platformAdminCache.entries()) {
      if (value.expiresAt <= now) {
        platformAdminCache.delete(key)
      }
    }
  }

  return isAdmin
}

/**
 * Clears the in-memory platform admin cache for a specific user or all users.
 * @param userId - Optional user ID to clear cache for. If not provided, clears all cache.
 */
export function clearPlatformAdminCache(userId?: string): void {
  if (userId) {
    platformAdminCache.delete(userId)
  } else {
    platformAdminCache.clear()
  }
}

