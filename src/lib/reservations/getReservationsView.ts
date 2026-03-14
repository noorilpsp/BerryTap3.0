/**
 * Server helper for fetching ReservationsView. Used by the reservations layout
 * for initial server render. Auth via supabaseServer + getPosUserId; location
 * from getCurrentLocationId cookie.
 */

import { getCurrentLocationId } from "@/app/actions/location";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { getPosUserId } from "@/lib/pos/posAuth";
import { buildReservationsView } from "./buildReservationsView";
import type { ReservationsView } from "./reservationsView";

export type GetReservationsViewResult =
  | { data: ReservationsView }
  | { error: "UNAUTHORIZED" | "FORBIDDEN" | "NO_LOCATION" };

/**
 * Fetch ReservationsView for server-side render.
 * Uses locationId from cookie (getCurrentLocationId). If no location selected,
 * returns NO_LOCATION. Caller should render no-location state when
 * error === "NO_LOCATION".
 */
export async function getReservationsView(): Promise<GetReservationsViewResult> {
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

  const view = await buildReservationsView(locationId);
  return { data: view };
}
