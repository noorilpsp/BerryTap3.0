/**
 * Server helper for fetching GuestsView. Used by the Guests page for initial server render.
 * Auth via supabaseServer + getPosUserId; location from getCurrentLocationId cookie.
 */

import { getCurrentLocationId } from "@/app/actions/location";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { getPosUserId } from "@/lib/pos/posAuth";
import { buildGuestsView } from "./buildGuestsView";
import type { GuestsView } from "./guestsView";

export type GetGuestsViewResult =
  | { data: GuestsView }
  | { error: "UNAUTHORIZED" | "FORBIDDEN" | "NO_LOCATION" };

/**
 * Fetch GuestsView for server-side render.
 * Uses locationId from cookie (getCurrentLocationId). If no location selected, returns NO_LOCATION.
 */
export async function getGuestsView(): Promise<GetGuestsViewResult> {
  const locationId = await getCurrentLocationId();
  if (!locationId?.trim()) {
    return { error: "NO_LOCATION" };
  }

  const supabase = await supabaseServer();
  const authResult = await getPosUserId(supabase);
  if (!authResult.ok) {
    return { error: "UNAUTHORIZED" };
  }

  const ctx = await getPosMerchantContext(authResult.userId);
  if (ctx.locationIds.length === 0) {
    return { error: "FORBIDDEN" };
  }
  if (!ctx.locationIds.includes(locationId)) {
    return { error: "FORBIDDEN" };
  }

  const view = await buildGuestsView(locationId);
  if (!view) {
    return { error: "NO_LOCATION" };
  }

  return { data: view };
}
