"use server";

import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

/**
 * Verifies the authenticated user has access to the given location.
 * Returns the location if valid, null otherwise.
 */
export async function verifyLocationAccess(
  locationId: string
): Promise<{ id: string; merchantId: string } | null> {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const location = await db.query.merchantLocations.findFirst({
    where: eq(merchantLocations.id, locationId),
    columns: {
      id: true,
      merchantId: true,
    },
  });

  if (!location) return null;

  const membership = await db.query.merchantUsers.findFirst({
    where: and(
      eq(merchantUsers.merchantId, location.merchantId),
      eq(merchantUsers.userId, user.id),
      eq(merchantUsers.isActive, true)
    ),
    columns: { id: true },
  });

  if (!membership) return null;

  return location;
}
