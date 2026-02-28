import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  sessions,
  seats,
  orders,
  payments,
  sessionEvents,
} from "@/lib/db/schema/orders";

export const runtime = "nodejs";

/**
 * GET /api/debug/session/[sessionId]
 * Debug endpoint to inspect the full POS state for a session.
 * Read-only. No auth required (development use).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const sessionRow = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        table: { columns: { id: true, tableNumber: true, displayId: true } },
        server: { columns: { id: true, fullName: true } },
        location: { columns: { id: true } },
      },
    });

    if (!sessionRow) {
      return NextResponse.json(
        { ok: false, error: "Session not found", sessionId },
        { status: 404 }
      );
    }

    const [seatsRows, ordersRows, paymentsRows, eventsRows] = await Promise.all([
      db.query.seats.findMany({
        where: eq(seats.sessionId, sessionId),
        columns: { id: true, seatNumber: true, status: true, guestName: true, createdAt: true, updatedAt: true },
        orderBy: [asc(seats.seatNumber)],
      }),
      db.query.orders.findMany({
        where: eq(orders.sessionId, sessionId),
        with: {
          orderItems: {
            with: { customizations: true },
          },
        },
      }),
      db.query.payments.findMany({
        where: eq(payments.sessionId, sessionId),
      }),
      db.query.sessionEvents.findMany({
        where: eq(sessionEvents.sessionId, sessionId),
        orderBy: [asc(sessionEvents.createdAt)],
      }),
    ]);

    const session = {
      ...sessionRow,
      openedAt: sessionRow.openedAt?.toISOString(),
      closedAt: sessionRow.closedAt?.toISOString(),
      createdAt: sessionRow.createdAt?.toISOString(),
      updatedAt: sessionRow.updatedAt?.toISOString(),
    };

    const items = ordersRows.flatMap((o) =>
      (o.orderItems ?? []).map((item) => ({
        ...item,
        itemPrice: item.itemPrice?.toString(),
        customizationsTotal: item.customizationsTotal?.toString(),
        lineTotal: item.lineTotal?.toString(),
        sentToKitchenAt: item.sentToKitchenAt?.toISOString(),
        startedAt: item.startedAt?.toISOString(),
        readyAt: item.readyAt?.toISOString(),
        servedAt: item.servedAt?.toISOString(),
        voidedAt: item.voidedAt?.toISOString(),
        refiredAt: item.refiredAt?.toISOString(),
        createdAt: item.createdAt?.toISOString(),
        customizations: item.customizations ?? [],
      }))
    );

    const serializedOrders = ordersRows.map((o) => ({
      ...o,
      subtotal: o.subtotal?.toString(),
      taxAmount: o.taxAmount?.toString(),
      serviceCharge: o.serviceCharge?.toString(),
      tipAmount: o.tipAmount?.toString(),
      discountAmount: o.discountAmount?.toString(),
      total: o.total?.toString(),
      firedAt: o.firedAt?.toISOString(),
      estimatedReadyAt: o.estimatedReadyAt?.toISOString(),
      completedAt: o.completedAt?.toISOString(),
      cancelledAt: o.cancelledAt?.toISOString(),
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
      orderItems: (o.orderItems ?? []).map((item) => ({
        ...item,
        itemPrice: item.itemPrice?.toString(),
        customizationsTotal: item.customizationsTotal?.toString(),
        lineTotal: item.lineTotal?.toString(),
      })),
    }));

    const serializedPayments = paymentsRows.map((p) => ({
      ...p,
      amount: p.amount?.toString(),
      tipAmount: p.tipAmount?.toString(),
      paidAt: p.paidAt?.toISOString(),
      refundedAt: p.refundedAt?.toISOString(),
      createdAt: p.createdAt?.toISOString(),
    }));

    const serializedEvents = eventsRows.map((e) => ({
      ...e,
      createdAt: e.createdAt?.toISOString(),
    }));

    const serializedSeats = seatsRows.map((s) => ({
      ...s,
      createdAt: s.createdAt?.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      sessionId,
      data: {
        session,
        seats: serializedSeats,
        orders: serializedOrders,
        items,
        payments: serializedPayments,
        events: serializedEvents,
      },
    });
  } catch (error) {
    console.error("[GET /api/debug/session/[sessionId]] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
