"use server";

import { cookies } from "next/headers";

const COOKIE_PREFIX = "floor_map_floorplan_";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function getCookieName(locationId: string): string {
  return `${COOKIE_PREFIX}${locationId}`;
}

export async function setLastViewedFloorMapFloorplanId(
  locationId: string,
  floorplanId: string | null
): Promise<void> {
  if (!locationId?.trim()) return;
  const cookieStore = await cookies();
  const name = getCookieName(locationId);

  if (!floorplanId?.trim()) {
    cookieStore.delete(name);
    return;
  }

  cookieStore.set(name, floorplanId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getLastViewedFloorMapFloorplanId(
  locationId: string
): Promise<string | null> {
  if (!locationId?.trim()) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(getCookieName(locationId))?.value;
  return value?.trim() ? value : null;
}
