import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, payments } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { addPayment } from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

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

/**
 * POST /api/orders/[id]/payments
 * Create payment
 * Body: { amount, tipAmount?, method, provider?, providerTransactionId?, providerResponse? }
 */
export async function POST(
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
      return posFailure("BAD_REQUEST", "Amount and method are required", { status: 400 });
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
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
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
      return posFailure(statusCode === 403 ? "FORBIDDEN" : "BAD_REQUEST", result.reason, {
        status: statusCode,
      });
    }

    const newPayment = await db.query.payments.findFirst({
      where: eq(payments.id, result.paymentId!),
    });
    return posSuccess(newPayment ?? { id: result.paymentId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders/[id]/payments] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to create payment"),
      { status: 500 }
    );
  }
}
