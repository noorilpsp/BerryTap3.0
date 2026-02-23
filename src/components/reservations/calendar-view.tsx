"use client"

import { useMemo, useState, useCallback } from "react"
import {
  CalendarTopBar,
  type CalendarViewMode,
} from "@/components/reservations/calendar-top-bar"
import { WeekView } from "@/components/reservations/week-view"
import { MonthView } from "@/components/reservations/month-view"
import { MobileAgenda } from "@/components/reservations/mobile-agenda"
import { DayDetailPanel } from "@/components/reservations/day-detail-panel"
import {
  type CalendarDay,
  type CalendarServicePeriod,
  generateJanuaryData,
  getWeekForDate,
  MONTH_NAME,
} from "@/lib/calendar-data"

export function CalendarView() {
  const allDays = useMemo(() => generateJanuaryData(), [])

  const [viewMode, setViewMode] = useState<CalendarViewMode>("week")
  const [anchorDate, setAnchorDate] = useState(17) // Start on today's week

  // Side panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [selectedService, setSelectedService] =
    useState<CalendarServicePeriod>("dinner")

  const weekDays = useMemo(
    () => getWeekForDate(allDays, anchorDate),
    [allDays, anchorDate]
  )

  // Navigation
  const handlePrev = useCallback(() => {
    if (viewMode === "week") {
      setAnchorDate((d) => Math.max(1, d - 7))
    }
    // Month view only has January, so no-op
  }, [viewMode])

  const handleNext = useCallback(() => {
    if (viewMode === "week") {
      setAnchorDate((d) => Math.min(31, d + 7))
    }
  }, [viewMode])

  const handleToday = useCallback(() => {
    setAnchorDate(17)
  }, [])

  // Cell click handlers
  const handleWeekCellClick = useCallback(
    (day: CalendarDay, service: CalendarServicePeriod) => {
      setSelectedDay(day)
      setSelectedService(service)
      setPanelOpen(true)
    },
    []
  )

  const handleMonthDayClick = useCallback((day: CalendarDay) => {
    setSelectedDay(day)
    setSelectedService("dinner")
    setPanelOpen(true)
  }, [])

  const handleMobileServiceTap = useCallback(
    (day: CalendarDay, service: CalendarServicePeriod) => {
      setSelectedDay(day)
      setSelectedService(service)
      setPanelOpen(true)
    },
    []
  )

  // Build title
  const title = useMemo(() => {
    if (viewMode === "month") return MONTH_NAME
    if (weekDays.length === 0) return MONTH_NAME
    const first = weekDays[0]
    const last = weekDays[weekDays.length - 1]
    return `Jan ${first.date} - ${last.date}, 2025`
  }, [viewMode, weekDays])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarTopBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        title={title}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop/Tablet: Calendar grid */}
        <div className="hidden flex-1 overflow-y-auto px-4 py-4 md:block lg:px-6">
          <div
            className={`transition-opacity duration-200 ${
              viewMode === "week" ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            {viewMode === "week" && (
              <WeekView days={weekDays} onCellClick={handleWeekCellClick} />
            )}
          </div>
          <div
            className={`transition-opacity duration-200 ${
              viewMode === "month" ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            {viewMode === "month" && (
              <MonthView days={allDays} onDayClick={handleMonthDayClick} />
            )}
          </div>
        </div>

        {/* Mobile: Agenda list */}
        <div className="flex flex-1 flex-col overflow-hidden md:hidden">
          <MobileAgenda
            days={
              viewMode === "week"
                ? weekDays
                : allDays
            }
            onServiceTap={handleMobileServiceTap}
          />
        </div>
      </main>

      {/* Day detail side panel */}
      <DayDetailPanel
        day={selectedDay}
        service={selectedService}
        onServiceChange={setSelectedService}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  )
}
