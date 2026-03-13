/**
 * Server helper for fetching CounterView. Used by the counter page for initial server render.
 * Auth via supabaseServer + getPosUserId; location from getCurrentLocationId cookie.
 */

import { getCurrentLocationId } from "@/app/actions/location";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { getPosUserId } from "@/lib/pos/posAuth";
import { buildCounterView } from "@/lib/counter/buildCounterView";
import type { CounterView } from "@/lib/counter/counterView";

export type GetCounterViewResult =
  | { data: CounterView }
  | { error: "UNAUTHORIZED" | "FORBIDDEN" | "NO_LOCATION" };

/**
 * Fetch CounterView for server-side render.
 * Uses locationId from cookie (getCurrentLocationId). If no location selected, returns NO_LOCATION.
 * Caller should render no-location state when error === "NO_LOCATION".
 */
export async function getCounterView(): Promise<GetCounterViewResult> {
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

  const view = await buildCounterView(locationId);
  if (!view) {
    return { error: "NO_LOCATION" };
  }

  return { data: view };
}
