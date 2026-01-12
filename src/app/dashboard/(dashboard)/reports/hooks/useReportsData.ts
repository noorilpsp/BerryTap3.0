"use client"

import { useState, useEffect } from "react"
import type { ReportsData, ReportsFilters } from "../types/reports.types"
import { mockReportsData } from "../mock/reports.mock"

export function useReportsData(filters: ReportsFilters) {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In production, this would filter the data based on filters
        setData(mockReportsData)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const refresh = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setLoading(false)
  }

  return { data, loading, error, refresh }
}
