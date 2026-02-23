"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  capacitySlots,
  getTimeLabels,
  getSlotWidth,
  getNowPixel,
  NOW_LABEL,
  type ZoomLevel,
} from "@/lib/timeline-data"

interface TimelineCapacityStripProps {
  zoom: ZoomLevel
  scrollLeft?: number
  onSlotClick?: (slotIndex: number) => void
  sticky?: boolean
  synced?: boolean
}

function getBarColor(pct: number): string {
  if (pct < 60) return "bg-emerald-500"
  if (pct < 85) return "bg-amber-500"
  return "bg-rose-500"
}

export function TimelineCapacityStrip({
  zoom,
  scrollLeft = 0,
  onSlotClick,
  sticky = true,
  synced = true,
}: TimelineCapacityStripProps) {
  const [animated, setAnimated] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const slotWidth = getSlotWidth(zoom)
  const timeLabels = getTimeLabels(zoom)
  const nowPixel = getNowPixel(zoom)
  const totalWidth = timeLabels.length * slotWidth

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timeout)
  }, [])

  // Sync scroll with main timeline
  useEffect(() => {
    if (synced && stripRef.current) {
      stripRef.current.scrollLeft = scrollLeft
    }
  }, [scrollLeft, synced])

  // Map capacity data to zoom slots
  const getCapacityForSlot = (index: number): { pct: number; seats: number; total: number; arriving: number } => {
    // At 30min zoom, direct mapping to our data
    if (zoom === "30min") {
      const slot = capacitySlots[index]
      if (slot) return { pct: slot.occupancyPct, seats: slot.seatsOccupied, total: slot.totalSeats, arriving: slot.arrivingReservations }
      return { pct: 0, seats: 0, total: 78, arriving: 0 }
    }
    // At 1hr zoom, average two 30min slots
    if (zoom === "1hr") {
      const s1 = capacitySlots[index * 2]
      const s2 = capacitySlots[index * 2 + 1]
      if (s1 && s2) return { pct: Math.round((s1.occupancyPct + s2.occupancyPct) / 2), seats: Math.round((s1.seatsOccupied + s2.seatsOccupied) / 2), total: 78, arriving: s1.arrivingReservations + s2.arrivingReservations }
      if (s1) return { pct: s1.occupancyPct, seats: s1.seatsOccupied, total: 78, arriving: s1.arrivingReservations }
      return { pct: 0, seats: 0, total: 78, arriving: 0 }
    }
    // At 15min zoom, split each 30min slot in half
    const parentIndex = Math.floor(index / 2)
    const slot = capacitySlots[parentIndex]
    if (slot) return { pct: slot.occupancyPct, seats: slot.seatsOccupied, total: slot.totalSeats, arriving: Math.round(slot.arrivingReservations / 2) }
    return { pct: 0, seats: 0, total: 78, arriving: 0 }
  }

  return (
    <div
      className={cn(
        "border-b border-zinc-800/50 bg-background/95 backdrop-blur-sm",
        sticky ? "sticky top-[104px] z-40 md:top-[112px]" : "rounded-xl border"
      )}
    >
      <TooltipProvider delayDuration={100}>
        <div className="flex">
          {/* Left label column - matches sidebar width */}
          <div className="hidden w-[140px] shrink-0 items-center border-r border-zinc-800/50 px-3 lg:flex">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Capacity
            </span>
          </div>

          {/* Scrollable strip */}
          <div
            ref={stripRef}
            className={cn("flex-1", synced ? "overflow-hidden" : "overflow-x-auto scrollbar-none")}
          >
            <div className="relative" style={{ width: totalWidth }}>
              {/* NOW marker */}
              {nowPixel !== null && (
                <div
                  className="tl-now-line absolute top-0 z-20 h-full"
                  style={{ left: nowPixel }}
                >
                  <div className="flex h-full flex-col items-center">
                    <span className="rounded bg-cyan-500 px-1.5 py-0.5 text-[9px] font-bold text-zinc-950 shadow-lg shadow-cyan-500/30">
                      NOW {NOW_LABEL}
                    </span>
                    <div className="h-full w-0.5 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                  </div>
                </div>
              )}

              {/* Capacity bars + time labels */}
              <div className="flex h-16 items-end">
                {timeLabels.map((label, i) => {
                  const cap = getCapacityForSlot(i)
                  const barH = animated ? cap.pct : 0
                  return (
                    <Tooltip key={`cap-${i}`}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="group relative flex flex-col items-center justify-end"
                          style={{ width: slotWidth, height: "100%" }}
                          onClick={() => onSlotClick?.(i)}
                          aria-label={`${label}: ${cap.pct}% capacity`}
                        >
                          <div
                            className={`mx-0.5 w-[calc(100%-8px)] rounded-t-sm transition-all duration-700 ease-out ${getBarColor(cap.pct)} group-hover:opacity-70`}
                            style={{
                              height: `${barH}%`,
                              transitionDelay: `${i * 40}ms`,
                              minHeight: barH > 0 ? 2 : 0,
                            }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="border-zinc-700 bg-zinc-900 text-foreground">
                        <div className="space-y-0.5 text-xs">
                          <p className="font-semibold">{label}</p>
                          <p>{cap.seats}/{cap.total} seats ({cap.pct}%)</p>
                          <p>{cap.arriving} arriving</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Time labels row */}
              <div className="flex border-t border-zinc-800/30">
                {timeLabels.map((label, i) => (
                  <div
                    key={`tl-${i}`}
                    className="flex-shrink-0 py-1 text-center text-[10px] tabular-nums text-muted-foreground"
                    style={{ width: slotWidth }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
