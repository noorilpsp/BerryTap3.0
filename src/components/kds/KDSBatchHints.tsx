"use client";

import { useState } from "react";
import { Button } from "@/components/kds/ui/button";

export interface BatchSuggestion {
  itemName: string;
  variant: string | null;
  totalQuantity: number;
  orderCount: number;
  orderIds: string[];
}

export function batchKey(b: BatchSuggestion): string {
  return `${b.itemName}|${b.variant ?? ""}`;
}

/** Detect items that appear in 3+ orders (NEW column) for batching. */
export function detectBatches(
  orders: Array<{ id: string; items: Array<{ name: string; variant: string | null; quantity: number }> }>,
  threshold = 3
): BatchSuggestion[] {
  const itemCounts = new Map<
    string,
    { quantity: number; orderIds: Set<string> }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.name}|${item.variant ?? ""}`;
      const existing = itemCounts.get(key) ?? {
        quantity: 0,
        orderIds: new Set<string>(),
      };
      existing.quantity += item.quantity;
      existing.orderIds.add(order.id);
      itemCounts.set(key, existing);
    });
  });

  const batches: BatchSuggestion[] = [];
  itemCounts.forEach((data, key) => {
    if (data.orderIds.size >= threshold) {
      const [name, variantStr] = key.split("|");
      const variant = variantStr === "" ? null : variantStr;
      batches.push({
        itemName: name,
        variant,
        totalQuantity: data.quantity,
        orderCount: data.orderIds.size,
        orderIds: Array.from(data.orderIds),
      });
    }
  });

  return batches.sort((a, b) => b.totalQuantity - a.totalQuantity);
}

interface KDSBatchHintsProps {
  batches: BatchSuggestion[];
  dismissedKeys: Set<string>;
  onDismiss: (key: string) => void;
  onHighlight: (batch: BatchSuggestion) => void;
  /** Resolve order id to display label (e.g. "#1234 (T-5)") for single-batch banner */
  getOrderLabel?: (orderId: string) => string;
}

export function KDSBatchHints({
  batches,
  dismissedKeys,
  onDismiss,
  onHighlight,
  getOrderLabel,
}: KDSBatchHintsProps) {
  const [hideAll, setHideAll] = useState(false);
  const visible = batches.filter((b) => !dismissedKeys.has(batchKey(b)));
  if (visible.length === 0 || hideAll) return null;

  const singleBatch = visible.length === 1 ? visible[0] : null;
  const key = singleBatch ? batchKey(singleBatch) : "";

  return (
    <div className="shrink-0 border-b border-border bg-amber-50/80 dark:bg-amber-950/30">
      {singleBatch ? (
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xl shrink-0" aria-hidden>
              💡
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-amber-900 dark:text-amber-100">
                BATCH SUGGESTION
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                {singleBatch.itemName}
                {singleBatch.variant ? ` (${singleBatch.variant})` : ""} ×{" "}
                {singleBatch.totalQuantity} across {singleBatch.orderCount} orders
              </div>
              {getOrderLabel && singleBatch.orderIds.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  Orders:{" "}
                  {singleBatch.orderIds.map(getOrderLabel).join(", ")}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(key)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => onHighlight(singleBatch)}
            >
              Highlight Orders
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-semibold text-amber-900 dark:text-amber-100 text-sm uppercase tracking-wide">
              💡 BATCH SUGGESTIONS ({visible.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setHideAll(true)}
            >
              Hide
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {visible.map((batch) => {
              const k = batchKey(batch);
              return (
                <div
                  key={k}
                  className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {batch.itemName}
                      {batch.variant ? ` (${batch.variant})` : ""} ×{" "}
                      {batch.totalQuantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {batch.orderCount} orders
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => onDismiss(k)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => onHighlight(batch)}
                    >
                      Highlight
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
