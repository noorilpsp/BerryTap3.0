"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Flame, ChevronDown, ChevronUp, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Wave, Seat, WaveType } from "@/lib/table-data"
import { waveStatusConfig, statusConfig, minutesAgo } from "@/lib/table-data"

interface WaveTimelineProps {
  waves: Wave[]
  seats: Seat[]
  onFireWave: (waveId: string) => void
  onMarkWaveServed?: (waveId: string) => void
  tableNumber?: number
  waveItemsById?: Record<string, { seatNumber: number; item: Seat["items"][number] }[]>
  waveLabelsById?: Record<string, string>
}

function getWaveItems(seats: Seat[], waveType: WaveType) {
  const items: { seatNumber: number; item: Seat["items"][number] }[] = []
  for (const seat of seats) {
    for (const item of seat.items) {
      if (item.wave === waveType) {
        items.push({ seatNumber: seat.number, item })
      }
    }
  }
  return items
}

function getWaveChipClass(status: Wave["status"]): string {
  if (status === "served") {
    return "border-emerald-500/45 bg-emerald-500/15 text-emerald-200"
  }
  if (status === "ready") {
    return "border-red-400/45 bg-red-500/15 text-red-200"
  }
  if (status === "preparing") {
    return "border-amber-400/45 bg-amber-500/15 text-amber-200"
  }
  if (status === "fired") {
    return "border-cyan-300/45 bg-cyan-400/15 text-cyan-100"
  }
  return "border-muted-foreground/35 bg-muted/40 text-muted-foreground"
}

function getWaveChipPulseRgb(status: Wave["status"]): string | null {
  if (status === "ready") return "248 113 113"
  if (status === "preparing") return "251 191 36"
  if (status === "fired") return "103 232 249"
  return null
}

