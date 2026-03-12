"use client";

/**
 * Ops-level location menu. Consumes LocationMenuProvider (mounted under ops layout).
 * Menu data is fetched once per location and reused across table ↔ floor-map navigation.
 */
export {
  useLocationMenuContext as useLocationMenu,
} from "@/lib/contexts/LocationMenuContext";
