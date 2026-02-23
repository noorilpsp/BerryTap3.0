"use client"

import { useEffect, useRef, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type CapacitySlot, restaurantConfig, formatTime12h } from "@/lib/reservations-data"

interface CapacityBarProps {
  slots: CapacitySlot[]
}

function getBarColor(pct: number): string {
  if (pct < 60) return "bg-emerald-500"
  if (pct < 85) return "bg-amber-500"
  return "bg-rose-500"
}

function getBarGlow(pct: number): string {
  if (pct >= 95) return "res-pulse-bar"
  return ""
}

function isNowSlot(slotTime: string, currentTime: string): boolean {
  const [sh, sm] = slotTime.split(":").map(Number)
  const [ch, cm] = currentTime.split(":").map(Number)
  const slotMin = sh * 60 + sm
  const curMin = ch * 60 + cm
  return curMin >= slotMin && curMin < slotMin + 30
}

function getNowPosition(slots: CapacitySlot[], currentTime: string): number | null {
  const [ch, cm] = currentTime.split(":").map(Number)
  const curMin = ch * 60 + cm

  if (slots.length === 0) return null

  const [firstH, firstM] = slots[0].time.split(":").map(Number)
  const firstMin = firstH * 60 + firstM
  const [lastH, lastM] = slots[slots.length - 1].time.split(":").map(Number)
  const lastMin = lastH * 60 + lastM + 30

  if (curMin < firstMin || curMin > lastMin) return null

  return ((curMin - firstMin) / (lastMin - firstMin)) * 100
}

export function CapacityBar({ slots }: CapacityBarProps) {
  const [animated, setAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const nowPosition = getNowPosition(slots, restaurantConfig.currentTime)

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timeout)
  }, [])

  // Auto-scroll to NOW marker on mobile
  useEffect(() => {
    if (containerRef.current && nowPosition !== null) {
      const scrollTarget = (nowPosition / 100) * containerRef.current.scrollWidth
      containerRef.current.scrollTo({
        left: scrollTarget - containerRef.current.clientWidth / 2,
        behavior: "smooth",
      })
    }
  }, [nowPosition])

  return (
    <section aria-label="Predicted capacity timeline" className="px-4 lg:px-6">
      <div className="glass-surface overflow-hidden rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Capacity Forecast
          </h2>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
              {"Low (<60%)"}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
              Mid (60-85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-rose-500" />
              {"High (>85%)"}
            </span>
          </div>
        </div>

        <TooltipProvider delayDuration={100}>
          <div
            ref={containerRef}
            className="relative overflow-x-auto scrollbar-none"
          >
            <div className="relative min-w-[600px]">
              {/* NOW marker */}
              {nowPosition !== null && (
                <div
                  className="absolute top-0 z-10 h-full"
                  style={{ left: `${nowPosition}%` }}
                >
                  <div className="res-now-marker flex h-full flex-col items-center">
                    <span className="mb-1 rounded bg-cyan-500 px-1.5 py-0.5 text-[9px] font-bold text-zinc-950">
                      NOW
                    </span>
                    <div className="h-full w-0.5 bg-cyan-400/80" />
                  </div>
                </div>
              )}

              {/* Bars */}
              <div className="flex items-end gap-1 pb-6 pt-6" style={{ height: 180 }}>
                {slots.map((slot, i) => {
                  const height = animated ? slot.occupancyPct : 0
                  const isNow = isNowSlot(slot.time, restaurantConfig.currentTime)

                  return (
                    <Tooltip key={slot.time}>
                      <TooltipTrigger asChild>
                        <div
                          className="group relative flex flex-1 cursor-pointer flex-col items-center"
                          role="img"
                          aria-label={`${formatTime12h(slot.time)}: ${slot.occupancyPct}% capacity`}
                        >
                          <div className="relative flex w-full flex-1 items-end justify-center">
                            <div
                              className={`w-full max-w-[40px] rounded-t-sm transition-all duration-1000 ease-out ${getBarColor(
                                slot.occupancyPct
                              )} ${getBarGlow(slot.occupancyPct)} ${
                                isNow ? "ring-1 ring-cyan-400/40" : ""
                              } group-hover:opacity-80`}
                              style={{
                                height: `${height}%`,
                                transitionDelay: `${i * 60}ms`,
                                minHeight: height > 0 ? 4 : 0,
                              }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="border-zinc-700 bg-zinc-900 text-foreground"
                      >
                        <div className="space-y-1 text-xs">
                          <p className="font-semibold">
                            {formatTime12h(slot.time)}
                          </p>
                          <p>
                            {slot.seatsOccupied}/{slot.totalSeats} seats
                            occupied
                          </p>
                          <p>
                            {slot.arrivingReservations} reservations arriving
                          </p>
                          <p>{slot.predictedTurns} tables predicted to turn</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Time labels */}
              <div className="flex gap-1">
                {slots.map((slot) => (
                  <div
                    key={`label-${slot.time}`}
                    className="flex-1 text-center text-[10px] tabular-nums text-muted-foreground"
                  >
                    {formatTime12h(slot.time).replace(" PM", "").replace(" AM", "")}
                  </div>
                ))}
              </div>

              {/* Percentage labels */}
              <div className="mt-0.5 flex gap-1">
                {slots.map((slot) => (
                  <div
                    key={`pct-${slot.time}`}
                    className="flex-1 text-center text-[9px] tabular-nums text-muted-foreground/60"
                  >
                    {slot.occupancyPct}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </section>
  )
}
