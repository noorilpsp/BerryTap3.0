"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CalendarEvent } from "@/lib/calendar-events-data"
import { format, isSameDay } from "date-fns"
import { Eye, Edit, Pause, TrendingUp } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

export function DayView({ currentDate, events }: DayViewProps) {
  const dayEvents = events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return isSameDay(eventStart, currentDate) || (eventStart <= currentDate && eventEnd >= currentDate)
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return eventStart.getHours() <= hour && (eventEnd.getHours() > hour || (eventEnd.getHours() === hour && eventEnd.getMinutes() > 0))
    })
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-[100px_1fr] gap-1">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)

          return (
            <>
              {/* Time Label */}
              <div key={`time-${hour}`} className="p-2 text-sm text-muted-foreground text-right border-r">
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </div>

              {/* Events */}
              <div key={`events-${hour}`} className="min-h-[80px] p-2 border-b">
                {hourEvents.map((event) => (
                  <Card key={event.id} className="mb-2 p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{event.statusDot}</span>
                            <h4 className="font-semibold">{event.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <div className="font-medium">{event.category}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <div className="font-medium">{event.timeDisplay}</div>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Redemptions:</span>
                          <span className="font-medium">
                            {event.redemptions.current} / {event.redemptions.max} ({event.redemptions.percent.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={Math.min(event.redemptions.percent, 100)} className="h-2" />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Revenue lift:</span>
                          <span className={cn("font-medium flex items-center gap-1", event.revenue.liftPercent > 0 && "text-green-600")}>
                            +€{event.revenue.lift.toFixed(0)} <TrendingUp className="h-3 w-3" /> {event.revenue.liftPercent.toFixed(1)}%
                          </span>
                        </div>

                        {event.status === "active" && event.redemptions.current > event.redemptions.max * 0.5 && (
                          <div className="flex items-center gap-2 text-sm p-2 bg-chart-1/10 rounded border border-chart-1/20">
                            <span className="text-lg">🔥</span>
                            <span className="text-chart-1 font-medium">Trending: High redemption rate</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" className="flex-1 gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}
