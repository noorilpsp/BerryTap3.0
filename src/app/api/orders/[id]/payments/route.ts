import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, payments } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import { addPayment } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/payments
 * List payments for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    // Get existing order
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404 });
    }

    // Check user has access
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    });

    if (!membership) {
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403 });
    }

    // Fetch payments
    const paymentsList = await db.query.payments.findMany({
      where: eq(payments.orderId, id),
      orderBy: [desc(payments.createdAt)],
    });

    return posSuccess(paymentsList);
  } catch (error) {
    console.error("[GET /api/orders/[id]/payments] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to fetch payments"),
      { status: 500 }
    );
  }
}

const ROUTE_POST_PAYMENTS = "POST /api/orders/[id]/payments";

/**
 * POST /api/orders/[id]/payments
 * Create payment
 * Body: { amount, tipAmount?, method, provider?, providerTransactionId?, providerResponse? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
    }

    const body = await request.json().catch(() => ({}));
    const {
      amount,
      tipAmount,
      method,
      provider,
      providerTransactionId,
      providerResponse,
    } = body;

    if (!amount || !method) {
      return posFailure("BAD_REQUEST", "Amount and method are required", { status: 400, correlationId: idempotencyKey });
    }

    const requestHash = computeRequestHash({ ...body, id });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_POST_PAYMENTS,
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
      return NextResponse.json(replayBody, { status: saved.status ?? 201 });
    }

    // Get existing order
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404, correlationId: idempotencyKey });
    }

    // Check user has access
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    });

    if (!membership) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    const result = await addPayment(id, {
      amount: Number(amount),
      tipAmount: tipAmount != null ? Number(tipAmount) : undefined,
      method,
      provider: provider ?? undefined,
      providerTransactionId: providerTransactionId ?? undefined,
      providerResponse: providerResponse ?? undefined,
    });

    if (!result.ok) {
      const statusCode = result.reason === "unauthorized" ? 403 : 400;
      const code = statusCode === 403 ? "FORBIDDEN" : "BAD_REQUEST";
      const failureBody = { ok: false as const, error: { code, message: result.reason }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE_POST_PAYMENTS,
        requestHash,
        responseJson: { body: failureBody, status: statusCode },
      });
      return posFailure(code, result.reason, { status: statusCode, correlationId: idempotencyKey });
    }

    const newPayment = await db.query.payments.findFirst({
      where: eq(payments.id, result.paymentId!),
    });
    const data = newPayment ?? { id: result.paymentId };
    const successBody = { ok: true as const, data, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_POST_PAYMENTS,
      requestHash,
      responseJson: { body: successBody, status: 201 },
    });
    return posSuccess(data, { status: 201, correlationId: idempotencyKey });
  } catch (error) {
    console.error("[POST /api/orders/[id]/payments] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to create payment"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
