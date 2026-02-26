"use server";

import { cookies } from "next/headers";

const LOCATION_COOKIE_NAME = "current_location";
const LOCATION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Sets the current location ID in a cookie for session-scoped location context.
 * Option C: Session + selector - no location in URL.
 */
export async function setCurrentLocationId(locationId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCATION_COOKIE_NAME, locationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: LOCATION_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Gets the current location ID from the session cookie.
 */
export async function getCurrentLocationId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCATION_COOKIE_NAME)?.value;
  return value && value.trim() !== "" ? value : null;
}
