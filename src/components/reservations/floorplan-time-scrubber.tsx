"use client"

import { useCallback } from "react"
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Radio,
  FlaskConical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  DINNER_START_MIN,
  DINNER_END_MIN,
  NOW_MIN,
  minutesToTime12h,
} from "@/lib/floorplan-data"

interface TimeScrubberProps {
  scrubMin: number
  onScrubChange: (min: number) => void
  isLive: boolean
  onGoLive: () => void
  whatIfMode: boolean
  onToggleWhatIf: () => void
}

const TIME_LABELS = [
  { min: 17 * 60, label: "5:00" },
  { min: 17 * 60 + 30, label: "5:30" },
  { min: 18 * 60, label: "6:00" },
  { min: 18 * 60 + 30, label: "6:30" },
  { min: 19 * 60, label: "7:00" },
  { min: 19 * 60 + 30, label: "7:30" },
  { min: 20 * 60, label: "8:00" },
  { min: 20 * 60 + 30, label: "8:30" },
  { min: 21 * 60, label: "9:00" },
  { min: 21 * 60 + 30, label: "9:30" },
  { min: 22 * 60, label: "10:00" },
]

export function FloorplanTimeScrubber({
  scrubMin,
  onScrubChange,
  isLive,
  onGoLive,
  whatIfMode,
  onToggleWhatIf,
}: TimeScrubberProps) {
  const jump = useCallback(
    (delta: number) => {
      const next = Math.max(DINNER_START_MIN, Math.min(DINNER_END_MIN, scrubMin + delta))
      onScrubChange(next)
    },
    [scrubMin, onScrubChange]
  )

  const isFuture = scrubMin > NOW_MIN
  const isPast = scrubMin < NOW_MIN

  return (
    <div className="glass-surface-strong border-t border-zinc-800/50">
      {/* Time label row */}
      <div className="relative mx-auto hidden max-w-3xl px-6 pt-2 md:block">
        <div className="flex items-center justify-between">
          {TIME_LABELS.map((tl) => (
            <span
              key={tl.min}
              className={cn(
                "text-[9px] tabular-nums font-mono",
                tl.min === Math.round(scrubMin / 30) * 30
                  ? "text-cyan-300 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {tl.label}
            </span>
          ))}
        </div>
      </div>

      {/* Scrubber + controls */}
      <div className="flex items-center gap-2 px-4 py-2 lg:gap-3 lg:px-6">
        {/* Time nav buttons */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => jump(-30)}
            aria-label="Back 30 minutes"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => jump(-15)}
            aria-label="Back 15 minutes"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Live button */}
        <Button
          variant={isLive ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-7 min-w-14 text-[10px] font-bold",
            isLive
              ? "bg-emerald-600 text-emerald-50 hover:bg-emerald-500"
              : "border-zinc-700 text-muted-foreground hover:bg-zinc-800"
          )}
          onClick={onGoLive}
          aria-label="Go to live time"
        >
          <Radio className="mr-1 h-3 w-3" />
          Live
        </Button>

        {/* Slider */}
        <div className="relative flex-1">
          {/* NOW marker */}
          <div
            className="absolute -top-3 z-10 flex flex-col items-center pointer-events-none"
            style={{ left: `${((NOW_MIN - DINNER_START_MIN) / (DINNER_END_MIN - DINNER_START_MIN)) * 100}%` }}
          >
            <span className="text-[7px] font-bold text-cyan-400 uppercase">NOW</span>
            <div className="h-1.5 w-px bg-cyan-400" />
          </div>
          <Slider
            value={[scrubMin]}
            min={DINNER_START_MIN}
            max={DINNER_END_MIN}
            step={5}
            onValueChange={([v]) => onScrubChange(v)}
            className="w-full"
            aria-label="Time scrubber"
          />
        </div>

        {/* Forward buttons */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => jump(15)}
            aria-label="Forward 15 minutes"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => jump(30)}
            aria-label="Forward 30 minutes"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Current time label */}
        <div className="hidden min-w-16 text-center md:block">
          <span className={cn(
            "text-xs font-bold tabular-nums font-mono",
            isLive ? "text-emerald-400" : isFuture ? "text-cyan-300" : "text-zinc-400"
          )}>
            {minutesToTime12h(scrubMin)}
          </span>
          {isFuture && <span className="block text-[7px] text-cyan-400/60 uppercase">Predicted</span>}
          {isPast && !isLive && <span className="block text-[7px] text-zinc-500 uppercase">Past</span>}
        </div>

        {/* What If button */}
        <Button
          variant={whatIfMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "hidden h-7 text-[10px] md:flex",
            whatIfMode
              ? "bg-amber-600 text-amber-50 hover:bg-amber-500"
              : "border-zinc-700 text-muted-foreground hover:bg-zinc-800"
          )}
          onClick={onToggleWhatIf}
        >
          <FlaskConical className="mr-1 h-3 w-3" />
          What If
        </Button>
      </div>

      {/* Mobile: show time label below */}
      <div className="flex items-center justify-between border-t border-zinc-800/30 px-4 py-1.5 md:hidden">
        <span className={cn(
          "text-xs font-bold tabular-nums font-mono",
          isLive ? "text-emerald-400" : isFuture ? "text-cyan-300" : "text-zinc-400"
        )}>
          {minutesToTime12h(scrubMin)}
          {isFuture && <span className="ml-1 text-[8px] text-cyan-400/60">(Predicted)</span>}
        </span>
        <Button
          variant={whatIfMode ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-6 text-[9px]",
            whatIfMode ? "bg-amber-600 text-amber-50" : "text-muted-foreground"
          )}
          onClick={onToggleWhatIf}
        >
          <FlaskConical className="mr-1 h-2.5 w-2.5" />
          What If
        </Button>
      </div>
    </div>
  )
}
