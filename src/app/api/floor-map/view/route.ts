import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPosUserId } from "@/lib/pos/posAuth";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import { buildFloorMapView } from "@/lib/floor-map/buildFloorMapView";

/**
 * GET /api/floor-map/view?locationId=<uuid>&floorplanId=<uuid>
 * Returns FloorMapView for the location. floorplanId optional; uses active if omitted.
 */
export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get("locationId");
    const floorplanIdParam = request.nextUrl.searchParams.get("floorplanId");

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

    const floorplanId = floorplanIdParam?.trim() || undefined;
    const view = await buildFloorMapView(locationId, authResult.userId, floorplanId);
    if (!view) {
      return posFailure("INTERNAL_ERROR", "Failed to build FloorMapView", { status: 500 });
    }

    return posSuccess(view);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load floor map view"),
      { status: 500 }
    );
  }
}
