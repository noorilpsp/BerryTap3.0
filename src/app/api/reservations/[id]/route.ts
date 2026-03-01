import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { reservations } from "@/lib/db/schema/orders";
import { merchantUsers } from "@/lib/db/schema";
import {
  deleteReservationMutation,
  updateReservationMutation,
} from "@/domain";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * GET /api/reservations/[id]
 * Get single reservation
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

    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, id),
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
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404 });
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
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403 });
    }

    return posSuccess(reservation);
  } catch (error) {
    console.error("[GET /api/reservations/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to fetch reservation"),
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
      where: eq(reservations.id, id),
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
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404 });
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
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
      });
    }

    let updatedReservation;
    try {
      updatedReservation = await updateReservationMutation(
        existingReservation.location.id,
        id,
        {
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
        }
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("Invalid reservation status:")
      ) {
        return posFailure("BAD_REQUEST", error.message, { status: 400 });
      }
      throw error;
    }
    if (!updatedReservation) {
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404 });
    }

    return posSuccess({ ...updatedReservation });
  } catch (error) {
    console.error("[PUT /api/reservations/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update reservation"),
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

    // Get existing reservation
    const existingReservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, id),
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
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404 });
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
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
      });
    }

    const deleted = await deleteReservationMutation(
      existingReservation.location.id,
      id
    );
    if (!deleted) {
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404 });
    }

    return posSuccess({ success: true });
  } catch (error) {
    console.error("[DELETE /api/reservations/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to delete reservation"),
      { status: 500 }
    );
  }
}
