/**
 * Reservations view contract — shape returned by getReservationsView and GET /api/reservations/view.
 * Server-read snapshot for the reservations shell and child views.
 */

import type { StoreReservation } from "@/store/types";
import type { WaitlistEntry } from "@/store/types";
import type { CapacitySlot } from "./buildCapacitySlots";

export type ReservationsViewConfig = {
  locationId: string;
  locationName: string;
  totalSeats: number;
  totalTables: number;
  servicePeriods: Array<{
    id: string;
    name: string;
    start: string;
    end: string;
  }>;
};

export type ReservationsView = {
  /** Location id for this snapshot */
  locationId: string;
  /** Reservations for the location (real DB data) */
  reservations: StoreReservation[];
  /** Waitlist entries for the location (real DB data) */
  waitlist: WaitlistEntry[];
  /** Location and service-period config from backend */
  config: ReservationsViewConfig;
  /** Real capacity slots (30-min) for today from sessions + reservations */
  capacitySlots: CapacitySlot[];
};
