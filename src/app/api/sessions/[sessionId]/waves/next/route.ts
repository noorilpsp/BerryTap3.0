import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { createNextWaveForSession } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * POST /api/sessions/[sessionId]/waves/next
 * Create the next wave for a session.
 * Body: { eventSource? } (optional, accepted for consistency)
 * Does NOT write to DB in the route — delegates to domain.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  let idemKey: string | undefined;
  try {
    const idem = requireIdempotencyKey(request);
    if (!idem.ok) return idem.failure;
    idemKey = idem.key;

    const { sessionId } = await params;

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idemKey });
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
      return posFailure("NOT_FOUND", "Session not found", { status: 404, correlationId: idemKey });
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
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403, correlationId: idemKey });
    }

    const result = await createNextWaveForSession(sessionId);

    if (!result.ok) {
      return posFailure(
        "INTERNAL_ERROR",
        result.reason ?? "Failed to create next wave",
        { status: 500, correlationId: idemKey }
      );
    }

    return posSuccess(
      {
        sessionId,
        waveNumber: result.wave,
      },
      { correlationId: idemKey }
    );
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/waves/next] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to create next wave"),
      { status: 500, correlationId: idemKey }
    );
  }
}
