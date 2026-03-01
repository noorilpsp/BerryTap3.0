import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { payments } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { updatePayment } from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * PUT /api/payments/[id]
 * Update payment status (complete, refund)
 * Body: { status, refundedAt? }
 */
export async function PUT(
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
    const { status } = body;

    if (!status) {
      return posFailure("BAD_REQUEST", "Status is required", { status: 400 });
    }

    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
      with: { order: { with: { location: { columns: { merchantId: true } } } } },
    });

    if (!existingPayment?.order?.location) {
      return posFailure("NOT_FOUND", "Payment not found", { status: 404 });
    }

    const merchantId = existingPayment.order.location.merchantId;
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, merchantId),
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

    const result = await updatePayment(id, status);

    if (!result.ok) {
      const statusCode = result.reason === "unauthorized" ? 403 : 400;
      return posFailure(statusCode === 403 ? "FORBIDDEN" : "BAD_REQUEST", result.reason, {
        status: statusCode,
      });
    }

    const updatedPayment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
    });
    return posSuccess(updatedPayment ?? { id });
  } catch (error) {
    console.error("[PUT /api/payments/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update payment"),
      { status: 500 }
    );
  }
}
