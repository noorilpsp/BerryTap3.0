"use client";

import { useCallback } from "react";
import { useLocation } from "@/lib/contexts/LocationContext";
import {
  addToWaitlist as addToWaitlistAction,
  removeFromWaitlist as removeFromWaitlistAction,
  updateWaitlistEntry as updateWaitlistEntryAction,
  seatFromWaitlist as seatFromWaitlistAction,
} from "@/app/actions/waitlist";
import {
  createReservation as createReservationAction,
  updateReservation as updateReservationAction,
  deleteReservation as deleteReservationAction,
  seatReservation as seatReservationAction,
} from "@/app/actions/reservations";
import { refreshReservationsView } from "@/lib/reservations/refreshReservationsView";
import { postSeatingInvalidate } from "@/lib/view-cache";
import type { StoreReservation } from "@/store/types";

/**
 * Mutation helpers that call server actions and refetch via the shared view path.
 */
export function useRestaurantMutations() {
  const { currentLocationId } = useLocation();

  const refreshView = useCallback(async () => {
    if (!currentLocationId) return;
    await refreshReservationsView(currentLocationId);
  }, [currentLocationId]);

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
      await refreshView();
    },
    [currentLocationId, refreshView]
  );

  const removeFromWaitlist = useCallback(
    async (id: string) => {
      if (!currentLocationId) throw new Error("No location selected");
      await removeFromWaitlistAction(currentLocationId, id);
      await refreshView();
    },
    [currentLocationId, refreshView]
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
      await refreshView();
    },
    [currentLocationId, refreshView]
  );

  const refetchReservations = useCallback(
    async () => {
      if (!currentLocationId) return;
      await refreshReservationsView(currentLocationId);
    },
    [currentLocationId]
  );

  const refetchWaitlist = useCallback(
    async () => {
      if (!currentLocationId) return;
      await refreshReservationsView(currentLocationId);
    },
    [currentLocationId]
  );

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
      customerId?: string | null;
    }) => {
      if (!currentLocationId) throw new Error("No location selected");
      await createReservationAction(currentLocationId, data);
      await refreshView();
    },
    [currentLocationId, refreshView]
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
        customerId: string | null;
        notes: string;
        tableId: string | null;
      }>
    ) => {
      if (!currentLocationId) throw new Error("No location selected");
      await updateReservationAction(currentLocationId, id, patch);
      await refreshView();
    },
    [currentLocationId, refreshView]
  );

  const deleteReservation = useCallback(
    async (id: string) => {
      if (!currentLocationId) throw new Error("No location selected");
      await deleteReservationAction(currentLocationId, id);
      await refreshView();
    },
    [currentLocationId, refreshView]
  );

  const seatFromWaitlist = useCallback(
    async (waitlistEntryId: string, tableUuid: string) => {
      if (!currentLocationId) throw new Error("No location selected");
      const result = await seatFromWaitlistAction(
        currentLocationId,
        waitlistEntryId,
        tableUuid
      );
      if (!result.ok) throw new Error(result.reason);
      await refreshView();
      postSeatingInvalidate(currentLocationId, result.tableId);
      return {
        reservationId: result.reservationId,
        sessionId: result.sessionId,
        tableId: result.tableId,
      };
    },
    [currentLocationId, refreshView]
  );

  const seatReservation = useCallback(
    async (reservationId: string, tableUuid?: string | null) => {
      if (!currentLocationId) throw new Error("No location selected");
      const result = await seatReservationAction(
        currentLocationId,
        reservationId,
        tableUuid
      );
      if (!result.ok) throw new Error(result.reason);
      await refreshView();
      postSeatingInvalidate(currentLocationId, result.tableId);
      return { sessionId: result.sessionId, tableId: result.tableId };
    },
    [currentLocationId, refreshView]
  );

  return {
    addToWaitlist,
    removeFromWaitlist,
    updateWaitlistEntry,
    seatFromWaitlist,
    refetchWaitlist,
    createReservation,
    updateReservation,
    deleteReservation,
    seatReservation,
    refetchReservations,
  };
}
