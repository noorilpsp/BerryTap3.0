import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { updateOrderStatus } from "@/domain/serviceActions";

export const runtime = "nodejs";

/**
 * PUT /api/orders/[id]/status
 * Update order status (also creates timeline entry)
 * Body: { status, note?, changedByStaffId? }
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
    const { status, note, changedByStaffId } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { location: { columns: { merchantId: true } } },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingOrder.location.merchantId),
        eq(merchantUsers.userId, user.id),
        eq(merchantUsers.isActive, true)
      ),
      columns: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this location" },
        { status: 403 }
      );
    }

    const result = await updateOrderStatus(id, {
      status,
      note: note ?? undefined,
      changedByStaffId: changedByStaffId ?? undefined,
      changedByUserId: user.id,
    });

    if (!result.ok) {
      const statusCode = result.reason === "unauthorized" ? 403 : 400;
      return NextResponse.json({ error: result.reason }, { status: statusCode });
    }

    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/status] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update order status",
      },
      { status: 500 }
    );
  }
}
