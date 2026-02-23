"use client"

import { useEffect } from "react"

/**
 * Sets data-ops-reservations and Inter font variable on html when on reservations route.
 * Enables global CSS overrides for Radix portal content (tooltips, selects, etc.)
 * that render in body outside the ops-reservations-root wrapper.
 */
export function OpsReservationsAttr({
  fontVariableClass,
}: {
  fontVariableClass?: string
}) {
  useEffect(() => {
    document.documentElement.dataset.opsReservations = "true"
    if (fontVariableClass) {
      document.documentElement.classList.add(...fontVariableClass.split(" "))
    }
    return () => {
      delete document.documentElement.dataset.opsReservations
      if (fontVariableClass) {
        document.documentElement.classList.remove(...fontVariableClass.split(" "))
      }
    }
  }, [fontVariableClass])
  return null
}
