"use client"

import { useState } from "react"
import { AlertCircle, Clock, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type BookingState,
  availableSlots,
  formatDateShort,
  formatTime12h,
  nearbyDates,
  seatingOptions,
  servicePeriods,
} from "@/lib/booking-data"

interface StepTimeProps {
  state: BookingState
  onChange: (patch: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
  onJoinWaitlist: () => void
}

export function StepTime({ state, onChange, onNext, onBack, onJoinWaitlist }: StepTimeProps) {
  const [showNoAvailability] = useState(false) // Toggle for demo

  const period = servicePeriods.find((p) => p.id === state.servicePeriod)
  const summaryLabel = state.date
    ? `${formatDateShort(state.date)} \u00B7 ${period?.name ?? ""} \u00B7 ${state.partySize} guest${state.partySize !== 1 ? "s" : ""}`
    : ""

  const availSlots = availableSlots.filter((s) => s.available)
  const unavailSlots = availableSlots.filter((s) => !s.available)

  const selectedSeating = seatingOptions.find((s) => s.id === state.seatingPreference)
  const showWeatherNote = state.seatingPreference === "patio"

  const canProceed = state.timeSlot !== null

  if (showNoAvailability) {
    return (
      <div className="flex flex-col gap-6">
        <NoAvailability
          state={state}
          summaryLabel={summaryLabel}
          onBack={onBack}
          onJoinWaitlist={onJoinWaitlist}
          onChange={onChange}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{summaryLabel}</span>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Change
        </button>
      </div>

      {/* Time slots grid */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Available Times</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Available time slots">
          {availSlots.map((slot) => {
            const isSelected = state.timeSlot === slot.time
            const isPopular = slot.popularity === "high"
            return (
              <button
                key={slot.time}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${formatTime12h(slot.time)}${isPopular ? ", popular time" : ""}`}
                onClick={() => onChange({ timeSlot: slot.time })}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 px-2 py-2.5 text-sm font-semibold transition-all duration-150",
                  isSelected
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:border-emerald-500 dark:bg-emerald-500"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600",
                )}
              >
                <span>{formatTime12h(slot.time)}</span>
                {isPopular && !isSelected && (
                  <span className="absolute -top-1.5 right-1 flex items-center">
                    <Flame className="h-3 w-3 text-orange-500 booking-popular-pulse" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Popular note */}
        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Flame className="h-3 w-3" />
          <span>{"Popular time \u2014 books fast!"}</span>
        </p>

        {/* Unavailable slots */}
        {unavailSlots.length > 0 && (
          <div className="flex flex-col gap-1 pt-1">
            {unavailSlots.map((slot) => (
              <div key={slot.time} className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <AlertCircle className="h-3 w-3" />
                <span>{formatTime12h(slot.time)} &mdash; {slot.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seating preference */}
      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Seating Preference <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional)</span>
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Seating preference">
          {seatingOptions.map((opt) => {
            const isSelected = state.seatingPreference === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange({ seatingPreference: opt.id })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 text-xs font-medium transition-all duration-150",
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                {opt.icon && <span className="text-sm" aria-hidden="true">{opt.icon}</span>}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
        {showWeatherNote && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 booking-warning-enter" role="alert">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>Patio may be weather-dependent</span>
          </p>
        )}
        {selectedSeating?.note && selectedSeating.id !== "patio" && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{selectedSeating.note}</p>
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 -mx-6 border-t border-zinc-100 bg-white/90 px-6 pb-2 pt-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
        <Button
          className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-700 disabled:opacity-40 disabled:shadow-none dark:bg-emerald-500 dark:shadow-emerald-500/25 dark:hover:bg-emerald-600"
          onClick={onNext}
          disabled={!canProceed}
        >
          {"Continue \u2192"}
        </Button>
      </div>
    </div>
  )
}

// ── No Availability Sub-component ─────────────────────────────

function NoAvailability({
  state,
  summaryLabel,
  onBack,
  onJoinWaitlist,
  onChange,
}: {
  state: BookingState
  summaryLabel: string
  onBack: () => void
  onJoinWaitlist: () => void
  onChange: (patch: Partial<BookingState>) => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Clock className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          No tables available
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{summaryLabel}</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <p className="text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Try nearby dates:</p>
        <div className="grid grid-cols-3 gap-2">
          {nearbyDates.map((nd) => (
            <button
              key={nd.label}
              type="button"
              onClick={() => onChange({ date: nd.date, servicePeriod: null, timeSlot: null })}
              className="flex flex-col items-center gap-1 rounded-xl border-2 border-zinc-200 bg-white px-3 py-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-500/10"
            >
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{nd.label}</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{nd.slotsAvailable} slots</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">Or try a different party size or time.</p>

      <div className="flex w-full flex-col gap-3">
        <Button
          className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 dark:bg-emerald-500 dark:shadow-emerald-500/25 dark:hover:bg-emerald-600"
          onClick={onJoinWaitlist}
        >
          Join the Waitlist Instead
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-full text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          onClick={onBack}
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}
