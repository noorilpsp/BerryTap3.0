"use client";

import { useCallback } from "react";
import { useLocation } from "@/lib/contexts/LocationContext";
import { useRestaurantStore } from "@/store/restaurantStore";
import {
  addToWaitlist as addToWaitlistAction,
  removeFromWaitlist as removeFromWaitlistAction,
  updateWaitlistEntry as updateWaitlistEntryAction,
} from "@/app/actions/waitlist";
import { getWaitlistForLocation } from "@/app/actions/waitlist";
import {
  createReservation as createReservationAction,
  updateReservation as updateReservationAction,
  getReservationsForLocation,
} from "@/app/actions/reservations";
import type { StoreReservation } from "@/store/types";

/**
 * Mutation helpers that call server actions and refetch into the store.
 */
export function useRestaurantMutations() {
  const { currentLocationId } = useLocation();
  const setWaitlist = useRestaurantStore((s) => s.setWaitlist);
  const setReservations = useRestaurantStore((s) => s.setReservations);

  const refetchWaitlist = useCallback(async () => {
    if (!currentLocationId) return;
    const entries = await getWaitlistForLocation(currentLocationId);
    setWaitlist(entries);
  }, [currentLocationId, setWaitlist]);

  const addToWaitlist = useCallback(
    async (data: {
      guestName: string;
      partySize: number;
      phone?: string;
      notes?: string;
      waitTime?: string;
    }) => {
      if (!currentLocationId) throw new Error("No location selected");
      await addToWaitlistAction(currentLocationId, data);
      await refetchWaitlist();
    },
    [currentLocationId, refetchWaitlist]
  );

  const removeFromWaitlist = useCallback(
    async (id: string) => {
      if (!currentLocationId) throw new Error("No location selected");
      await removeFromWaitlistAction(currentLocationId, id);
      await refetchWaitlist();
    },
    [currentLocationId, refetchWaitlist]
  );

  const updateWaitlistEntry = useCallback(
    async (
      id: string,
      data: Partial<{
        guestName: string;
        partySize: number;
        phone: string;
        notes: string;
        waitTime: string;
      }>
    ) => {
      if (!currentLocationId) throw new Error("No location selected");
      await updateWaitlistEntryAction(currentLocationId, id, data);
      await refetchWaitlist();
    },
    [currentLocationId, refetchWaitlist]
  );

  const refetchReservations = useCallback(async () => {
    if (!currentLocationId) return;
    const list = await getReservationsForLocation(currentLocationId);
    setReservations(list);
  }, [currentLocationId, setReservations]);

  const createReservation = useCallback(
    async (data: {
      partySize: number;
      reservationDate: string;
      reservationTime: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      notes?: string;
      tableId?: string | null;
    }) => {
      if (!currentLocationId) throw new Error("No location selected");
      await createReservationAction(currentLocationId, data);
      await refetchReservations();
    },
    [currentLocationId, refetchReservations]
  );

  const updateReservation = useCallback(
    async (
      id: string,
      patch: Partial<{
        partySize: number;
        reservationDate: string;
        reservationTime: string;
        status: StoreReservation["status"];
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        notes: string;
        tableId: string | null;
      }>
    ) => {
      if (!currentLocationId) throw new Error("No location selected");
      await updateReservationAction(currentLocationId, id, patch);
      await refetchReservations();
    },
    [currentLocationId, refetchReservations]
  );

  return {
    addToWaitlist,
    removeFromWaitlist,
    updateWaitlistEntry,
    refetchWaitlist,
    createReservation,
    updateReservation,
    refetchReservations,
  };
}
