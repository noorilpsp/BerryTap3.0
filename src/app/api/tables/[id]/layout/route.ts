import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { updateTableLayout } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * PUT /api/tables/[id]/layout
 * Body: { locationId: string, layout: { status?, guests?, seatedAt?, stage?, alerts? }, eventSource?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let idemKey: string | undefined;
  try {
    const idem = requireIdempotencyKey(request);
    if (!idem.ok) return idem.failure;
    idemKey = idem.key;

    const supabase = await supabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idemKey });
    }

    const { id: tableId } = await params;
    if (!tableId || !tableId.trim()) {
      return posFailure("BAD_REQUEST", "table id is required", { status: 400, correlationId: idemKey });
    }

    const body = await request.json().catch(() => ({}));
    const locationId = body.locationId;
    if (!locationId || typeof locationId !== "string" || !locationId.trim()) {
      return posFailure("BAD_REQUEST", "locationId is required in body", { status: 400, correlationId: idemKey });
    }

    const layout = body.layout;
    if (!layout || typeof layout !== "object") {
      return posFailure("BAD_REQUEST", "layout is required in body", { status: 400, correlationId: idemKey });
    }

    const location = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId.trim()),
      columns: { id: true, merchantId: true },
    });
    if (!location) {
      return posFailure("NOT_FOUND", "Location not found", { status: 404, correlationId: idemKey });
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });
    if (!membership) {
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403, correlationId: idemKey });
    }

    const updates = {
      status: layout.status,
      guests: layout.guests,
      seatedAt: layout.seatedAt,
      stage: layout.stage,
      alerts: layout.alerts,
    };

    const result = await updateTableLayout(locationId.trim(), tableId.trim(), updates);
    if (!result.ok) {
      const status = result.reason === "unauthorized" ? 403 : 400;
      const code = result.reason === "unauthorized" ? "FORBIDDEN" : "BAD_REQUEST";
      return posFailure(code, result.reason, { status, correlationId: idemKey });
    }

    return posSuccess({ ok: true }, { correlationId: idemKey });
  } catch (error) {
    console.error("[PUT /api/tables/.../layout] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update layout"),
      { status: 500, correlationId: idemKey }
    );
  }
}
