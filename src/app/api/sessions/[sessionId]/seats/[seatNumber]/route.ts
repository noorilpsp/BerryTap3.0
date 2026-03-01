import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { removeSeatByNumber } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * DELETE /api/sessions/[sessionId]/seats/[seatNumber]
 * Body: { reason?: string, eventSource?: "table_page"|"kds"|"system"|"api" } (optional)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; seatNumber: string }> }
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

    const { sessionId, seatNumber } = await params;
    const parsedSeatNumber = Number.parseInt(seatNumber, 10);
    if (!Number.isFinite(parsedSeatNumber) || parsedSeatNumber < 1) {
      return posFailure("BAD_REQUEST", "Invalid seatNumber", { status: 400, correlationId: idemKey });
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      columns: { id: true },
      with: { location: { columns: { id: true, merchantId: true } } },
    });
    if (!session?.location) {
      return posFailure("NOT_FOUND", "Session not found", { status: 404, correlationId: idemKey });
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, session.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });
    if (!membership) {
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403, correlationId: idemKey });
    }

    const result = await removeSeatByNumber(sessionId, parsedSeatNumber);
    if (!result.ok) {
      return posFailure(
        "BAD_REQUEST",
        result.error ?? "Failed to remove seat",
        { status: 400, correlationId: idemKey }
      );
    }

    return posSuccess({ ok: true }, { correlationId: idemKey });
  } catch (error) {
    console.error("[DELETE /api/sessions/.../seats/...] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to remove seat"),
      { status: 500, correlationId: idemKey }
    );
  }
}
