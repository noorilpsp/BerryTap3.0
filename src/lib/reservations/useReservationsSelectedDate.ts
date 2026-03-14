"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseIsoToDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null
  const d = new Date(iso + "T12:00:00")
  return Number.isNaN(d.getTime()) ? null : d
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/**
 * URL-driven selected date for Reservations List and Timeline.
 * Source of truth: searchParams.get("date"). Omit param when date is today.
 */
export function useReservationsSelectedDate() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const todayIso = useMemo(() => toIsoDate(new Date()), [])

  const selectedIsoDate = useMemo(() => {
    const raw = searchParams.get("date")
    const parsed = raw ? parseIsoToDate(raw) : null
    return parsed ? toIsoDate(parsed) : todayIso
  }, [searchParams, todayIso])

  const selectedDate = useMemo(() => {
    const parsed = parseIsoToDate(selectedIsoDate)
    return parsed ? startOfDay(parsed) : startOfDay(new Date())
  }, [selectedIsoDate])

  const setSelectedDate = useCallback(
    (date: Date) => {
      const iso = toIsoDate(date)
      const next = new URLSearchParams(searchParams.toString())
      if (iso === todayIso) {
        next.delete("date")
      } else {
        next.set("date", iso)
      }
      const query = next.toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams, todayIso]
  )

  return { selectedDate, selectedIsoDate, todayIso, setSelectedDate }
}
