"use client"

import { useEffect, useState } from "react"
import { Plus, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  type CalendarDay,
  type CalendarServicePeriod,
  type DayDetail,
  DAY_LABELS_SHORT,
  getCapacityBgClass,
  getCapacityTextClass,
  getDayDetail,
} from "@/lib/calendar-data"

interface DayDetailPanelProps {
  day: CalendarDay | null
  service: CalendarServicePeriod
  onServiceChange: (service: CalendarServicePeriod) => void
  open: boolean
  onClose: () => void
}

function CapacityTimeSlot({
  time,
  pct,
  animate,
  delay,
}: {
  time: string
  pct: number
  animate: boolean
  delay: number
}) {
  const width = animate ? Math.min(pct, 100) : 0
  const warning = pct >= 95 ? "Full" : pct >= 90 ? "Near" : null

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
        {time}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getCapacityBgClass(pct)}`}
          style={{
            width: `${width}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span
        className={`w-10 text-right text-[10px] tabular-nums ${getCapacityTextClass(pct)}`}
      >
        {pct}%
      </span>
      {warning && (
        <span className="text-[9px] font-bold text-rose-400">{warning}</span>
      )}
    </div>
  )
}

export function DayDetailPanel({
  day,
  service,
  onServiceChange,
  open,
  onClose,
}: DayDetailPanelProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (open) {
      setAnimate(false)
      const t = setTimeout(() => setAnimate(true), 200)
      return () => clearTimeout(t)
    }
  }, [open, day, service])

  if (!day) return null

  const detail = getDayDetail(day, service)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] border-zinc-800 bg-zinc-950 p-0 sm:max-w-[420px]"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b border-zinc-800/50 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-foreground">
                  {detail.dayName}, Jan {detail.date} -- {service === "lunch" ? "Lunch" : "Dinner"}
                </SheetTitle>
                <SheetDescription className="mt-1 text-muted-foreground">
                  {detail.covers} covers &middot; {detail.reservationCount}{" "}
                  reservations &middot;{" "}
                  <span className={getCapacityTextClass(detail.capacityPct)}>
                    {detail.capacityPct}% capacity
                  </span>
                </SheetDescription>
              </div>
            </div>

            {/* Service toggle */}
            <div className="mt-3 flex gap-1 rounded-lg border border-zinc-700 bg-zinc-800/60 p-0.5">
              <button
                className={`flex-1 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  service === "lunch"
                    ? "bg-emerald-600 text-emerald-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onServiceChange("lunch")}
              >
                Lunch
              </button>
              <button
                className={`flex-1 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  service === "dinner"
                    ? "bg-emerald-600 text-emerald-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onServiceChange("dinner")}
              >
                Dinner
              </button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-5 px-5 py-4">
              {/* Capacity by time */}
              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Capacity by Time
                </h3>
                <div className="space-y-1.5">
                  {detail.timeSlots.map((slot, i) => (
                    <CapacityTimeSlot
                      key={slot.time}
                      time={slot.time}
                      pct={slot.capacityPct}
                      animate={animate}
                      delay={i * 30}
                    />
                  ))}
                </div>
              </section>

              {/* Reservations list */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Reservations
                  </h3>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {detail.reservations.length} total
                  </span>
                </div>

                <div className="space-y-1">
                  {detail.reservations.map((res, i) => (
                    <div
                      key={`${res.time}-${res.guestName}-${i}`}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-800/40"
                    >
                      <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
                        {res.time}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {res.guestName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({res.partySize}p)
                          </span>
                        </div>
                        {res.tags.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {res.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="h-4 px-1 text-[8px] font-medium border-zinc-700 text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {res.table}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="mt-3 w-full bg-emerald-600 text-emerald-50 hover:bg-emerald-500"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Reservation
                </Button>
              </section>

              {/* Notes */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </h3>
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                {detail.notes.length > 0 ? (
                  <div className="space-y-2">
                    {detail.notes.map((note, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-zinc-800/50 bg-zinc-900/60 px-3 py-2"
                      >
                        <p className="text-xs italic text-muted-foreground">
                          &ldquo;{note}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50">
                    No notes for this service period.
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-zinc-700 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Note
                </Button>
              </section>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
