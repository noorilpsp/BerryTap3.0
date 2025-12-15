import { supabaseServer } from '@/lib/supabaseServer'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { unstable_cache } from '@/lib/unstable-cache'

type CurrentUser = {
  id: string
  email: string | null
  profile: {
    id: string
    email: string
    createdAt: Date | null
  } | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const userId = user.id
  const userEmail = user.email ?? null

  // Cache the profile fetch to avoid repeated database queries
  // Cache is keyed by user ID and revalidates every 5 minutes
  const getCachedProfile = unstable_cache(
    async (id: string) => {
      return db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    },
    ['user-profile', userId],
    { revalidate: 300 }, // 5 minutes
  )

  // Fetch profile from Neon (cached)
  const profile = await getCachedProfile(userId)

  return {
    id: userId,
    email: userEmail,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          createdAt: profile.createdAt,
        }
      : null,
  }
}

