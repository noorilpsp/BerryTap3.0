import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderTimeline } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/timeline
 * Get status history for an order
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

    // Fetch timeline
    const timeline = await db.query.orderTimeline.findMany({
      where: eq(orderTimeline.orderId, id),
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
    });

    // Transform to match expected format
    const transformedTimeline = timeline.map((entry) => ({
      id: entry.id,
      status: entry.status,
      createdAt: entry.createdAt.toISOString(),
      changedBy:
        entry.changedByStaff?.fullName ||
        entry.changedByUser?.fullName ||
        "System",
      note: entry.note,
    }));

    return NextResponse.json({ timeline: transformedTimeline });
  } catch (error) {
    console.error("[GET /api/orders/[id]/timeline] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch timeline",
      },
      { status: 500 }
    );
  }
}
