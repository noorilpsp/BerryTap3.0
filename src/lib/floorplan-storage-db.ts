"use client";

import type { PlacedElement, FloorSection } from "./floorplan-types";
import {
  getFloorPlansForLocation,
  getActiveFloorPlan,
  saveFloorPlan,
  setActiveFloorPlanId,
  deleteFloorPlan,
  getConvertedTablesForFloorPlan,
  getUsedTableNumbersForPlan,
  type FloorPlanResult,
} from "@/app/actions/floor-plans";
import { getTablesForFloorPlan } from "@/app/actions/tables";

export type SavedFloorplan = FloorPlanResult;

/**
 * Async floor plan storage using Neon server actions.
 * Requires locationId from LocationContext.
 */

export async function saveFloorplanDb(
  locationId: string,
  name: string,
  elements: PlacedElement[],
  gridSize: number,
  totalSeats: number,
  existingId?: string,
  sections?: FloorSection[]
): Promise<{ id: string; tables: Awaited<ReturnType<typeof saveFloorPlan>>["tables"] }> {
  const { id, tables } = await saveFloorPlan(locationId, {
    name,
    elements,
    sections,
    gridSize,
    totalSeats,
    isActive: true,
    existingId,
  });
  return { id, tables };
}

export async function getAllFloorplansDb(
  locationId: string
): Promise<SavedFloorplan[]> {
  return getFloorPlansForLocation(locationId);
}

export async function getActiveFloorplanDb(
  locationId: string
): Promise<SavedFloorplan | null> {
  return getActiveFloorPlan(locationId);
}

export async function setActiveFloorplanIdDb(
  locationId: string,
  id: string | null
): Promise<void> {
  await setActiveFloorPlanId(locationId, id);
}

export async function getConvertedTablesForFloorplanDb(
  locationId: string,
  floorPlanId: string
) {
  return getConvertedTablesForFloorPlan(locationId, floorPlanId);
}

/** Get table numbers used by other plans and in DB. For builder inspector. */
export async function getUsedTableNumbersForPlanDb(
  locationId: string,
  floorPlanId: string | null
): Promise<number[]> {
  return getUsedTableNumbersForPlan(locationId, floorPlanId);
}

/** Get tables from DB for a floor plan. Falls back to converted if none in DB. */
export async function getTablesForFloorplanDb(
  locationId: string,
  floorPlanId: string
) {
  const fromDb = await getTablesForFloorPlan(locationId, floorPlanId);
  if (fromDb.length > 0) return fromDb;
  return getConvertedTablesForFloorPlan(locationId, floorPlanId);
}

export async function deleteFloorplanDb(
  locationId: string,
  id: string
): Promise<void> {
  await deleteFloorPlan(locationId, id);
}
