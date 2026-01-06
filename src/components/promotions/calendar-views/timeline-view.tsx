"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CalendarEvent } from "@/lib/calendar-events-data"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TimelineViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function TimelineView({ currentDate, events }: TimelineViewProps) {
  const [zoom, setZoom] = useState(50)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const dayWidth = 20 + (zoom / 100) * 30 // 20px to 50px based on zoom

  return (
    <div className="p-4 space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4 justify-end">
        <span className="text-sm text-muted-foreground">Zoom:</span>
        <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(0, zoom - 25))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} className="w-32" />
        <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(100, zoom + 25))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline Container */}
      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-max p-4">
          {/* Date Headers */}
          <div className="flex items-center mb-4">
            <div className="w-48 flex-shrink-0" /> {/* Spacer for labels */}
            {days.filter((_, i) => i % 5 === 0).map((day) => (
              <div key={day.toISOString()} className="text-xs text-muted-foreground text-center" style={{ width: `${dayWidth * 5}px` }}>
                {format(day, "d")}
              </div>
            ))}
          </div>

          <div className="h-px bg-border mb-4" />

          {/* Timeline Bars */}
          <div className="space-y-3">
            {events.map((event) => {
              const eventStart = new Date(event.start)
              const eventEnd = new Date(event.end)
              const startDay = Math.max(0, Math.floor((eventStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)))
              const duration = Math.ceil((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={event.id} className="flex items-center gap-4">
                  {/* Label */}
                  <div className="w-48 flex-shrink-0">
                    <div className="text-sm font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{event.category}</div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative flex-1 h-8" style={{ marginLeft: `${startDay * dayWidth}px` }}>
                    <div
                      className={cn(
                        "absolute top-0 h-full rounded flex items-center px-2 cursor-pointer hover:shadow-md transition-all",
                        event.status === "active" && "bg-chart-1",
                        event.status === "scheduled" && "bg-chart-2",
                        event.status === "paused" && "bg-chart-3",
                        event.status === "expired" && "bg-chart-4"
                      )}
                      style={{ width: `${duration * dayWidth}px` }}
                    >
                      <div className="flex items-center gap-2 text-xs text-white font-medium">
                        <span>{event.statusDot}</span>
                        <span className="truncate">{event.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Conflicts Warning */}
          <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <div className="font-semibold text-sm">Overlaps detected: Nov 25-30</div>
                <div className="text-xs text-muted-foreground">Weekend Brunch + Happy Hour have overlapping schedules</div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm">
                  View Conflicts
                </Button>
                <Button size="sm">Resolve</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
