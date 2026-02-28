import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, payments, orderDelivery } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { updateOrder, cancelOrder } from "@/domain/serviceActions";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]
 * Get single order with all relations
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

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
        customer: true,
        table: true,
        reservation: true,
        assignedStaff: true,
        orderItems: {
          with: {
            customizations: true,
          },
        },
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
          with: {
            changedByStaff: {
              columns: {
                id: true,
                fullName: true,
              },
            },
            changedByUser: {
              columns: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        payments: {
          orderBy: [desc(payments.createdAt)],
        },
        delivery: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, order.location.merchantId),
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

    // Transform to match expected format
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      reservation: order.reservation
        ? {
            id: order.reservation.id,
            reservationDate: order.reservation.reservationDate,
            reservationTime: order.reservation.reservationTime,
          }
        : null,
      table: order.table
        ? { id: order.table.id, tableNumber: order.table.tableNumber }
        : null,
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.name || "Guest",
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      assignedStaff: order.assignedStaff
        ? { id: order.assignedStaff.id, fullName: order.assignedStaff.fullName }
        : null,
      items: order.orderItems.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        itemPrice: parseFloat(item.itemPrice),
        quantity: item.quantity,
        customizations: item.customizations.map((cust) => ({
          groupName: cust.groupName,
          optionName: cust.optionName,
          optionPrice: parseFloat(cust.optionPrice),
          quantity: cust.quantity,
        })),
        customizationsTotal: parseFloat(item.customizationsTotal),
        lineTotal: parseFloat(item.lineTotal),
        notes: item.notes,
        status: item.status,
      })),
      subtotal: parseFloat(order.subtotal),
      taxAmount: parseFloat(order.taxAmount),
      serviceCharge: parseFloat(order.serviceCharge),
      tipAmount: parseFloat(order.tipAmount),
      discountAmount: parseFloat(order.discountAmount),
      total: parseFloat(order.total),
      timeline: order.timeline.map((entry) => ({
        status: entry.status,
        createdAt: entry.createdAt.toISOString(),
        changedBy:
          entry.changedByStaff?.fullName ||
          entry.changedByUser?.fullName ||
          "System",
        note: entry.note,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        amount: parseFloat(payment.amount),
        tipAmount: parseFloat(payment.tipAmount),
        method: payment.method,
        status: payment.status,
        paidAt: payment.paidAt?.toISOString(),
      })),
      delivery: order.delivery
        ? {
            addressLine1: order.delivery.addressLine1,
            addressLine2: order.delivery.addressLine2,
            city: order.delivery.city,
            postalCode: order.delivery.postalCode,
            deliveryInstructions: order.delivery.deliveryInstructions,
            deliveryFee: parseFloat(order.delivery.deliveryFee),
            estimatedDeliveryAt: order.delivery.estimatedDeliveryAt?.toISOString(),
            deliveredAt: order.delivery.deliveredAt?.toISOString(),
          }
        : null,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("[GET /api/orders/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update order
 * Body: { customerId?, tableId?, reservationId?, assignedStaffId?, notes? }
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
    const { customerId, tableId, reservationId, assignedStaffId, notes } = body;

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

    const patch = {
      ...(customerId !== undefined && { customerId }),
      ...(tableId !== undefined && { tableId }),
      ...(reservationId !== undefined && { reservationId }),
      ...(assignedStaffId !== undefined && { assignedStaffId }),
      ...(notes !== undefined && { notes }),
    };

    const result = await updateOrder(id, patch);
    if (!result.ok) {
      const status = result.reason === "unauthorized" ? 403 : 400;
      return NextResponse.json({ error: result.reason }, { status });
    }
    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[PUT /api/orders/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update order",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel/delete order (soft delete by setting status to cancelled)
 */
export async function DELETE(
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

    const result = await cancelOrder(id, user.id);
    if (!result.ok) {
      const status = result.reason === "unauthorized" ? 403 : 400;
      return NextResponse.json({ error: result.reason }, { status });
    }
    const cancelledOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    return NextResponse.json({ success: true, order: cancelledOrder });
  } catch (error) {
    console.error("[DELETE /api/orders/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to cancel order",
      },
      { status: 500 }
    );
  }
}
