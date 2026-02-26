"use client";

import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/contexts/LocationContext";
import { useRestaurantStore } from "@/store/restaurantStore";
import { getTablesForLocation, getTablesForFloorPlan } from "@/app/actions/tables";
import { getReservationsForLocation } from "@/app/actions/reservations";
import { getWaitlistForLocation } from "@/app/actions/waitlist";
import { getActiveFloorPlan, getConvertedTablesForFloorPlan } from "@/app/actions/floor-plans";

/**
 * Hydrates the restaurant Zustand store from Neon when currentLocationId is set.
 * Call this from layouts or pages that use the restaurant store and have LocationProvider.
 */
export function useRestaurantHydration() {
  const { currentLocationId, loading: locationLoading } = useLocation();
  const setTables = useRestaurantStore((s) => s.setTables);
  const setReservations = useRestaurantStore((s) => s.setReservations);
  const setWaitlist = useRestaurantStore((s) => s.setWaitlist);
  const lastLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (locationLoading || !currentLocationId || currentLocationId.trim() === "") {
      if (!currentLocationId && lastLocationRef.current) {
        lastLocationRef.current = null;
      }
      return;
    }

    if (lastLocationRef.current === currentLocationId) {
      return;
    }
    lastLocationRef.current = currentLocationId;

    let cancelled = false;

    async function hydrate() {
      try {
        const [allTables, reservations, waitlist, activeFloorPlan] = await Promise.all([
          getTablesForLocation(currentLocationId!),
          getReservationsForLocation(currentLocationId!),
          getWaitlistForLocation(currentLocationId!),
          getActiveFloorPlan(currentLocationId!),
        ]);

        if (cancelled) return;

        setReservations(reservations);
        setWaitlist(waitlist);

        if (activeFloorPlan && activeFloorPlan.elements.length > 0) {
          const planTables = await getTablesForFloorPlan(currentLocationId!, activeFloorPlan.id);
          const toSet = planTables.length > 0
            ? planTables
            : await getConvertedTablesForFloorPlan(currentLocationId!, activeFloorPlan.id);
          setTables(toSet.length > 0 ? toSet : allTables);
        } else {
          setTables(allTables);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useRestaurantHydration] Error:", err);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    currentLocationId,
    locationLoading,
    setTables,
    setReservations,
    setWaitlist,
  ]);
}
