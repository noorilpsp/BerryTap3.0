"use client"

import { useEffect } from "react"

/**
 * Sets data-ops-tables and Inter font variable on html when on tables route.
 * Enables global CSS overrides for Radix portal content (dialogs, selects, etc.)
 * that render in body outside the ops-tables-root wrapper.
 */
export function OpsTablesAttr({
  fontVariableClass,
}: {
  fontVariableClass?: string
}) {
  useEffect(() => {
    document.documentElement.dataset.opsTables = "true"
    if (fontVariableClass) {
      document.documentElement.classList.add(...fontVariableClass.split(" "))
    }
    return () => {
      delete document.documentElement.dataset.opsTables
      if (fontVariableClass) {
        document.documentElement.classList.remove(...fontVariableClass.split(" "))
      }
    }
  }, [fontVariableClass])
  return null
}
