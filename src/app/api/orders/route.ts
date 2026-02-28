import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderTimeline } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import { createOrderFromApi } from "@/domain/serviceActions";

export const runtime = "nodejs";

/**
 * GET /api/orders
 * List orders for a location with filters
 * Query params: locationId (required), status?, orderType?, date?, startDate?, endDate?
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");
    const orderType = searchParams.get("orderType");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Verify location exists and user has access
    const location = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: {
        id: true,
        merchantId: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, location.merchantId),
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

    // Build where conditions
    const whereConditions = [eq(orders.locationId, locationId)];
    if (status) {
      whereConditions.push(eq(orders.status, status as any));
    }
    if (orderType) {
      whereConditions.push(eq(orders.orderType, orderType as any));
    }
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      whereConditions.push(gte(orders.createdAt, dateStart));
      whereConditions.push(lte(orders.createdAt, dateEnd));
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.push(gte(orders.createdAt, start));
      whereConditions.push(lte(orders.createdAt, end));
    }

    // Fetch orders with relations
    const ordersList = await db.query.orders.findMany({
      where: and(...whereConditions),
      orderBy: [desc(orders.createdAt)],
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
          },
        },
        table: {
          columns: {
            id: true,
            tableNumber: true,
          },
        },
        assignedStaff: {
          columns: {
            id: true,
            fullName: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            notes: true,
          },
        },
      },
      limit: 100, // Limit to prevent huge responses
    });

    // Transform to match expected format
    const transformedOrders = ordersList.map((order) => {
      // Check if any items have notes
      const hasItemNotes = order.orderItems?.some((item) => item.notes && item.notes.trim().length > 0) || false;
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        table: order.table
          ? { id: order.table.id, tableNumber: order.table.tableNumber }
          : null,
        customer: order.customer
          ? { id: order.customer.id, name: order.customer.name || "Guest" }
          : null,
        itemsCount: order.orderItems?.length || 0,
        total: parseFloat(order.total || "0"),
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        assignedStaff: order.assignedStaff
          ? { id: order.assignedStaff.id, fullName: order.assignedStaff.fullName }
          : null,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        hasItemNotes,
      };
    });

    return NextResponse.json(
      { orders: transformedOrders },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create order with items and customizations. Routes through service layer.
 * Body: { locationId, customerId?, sessionId?, tableId?, reservationId?, assignedStaffId?, orderType, paymentTiming, guestCount?, items: [...], notes? }
 *
 * Dine-in: ensureSessionByTableUuid + addItemsToOrder (validators, events, totals).
 * Pickup/delivery: createOrderWithItemsForPickupDelivery.
 */
export async function POST(request: NextRequest) {
  try {
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
      locationId,
      customerId,
      sessionId,
      tableId,
      reservationId,
      assignedStaffId,
      orderType,
      paymentTiming,
      items,
      notes,
      guestCount,
    } = body;

    if (!locationId || !orderType || !paymentTiming || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Location ID, order type, payment timing, and at least one item are required" },
        { status: 400 }
      );
    }

    const result = await createOrderFromApi({
      locationId,
      customerId: customerId ?? null,
      sessionId: sessionId ?? null,
      tableId: tableId ?? null,
      reservationId: reservationId ?? null,
      assignedStaffId: assignedStaffId ?? null,
      orderType,
      paymentTiming,
      guestCount,
      notes: notes ?? null,
      items,
      changedByUserId: user.id,
    });

    if (!result.ok) {
      const status =
        result.reason === "Unauthorized or location not found" ? 403 : 400;
      return NextResponse.json({ error: result.reason }, { status });
    }

    const completeOrder = await db.query.orders.findFirst({
      where: eq(orders.id, result.orderId),
      with: {
        customer: true,
        table: true,
        session: true,
        reservation: true,
        assignedStaff: true,
        orderItems: {
          with: {
            customizations: true,
          },
        },
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
        },
        payments: true,
        delivery: true,
      },
    });

    return NextResponse.json({ order: completeOrder }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to create order",
      },
      { status: 500 }
    );
  }
}
