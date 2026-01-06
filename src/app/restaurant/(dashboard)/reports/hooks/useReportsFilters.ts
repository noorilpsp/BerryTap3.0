"use client"

import { useState } from "react"
import type { ReportsFilters } from "../types/reports.types"

const DEFAULT_FILTERS: ReportsFilters = {
  dateRange: { from: "2025-10-15", to: "2025-11-12" },
  datePreset: "last_30_days",
  locations: [],
  staff: [],
  channels: ["dine_in", "takeout", "delivery"],
  categories: [],
  tables: [],
  granularity: "daily",
}

export function useReportsFilters() {
  const [filters, setFilters] = useState<ReportsFilters>(DEFAULT_FILTERS)

  const updateFilters = (updates: Partial<ReportsFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return { filters, updateFilters, resetFilters }
}
