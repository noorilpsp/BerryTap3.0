/**
 * Shared core logic for building OrdersView from locationId.
 * Used by getOrdersView (server page) and GET /api/orders/view.
 * Caller must have validated auth and location access.
 */

import { eq, and, inArray, isNull, ne, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, sessions } from "@/lib/db/schema/orders";
import { merchantLocations } from "@/lib/db/schema";
import type {
  OrdersView,
  OrdersUnifiedOrder,
  OrdersUnifiedStatus,
  OrdersWaveStatus,
  OrdersOrderSource,
  OrdersPaymentState,
  OrdersPaymentMethod,
} from "./ordersView";

const SECTION_LABELS: Record<string, string> = {
  main: "Main Dining",
  patio: "Patio",
  bar: "Bar Area",
  private: "Private Room",
};

function itemStatusToWaveStatus(s: string): OrdersWaveStatus {
  if (s === "served") return "served";
  if (s === "ready") return "ready";
  if (s === "preparing") return "cooking";
  return "held";
}

function mapDbItemStatus(s: string): string {
  if (s === "served") return "served";
  if (s === "ready") return "ready";
  if (s === "preparing") return "preparing";
  return s === "pending" ? "held" : "sent";
}

function mapOrderStatusToUnified(
  status: string,
  paymentStatus: string
): OrdersUnifiedStatus {
  if (status === "cancelled") return "voided";
  if (status === "completed") {
    return paymentStatus === "paid" ? "closed" : "served";
  }
  if (status === "ready") return "ready";
  if (status === "preparing") return "preparing";
  if (status === "confirmed" || status === "pending") return "sent";
  return "sent";
}

function mapTableStatusToBilling(status: string): boolean {
  return status === "billing" || status === "closed";
}