export function WaveTimeline({
  waves,
  seats,
  onFireWave,
  onMarkWaveServed,
  tableNumber,
  waveItemsById,
  waveLabelsById,
}: WaveTimelineProps) {
  const [expandedWave, setExpandedWave] = useState<string | null>(null)
  const waveStripRef = useRef<HTMLDivElement | null>(null)
  const [canScrollWavesLeft, setCanScrollWavesLeft] = useState(false)
  const [canScrollWavesRight, setCanScrollWavesRight] = useState(false)

  const updateWaveStripScrollState = useCallback(() => {
    const el = waveStripRef.current
    if (!el) {
      setCanScrollWavesLeft(false)
      setCanScrollWavesRight(false)
      return
    }
    setCanScrollWavesLeft(el.scrollLeft > 4)
    setCanScrollWavesRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(updateWaveStripScrollState)
    const handleResize = () => updateWaveStripScrollState()
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [updateWaveStripScrollState, waves.length])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.06] p-4",
        "bg-[hsl(225,15%,9%)]/80 backdrop-blur-sm"
      )}
    >
      <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        Meal Progress
      </h2>

      <div className="relative">
        <div
          ref={waveStripRef}
          onScroll={updateWaveStripScrollState}
          className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-start gap-1">
          {waves.map((wave, i) => {
          const isLast = i === waves.length - 1
          const waveChipLabel = waveLabelsById?.[wave.id] ?? `W${i + 1}`
          const waveNumberMatch = waveChipLabel.match(/^W(\d+)$/i)
          const waveTextLabel = waveNumberMatch ? `Wave ${waveNumberMatch[1]}` : waveChipLabel
          const statusLabel = waveStatusConfig[wave.status].label
          const isReady = wave.status === "ready"
          const isPreparing = wave.status === "preparing"
          const isSent = wave.status === "fired"
          const isServed = wave.status === "served"
          const isHeld = wave.status === "held"

          return (
            <div key={wave.id} className="flex shrink-0 items-start gap-1">
              <div className="flex w-24 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "text-[10px] leading-tight font-mono",
                    isServed && "text-emerald-400/70",
                    isReady && "text-red-400/70",
                    isPreparing && "text-amber-400/70",
                    isSent && "text-cyan-200/90",
                    isHeld && "text-muted-foreground/70"
                  )}
                >
                  {statusLabel}
                </span>

                <button
                  type="button"
                  onClick={() => setExpandedWave((prev) => (prev === wave.id ? null : wave.id))}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all hover:scale-[1.03]",
                    isServed && "border-emerald-500/60 bg-emerald-500/10",
                    isReady && "border-red-400/60 bg-red-500/10",
                    isPreparing && "border-amber-400/60 bg-amber-500/10",
                    isSent && "border-cyan-300/60 bg-cyan-400/10",
                    isHeld && "border-muted-foreground/30 bg-muted/50"
                  )}
                  aria-label={`Expand ${waveTextLabel}`}
                >
                  {(isReady || isPreparing || isSent) && (
                    <span
                      style={{
                        ["--ring-rgb" as string]:
                          isReady ? "248 113 113" : isPreparing ? "251 191 36" : "103 232 249",
                      }}
                      className={cn(
                        "absolute inset-0 rounded-full animate-status-ring",
                        isReady && "border-2 border-red-400/30",
                        isPreparing && "border-2 border-amber-400/20",
                        isSent && "border-2 border-cyan-300/35"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-[12px] font-black tracking-wide",
                      isServed && "text-emerald-300",
                      isReady && "text-red-300",
                      isPreparing && "text-amber-200",
                      isSent && "text-cyan-100",
                      isHeld && "text-muted-foreground"
                    )}
                  >
                    {waveChipLabel}
                  </span>
                </button>

                <span className="sr-only">
                  {waveChipLabel}
                </span>

                {wave.firedAt && (
                  <span className="text-[9px] font-mono text-muted-foreground/60">
                    {minutesAgo(wave.firedAt)}m ago
                  </span>
                )}

                {isHeld && (
                  <Button
                    data-meal-btn="fire-outline"
                    size="sm"
                    variant="outline"
                    className="h-6 border border-amber-500/35 bg-transparent px-2 text-[10px] text-amber-300 hover:border-amber-400/55 hover:text-amber-200"
                    onClick={() => onFireWave(wave.id)}
                  >
                    Fire
                  </Button>
                )}
                {isReady && (
                  <Button
                    data-meal-btn="served-outline"
                    size="sm"
                    variant="outline"
                    className="h-6 border border-emerald-500/35 bg-transparent px-2 text-[10px] text-emerald-300 hover:border-emerald-400/55 hover:text-emerald-200"
                    onClick={() => onMarkWaveServed?.(wave.id)}
                  >
                    Served
                  </Button>
                )}
              </div>
              {!isLast && (
                <div className="flex items-center pt-8 animate-pulse">
                  <div
                    className={cn(
                      "h-px w-4",
                      isServed && "bg-emerald-400/55",
                      isReady && "bg-red-400/50",
                      isPreparing && "bg-amber-400/50",
                      isSent && "bg-cyan-300/55",
                      isHeld && "bg-white/20"
                    )}
                  />
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 -ml-1",
                      isServed && "text-emerald-300/85",
                      isReady && "text-red-300/85",
                      isPreparing && "text-amber-300/85",
                      isSent && "text-cyan-200/90",
                      isHeld && "text-white/55"
                    )}
                  />
                </div>
              )}
            </div>
          )
          })}
          </div>
        </div>
        {canScrollWavesLeft && (
          <div className="pointer-events-none absolute left-0 top-[2.55rem] z-10 -translate-y-1/2">
            <div className="absolute -inset-y-6 left-0 w-10 bg-gradient-to-r from-[hsl(225,15%,9%)]/95 to-transparent" />
            <span className="relative -ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_14px_rgba(103,232,249,0.35)]">
              <ChevronLeft className="h-3 w-3 animate-pulse" />
            </span>
          </div>
        )}
        {canScrollWavesRight && (
          <div className="pointer-events-none absolute right-0 top-[2.55rem] z-10 -translate-y-1/2">
            <div className="absolute -inset-y-6 right-0 w-10 bg-gradient-to-l from-[hsl(225,15%,9%)]/95 to-transparent" />
            <span className="relative -mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_14px_rgba(103,232,249,0.35)]">
              <ChevronRight className="h-3 w-3 animate-pulse" />
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {waves.map((wave, index) => {
          const cfg = waveStatusConfig[wave.status]
          const waveItems = waveItemsById?.[wave.id] ?? getWaveItems(seats, wave.type)
          const isExpanded = expandedWave === wave.id
          const itemCount = waveItems.length
          const waveChipLabel = waveLabelsById?.[wave.id] ?? `W${index + 1}`
          const waveNumberMatch = waveChipLabel.match(/^W(\d+)$/i)
          const waveTextLabel = waveNumberMatch ? `Wave ${waveNumberMatch[1]}` : waveChipLabel

          return (
            <div
              key={wave.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-sm"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedWave(isExpanded ? null : wave.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setExpandedWave(isExpanded ? null : wave.id)
                  }
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
              >
                <span
                  style={{
                    ["--ring-rgb" as string]: getWaveChipPulseRgb(wave.status) ?? "248 113 113",
                  }}
                  className={cn(
                    "inline-flex h-6 items-center rounded border px-2 text-[11px] font-semibold",
                    getWaveChipClass(wave.status),
                    getWaveChipPulseRgb(wave.status) && "animate-status-ring"
                  )}
                >
                  {waveChipLabel}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">
                    {waveTextLabel}
                  </span>
                  <span className={cn("ml-2 text-xs font-medium", cfg.colorClass)}>
                    {cfg.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {itemCount} {"item"}
                  {itemCount !== 1 ? "s" : ""}
                  {wave.eta ? ` · ~${wave.eta} min` : ""}
                </span>
                {wave.status === "held" && (
                  <Button
                    data-meal-btn="fire-filled"
                    size="sm"
                    className="ml-2 h-7 gap-1.5 bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFireWave(wave.id)
                    }}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    Fire
                  </Button>
                )}
                {wave.status === "ready" && (
                  <Button
                    data-meal-btn="served-filled"
                    size="sm"
                    className="ml-2 h-7 gap-1.5 bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkWaveServed?.(wave.id)
                    }}
                  >
                    Served
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-secondary/30 px-4 py-3">
                  <div className="space-y-2">
                    {waveItems.map(({ seatNumber, item }) => {
                      const sCfg = statusConfig[item.status]
                      const seatChip = seatNumber === 0 ? `T${tableNumber ?? ""}` : `S${seatNumber}`
                      const seatChipClass =
                        seatNumber === 0
                          ? "border-sky-300/45 bg-sky-500/15 text-sky-200"
                          : "border-indigo-300/40 bg-indigo-500/15 text-indigo-200"
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className={cn("flex-1 font-medium text-foreground", sCfg.strike && "line-through text-muted-foreground")}>
                            <span>{item.name}{item.variant && ` (${item.variant})`}</span>
                            <span
                              className={cn(
                                "ml-2 inline-flex h-5 items-center rounded border px-1.5 text-[10px] font-semibold",
                                seatChipClass
                              )}
                            >
                              {seatChip}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              sCfg.colorClass,
                              sCfg.pulse && "animate-pulse"
                            )}
                          >
                            {sCfg.label}
                            {item.eta ? ` (~${item.eta}m)` : ""}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {(wave.status === "preparing" || wave.status === "fired") && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent">
                        <Send className="h-3 w-3" />
                        Message Kitchen
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent">
                        Rush This Wave
                      </Button>
                    </div>
                  )}

                  {wave.status === "held" && (
                    <div className="mt-4">
                      <Button
                        className="w-full gap-2 bg-orange-500 py-5 text-base font-bold text-white shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all"
                        onClick={() => onFireWave(wave.id)}
                      >
                        <Flame className="h-5 w-5" />
                        Fire {waveTextLabel}
                      </Button>
                      <p className="mt-1.5 text-center text-xs text-muted-foreground">
                        Sends to preparation now
                      </p>
                    </div>
                  )}
                  {wave.status === "ready" && (
                    <div className="mt-4">
                      <Button
                        className="w-full gap-2 bg-emerald-500 py-5 text-base font-bold text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl transition-all"
                        onClick={() => onMarkWaveServed?.(wave.id)}
                      >
                        Served {waveTextLabel}
                      </Button>
                      <p className="mt-1.5 text-center text-xs text-muted-foreground">
                        Mark this wave as served
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
