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
  type CalendarServicePeriod,
  DAY_LABELS_SHORT,
  getCapacityBgClass,
  getCapacityTextClass,
  getWarningIndicator,
  getWarningBadgeClass,
  getEventIcon,
} from "@/lib/calendar-data"

interface WeekViewProps {
  days: CalendarDay[]
  onCellClick: (day: CalendarDay, service: CalendarServicePeriod) => void
}

function CapacityMiniBar({
  pct,
  animate,
  delay,
}: {
  pct: number
  animate: boolean
  delay: number
}) {
  const width = animate ? pct : 0

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${getCapacityBgClass(pct)}`}
        style={{
          width: `${Math.min(width, 100)}%`,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  )
}

function ServiceRow({
  label,
  timeRange,
  days,
  service,
  animate,
  onCellClick,
}: {
  label: string
  timeRange: string
  days: CalendarDay[]
  service: CalendarServicePeriod
  animate: boolean
  onCellClick: (day: CalendarDay, service: CalendarServicePeriod) => void
}) {
  return (
    <>
      {/* Row header */}
      <div className="flex flex-col justify-center border-r border-zinc-800/50 px-3 py-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {timeRange}
        </span>
      </div>

      {/* Cells */}
      {days.map((day, i) => {
        const data = service === "lunch" ? day.lunch : day.dinner
        const warning = getWarningIndicator(data.capacityPct)

        return (
          <TooltipProvider key={`${service}-${day.date}`} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`group flex flex-col gap-1.5 border-r border-zinc-800/50 px-2.5 py-3 text-left transition-all hover:bg-zinc-800/40 ${
                    day.isToday ? "bg-emerald-500/5" : ""
                  } ${day.isPast ? "opacity-50" : ""}`}
                  onClick={() => onCellClick(day, service)}
                  aria-label={`${DAY_LABELS_SHORT[day.dayOfWeek]} January ${day.date}, ${label}, ${data.covers} covers, ${data.capacityPct}% capacity, ${data.reservationCount} reservations`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {data.covers}
                    </span>
                    <span className="text-[10px] text-muted-foreground">cvr</span>
                  </div>

                  <CapacityMiniBar
                    pct={data.capacityPct}
                    animate={animate}
                    delay={i * 60 + (service === "dinner" ? 250 : 0)}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {data.reservationCount} res
                    </span>
                    {warning && (
                      <Badge
                        variant="outline"
                        className={`h-4 px-1 text-[8px] font-bold ${getWarningBadgeClass(data.capacityPct)}`}
                      >
                        {warning}
                      </Badge>
                    )}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="border-zinc-700 bg-zinc-900 text-foreground"
              >
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold">
                    {DAY_LABELS_SHORT[day.dayOfWeek]} Jan {day.date} - {label}
                  </p>
                  <p>
                    {data.reservationCount} reservations, {data.covers} covers
                  </p>
                  <p className={getCapacityTextClass(data.capacityPct)}>
                    {data.capacityPct}% capacity
                  </p>
                  {data.capacityPct < 100 && (
                    <p className="text-muted-foreground">
                      {Math.max(0, Math.round(78 * (1 - data.capacityPct / 100)))} seats remaining
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </>
  )
}

export function WeekView({ days, onCellClick }: WeekViewProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [days])

  // Reset animation when days change
  useEffect(() => {
    setAnimate(false)
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [days.map((d) => d.date).join(",")])

  return (
    <div className="glass-surface overflow-hidden rounded-xl" role="grid" aria-label="Weekly reservation calendar">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Column headers */}
          <div
            className="grid border-b border-zinc-800/50"
            style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
            role="row"
          >
            <div className="border-r border-zinc-800/50 px-3 py-2" role="columnheader" />
            {days.map((day) => (
              <div
                key={`head-${day.date}`}
                className={`flex flex-col items-center border-r border-zinc-800/50 px-2 py-2 ${
                  day.isToday
                    ? "bg-emerald-500/10"
                    : ""
                }`}
                role="columnheader"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {DAY_LABELS_SHORT[day.dayOfWeek]}
                </span>
                <span
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    day.isToday
                      ? "bg-emerald-500 text-zinc-950"
                      : "text-foreground"
                  }`}
                >
                  {day.date}
                </span>
                {day.isToday && (
                  <span className="mt-0.5 text-[9px] font-semibold text-emerald-400">
                    TODAY
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Lunch row */}
          <div
            className="grid border-b border-zinc-800/50"
            style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
            role="row"
          >
            <ServiceRow
              label="Lunch"
              timeRange="11am - 3pm"
              days={days}
              service="lunch"
              animate={animate}
              onCellClick={onCellClick}
            />
          </div>

          {/* Dinner row */}
          <div
            className="grid border-b border-zinc-800/50"
            style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
            role="row"
          >
            <ServiceRow
              label="Dinner"
              timeRange="5pm - 11pm"
              days={days}
              service="dinner"
              animate={animate}
              onCellClick={onCellClick}
            />
          </div>

          {/* Events row */}
          <div
            className="grid border-b border-zinc-800/50"
            style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
            role="row"
          >
            <div className="flex flex-col justify-center border-r border-zinc-800/50 px-3 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Events
              </span>
            </div>
            {days.map((day) => (
              <div
                key={`events-${day.date}`}
                className={`flex flex-col gap-1 border-r border-zinc-800/50 px-2 py-2 ${
                  day.isToday ? "bg-emerald-500/5" : ""
                } ${day.isPast ? "opacity-50" : ""}`}
              >
                {day.events.length > 0 ? (
                  day.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="rounded-md border border-violet-500/25 bg-violet-500/10 px-1.5 py-1"
                    >
                      <p className="text-[10px] font-semibold text-violet-300 leading-tight">
                        {evt.name}
                      </p>
                      <p className="text-[9px] text-violet-400/70">
                        {evt.zone} {evt.timeRange}
                      </p>
                      {evt.guestCount > 0 && (
                        <p className="text-[9px] text-violet-400/50">
                          {evt.guestCount} pax
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground/30">--</span>
                )}
              </div>
            ))}
          </div>

          {/* Totals row */}
          <div
            className="grid bg-zinc-900/40"
            style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
            role="row"
          >
            <div className="flex flex-col justify-center border-r border-zinc-800/50 px-3 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total
              </span>
            </div>
            {days.map((day) => (
              <div
                key={`total-${day.date}`}
                className={`flex flex-col gap-0.5 border-r border-zinc-800/50 px-2.5 py-3 ${
                  day.isToday ? "bg-emerald-500/5" : ""
                } ${day.isPast ? "opacity-50" : ""}`}
              >
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {day.totalCovers}
                </span>
                <span className="text-[10px] text-muted-foreground">covers</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {day.totalReservations} res
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
