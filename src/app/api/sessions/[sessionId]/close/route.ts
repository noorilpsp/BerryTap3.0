import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { closeSessionService } from "@/domain";
import type { CloseTablePayment, CloseOrderForTableOptions } from "@/app/actions/orders";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

type CloseBody = {
  payment?: CloseTablePayment;
  options?: CloseOrderForTableOptions;
  eventSource?: unknown;
};

function parsePayment(value: unknown): CloseTablePayment | null | undefined {
  if (value == null) return undefined;
  if (typeof value !== "object") return null;

  const payment = value as Record<string, unknown>;
  const amount =
    typeof payment.amount === "number" && Number.isFinite(payment.amount)
      ? payment.amount
      : null;
  if (amount == null) return null;

  let tipAmount: number | undefined;
  if (payment.tipAmount != null) {
    if (typeof payment.tipAmount !== "number" || !Number.isFinite(payment.tipAmount)) return null;
    tipAmount = payment.tipAmount;
  }

  let method: CloseTablePayment["method"] | undefined;
  if (payment.method != null) {
    if (
      payment.method !== "card" &&
      payment.method !== "cash" &&
      payment.method !== "mobile" &&
      payment.method !== "other"
    ) {
      return null;
    }
    method = payment.method;
  }

  return { amount, tipAmount, method };
}

function parseOptions(value: unknown): CloseOrderForTableOptions | null | undefined {
  if (value == null) return undefined;
  if (typeof value !== "object") return null;

  const options = value as Record<string, unknown>;
  const parsed: CloseOrderForTableOptions = {};
  if (options.force != null) {
    if (typeof options.force !== "boolean") return null;
    parsed.force = options.force;
  }
  return parsed;
}

/**
 * POST /api/sessions/[sessionId]/close
 * Body: { payment?, options?, eventSource? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as CloseBody;
    const payment = parsePayment(body.payment);
    if (payment === null) {
      return posFailure("BAD_REQUEST", "Invalid payment payload", { status: 400 });
    }
    const options = parseOptions(body.options);
    if (options === null) {
      return posFailure("BAD_REQUEST", "Invalid options payload", { status: 400 });
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

    const result = await closeSessionService(sessionId, payment, options);
    if (!result.ok) {
      const statusCode =
        result.reason === "session_not_found"
          ? 404
          : result.reason === "unauthorized"
            ? 403
            : result.reason === "invalid_tip"
              ? 400
              : 409;
      const code =
        statusCode === 404
          ? "NOT_FOUND"
          : statusCode === 403
            ? "FORBIDDEN"
            : statusCode === 409
              ? "CONFLICT"
              : "BAD_REQUEST";
      return posFailure(code, result.error ?? result.reason, {
        status: statusCode,
        correlationId: result.correlationId,
      });
    }

    return posSuccess(
      {
        sessionId: result.sessionId,
      },
      { correlationId: result.correlationId }
    );
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/close] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to close session"),
      { status: 500 }
    );
  }
}
