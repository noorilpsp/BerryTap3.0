/**
 * Build API payload and submit counter order via POST /api/orders.
 * Maps counter draft lines to CreateOrderFromApi input shape.
 */

import type { CounterCustomizationGroup } from "./useCounterMenu";
import type { MenuItem } from "@/lib/take-order-data";

export type DraftLineForSubmit = {
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  options: Record<string, string>;
  extras: string[];
  note: string;
};

type ResolvedCustomization = {
  groupId: string;
  optionId: string;
  groupName: string;
  optionName: string;
  optionPrice: number;
  quantity: number;
};

function resolveCustomizations(
  line: DraftLineForSubmit,
  menuItem: MenuItem | undefined,
  customizations: CounterCustomizationGroup[]
): ResolvedCustomization[] {
  const result: ResolvedCustomization[] = [];
  const groupByName = new Map(customizations.map((g) => [g.name, g]));

  for (const [groupName, selectedValue] of Object.entries(line.options)) {
    if (!selectedValue?.trim()) continue;
    const group = groupByName.get(groupName);
    if (!group?.options?.length) continue;

    const opt = group.options.find((o) => {
      const val = selectedValue.trim();
      return o.name === val || o.name.toLowerCase() === val.toLowerCase();
    });
    if (!opt) continue;

    const price = typeof opt.price === "string" ? parseFloat(opt.price) : Number(opt.price);
    result.push({
      groupId: group.id,
      optionId: opt.id,
      groupName: group.name,
      optionName: opt.name,
      optionPrice: Number.isFinite(price) ? price : 0,
      quantity: 1,
    });
  }

  for (const extraName of line.extras) {
    if (!extraName?.trim()) continue;
    for (const group of customizations) {
      const opt = group.options?.find(
        (o) =>
          o.name === extraName.trim() ||
          o.name.toLowerCase() === extraName.trim().toLowerCase()
      );
      if (opt) {
        const price = typeof opt.price === "string" ? parseFloat(opt.price) : Number(opt.price);
        result.push({
          groupId: group.id,
          optionId: opt.id,
          groupName: group.name,
          optionName: opt.name,
          optionPrice: Number.isFinite(price) ? price : 0,
          quantity: 1,
        });
        break;
      }
    }
  }

  return result;
}

export type SubmitCounterOrderInput = {
  locationId: string;
  serviceType: "pickup" | "dine_in_no_table";
  customerName: string;
  customerPhone: string;
  orderNote: string;
  draftLines: DraftLineForSubmit[];
  menuItems: MenuItem[];
  customizations: CounterCustomizationGroup[];
  payment: {
    method: "card" | "cash" | "tap" | "other";
    total: number;
  };
  idempotencyKey: string;
};

export type SubmitCounterOrderResult =
  | { ok: true; orderId: string; orderNumber?: string }
  | { ok: false; reason: string };

/**
 * Submit counter order to backend. Creates order then records payment.
 * Both pickup and dine_in_no_table map to orderType "pickup" (no table, goes to kitchen on create).
 */
export async function submitCounterOrder(
  input: SubmitCounterOrderInput
): Promise<SubmitCounterOrderResult> {
  const orderType: "pickup" = "pickup";
  const paymentTiming: "pay_first" = "pay_first";

  const menuItemMap = new Map(input.menuItems.map((m) => [m.id, m]));
  const items = input.draftLines.map((line) => {
    const menuItem = menuItemMap.get(line.menuItemId);
    const custRows = resolveCustomizations(
      line,
      menuItem,
      input.customizations
    );
    return {
      itemId: line.menuItemId,
      itemName: line.name,
      itemPrice: line.unitPrice,
      quantity: line.qty,
      notes: line.note?.trim() || null,
      waveNumber: 1,
      customizations: custRows.map((c) => ({
        groupId: c.groupId,
        optionId: c.optionId,
        groupName: c.groupName,
        optionName: c.optionName,
        optionPrice: c.optionPrice,
        quantity: c.quantity,
      })),
    };
  });

  const notesParts: string[] = [];
  if (input.orderNote?.trim()) notesParts.push(input.orderNote.trim());
  if (input.customerName?.trim()) notesParts.push(`Customer: ${input.customerName.trim()}`);
  if (input.customerPhone?.trim()) notesParts.push(`Phone: ${input.customerPhone.trim()}`);
  if (input.serviceType === "dine_in_no_table") notesParts.push("(Dine-in, no table)");

  const orderRes = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    credentials: "include",
    body: JSON.stringify({
      locationId: input.locationId,
      orderType,
      paymentTiming,
      notes: notesParts.length > 0 ? notesParts.join("\n") : null,
      guestCount: 1,
      items,
      eventSource: "counter",
    }),
  });

  const orderPayload = await orderRes.json().catch(() => null);
  if (!orderRes.ok || orderPayload?.ok === false) {
    const msg =
      orderPayload?.error?.message ??
      (typeof orderPayload?.error === "string" ? orderPayload.error : null) ??
      `Order failed (${orderRes.status})`;
    return { ok: false, reason: msg };
  }

  const orderId = orderPayload?.data?.orderId ?? orderPayload?.data?.order?.id;
  if (!orderId) {
    return { ok: false, reason: "No order ID in response" };
  }

  const paymentMethod = input.payment.method === "tap" ? "card" : input.payment.method;
  const paymentRes = await fetch(`/api/orders/${orderId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `${input.idempotencyKey}-payment`,
    },
    credentials: "include",
    body: JSON.stringify({
      amount: input.payment.total,
      tipAmount: 0,
      method: paymentMethod,
    }),
  });

  const paymentPayload = await paymentRes.json().catch(() => null);
  if (!paymentRes.ok || paymentPayload?.ok === false) {
    return {
      ok: false,
      reason:
        paymentPayload?.error?.message ??
        (typeof paymentPayload?.error === "string" ? paymentPayload.error : "Payment record failed"),
    };
  }

  const orderNumber = orderPayload?.data?.order?.orderNumber ?? orderPayload?.data?.orderNumber;
  return {
    ok: true,
    orderId,
    orderNumber: typeof orderNumber === "string" ? orderNumber : undefined,
  };
}
