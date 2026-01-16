import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderTimeline, tables } from "@/lib/db/schema/orders";
import { staff } from "@/lib/db/schema/staff";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

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
        table: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
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

    // Update order status
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };

    // Set completed_at if status is completed
    if (status === "completed") {
      updateData.completedAt = new Date();
      // Free up table if assigned
      if (existingOrder.tableId) {
        await db
          .update(tables)
          .set({ status: "available", updatedAt: new Date() })
          .where(eq(tables.id, existingOrder.tableId));
      }
    }

    // Set cancelled_at if status is cancelled
    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
      // Free up table if assigned
      if (existingOrder.tableId) {
        await db
          .update(tables)
          .set({ status: "available", updatedAt: new Date() })
          .where(eq(tables.id, existingOrder.tableId));
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // Create timeline entry
    await db.insert(orderTimeline).values({
      orderId: id,
      status: status as any,
      changedByStaffId: changedByStaffId || null,
      changedByUserId: user.id,
      note: note || null,
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
