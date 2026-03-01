import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { reservations } from "@/lib/db/schema/orders";
import { merchantUsers } from "@/lib/db/schema";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import {
  deleteReservationMutation,
  updateReservationMutation,
} from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

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

const ROUTE_PUT_RESERVATION = "PUT /api/reservations/[id]";
const ROUTE_DELETE_RESERVATION = "DELETE /api/reservations/[id]";

/**
 * PUT /api/reservations/[id]
 * Update reservation (including status)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
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

    const requestHash = computeRequestHash({ ...body, id });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_PUT_RESERVATION,
      requestHash,
    });
    if (cached) {
      if (!cached.ok) {
        return posFailure(IDEMPOTENCY_CONFLICT, "Idempotency-Key reuse with different request", {
          status: 409,
          correlationId: idempotencyKey,
        });
      }
      const saved = cached.response as { body: Record<string, unknown>; status: number };
      const replayBody = { ...(saved.body ?? cached.response) as Record<string, unknown>, correlationId: idempotencyKey };
      return NextResponse.json(replayBody, { status: saved.status ?? 200 });
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
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404, correlationId: idempotencyKey });
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
        correlationId: idempotencyKey,
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
        const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: error.message }, correlationId: idempotencyKey };
        await saveIdempotentResponse({
          key: idempotencyKey,
          userId: user.id,
          route: ROUTE_PUT_RESERVATION,
          requestHash,
          responseJson: { body: failureBody, status: 400 },
        });
        return posFailure("BAD_REQUEST", error.message, { status: 400, correlationId: idempotencyKey });
      }
      throw error;
    }
    if (!updatedReservation) {
      const failureBody = { ok: false as const, error: { code: "NOT_FOUND", message: "Reservation not found" }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE_PUT_RESERVATION,
        requestHash,
        responseJson: { body: failureBody, status: 404 },
      });
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404, correlationId: idempotencyKey });
    }

    const successBody = { ok: true as const, data: { ...updatedReservation }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_PUT_RESERVATION,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(successBody.data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[PUT /api/reservations/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to update reservation"),
      { status: 500, correlationId: idempotencyKey }
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
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

    const { id } = await params;
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401, correlationId: idempotencyKey });
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
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404, correlationId: idempotencyKey });
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
        correlationId: idempotencyKey,
      });
    }

    const body = await request.json().catch(() => ({}));
    const requestHash = computeRequestHash({ ...body, id });
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_DELETE_RESERVATION,
      requestHash,
    });
    if (cached) {
      if (!cached.ok) {
        return posFailure(IDEMPOTENCY_CONFLICT, "Idempotency-Key reuse with different request", {
          status: 409,
          correlationId: idempotencyKey,
        });
      }
      const saved = cached.response as { body: Record<string, unknown>; status: number };
      const replayBody = { ...(saved.body ?? cached.response) as Record<string, unknown>, correlationId: idempotencyKey };
      return NextResponse.json(replayBody, { status: saved.status ?? 200 });
    }

    const deleted = await deleteReservationMutation(
      existingReservation.location.id,
      id
    );
    if (!deleted) {
      const failureBody = { ok: false as const, error: { code: "NOT_FOUND", message: "Reservation not found" }, correlationId: idempotencyKey };
      await saveIdempotentResponse({
        key: idempotencyKey,
        userId: user.id,
        route: ROUTE_DELETE_RESERVATION,
        requestHash,
        responseJson: { body: failureBody, status: 404 },
      });
      return posFailure("NOT_FOUND", "Reservation not found", { status: 404, correlationId: idempotencyKey });
    }

    const successBody = { ok: true as const, data: { success: true }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_DELETE_RESERVATION,
      requestHash,
      responseJson: { body: successBody, status: 200 },
    });
    return posSuccess(successBody.data, { correlationId: idempotencyKey });
  } catch (error) {
    console.error("[DELETE /api/reservations/[id]] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to delete reservation"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
