import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema";
import { sessions } from "@/lib/db/schema/orders";
import { closeSessionService } from "@/domain";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import type { CloseTablePayment, CloseOrderForTableOptions } from "@/app/actions/orders";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

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

const ROUTE_SESSIONS_CLOSE = "POST /api/sessions/[sessionId]/close";

/**
 * POST /api/sessions/[sessionId]/close
 * Body: { payment?, options?, eventSource? }
 *
 * Requires Idempotency-Key header.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { sessionId } = await params;

    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const body = (await request.json().catch(() => ({}))) as CloseBody;
    const payment = parsePayment(body.payment);
    if (payment === null) {
      return posFailure("BAD_REQUEST", "Invalid payment payload", { status: 400, correlationId: idempotencyKey });
    }
    const options = parseOptions(body.options);
    if (options === null) {
      return posFailure("BAD_REQUEST", "Invalid options payload", { status: 400, correlationId: idempotencyKey });
    }

    const requestHash = computeRequestHash({ ...body, sessionId });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_SESSIONS_CLOSE,
      requestHash,
    });
    if (cached) {
      if (!cached.ok) {
        return posFailure(IDEMPOTENCY_CONFLICT, "Idempotency-Key reuse with different request", {
          status: 409,
          correlationId: idempotencyKey,
        });
      }
      const saved = cached.response as { body: Record<string, unknown>; status: number };
      const replayBody = { ...(saved.body ?? cached.response) as Record<string, unknown>, correlationId: idempotencyKey };
      return NextResponse.json(replayBody, { status: saved.status ?? 200 });
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
        correlationId: idempotencyKey,
      });
    }

    const data = { sessionId: result.sessionId };
    const responseBody = {
      ok: true as const,
      data,
      correlationId: idempotencyKey,
    };

    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_SESSIONS_CLOSE,
      requestHash,
      responseJson: { body: responseBody, status: 200 },
    });

    return posSuccess(data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/close] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to close session"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
