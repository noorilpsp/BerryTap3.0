"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Repeat, Eye, Edit, Pause } from 'lucide-react'
import { CalendarEvent, Conflict } from "@/lib/calendar-events-data"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, isSameMonth } from "date-fns"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  conflicts: Conflict[]
}

export function MonthView({ currentDate, events, conflicts }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return day >= eventStart && day <= eventEnd
    })
  }

  const getDayConflicts = (day: Date) => {
    return conflicts.filter((conflict) => isSameDay(new Date(conflict.date), day))
  }

  return (
    <div className="p-4" role="application" aria-label="Monthly calendar view">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground" role="columnheader">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const dayConflicts = getDayConflicts(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] border rounded-lg p-2 transition-colors hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/30",
                isTodayDate && "border-2 border-primary bg-primary/5"
              )}
              role="gridcell"
              tabIndex={0}
              aria-label={`${format(day, "MMMM d, yyyy")}. ${dayEvents.length} promotion(s).`}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-sm font-medium", isTodayDate && "font-bold text-primary")}>{format(day, "d")}</span>
                {isTodayDate && (
                  <Badge variant="default" className="text-xs px-1 py-0">
                    Today
                  </Badge>
                )}
                {dayConflicts.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Conflict Detected</p>
                        <p className="text-xs">Multiple promotions overlap</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1" role="list" aria-label="Promotions">
                {dayEvents.slice(0, 2).map((event) => (
                  <TooltipProvider key={event.id}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "text-xs p-1.5 rounded cursor-pointer transition-all hover:scale-105 hover:shadow-md",
                            "flex items-start gap-1 truncate",
                            event.status === "active" && "bg-chart-1/20 text-chart-1 border border-chart-1/40",
                            event.status === "scheduled" && "bg-chart-2/20 text-chart-2 border border-chart-2/40",
                            event.status === "paused" && "bg-chart-3/20 text-chart-3 border border-chart-3/40 opacity-70"
                          )}
                          role="listitem"
                        >
                          {event.recurring && <Repeat className="h-3 w-3 flex-shrink-0 mt-0.5" aria-label="Recurring" />}
                          <span className="truncate font-medium">{event.title.split(" ").slice(0, 3).join(" ")}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="w-[400px] p-4">
                        <EventPreview event={event} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}

                {dayEvents.length > 2 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs h-6 text-muted-foreground hover:text-foreground">
                    +{dayEvents.length - 2} more
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventPreview({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{event.statusDot}</span>
          <h4 className="font-semibold">{event.title}</h4>
        </div>
        <p className="text-xs text-muted-foreground">{event.description}</p>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Schedule:</span>
          <div className="text-xs mt-0.5">
            {event.recurring && (
              <div className="flex items-center gap-1 text-chart-2">
                <Repeat className="h-3 w-3" />
                <span>Recurring</span>
              </div>
            )}
            <div>{event.duration}</div>
            {event.timeDisplay && <div>{event.timeDisplay}</div>}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <span className="text-muted-foreground">Performance:</span>
        <div className="text-xs">
          <div>
            Redemptions: {event.redemptions.current} / {event.redemptions.max} ({event.redemptions.percent.toFixed(1)}%)
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div className="bg-chart-1 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(event.redemptions.percent, 100)}%` }} />
          </div>
          <div className="mt-1">
            Revenue: +€{event.revenue.lift.toFixed(0)} ({event.revenue.liftPercent > 0 ? "↑" : ""} {event.revenue.liftPercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Eye className="h-3 w-3" />
          View
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Edit className="h-3 w-3" />
          Edit
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Pause className="h-3 w-3" />
          Pause
        </Button>
      </div>
    </div>
  )
}
