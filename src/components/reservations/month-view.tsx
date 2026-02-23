"use client"

import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  type CalendarDay,
  DAY_LABELS_SHORT,
  getCapacityBgClass,
  getCapacityTextClass,
  getWarningIndicator,
  getWarningBadgeClass,
} from "@/lib/calendar-data"

interface MonthViewProps {
  days: CalendarDay[]
  onDayClick: (day: CalendarDay) => void
}

function MiniBar({
  pct,
  animate,
  delay,
}: {
  pct: number
  animate: boolean
  delay: number
}) {
  const width = animate ? Math.min(pct, 100) : 0

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${getCapacityBgClass(pct)}`}
        style={{
          width: `${width}%`,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  )
}

export function MonthView({ days, onDayClick }: MonthViewProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(false)
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Build the 5-week grid with offset for Jan 1 (Wednesday = index 2)
  const offsetDays = 2 // Jan 1 is Wednesday (0=Mon, 2=Wed)
  const totalSlots = Math.ceil((31 + offsetDays) / 7) * 7 // 35 slots for 5 weeks

  const grid: (CalendarDay | null)[] = []
  for (let i = 0; i < totalSlots; i++) {
    const dayNum = i - offsetDays + 1
    if (dayNum >= 1 && dayNum <= 31) {
      grid.push(days.find((d) => d.date === dayNum) ?? null)
    } else {
      grid.push(null)
    }
  }

  const weeks: (CalendarDay | null)[][] = []
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7))
  }

  return (
    <div
      className="glass-surface overflow-hidden rounded-xl"
      role="grid"
      aria-label="Monthly reservation calendar"
    >
      {/* Header */}
      <div
        className="grid border-b border-zinc-800/50"
        style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
        role="row"
      >
        {DAY_LABELS_SHORT.map((label) => (
          <div
            key={label}
            className="border-r border-zinc-800/50 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground last:border-r-0"
            role="columnheader"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIdx) => (
        <div
          key={weekIdx}
          className="grid border-b border-zinc-800/50 last:border-b-0"
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
          role="row"
        >
          {week.map((day, dayIdx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${weekIdx}-${dayIdx}`}
                  className="min-h-[90px] border-r border-zinc-800/50 bg-zinc-950/30 last:border-r-0 md:min-h-[110px]"
                  role="gridcell"
                />
              )
            }

            const warning = getWarningIndicator(
              Math.round(
                (day.totalCovers / 156) * 100 // 78 seats * 2 services
              )
            )
            const cellDelay = weekIdx * 7 * 15 + dayIdx * 15

            return (
              <TooltipProvider key={`day-${day.date}`} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`group flex min-h-[90px] flex-col border-r border-zinc-800/50 px-2 py-1.5 text-left transition-all last:border-r-0 hover:bg-zinc-800/30 md:min-h-[110px] ${
                        day.isToday ? "bg-emerald-500/8 ring-1 ring-inset ring-emerald-500/20" : ""
                      } ${day.isPast ? "opacity-45" : ""}`}
                      onClick={() => onDayClick(day)}
                      role="gridcell"
                      aria-label={`January ${day.date}, ${day.totalCovers} covers, ${day.totalReservations} reservations`}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            day.isToday
                              ? "bg-emerald-500 text-zinc-950"
                              : "text-foreground"
                          }`}
                        >
                          {day.date}
                        </span>
                        {day.isToday && (
                          <span className="text-[8px] font-bold text-emerald-400">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Covers */}
                      <div className="mt-1 flex items-baseline gap-0.5">
                        <span className="text-xs font-bold tabular-nums text-foreground">
                          {day.totalCovers}
                        </span>
                        <span className="text-[9px] text-muted-foreground">cvr</span>
                      </div>

                      {/* Mini bar */}
                      <div className="mt-1">
                        <MiniBar
                          pct={Math.round((day.totalCovers / 156) * 100)}
                          animate={animate}
                          delay={cellDelay}
                        />
                      </div>

                      {/* Events */}
                      {day.events.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {day.events.map((evt) => (
                            <Badge
                              key={evt.id}
                              variant="outline"
                              className="h-4 border-violet-500/30 bg-violet-500/10 px-1 text-[8px] font-bold text-violet-300"
                            >
                              {evt.name.length > 12
                                ? evt.name.slice(0, 12) + "..."
                                : evt.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border-zinc-700 bg-zinc-900 text-foreground"
                  >
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">
                        {DAY_LABELS_SHORT[day.dayOfWeek]}, January {day.date}
                      </p>
                      <div className="flex items-center gap-3">
                        <span>
                          Lunch: {day.lunch.covers} cvr ({day.lunch.capacityPct}%)
                        </span>
                        <span>
                          Dinner: {day.dinner.covers} cvr ({day.dinner.capacityPct}%)
                        </span>
                      </div>
                      <p>
                        Total: {day.totalCovers} covers, {day.totalReservations}{" "}
                        reservations
                      </p>
                      {day.events.length > 0 && (
                        <p className="text-violet-300">
                          {day.events.map((e) => e.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      ))}
    </div>
  )
}
