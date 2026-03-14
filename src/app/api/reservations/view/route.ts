import { NextRequest } from "next/server";
import { getPosUserId } from "@/lib/pos/posAuth";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { buildReservationsView } from "@/lib/reservations/buildReservationsView";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * GET /api/reservations/view?locationId=<uuid>
 * Returns full reservations read model for the location. Read-only.
 * Suitable for client refresh/revalidation.
 */
export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get("locationId");
    if (!locationId?.trim()) {
      return posFailure("BAD_REQUEST", "locationId is required", { status: 400 });
    }

    const supabase = await supabaseServer();
    const authResult = await getPosUserId(supabase);
    if (!authResult.ok) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const ctx = await getPosMerchantContext(authResult.userId);
    if (!ctx.locationIds.length) {
      return posFailure("FORBIDDEN", "Forbidden - No locations available", { status: 403 });
    }
    if (!ctx.locationIds.includes(locationId)) {
      return posFailure(
        "FORBIDDEN",
        "Forbidden - You don't have access to this location",
        { status: 403 }
      );
    }

    const view = await buildReservationsView(locationId);
    return posSuccess(view);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load reservations view"),
      { status: 500 }
    );
  }
}
