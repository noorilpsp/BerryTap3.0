/**
 * Client-side refresh of reservations view. Fetches from GET /api/reservations/view
 * and updates the restaurant store. Use for post-mutation refresh and manual revalidation.
 */

import { useRestaurantStore } from "@/store/restaurantStore";
import type { ReservationsView } from "./reservationsView";

function isReservationsView(v: unknown): v is ReservationsView {
  const x = v as ReservationsView;
  return (
    v != null &&
    typeof v === "object" &&
    typeof x.locationId === "string" &&
    Array.isArray(x.reservations) &&
    Array.isArray(x.waitlist) &&
    x.config != null &&
    typeof x.config === "object" &&
    typeof x.config.locationName === "string" &&
    Array.isArray(x.config.servicePeriods) &&
    Array.isArray(x.capacitySlots)
  );
}

/**
 * Fetch reservations view from API and update the store.
 * Returns true on success, false on failure. Safe to call from client only.
 */
export async function refreshReservationsView(
  locationId: string,
  _options?: { silent?: boolean }
): Promise<boolean> {
  if (!locationId?.trim()) return false;

  try {
    const res = await fetch(
      `/api/reservations/view?locationId=${encodeURIComponent(locationId)}`,
      { cache: "no-store" }
    );
    const payload = await res.json().catch(() => null);

    if (!res.ok || payload?.ok !== true || !isReservationsView(payload?.data)) {
      return false;
    }

    const view = payload.data as ReservationsView;
    const { setReservations, setWaitlist, setCapacitySlots } = useRestaurantStore.getState();
    setReservations(view.reservations);
    setWaitlist(view.waitlist);
    setCapacitySlots(view.capacitySlots);
    return true;
  } catch {
    return false;
  }
}
