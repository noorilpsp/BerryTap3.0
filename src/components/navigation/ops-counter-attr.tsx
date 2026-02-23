"use client"

import { useEffect } from "react"

/**
 * Sets data-ops-counter and Inter font variable on html when on counter route.
 * Enables global CSS overrides for Radix portal content (dialogs, tooltips, selects, etc.)
 * that render in body outside the ops-counter-root wrapper.
 */
export function OpsCounterAttr({
  fontVariableClass,
}: {
  fontVariableClass?: string
}) {
  useEffect(() => {
    document.documentElement.dataset.opsCounter = "true"
    if (fontVariableClass) {
      document.documentElement.classList.add(...fontVariableClass.split(" "))
    }
    return () => {
      delete document.documentElement.dataset.opsCounter
      if (fontVariableClass) {
        document.documentElement.classList.remove(...fontVariableClass.split(" "))
      }
    }
  }, [fontVariableClass])
  return null
}
