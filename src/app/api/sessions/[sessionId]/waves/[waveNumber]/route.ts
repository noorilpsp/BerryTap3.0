import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { removeWaveForSession } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * DELETE /api/sessions/[sessionId]/waves/[waveNumber]
 * Body: { eventSource? } (optional)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; waveNumber: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { sessionId, waveNumber } = await params;
    const parsedWaveNumber = Number.parseInt(waveNumber, 10);
    if (!Number.isFinite(parsedWaveNumber) || parsedWaveNumber <= 0) {
      return posFailure("BAD_REQUEST", "Invalid waveNumber", { status: 400, correlationId: idempotencyKey });
    }

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const existingSession = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
      columns: {
        id: true,
      },
    });
    if (!existingSession?.location) {
      return posFailure("NOT_FOUND", "Session not found", { status: 404, correlationId: idempotencyKey });
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingSession.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });
    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    const result = await removeWaveForSession(sessionId, parsedWaveNumber);
    if (!result.ok) {
      const statusCode =
        result.reason === "session_not_found" || result.reason === "wave_not_found"
          ? 404
          : result.reason === "unauthorized"
            ? 403
            : result.reason === "not_last_wave" || result.reason === "wave_has_items"
              ? 409
              : 400;
      const code =
        statusCode === 404
          ? "NOT_FOUND"
          : statusCode === 403
            ? "FORBIDDEN"
            : statusCode === 409
              ? "CONFLICT"
              : "BAD_REQUEST";
      return posFailure(code, result.error ?? result.reason ?? "Failed to remove wave", {
        status: statusCode,
        correlationId: idempotencyKey,
      });
    }

    return posSuccess(
      { deletedWaveNumber: parsedWaveNumber },
      { correlationId: idempotencyKey }
    );
  } catch (error) {
    console.error("[DELETE /api/sessions/[sessionId]/waves/[waveNumber]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to remove wave"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
