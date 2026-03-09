import { NextRequest } from "next/server";
import { eq, and, desc, inArray, isNull, isNotNull, or } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabaseServer";
import { db } from "@/db";
import { orders, orderItems } from "@/lib/db/schema/orders";
import { merchantLocations } from "@/lib/db/schema";
import { getPosUserId } from "@/lib/pos/posAuth";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { computeKitchenDelaysFromOrderItems } from "@/lib/pos/computeKitchenDelays";
import { computeKdsActions } from "@/lib/kds/computeKdsActions";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import type { KdsView, KdsOrder, KdsOrderItem, KdsStation, KdsDelay } from "@/lib/kds/kdsView";
import { isKdsView } from "@/lib/kds/kdsView";
import { getLocationStationsWithSubstations } from "@/lib/kds/getLocationStations";
import { devTimer } from "@/lib/pos/devTimer";

export const runtime = "nodejs";

const DEV = process.env.NODE_ENV !== "production";
/** KDS shows orders sent to kitchen. Dine-in: only fired waves (firedAt set). Pickup/delivery: included when placed (no fire step). */

/**
 * GET /api/kds/view?locationId=<uuid>
 * Returns full KDS read model for the location. Read-only; use getPosUserId.
 */
export async function GET(request: NextRequest) {
  const totalStart = DEV ? performance.now() : 0;
  try {
    const locationId = request.nextUrl.searchParams.get("locationId");
    if (!locationId?.trim()) {
      return posFailure("BAD_REQUEST", "locationId is required", { status: 400 });
    }

    const supabase = await supabaseServer();
    const t0 = DEV ? performance.now() : 0;
    const authResult = await getPosUserId(supabase);
    if (DEV) devTimer("[kds] auth", t0);
    if (!authResult.ok) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const tCtx = DEV ? performance.now() : 0;
    const ctx = await getPosMerchantContext(authResult.userId);
    if (DEV) devTimer("[kds] ctx", tCtx);
    if (!ctx.locationIds.length) {
      return posFailure("FORBIDDEN", "Forbidden - No locations available", { status: 403 });
    }
    if (!ctx.locationIds.includes(locationId)) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to this location", { status: 403 });
    }

    const tLoc = DEV ? performance.now() : 0;
    const locationRow = await db.query.merchantLocations.findFirst({
      where: eq(merchantLocations.id, locationId),
      columns: { id: true, name: true },
    });
    if (DEV) devTimer("[kds] location", tLoc);
    if (!locationRow) {
      return posFailure("NOT_FOUND", "Location not found", { status: 404 });
    }

    const tOrders = DEV ? performance.now() : 0;
    const ordersList = await db.query.orders.findMany({
      where: and(
        eq(orders.locationId, locationId),
        or(
          isNotNull(orders.firedAt),
          inArray(orders.orderType, ["pickup", "delivery"])
        )
      ),
      orderBy: [desc(orders.firedAt), desc(orders.createdAt)],
      columns: {
        id: true,
        orderNumber: true,
        orderType: true,
        status: true,
        station: true,
        wave: true,
        firedAt: true,
        sessionId: true,
        tableId: true,
        createdAt: true,
        snoozedAt: true,
        snoozeUntil: true,
        wasSnoozed: true,
      },
      with: {
        table: { columns: { id: true, tableNumber: true } },
        customer: { columns: { id: true, name: true } },
        session: {
          columns: { id: true, tableId: true },
          with: { table: { columns: { id: true, tableNumber: true } } },
        },
      },
      limit: 100,
    });
    if (DEV) devTimer("[kds] orders", tOrders, ordersList.length);

    const orderIds = ordersList.map((o) => o.id);
    let itemRows: Array<{
      id: string;
      orderId: string;
      itemName: string | null;
      quantity: number | null;
      notes: string | null;
      status: string;
      sentToKitchenAt: Date | null;
      startedAt: Date | null;
      readyAt: Date | null;
      servedAt: Date | null;
      voidedAt: Date | null;
      refiredAt: Date | null;
      stationOverride: string | null;
      seat: number | null;
      prepGroup: string | null;
      item: { defaultSubstation: string | null } | null;
    }> = [];
    if (orderIds.length > 0) {
      const tItems = DEV ? performance.now() : 0;
      itemRows = await db.query.orderItems.findMany({
        where: inArray(orderItems.orderId, orderIds),
        columns: {
          id: true,
          orderId: true,
          itemName: true,
          quantity: true,
          notes: true,
          status: true,
          sentToKitchenAt: true,
          startedAt: true,
          readyAt: true,
          servedAt: true,
          voidedAt: true,
          refiredAt: true,
          stationOverride: true,
          seat: true,
          prepGroup: true,
        },
        with: {
          item: { columns: { defaultSubstation: true } },
        },
        orderBy: (i, { asc }) => [asc(i.createdAt)],
      });
      if (DEV) devTimer("[kds] orderItems", tItems, itemRows.length);
    }

    const orderIdToStation = new Map(ordersList.map((o) => [o.id, o.station ?? null]));
    const tableNumberByOrderId = new Map(
      ordersList.map((o) => [
        o.id,
        o.session?.table?.tableNumber ?? o.table?.tableNumber ?? null,
      ])
    );
    const customerNameByOrderId = new Map(
      ordersList.map((o) => [o.id, o.customer?.name ?? null])
    );

    const now = new Date();
    const kdsOrders: KdsOrder[] = ordersList.map((o) => {
      const snoozeUntil = o.snoozeUntil?.toISOString() ?? null;
      const isSnoozed =
        snoozeUntil != null && new Date(snoozeUntil).getTime() > now.getTime();
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        orderType: o.orderType,
        status: o.status,
        station: o.station ?? null,
        wave: o.wave ?? 1,
        firedAt: o.firedAt?.toISOString() ?? null,
        sessionId: o.sessionId ?? null,
        tableId: o.tableId ?? null,
        tableNumber: tableNumberByOrderId.get(o.id) ?? null,
        customerName: customerNameByOrderId.get(o.id) ?? null,
        createdAt: o.createdAt.toISOString(),
        snoozedAt: o.snoozedAt?.toISOString() ?? null,
        snoozeUntil,
        isSnoozed,
        wasSnoozed: o.wasSnoozed ?? false,
      };
    });

    const kdsOrderItems: KdsOrderItem[] = itemRows.map((row) => ({
      id: row.id,
      orderId: row.orderId,
      itemName: row.itemName ?? "",
      quantity: row.quantity ?? 1,
      notes: row.notes ?? null,
      status: row.status as KdsOrderItem["status"],
      sentToKitchenAt: row.sentToKitchenAt?.toISOString() ?? null,
      startedAt: row.startedAt?.toISOString() ?? null,
      readyAt: row.readyAt?.toISOString() ?? null,
      servedAt: row.servedAt?.toISOString() ?? null,
      voidedAt: row.voidedAt?.toISOString() ?? null,
      refiredAt: row.refiredAt?.toISOString() ?? null,
      stationOverride: row.stationOverride ?? null,
      seatNumber: row.seat,
      substation: row.item?.defaultSubstation ?? null,
      prepGroup: row.prepGroup ?? null,
    }));

    // Build station list with substations: location_stations + location_substations
    const activeStations = await getLocationStationsWithSubstations(locationId);
    const stationKeyToMeta = new Map(
      activeStations.map((s) => [
        s.key,
        {
          id: s.key,
          name: s.name,
          displayOrder: s.displayOrder,
          substations: s.substations ?? [],
        },
      ])
    );

    if (stationKeyToMeta.size === 0) {
      stationKeyToMeta.set("kitchen", {
        id: "kitchen",
        name: "kitchen",
        displayOrder: 0,
        substations: [],
      });
      // Fallback: location has no stations; "kitchen" avoids empty KDS. Admin should add stations.
    }

    const stations: KdsStation[] = Array.from(stationKeyToMeta.values())
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(({ id, name, displayOrder, substations }) => ({
        id,
        name,
        displayOrder,
        substations: substations.map((ss) => ({
          id: ss.id,
          key: ss.key,
          name: ss.name,
          displayOrder: ss.displayOrder,
        })),
      }));

    if (DEV) {
      // eslint-disable-next-line no-console
      console.log("[kds-routing] GET /api/kds/view", {
        locationId,
        stations: stations.map((s) => s.id),
      });
    }

    const tDelays = DEV ? performance.now() : 0;
    const delays: KdsDelay[] = computeKitchenDelaysFromOrderItems(
      itemRows.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        sentToKitchenAt: r.sentToKitchenAt,
        readyAt: r.readyAt,
        voidedAt: r.voidedAt,
        stationOverride: r.stationOverride,
      })),
      orderIdToStation,
      { warningMinutes: 10 }
    );
    if (DEV) devTimer("[kds] delays", tDelays);

    const tActions = DEV ? performance.now() : 0;
    const actions = computeKdsActions(kdsOrderItems);
    if (DEV) devTimer("[kds] actions", tActions);

    const view: KdsView = {
      location: { id: locationRow.id, name: locationRow.name ?? undefined },
      orders: kdsOrders,
      orderItems: kdsOrderItems,
      stations,
      delays,
      actions,
    };

    if (!isKdsView(view)) {
      return posFailure("INTERNAL_ERROR", "Invalid KdsView payload", { status: 500 });
    }

    if (DEV) devTimer("[kds] GET total", totalStart);
    return posSuccess(view);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load KDS view"),
      { status: 500 }
    );
  }
}
