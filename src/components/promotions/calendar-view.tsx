"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Calendar, CalendarDays, Clock, BarChart3, ChevronLeft, ChevronRight, Plus, Download, Eye, Edit, Pause, Play, AlertTriangle, Repeat } from 'lucide-react'
import { calendarEvents, conflicts, type ViewType } from "@/lib/calendar-events-data"
import { MonthView } from "./calendar-views/month-view"
import { WeekView } from "./calendar-views/week-view"
import { DayView } from "./calendar-views/day-view"
import { TimelineView } from "./calendar-views/timeline-view"
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 20)) // Nov 20, 2024
  const [viewType, setViewType] = useState<ViewType>("month")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const navigatePrevious = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(subDays(currentDate, 1))
        break
      case "timeline":
        setCurrentDate(subMonths(currentDate, 1))
        break
    }
  }

  const navigateNext = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(addDays(currentDate, 1))
        break
      case "timeline":
        setCurrentDate(addMonths(currentDate, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date(2024, 10, 20)) // Mock "today"
  }

  const getHeaderText = () => {
    switch (viewType) {
      case "month":
        return format(currentDate, "MMMM yyyy")
      case "week":
        return `Week of ${format(currentDate, "MMM d")}`
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy")
      case "timeline":
        return format(currentDate, "MMMM yyyy")
    }
  }

  const activeCount = calendarEvents.filter((e) => e.status === "active").length
  const scheduledCount = calendarEvents.filter((e) => e.status === "scheduled").length
  const pausedCount = calendarEvents.filter((e) => e.status === "paused").length
  const conflictCount = conflicts.length

  return (
    <section aria-labelledby="calendar-section-title" role="region" className="p-6 lg:p-8">
      <Card>
        <CardHeader className="border-b">
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-chart-1" aria-hidden="true" />
                <h2 id="calendar-section-title" className="text-2xl font-bold">
                  Promotions Calendar
                </h2>
              </div>

              {/* View Tabs */}
              <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="hidden md:block">
                <TabsList>
                  <TabsTrigger value="month" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="week" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="day" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Navigation & Actions Row */}
            <div className="flex items-center justify-between">
              {/* Navigation */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={navigatePrevious} aria-label="Previous period">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-semibold min-w-[200px] text-center" aria-live="polite">
                  {getHeaderText()}
                </h3>

                <Button variant="outline" size="icon" onClick={navigateNext} aria-label="Next period">
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Promo</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem>Export as PNG</DropdownMenuItem>
                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Include analytics</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-chart-1" />
                <span>Active ({activeCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-chart-2" />
                <span>Scheduled ({scheduledCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-chart-3" />
                <span>Paused ({pausedCount})</span>
              </div>
              {conflictCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span>Conflict ({conflictCount})</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {viewType === "month" && <MonthView currentDate={currentDate} events={calendarEvents} conflicts={conflicts} />}
          {viewType === "week" && <WeekView currentDate={currentDate} events={calendarEvents} />}
          {viewType === "day" && <DayView currentDate={currentDate} events={calendarEvents} />}
          {viewType === "timeline" && <TimelineView currentDate={currentDate} events={calendarEvents} />}
        </CardContent>
      </Card>
    </section>
  )
}
