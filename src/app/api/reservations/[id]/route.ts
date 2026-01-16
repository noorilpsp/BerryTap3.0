import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { reservations } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/reservations/[id]
 * Get single reservation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
        customer: true,
        table: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, reservation.location.merchantId),
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

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("[GET /api/reservations/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to fetch reservation",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reservations/[id]
 * Update reservation (including status)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      customerId,
      tableId,
      partySize,
      reservationDate,
      reservationTime,
      status,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = body;

    // Get existing reservation
    const existingReservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingReservation.location.merchantId),
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

    // Update reservation
    const updateData: any = {
      updatedAt: new Date(),
    };
    if (customerId !== undefined) updateData.customerId = customerId;
    if (tableId !== undefined) updateData.tableId = tableId;
    if (partySize !== undefined) updateData.partySize = partySize;
    if (reservationDate !== undefined) updateData.reservationDate = reservationDate;
    if (reservationTime !== undefined) updateData.reservationTime = reservationTime;
    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedReservation] = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.id, params.id))
      .returning();

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("[PUT /api/reservations/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to update reservation",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservations/[id]
 * Delete reservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get existing reservation
    const existingReservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, params.id),
      with: {
        location: {
          columns: {
            id: true,
            merchantId: true,
          },
        },
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check user has access to this merchant
    const membership = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, existingReservation.location.merchantId),
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

    // Delete reservation
    await db.delete(reservations).where(eq(reservations.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/reservations/[id]] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error - Failed to delete reservation",
      },
      { status: 500 }
    );
  }
}
