"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarEvent } from "@/lib/calendar-events-data"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, startOfDay, isSameDay, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function WeekView({ currentDate, events }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const hourStart = new Date(day)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(day)
      hourEnd.setHours(hour, 59, 59, 999)

      return isSameDay(eventStart, day) && eventStart.getHours() <= hour && (eventEnd.getHours() > hour || (eventEnd.getHours() === hour && eventEnd.getMinutes() > 0))
    })
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4">
        <div className="grid grid-cols-8 gap-1">
          {/* Time Column Header */}
          <div className="sticky top-0 bg-background z-10 p-2 text-sm font-semibold text-muted-foreground border-b">Time</div>

          {/* Day Headers */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="sticky top-0 bg-background z-10 p-2 text-center border-b">
              <div className="text-sm font-semibold">{format(day, "EEE d")}</div>
            </div>
          ))}

          {/* Time Rows */}
          {hours.map((hour) => (
            <>
              {/* Time Label */}
              <div key={`time-${hour}`} className="p-2 text-xs text-muted-foreground text-right border-r">
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const hourEvents = getEventsForDayAndHour(day, hour)
                const hasEvents = hourEvents.length > 0

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn("min-h-[60px] p-1 border-b border-r hover:bg-accent/50 transition-colors", hasEvents && "bg-accent/20")}
                  >
                    {hourEvents.map((event, index) => (
                      <Card
                        key={event.id}
                        className={cn(
                          "p-2 mb-1 text-xs cursor-pointer hover:shadow-md transition-all",
                          event.status === "active" && "bg-chart-1/20 border-chart-1/40",
                          event.status === "scheduled" && "bg-chart-2/20 border-chart-2/40",
                          event.status === "paused" && "bg-chart-3/20 border-chart-3/40"
                        )}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-muted-foreground truncate">{event.category}</div>
                        <Badge variant="outline" className="mt-1 text-[10px] h-4">
                          {event.statusDot} {event.status}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
