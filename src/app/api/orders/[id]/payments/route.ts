import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, payments } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    // Fetch payments
    const paymentsList = await db.query.payments.findMany({
      where: eq(payments.orderId, id),
      orderBy: [desc(payments.createdAt)],
    });

    return NextResponse.json(paymentsList);
  } catch (error) {
    console.error("[GET /api/orders/[id]/payments] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch payments",
      },
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
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "Amount and method are required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    // Create payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        orderId: id,
        amount: amount.toString(),
        tipAmount: (tipAmount || 0).toString(),
        method: method as any,
        provider: provider || null,
        providerTransactionId: providerTransactionId || null,
        providerResponse: providerResponse || null,
        status: "completed",
        paidAt: new Date(),
      })
      .returning();

    // Calculate total paid
    const allPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.orderId, id),
        eq(payments.status, "completed")
      ),
    });

    const totalPaid = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );
    const orderTotal = parseFloat(existingOrder.total);

    // Update order payment status
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
        tipAmount: (parseFloat(existingOrder.tipAmount) + parseFloat(newPayment.tipAmount)).toString(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders/[id]/payments] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create payment",
      },
      { status: 500 }
    );
  }
}
