import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/lib/db/schema/orders";
import { merchantUsers } from "@/lib/db/schema";
import { supabaseServer } from "@/lib/supabaseServer";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";

export const runtime = "nodejs";

/**
 * PATCH /api/orders/[id]/snooze
 * KDS snooze or wake. Requires POS auth.
 *
 * Body:
 *   - { durationSeconds: number } → snooze until now + duration
 *   - { wake: true } → clear snooze, set wasSnoozed
 */
export async function PATCH(
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
    const { durationSeconds, wake } = body;

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      columns: {
        id: true,
        locationId: true,
        snoozedAt: true,
        snoozeUntil: true,
        wasSnoozed: true,
      },
      with: {
        location: { columns: { merchantId: true } },
      },
    });

    if (!existingOrder) {
      return posFailure("NOT_FOUND", "Order not found", { status: 404 });
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
      return posFailure("FORBIDDEN", "You don't have access to this location", { status: 403 });
    }

    if (wake === true) {
      await db
        .update(orders)
        .set({
          snoozedAt: null,
          snoozeUntil: null,
          wasSnoozed: true,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id));

      return posSuccess({ action: "wake", orderId: id });
    }

    const sec = typeof durationSeconds === "number" ? durationSeconds : 0;
    if (sec <= 0 || sec > 3600) {
      return posFailure("BAD_REQUEST", "durationSeconds must be 1–3600", { status: 400 });
    }

    if (existingOrder.wasSnoozed) {
      return posFailure("BAD_REQUEST", "Order was already snoozed and woken; cannot snooze again", {
        status: 400,
      });
    }

    const now = new Date();
    const snoozeUntil = new Date(now.getTime() + sec * 1000);

    await db
      .update(orders)
      .set({
        snoozedAt: now,
        snoozeUntil,
        updatedAt: now,
      })
      .where(eq(orders.id, id));

    return posSuccess({
      action: "snooze",
      orderId: id,
      snoozedAt: now.toISOString(),
      snoozeUntil: snoozeUntil.toISOString(),
    });
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Failed to update snooze"),
      { status: 500 }
    );
  }
}
