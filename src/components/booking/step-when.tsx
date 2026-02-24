"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type BookingState,
  calendarAvailability,
  getAvailablePeriods,
  getDateKey,
  servicePeriods,
} from "@/lib/booking-data"

interface StepWhenProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onNext: () => void
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  // Monday-based offset: 0=Mon...6=Sun
  let startDay = first.getDay() - 1
  if (startDay < 0) startDay = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { startDay, daysInMonth }
}

export function StepWhen({ state, onChange, onNext }: StepWhenProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    if (state.date) return { year: state.date.getFullYear(), month: state.date.getMonth() }
    return { year: 2025, month: 0 }
  })

  const { startDay, daysInMonth } = useMemo(
    () => getMonthDays(viewMonth.year, viewMonth.month),
    [viewMonth]
  )

  const today = useMemo(() => new Date(), [])

  const availablePeriods = useMemo(() => {
    if (!state.date) return []
    return getAvailablePeriods(state.date)
  }, [state.date])

  // Auto-select service period if only one available
  useEffect(() => {
    if (availablePeriods.length === 1 && state.servicePeriod !== availablePeriods[0].id) {
      onChange({ servicePeriod: availablePeriods[0].id })
    }
  }, [availablePeriods, state.servicePeriod, onChange])

  const canProceed = state.partySize > 0 && state.date !== null && state.servicePeriod !== null

  const handleDateSelect = useCallback((day: number) => {
    const d = new Date(viewMonth.year, viewMonth.month, day)
    const key = getDateKey(d)
    const avail = calendarAvailability[key]
    if (avail && !avail.available) return
    // Don't allow past dates
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (d < todayStart) return
    onChange({ date: d, servicePeriod: null })
  }, [viewMonth, today, onChange])

  const prevMonth = () => {
    setViewMonth((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { ...v, month: v.month - 1 }
    })
  }
  const nextMonth = () => {
    setViewMonth((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { ...v, month: v.month + 1 }
    })
  }

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const selectedDateKey = state.date ? getDateKey(state.date) : null
  const todayKey = getDateKey(today)

  return (
    <div className="flex flex-col gap-6">
      {/* Party Size */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Party Size</label>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Party size"
        >
          {PARTY_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={state.partySize === n}
              aria-label={`Party of ${n} ${n === 1 ? "guest" : "guests"}`}
              onClick={() => onChange({ partySize: n })}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-150",
                state.partySize === n
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105 dark:border-emerald-500 dark:bg-emerald-500"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Phone className="h-3 w-3" />
          <span>Larger party? Call us: {"+32 2 123 4567"}</span>
        </p>
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          {/* Month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const d = new Date(viewMonth.year, viewMonth.month, day)
              const key = getDateKey(d)
              const isToday = key === todayKey
              const isSelected = key === selectedDateKey
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
              const isPast = d < todayStart
              const avail = calendarAvailability[key]
              const isBooked = avail && !avail.available
              const isFew = avail?.spotsLeft === "few"
              const isDisabled = isPast || !!isBooked

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateSelect(day)}
                  aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${isBooked ? `, ${avail?.note || "fully booked"}` : ""}${isFew ? ", filling fast" : ""}`}
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                    isDisabled && "cursor-not-allowed text-zinc-300 line-through dark:text-zinc-600",
                    !isDisabled && !isSelected && "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
                    isSelected && "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:bg-emerald-500",
                    isToday && !isSelected && !isDisabled && "ring-2 ring-inset ring-emerald-300 dark:ring-emerald-700",
                  )}
                  title={isBooked ? (avail?.note || "Fully booked") : isFew ? "Filling fast" : undefined}
                >
                  {day}
                  {/* "few spots" dot */}
                  {isFew && !isSelected && !isDisabled && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Service Period */}
      {state.date && availablePeriods.length > 0 && (
        <div className="flex flex-col gap-3 booking-step-field-enter">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Service Period</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Service period">
            {availablePeriods.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={state.servicePeriod === p.id}
                onClick={() => onChange({ servicePeriod: p.id })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-150",
                  state.servicePeriod === p.id
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                <span className="text-base" aria-hidden="true">{p.icon}</span>
                <span className="flex flex-col items-start">
                  <span>{p.name}</span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{p.start}&ndash;{p.end}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="sticky bottom-0 -mx-6 border-t border-zinc-100 bg-white/90 px-6 pb-2 pt-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
        <Button
          className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-700 disabled:opacity-40 disabled:shadow-none dark:bg-emerald-500 dark:shadow-emerald-500/25 dark:hover:bg-emerald-600"
          onClick={onNext}
          disabled={!canProceed}
          aria-label={
            canProceed
              ? "Find available times"
              : "Find available times, button disabled \u2014 select party size, date, and service period first"
          }
        >
          {"Find Available Times \u2192"}
        </Button>
      </div>
    </div>
  )
}
