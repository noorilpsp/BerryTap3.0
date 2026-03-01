import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { reservations } from "@/lib/db/schema/orders";
import { merchantLocations, merchantUsers } from "@/lib/db/schema";
import {
  computeRequestHash,
  getIdempotentResponse,
  IDEMPOTENCY_CONFLICT,
  saveIdempotentResponse,
} from "@/domain/idempotency";
import { createReservationMutation } from "@/domain";
import { posFailure, posSuccess, requireIdempotencyKey, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * GET /api/reservations
 * List reservations for a location (with date filters)
 * Query params: locationId (required), status?, date?, startDate?, endDate?
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!locationId) {
      return posFailure("BAD_REQUEST", "Location ID is required", { status: 400 });
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
      return posFailure("NOT_FOUND", "Location not found", { status: 404 });
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
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403 });
    }

    // Build where conditions
    const whereConditions = [eq(reservations.locationId, locationId)];
    if (status) {
      whereConditions.push(eq(reservations.status, status as any));
    }
    if (date) {
      whereConditions.push(eq(reservations.reservationDate, date));
    } else if (startDate && endDate) {
      whereConditions.push(gte(reservations.reservationDate, startDate));
      whereConditions.push(lte(reservations.reservationDate, endDate));
    }

    // Fetch reservations
    const reservationsList = await db.query.reservations.findMany({
      where: and(...whereConditions),
      orderBy: [desc(reservations.reservationDate), desc(reservations.reservationTime)],
      limit: 100,
    });

    const res = posSuccess(reservationsList);
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  } catch (error) {
    console.error("[GET /api/reservations] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to fetch reservations"),
      { status: 500 }
    );
  }
}

const ROUTE_POST_RESERVATIONS = "POST /api/reservations";

/**
 * POST /api/reservations
 * Create reservation
 * Body: { locationId, customerId?, tableId?, partySize, reservationDate, reservationTime, status?, customerName, customerPhone?, customerEmail?, notes? }
 */
export async function POST(request: NextRequest) {
  let idempotencyKey: string | undefined;
  try {
    const keyRes = requireIdempotencyKey(request);
    if (!keyRes.ok) return keyRes.failure;
    idempotencyKey = keyRes.key;

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
      locationId,
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

    if (!locationId || !partySize || !reservationDate || !reservationTime || !customerName) {
      return posFailure(
        "BAD_REQUEST",
        "Location ID, party size, reservation date, time, and customer name are required",
        { status: 400, correlationId: idempotencyKey }
      );
    }

    const requestHash = computeRequestHash(body);
    const cached = await getIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_POST_RESERVATIONS,
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
      return NextResponse.json(replayBody, { status: saved.status ?? 201 });
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
      return posFailure("NOT_FOUND", "Location not found", { status: 404, correlationId: idempotencyKey });
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
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", {
        status: 403,
        correlationId: idempotencyKey,
      });
    }

    let newReservation;
    try {
      newReservation = await createReservationMutation({
        locationId,
        customerId: customerId || null,
        tableId: tableId || null,
        partySize,
        reservationDate,
        reservationTime,
        status,
        customerName,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        notes: notes || null,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("Invalid reservation status:")
      ) {
        const failureBody = { ok: false as const, error: { code: "BAD_REQUEST", message: error.message }, correlationId: idempotencyKey };
        await saveIdempotentResponse({
          key: idempotencyKey,
          userId: user.id,
          route: ROUTE_POST_RESERVATIONS,
          requestHash,
          responseJson: { body: failureBody, status: 400 },
        });
        return posFailure("BAD_REQUEST", error.message, { status: 400, correlationId: idempotencyKey });
      }
      throw error;
    }

    const successBody = { ok: true as const, data: { ...newReservation }, correlationId: idempotencyKey };
    await saveIdempotentResponse({
      key: idempotencyKey,
      userId: user.id,
      route: ROUTE_POST_RESERVATIONS,
      requestHash,
      responseJson: { body: successBody, status: 201 },
    });
    return posSuccess(successBody.data, { status: 201, correlationId: idempotencyKey });
  } catch (error) {
    console.error("[POST /api/reservations] Error:", error);
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to create reservation"),
      { status: 500, correlationId: idempotencyKey }
    );
  }
}
