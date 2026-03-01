import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { fireWave } from "@/domain";
import type { EventSource } from "@/app/actions/session-events";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

function normalizeEventSource(value: unknown): EventSource {
  return value === "table_page" || value === "kds" || value === "system"
    ? value
    : "api";
}

/**
 * POST /api/sessions/[sessionId]/waves/[waveNumber]/fire
 * Body: { eventSource? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; waveNumber: string }> }
) {
  try {
    const { sessionId, waveNumber } = await params;
    const parsedWaveNumber = Number.parseInt(waveNumber, 10);
    if (!Number.isFinite(parsedWaveNumber) || parsedWaveNumber <= 0) {
      return posFailure("BAD_REQUEST", "Invalid waveNumber", { status: 400 });
    }

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const eventSource = normalizeEventSource(body.eventSource);

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
      return posFailure("NOT_FOUND", "Session not found", { status: 404 });
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
      });
    }

    const result = await fireWave(sessionId, {
      waveNumber: parsedWaveNumber,
      eventSource,
    });

    if (!result.ok) {
      const statusCode =
        result.reason === "session_not_found" || result.reason === "order_not_found"
          ? 404
          : result.reason === "unauthorized"
            ? 403
            : result.reason === "wave_already_fired" || result.reason === "no_wave_to_fire"
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
      return posFailure(code, result.reason, { status: statusCode });
    }

    return posSuccess({
      sessionId: result.sessionId,
      orderId: result.orderId,
      wave: result.wave,
      firedAt: result.firedAt,
      itemCount: result.itemCount,
      affectedItems: result.affectedItems,
    });
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/waves/[waveNumber]/fire] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to fire wave"),
      { status: 500 }
    );
  }
}
