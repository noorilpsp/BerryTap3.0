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
import { getTableLanesFromStore } from "@/lib/timeline-data";
import { getZonesFromTableLanes, type ReservationZone } from "@/lib/reservations/zones";
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
  sectionLabels?: Record<string, string>;
  floorplans?: Array<{ id: string; name: string; isActive: boolean }>;
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
    ...(c.sectionLabels ? { sectionLabels: c.sectionLabels } : {}),
    ...(c.floorplans ? { floorplans: c.floorplans } : {}),
  };
}

type ReservationsDataValue = {
  reservations: Reservation[];
  waitlistParties: WaitlistParty[];
  refresh: ReservationsRefreshFn;
  /** Real tables for the location (authoritative). */
  tables: import("@/store/types").StoreTable[];
  /** Timeline lanes derived from real tables. */
  tableLanes: ReturnType<typeof getTableLanesFromStore>;
  /** Canonical zone list derived from table lanes. */
  zones: ReservationZone[];
  /** Section id -> display name from Builder floor plan sections. */
  zoneLabels: Readonly<Record<string, string>>;
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
  const [reservationTables, setReservationTables] = useState(
    () => initialReservationsView?.tables ?? []
  );
  const storeData = useReservationsFromStore();
  const storeCapacitySlots = useRestaurantStore((s) => s.capacitySlots);
  const setReservations = useRestaurantStore((s) => s.setReservations);
  const setWaitlist = useRestaurantStore((s) => s.setWaitlist);
  const setCapacitySlots = useRestaurantStore((s) => s.setCapacitySlots);
  const storeTables = useRestaurantStore((s) => s.tables);
  const setTables = useRestaurantStore((s) => s.setTables);

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
    if (Array.isArray(initialReservationsView.tables)) {
      setReservationTables(initialReservationsView.tables);
      setTables(initialReservationsView.tables);
    }
    setHasSynced(true);
  }, [
    initialReservationsView,
    hasSynced,
    setReservations,
    setWaitlist,
    setCapacitySlots,
    setReservationTables,
    setTables,
  ]);

  useEffect(() => {
    if (!Array.isArray(initialReservationsView?.tables)) return;
    setReservationTables(initialReservationsView.tables);
  }, [initialReservationsView?.tables]);

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

  const effectiveTables = reservationTables.length > 0 ? reservationTables : storeTables;
  const tableLanes = useMemo(
    () => (effectiveTables.length > 0 ? getTableLanesFromStore(effectiveTables) : []),
    [effectiveTables]
  );
  const zoneLabels = useMemo(() => config.sectionLabels ?? {}, [config.sectionLabels]);
  const zones = useMemo(
    () => getZonesFromTableLanes(tableLanes, zoneLabels),
    [tableLanes, zoneLabels]
  );

  const value = useMemo<ReservationsDataValue>(() => {
    const data =
      initialMapped && !hasSynced ? initialMapped : storeData;
    return {
      ...data,
      refresh,
      config,
      capacitySlots,
      tables: effectiveTables,
      tableLanes,
      zones,
      zoneLabels,
    };
  }, [
    initialMapped,
    hasSynced,
    storeData.reservations,
    storeData.waitlistParties,
    refresh,
    config,
    capacitySlots,
    effectiveTables,
    tableLanes,
    zones,
    zoneLabels,
  ]);

  return (
    <ReservationsDataContext.Provider value={value}>
      {children}
    </ReservationsDataContext.Provider>
  );
}
