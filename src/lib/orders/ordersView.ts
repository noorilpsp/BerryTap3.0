/**
 * Orders view contract — shape returned by getOrdersView and GET /api/orders/view.
 * Unified read model for the Orders ops page (table + pickup + delivery).
 */

export type OrdersOrderSource = "table" | "pickup" | "dine_in_no_table";

export type OrdersUnifiedStatus =
  | "sent"
  | "preparing"
  | "ready"
  | "served"
  | "closed"
  | "voided"
  | "refunded";

export type OrdersWaveStatus = "served" | "ready" | "cooking" | "fired" | "held" | "not_started";

export type OrdersPaymentState = "paid" | "unpaid";

export type OrdersPaymentMethod = "card" | "cash" | "other" | null;

export interface OrdersUnifiedOrder {
  id: string;
  source: OrdersOrderSource;
  /** Table number (T12), order code (PU-240), or DI-410 */
  label: string;
  sectionLabel: string;
  guestLabel: string;
  status: OrdersUnifiedStatus;
  createdAt: number;
  updatedAt: number;
  total: number;
  itemCount: number;
  items: Array<{ id: string; name: string; qty: number; status: string }>;
  waves: Array<{ number: number; status: OrdersWaveStatus }>;
  /** For table: table UUID (for /table/[id] nav). */
  tableId?: string;
  /** For table: session UUID (for fire wave mutation). */
  sessionId?: string;
  /** For pickup/delivery: order id for mutations */
  orderId?: string;
  note?: string;
  paymentState?: OrdersPaymentState;
  paymentMethod?: OrdersPaymentMethod;
}

export interface OrdersView {
  locationId: string;
  locationName: string;
  orders: OrdersUnifiedOrder[];
}

export function isOrdersView(x: unknown): x is OrdersView {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.locationId === "string" &&
    typeof o.locationName === "string" &&
    Array.isArray(o.orders)
  );
}