export async function buildOrdersView(locationId: string): Promise<OrdersView | null> {
  const locationRow = await db.query.merchantLocations.findFirst({
    where: eq(merchantLocations.id, locationId),
    columns: { id: true, name: true },
  });
  if (!locationRow) return null;

  const locationName = locationRow.name ?? "Restaurant";

  const [openSessions, standaloneOrders] = await Promise.all([
    db.query.sessions.findMany({
      where: and(
        eq(sessions.locationId, locationId),
        eq(sessions.status, "open")
      ),
      columns: { id: true, tableId: true, guestCount: true, openedAt: true },
      with: {
        table: {
          columns: { id: true, tableNumber: true, displayId: true, section: true, status: true },
        },
      },
    }),
    db.query.orders.findMany({
      where: and(
        eq(orders.locationId, locationId),
        isNull(orders.sessionId),
        inArray(orders.orderType, ["pickup", "delivery"])
      ),
      orderBy: [desc(orders.updatedAt)],
      columns: {
        id: true,
        orderNumber: true,
        orderType: true,
        status: true,
        paymentStatus: true,
        total: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        customer: { columns: { name: true } },
      },
      limit: 100,
    }),
  ]);

  const tableOrders: OrdersUnifiedOrder[] = [];
  const sessionIds = openSessions.map((s) => s.id);

  if (sessionIds.length > 0) {
    const sessionOrders = await db.query.orders.findMany({
      where: and(
        inArray(orders.sessionId, sessionIds),
        ne(orders.status, "cancelled")
      ),
      orderBy: orders.wave,
      columns: {
        id: true,
        sessionId: true,
        wave: true,
        firedAt: true,
        status: true,
        total: true,
        updatedAt: true,
      },
    });

    const sessionOrderIds = sessionOrders.map((o) => o.id);
    const sessionOrderItems =
      sessionOrderIds.length > 0
        ? await db
            .select({
              orderId: orderItems.orderId,
              id: orderItems.id,
              itemName: orderItems.itemName,
              quantity: orderItems.quantity,
              status: orderItems.status,
              voidedAt: orderItems.voidedAt,
            })
            .from(orderItems)
            .where(inArray(orderItems.orderId, sessionOrderIds))
        : [];

    const ordersBySession = new Map<string, typeof sessionOrders>();
    for (const o of sessionOrders) {
      if (o.sessionId) {
        const list = ordersBySession.get(o.sessionId) ?? [];
        list.push(o);
        ordersBySession.set(o.sessionId, list);
      }
    }

    const itemsByOrderId = new Map<string, typeof sessionOrderItems>();
    for (const i of sessionOrderItems) {
      if (i.voidedAt) continue;
      const list = itemsByOrderId.get(i.orderId) ?? [];
      list.push(i);
      itemsByOrderId.set(i.orderId, list);
    }

    for (const sess of openSessions) {
      const table = sess.table;
      if (!table) continue;
      const tableNum = table.tableNumber?.match(/^[A-Za-z]*(\d+)$/)?.[1] ?? "?";
      const label = `T${tableNum}`;
      const sectionLabel = SECTION_LABELS[table.section ?? "main"] ?? table.section ?? "Main";
      const guestCount = sess.guestCount ?? 0;
      const guestLabel = `${guestCount} guest${guestCount === 1 ? "" : "s"}`;
      const openedAt = sess.openedAt?.getTime() ?? Date.now();
      const tableStatus = table.status ?? "active";

      const sessOrders = (ordersBySession.get(sess.id) ?? []).sort(
        (a, b) => (a.wave ?? 1) - (b.wave ?? 1)
      );

      const waves: Array<{ number: number; status: OrdersWaveStatus }> = [];
      const allItems: Array<{ id: string; name: string; qty: number; status: string }> = [];
      let total = 0;

      for (const o of sessOrders) {
        const waveNum = o.wave ?? 1;
        const items = itemsByOrderId.get(o.id) ?? [];
        const statuses = items.map((i) => itemStatusToWaveStatus(i.status));
        let waveStatus: OrdersWaveStatus = "held";
        if (o.firedAt) {
          if (statuses.every((s) => s === "served")) waveStatus = "served";
          else if (statuses.some((s) => s === "ready")) waveStatus = "ready";
          else if (statuses.some((s) => s === "cooking")) waveStatus = "cooking";
          else waveStatus = "fired";
        } else {
          waveStatus = "held";
        }
        waves.push({ number: waveNum, status: waveStatus });
        for (const it of items) {
          allItems.push({
            id: it.id,
            name: it.itemName ?? "",
            qty: it.quantity ?? 1,
            status: mapDbItemStatus(it.status),
          });
        }
        total += parseFloat(String(o.total ?? 0)) || 0;
      }

      let status: OrdersUnifiedStatus;
      if (waves.some((w) => w.status === "ready")) status = "ready";
      else if (waves.some((w) => w.status === "cooking")) status = "preparing";
      else if (waves.some((w) => w.status === "fired") || waves.some((w) => w.status === "held"))
        status = "sent";
      else if (waves.every((w) => w.status === "served"))
        status = mapTableStatusToBilling(tableStatus) ? "closed" : "served";
      else status = "sent";

      const lastUpdated =
        sessOrders.length > 0
          ? Math.max(...sessOrders.map((o) => o.updatedAt?.getTime() ?? 0))
          : openedAt;

      tableOrders.push({
        id: `table-${table.id}`,
        source: "table",
        label,
        sectionLabel,
        guestLabel,
        status,
        createdAt: openedAt,
        updatedAt: lastUpdated,
        total,
        itemCount: allItems.length,
        items: allItems,
        waves,
        tableId: table.id,
        sessionId: sess.id,
      });
    }
  }

  const standaloneOrderIds = standaloneOrders.map((o) => o.id);
  let standaloneItems: Array<{
    orderId: string;
    id: string;
    itemName: string | null;
    quantity: number | null;
    status: string;
    voidedAt: Date | null;
  }> = [];

  if (standaloneOrderIds.length > 0) {
    standaloneItems = await db
      .select({
        orderId: orderItems.orderId,
        id: orderItems.id,
        itemName: orderItems.itemName,
        quantity: orderItems.quantity,
        status: orderItems.status,
        voidedAt: orderItems.voidedAt,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, standaloneOrderIds));
  }

  const itemsByStandaloneOrder = new Map<
    string,
    Array<{ id: string; name: string; qty: number; status: string }>
  >();
  for (const i of standaloneItems) {
    if (i.voidedAt) continue;
    const list = itemsByStandaloneOrder.get(i.orderId) ?? [];
    list.push({
      id: i.id,
      name: i.itemName ?? "",
      qty: i.quantity ?? 1,
      status: mapDbItemStatus(i.status),
    });
    itemsByStandaloneOrder.set(i.orderId, list);
  }

  const counterOrders: OrdersUnifiedOrder[] = standaloneOrders.map((o) => {
    const items = itemsByStandaloneOrder.get(o.id) ?? [];
    const paymentStatus = (o.paymentStatus ?? "unpaid") as string;
    const status = mapOrderStatusToUnified(o.status, paymentStatus);
    const source: OrdersOrderSource =
      o.orderType === "pickup" ? "pickup" : "dine_in_no_table";
    const prefix = o.orderType === "pickup" ? "PU" : "DI";
    const code = o.orderNumber?.toUpperCase().startsWith(prefix)
      ? o.orderNumber
      : `${prefix}-${o.orderNumber?.slice(-3) ?? o.id.slice(0, 6)}`;
    const customerName = o.customer?.name ?? "Guest";
    const paymentState: OrdersPaymentState =
      paymentStatus === "paid" ? "paid" : "unpaid";

    return {
      id: `order-${o.id}`,
      source,
      label: code,
      sectionLabel: source === "pickup" ? "Pickup" : "Dine-In",
      guestLabel: customerName,
      status,
      createdAt: o.createdAt?.getTime() ?? 0,
      updatedAt: o.updatedAt?.getTime() ?? 0,
      total: parseFloat(String(o.total ?? 0)) || 0,
      itemCount: items.length,
      items,
      waves: [],
      orderId: o.id,
      note: o.notes ?? undefined,
      paymentState,
      paymentMethod: null as OrdersPaymentMethod,
    };
  });

  const allOrders = [...tableOrders, ...counterOrders].sort(
    (a, b) => a.createdAt - b.createdAt
  );

  return {
    locationId,
    locationName,
    orders: allOrders,
  };
}
