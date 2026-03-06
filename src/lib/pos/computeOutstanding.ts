/**
 * Pure helper for POS closeability/outstanding from already-loaded data.
 * No DB calls. Used by /api/tables/[id]/pos to avoid duplicate canCloseSession work.
 */
import { canCloseSession as canCloseSessionLogic } from "@/domain/serviceFlow";

export type UnfinishedItem = {
  id: string;
  itemName: string;
  status: string;
  quantity: number;
  orderId: string;
};

export type OutstandingResult =
  | { canClose: true }
  | {
      canClose: false;
      reason:
        | "session_not_open"
        | "unfinished_items"
        | "unpaid_balance"
        | "payment_in_progress"
        | "kitchen_mid_fire";
      unfinishedItems?: UnfinishedItem[];
      remaining?: number;
    };

const UNFINISHED_STATUSES = ["pending", "preparing", "ready"] as const;

export type MoneyAgg = {
  pendingCount: number;
  ordersTotal: number;
  paymentsTotal: number;
};

export type OrderRow = { id: string };

export type ItemRow = {
  id: string;
  orderId: string;
  itemName: string;
  status: string;
  quantity: number | null;
  voidedAt: Date | string | null;
  sentToKitchenAt: Date | string | null;
  startedAt: Date | string | null;
};

export function computeOutstanding(
  sessionStatus: string,
  orderRows: OrderRow[],
  itemRows: ItemRow[],
  moneyAgg: MoneyAgg,
  incomingPaymentAmount?: number
): OutstandingResult {
  if (sessionStatus !== "open") {
    return { canClose: false, reason: "session_not_open" };
  }

  if (orderRows.length === 0) {
    return { canClose: true };
  }

  const activeItems = itemRows.filter((i) => i.voidedAt == null);
  const unfinishedItems = activeItems.filter((i) =>
    UNFINISHED_STATUSES.includes(i.status as (typeof UNFINISHED_STATUSES)[number])
  );
  const kitchenMidFire = activeItems.some(
    (i) => i.sentToKitchenAt != null && i.startedAt == null
  );

  const hasPaymentInProgress = moneyAgg.pendingCount > 0;
  const sessionTotal = moneyAgg.ordersTotal;
  const paymentsTotal =
    moneyAgg.paymentsTotal +
    (Number.isFinite(incomingPaymentAmount) && incomingPaymentAmount >= 0
      ? incomingPaymentAmount
      : 0);
  const remaining = sessionTotal - paymentsTotal;
  const tolerance = 0.01;
  const hasUnpaidBalance = remaining > tolerance;

  const ctx = {
    sessionStatus,
    hasUnfinishedItems: unfinishedItems.length > 0,
    hasKitchenMidFire: kitchenMidFire,
    hasPaymentInProgress,
    hasUnpaidBalance,
  };

  const closeResult = canCloseSessionLogic(ctx);
  if (!closeResult.ok) {
    if (unfinishedItems.length > 0) {
      return {
        canClose: false,
        reason: "unfinished_items",
        unfinishedItems: unfinishedItems.map((i) => ({
          id: i.id,
          itemName: i.itemName,
          status: i.status,
          quantity: i.quantity ?? 1,
          orderId: i.orderId,
        })),
      };
    }
    if (kitchenMidFire) return { canClose: false, reason: "kitchen_mid_fire" };
    if (hasPaymentInProgress) return { canClose: false, reason: "payment_in_progress" };
    if (hasUnpaidBalance) {
      return {
        canClose: false,
        reason: "unpaid_balance",
        remaining: Math.round(remaining * 100) / 100,
      };
    }
    return { canClose: false, reason: "session_not_open" };
  }

  return { canClose: true };
}
