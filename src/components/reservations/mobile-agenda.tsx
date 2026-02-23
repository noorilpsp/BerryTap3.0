"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type CalendarDay,
  type CalendarServicePeriod,
  DAY_LABELS_SHORT,
  getCapacityBgClass,
  getCapacityTextClass,
  getWarningIndicator,
  getWarningBadgeClass,
} from "@/lib/calendar-data"

interface MobileAgendaProps {
  days: CalendarDay[]
  onServiceTap: (day: CalendarDay, service: CalendarServicePeriod) => void
}

function AgendaDayCard({
  day,
  onServiceTap,
}: {
  day: CalendarDay
  onServiceTap: (day: CalendarDay, service: CalendarServicePeriod) => void
}) {
  const fullDayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  return (
    <div className={`${day.isToday ? "" : ""}`}>
      {/* Day header */}
      <div className="flex items-center gap-2 px-1 py-1.5">
        {day.isToday ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <span className="text-[10px] font-bold text-zinc-950">
              {day.date}
            </span>
          </span>
        ) : (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
              day.isPast ? "text-muted-foreground/50" : "text-muted-foreground"
            }`}
          >
            <span className="text-[10px] font-bold">{day.date}</span>
          </span>
        )}
        <span
          className={`text-xs font-semibold ${
            day.isToday
              ? "text-emerald-400"
              : day.isPast
                ? "text-muted-foreground/50"
                : "text-foreground"
          }`}
        >
          {day.isToday ? "TODAY -- " : ""}
          {fullDayNames[day.dayOfWeek]}, Jan {day.date}
        </span>
      </div>

      {/* Service cards */}
      <div
        className={`glass-surface overflow-hidden rounded-lg ${
          day.isPast ? "opacity-50" : ""
        }`}
      >
        {/* Lunch */}
        <button
          className="flex w-full items-center justify-between border-b border-zinc-800/50 px-3 py-2.5 text-left transition-colors active:bg-zinc-800/40"
          onClick={() => onServiceTap(day, "lunch")}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Lunch
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {day.lunch.covers} covers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${getCapacityBgClass(day.lunch.capacityPct)}`}
                  style={{
                    width: `${Math.min(day.lunch.capacityPct, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {day.lunch.reservationCount} res
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-xs font-bold tabular-nums ${getCapacityTextClass(day.lunch.capacityPct)}`}
            >
              {day.lunch.capacityPct}% full
            </span>
            {getWarningIndicator(day.lunch.capacityPct) && (
              <Badge
                variant="outline"
                className={`text-[9px] ${getWarningBadgeClass(day.lunch.capacityPct)}`}
              >
                {getWarningIndicator(day.lunch.capacityPct)}
              </Badge>
            )}
          </div>
        </button>

        {/* Dinner */}
        <button
          className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors active:bg-zinc-800/40"
          onClick={() => onServiceTap(day, "dinner")}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Dinner
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {day.dinner.covers} covers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${getCapacityBgClass(day.dinner.capacityPct)}`}
                  style={{
                    width: `${Math.min(day.dinner.capacityPct, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {day.dinner.reservationCount} res
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-xs font-bold tabular-nums ${getCapacityTextClass(day.dinner.capacityPct)}`}
            >
              {day.dinner.capacityPct}% full
            </span>
            {getWarningIndicator(day.dinner.capacityPct) && (
              <Badge
                variant="outline"
                className={`text-[9px] ${getWarningBadgeClass(day.dinner.capacityPct)}`}
              >
                {getWarningIndicator(day.dinner.capacityPct)}
              </Badge>
            )}
          </div>
        </button>

        {/* Events */}
        {day.events.length > 0 && (
          <div className="border-t border-zinc-800/50 px-3 py-2">
            {day.events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-2 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1.5"
              >
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-violet-300">
                    {evt.name}
                  </p>
                  <p className="text-[10px] text-violet-400/60">
                    {evt.zone}, {evt.timeRange}
                    {evt.guestCount > 0 && ` - ${evt.guestCount} pax`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function MobileAgenda({ days, onServiceTap }: MobileAgendaProps) {
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll today into view on mount
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 px-4 py-3">
        {days.map((day) => (
          <div key={day.date} ref={day.isToday ? todayRef : undefined}>
            <AgendaDayCard day={day} onServiceTap={onServiceTap} />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
