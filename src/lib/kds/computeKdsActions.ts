/**
 * Pure helper: compute per-item action flags from orderItems using domain validators.
 * No DB access. Used by GET /api/kds/view.
 */

import {
  canMarkItemPreparing,
  canMarkItemReady,
  canServeItem,
} from "@/domain/serviceFlow";
import type { KdsOrderItem, KdsActions } from "@/lib/kds/kdsView";

export function computeKdsActions(orderItems: KdsOrderItem[]): KdsActions {
  const actions: KdsActions = {};
  for (const item of orderItems) {
    if (item.voidedAt != null) continue;
    const preparing = canMarkItemPreparing({
      status: item.status,
      voidedAt: item.voidedAt ?? null,
    });
    const ready = canMarkItemReady({
      status: item.status,
      voidedAt: item.voidedAt ?? null,
    });
    const served = canServeItem({
      status: item.status,
      voidedAt: item.voidedAt ?? null,
    });
    actions[item.id] = {
      canMarkPreparing: preparing.ok,
      canMarkReady: ready.ok,
      canMarkServed: served.ok,
    };
  }
  return actions;
}
