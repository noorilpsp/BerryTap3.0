"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "@/lib/contexts/LocationContext";
import { useRestaurantStore } from "@/store/restaurantStore";
import {
  mapReservationsViewToData,
  useReservationsFromStore,
  type Reservation,
  type WaitlistParty,
} from "@/lib/reservations-data";
import { refreshReservationsView } from "./refreshReservationsView";
import type { ReservationsView, ReservationsViewConfig } from "./reservationsView";
import { getDefaultCapacitySlots } from "./buildCapacitySlots";
import type { CapacitySlot } from "./buildCapacitySlots";

export type ReservationsRefreshFn = (silent?: boolean) => Promise<boolean>;

/** Config shape compatible with legacy restaurantConfig (name, totalSeats, servicePeriods with label). */
export type ReservationsConfigCompatible = {
  name: string;
  totalSeats: number;
  totalTables: number;
  servicePeriods: Array<{ id: string; name: string; label: string; start: string; end: string }>;
};

function toCompatibleConfig(c: ReservationsViewConfig): ReservationsConfigCompatible {
  return {
    name: c.locationName,
    totalSeats: c.totalSeats,
    totalTables: c.totalTables,
    servicePeriods: c.servicePeriods.map((p) => ({
      id: p.id,
      name: p.name,
      label: p.name,
      start: p.start,
      end: p.end,
    })),
  };
}

type ReservationsDataValue = {
  reservations: Reservation[];
  waitlistParties: WaitlistParty[];
  refresh: ReservationsRefreshFn;
  /** Real config from ReservationsView; minimal fallback only when config unavailable. */
  config: ReservationsConfigCompatible;
  /** Real capacity slots from engine; fallback when view has none. */
  capacitySlots: CapacitySlot[];
};

const ReservationsDataContext = createContext<ReservationsDataValue | null>(null);

export function useReservationsData(): ReservationsDataValue {
  const ctx = useContext(ReservationsDataContext);
  if (!ctx) {
    throw new Error("useReservationsData must be used within ReservationsDataProvider");
  }
  return ctx;
}

interface ReservationsDataProviderProps {
  initialReservationsView: ReservationsView | null;
  children: ReactNode;
}

/**
 * Provides reservations and waitlist data. Uses initialReservationsView for first
 * paint when available, syncs to store on mount, then uses store for reactivity
 * (mutations, refetch).
 */
export function ReservationsDataProvider({
  initialReservationsView,
  children,
}: ReservationsDataProviderProps) {
  const { currentLocationId } = useLocation();
  const [hasSynced, setHasSynced] = useState(false);
  const storeData = useReservationsFromStore();
  const storeCapacitySlots = useRestaurantStore((s) => s.capacitySlots);
  const setReservations = useRestaurantStore((s) => s.setReservations);
  const setWaitlist = useRestaurantStore((s) => s.setWaitlist);
  const setCapacitySlots = useRestaurantStore((s) => s.setCapacitySlots);

  const refresh = useCallback<ReservationsRefreshFn>(
    async (silent) => {
      if (!currentLocationId) return false;
      return refreshReservationsView(currentLocationId, { silent });
    },
    [currentLocationId]
  );

  const initialMapped = useMemo(
    () =>
      initialReservationsView
        ? mapReservationsViewToData(initialReservationsView)
        : null,
    [initialReservationsView]
  );

  useEffect(() => {
    if (!initialReservationsView || hasSynced) return;
    setReservations(initialReservationsView.reservations);
    setWaitlist(initialReservationsView.waitlist);
    setCapacitySlots(initialReservationsView.capacitySlots);
    setHasSynced(true);
  }, [
    initialReservationsView,
    hasSynced,
    setReservations,
    setWaitlist,
    setCapacitySlots,
  ]);

  const config = useMemo<ReservationsConfigCompatible>(() => {
    const c = initialReservationsView?.config;
    if (c) return toCompatibleConfig(c);
    return {
      name: "",
      totalSeats: 0,
      totalTables: 0,
      servicePeriods: [],
    };
  }, [initialReservationsView?.config]);

  const capacitySlots = useMemo<CapacitySlot[]>(() => {
    if (storeCapacitySlots.length > 0) return storeCapacitySlots as CapacitySlot[];
    const slots = initialReservationsView?.capacitySlots;
    if (slots && slots.length > 0) return slots;
    return getDefaultCapacitySlots(config.totalSeats || 78);
  }, [storeCapacitySlots, initialReservationsView?.capacitySlots, config.totalSeats]);

  const value = useMemo<ReservationsDataValue>(() => {
    const data =
      initialMapped && !hasSynced ? initialMapped : storeData;
    return { ...data, refresh, config, capacitySlots };
  }, [
    initialMapped,
    hasSynced,
    storeData.reservations,
    storeData.waitlistParties,
    refresh,
    config,
    capacitySlots,
  ]);

  return (
    <ReservationsDataContext.Provider value={value}>
      {children}
    </ReservationsDataContext.Provider>
  );
}
