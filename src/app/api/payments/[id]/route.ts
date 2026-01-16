import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { payments, orders } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get existing payment
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
      with: {
        order: {
          with: {
            location: {
              columns: {
                id: true,
                merchantId: true,
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check user has access
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingPayment.order.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: {
        id: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    // Update payment
    const updateData: any = {
      status: status as any,
    };

    if (status === "completed" && !existingPayment.paidAt) {
      updateData.paidAt = new Date();
    }

    if (status === "refunded") {
      updateData.refundedAt = new Date();
    }

    const [updatedPayment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();

    // Recalculate order payment status
    const allPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.orderId, existingPayment.orderId),
        eq(payments.status, "completed")
      ),
    });

    const totalPaid = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const orderTotal = parseFloat(existingPayment.order.total);

    let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid";
    if (totalPaid >= orderTotal) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    }

    await db
      .update(orders)
      .set({
        paymentStatus: paymentStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existingPayment.orderId));

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("[PUT /api/payments/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update payment",
      },
      { status: 500 }
    );
  }
}
