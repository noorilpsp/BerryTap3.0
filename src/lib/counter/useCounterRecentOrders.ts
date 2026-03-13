"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const COUNTER_RECENT_ORDERS_POLL_MS = 30_000;

export type CounterRecentOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName?: string | null;
  itemsCount: number;
};

export type UseCounterRecentOrdersResult = {
  orders: CounterRecentOrder[];
  loading: boolean;
  error: string | null;
  refresh: (silent?: boolean) => Promise<void>;
};

/**
 * Fetches recent pickup orders for the counter. Uses existing GET /api/orders.
 * Supports manual refresh and light polling when tab visible.
 */
export function useCounterRecentOrders(
  locationId: string | null
): UseCounterRecentOrdersResult {
  const [orders, setOrders] = useState<CounterRecentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const refresh = useCallback(
    async (silent = false) => {
      if (!locationId) {
        setOrders([]);
        setError(null);
        return;
      }
      if (loadingRef.current) return;
      loadingRef.current = true;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/orders?locationId=${encodeURIComponent(locationId)}&orderType=pickup`,
          { cache: "no-store", credentials: "include" }
        );
        const payload = await res.json().catch(() => null);
        if (!res.ok || payload?.ok === false) {
          const msg =
            payload?.error?.message ??
            (typeof payload?.error === "string" ? payload.error : "Failed to load orders");
          setError(msg);
          setOrders([]);
          return;
        }
        const list = Array.isArray(payload?.data?.orders) ? payload.data.orders : [];
        setOrders(
          list.slice(0, 20).map((o: Record<string, unknown>) => ({
            id: String(o.id ?? ""),
            orderNumber: String(o.orderNumber ?? ""),
            total: Number(o.total ?? 0),
            status: String(o.status ?? ""),
            paymentStatus: String(o.paymentStatus ?? ""),
            createdAt: String(o.createdAt ?? ""),
            customerName: (o.customer as { name?: string } | null)?.name ?? null,
            itemsCount: Number(o.itemsCount ?? 0),
          }))
        );
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [locationId]
  );

  useEffect(() => {
    if (!locationId) {
      setOrders([]);
      setError(null);
      return;
    }
    void refresh(false);
  }, [locationId, refresh]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && locationId) void refresh(true);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [locationId, refresh]);

  useEffect(() => {
    if (!locationId) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refresh(true);
    }, COUNTER_RECENT_ORDERS_POLL_MS);
    return () => clearInterval(id);
  }, [locationId, refresh]);

  return { orders, loading, error, refresh };
}
