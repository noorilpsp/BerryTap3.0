"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "@/lib/contexts/LocationContext";
import { useLocationMenu } from "@/lib/hooks/useLocationMenu";
import type { MenuItem, Category } from "@/lib/take-order-data";
import type { CounterView } from "@/lib/counter/counterView";
import { isCounterView } from "@/lib/counter/counterView";

/**
 * Counter menu data source. Provides location-scoped menu items and categories
 * in the shape expected by take-order UI components.
 *
 * Phase 2: Accepts initialCounterView from server; when present and location
 * matches, uses it immediately and skips blocking initial fetch. Refetch uses
 * /api/counter/view.
 */
export type UseCounterMenuOptions = {
  /** Initial data from server render. Skips blocking initial fetch when present. */
  initialCounterView?: CounterView | null;
};

export type CounterCustomizationGroup = {
  id: string;
  name: string;
  options?: Array<{ id: string; name: string; price: string | number }>;
};

export type UseCounterMenuResult = {
  menuItems: MenuItem[];
  categories: Category[];
  customizations: CounterCustomizationGroup[];
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  locationId: string | null;
  refetch: () => Promise<void>;
};

function useCounterMenuWithInitial(
  currentLocationId: string | null,
  initialCounterView: CounterView | null
): UseCounterMenuResult {
  const hasInitial =
    initialCounterView != null &&
    initialCounterView.location?.id != null &&
    currentLocationId === initialCounterView.location.id;

  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    hasInitial ? initialCounterView.menu.items : []
  );
  const [categories, setCategories] = useState<Category[]>(
    hasInitial ? initialCounterView.menu.categories : []
  );
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!currentLocationId) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/counter/view?locationId=${encodeURIComponent(currentLocationId)}`,
        { cache: "no-store", credentials: "include" }
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.ok === false || !isCounterView(payload?.data)) {
        const message =
          payload?.error?.message ??
          (typeof payload?.error === "string" ? payload.error : "Failed to load menu");
        setError(message);
        return;
      }
      setMenuItems(payload.data.menu.items);
      setCategories(payload.data.menu.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [currentLocationId]);

  useEffect(() => {
    if (!currentLocationId) {
      setMenuItems([]);
      setCategories([]);
      setLoading(false);
      setError(null);
      return;
    }
    if (hasInitial) return;
    void refetch();
  }, [currentLocationId, refetch, hasInitial]);

  return {
    menuItems,
    categories,
    customizations: (initialCounterView?.menu?.customizations ?? []) as CounterCustomizationGroup[],
    loading,
    error,
    hasLocation: !!currentLocationId,
    locationId: currentLocationId,
    refetch,
  };
}

export function useCounterMenu(
  options?: UseCounterMenuOptions
): UseCounterMenuResult {
  const { initialCounterView = null } = options ?? {};
  const { currentLocationId, loading: locationLoading } = useLocation();

  const hasValidInitial =
    initialCounterView != null &&
    initialCounterView.location?.id != null &&
    currentLocationId === initialCounterView.location.id;

  const withInitial = useCounterMenuWithInitial(
    currentLocationId,
    hasValidInitial ? initialCounterView : null
  );
  const fromContext = useLocationMenu();

  if (initialCounterView != null && currentLocationId != null && hasValidInitial) {
    return {
      ...withInitial,
      loading: locationLoading || withInitial.loading,
    };
  }

  return {
    menuItems: fromContext.menuItems,
    categories: fromContext.categories,
    customizations: (fromContext as { customizations?: CounterCustomizationGroup[] }).customizations ?? [],
    loading: locationLoading || fromContext.loading,
    error: fromContext.error ?? null,
    hasLocation: !!currentLocationId,
    locationId: currentLocationId,
    refetch: fromContext.refetch,
  };
}
