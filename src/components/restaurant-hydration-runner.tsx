"use client";

import { useRestaurantHydration } from "@/lib/hooks/useRestaurantHydration";

/**
 * Calls useRestaurantHydration to hydrate the restaurant store from Neon when location is set.
 * Renders nothing - just a side-effect runner.
 */
export function RestaurantHydrationRunner() {
  useRestaurantHydration();
  return null;
}
