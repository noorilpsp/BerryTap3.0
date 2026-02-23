"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  restaurantConfig,
  getCurrentLocalTime24,
  getTimelineBlocksNoOverlap,
  tableLanes as timelineTableLanes,
  type ZoomLevel,
  type TimelineBlock,
} from "@/lib/timeline-data"
import { TimelineTopBar } from "./timeline-top-bar"
import { TimelineGrid } from "./timeline-grid"
import { TimelineDetailPanel } from "./timeline-detail-panel"
import { TimelineMobile } from "./timeline-mobile"

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function isWithinService(nowTime: string, start: string, end: string): boolean {
  const nowMin = parseTimeToMinutes(nowTime)
  const startMin = parseTimeToMinutes(start)
  let endMin = parseTimeToMinutes(end)
  let adjustedNow = nowMin

  if (endMin <= startMin) {
    endMin += 24 * 60
    if (adjustedNow < startMin) adjustedNow += 24 * 60
  }

  return adjustedNow >= startMin && adjustedNow < endMin
}

function startOfLocalDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function ceilToQuarterHour(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m
  const rounded = Math.ceil(total / 15) * 15
  const hh = Math.floor((rounded % (24 * 60)) / 60).toString().padStart(2, "0")
  const mm = (rounded % 60).toString().padStart(2, "0")
  return `${hh}:${mm}`
}

export function TimelineView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [zoom, setZoom] = useState<ZoomLevel>("30min")
  const [zoneFilter, setZoneFilter] = useState("all")
  const [partySizeFilter, setPartySizeFilter] = useState("all")
  const [showGhosts, setShowGhosts] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => getCurrentLocalTime24())
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()))
  const [servicePeriodId, setServicePeriodId] = useState(() => {
    const now = getCurrentLocalTime24()
    const activeService = restaurantConfig.servicePeriods.find((period) =>
      isWithinService(now, period.start, period.end)
    )
    return activeService?.id ?? restaurantConfig.servicePeriods.find((period) => period.id === "dinner")?.id ?? restaurantConfig.servicePeriods[0]?.id ?? "dinner"
  })
  const [selectedBlock, setSelectedBlock] = useState<TimelineBlock | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [blocks, setBlocks] = useState<TimelineBlock[]>(() => getTimelineBlocksNoOverlap())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const activeService =
    restaurantConfig.servicePeriods.find((period) => period.id === servicePeriodId)
    ?? restaurantConfig.servicePeriods[0]
  const isSelectedDateToday = isSameLocalDay(selectedDate, new Date())
  const nowTimeForTimeline = isSelectedDateToday ? currentTime : null
  const selectedIsoDate = toIsoDate(selectedDate)
  const displayedBlocks = isSelectedDateToday
    ? blocks
    : blocks.filter((b) => b.date === selectedIsoDate)

  const handleBlockClick = useCallback((block: TimelineBlock) => {
    setSelectedBlock(block)
    setDetailOpen(true)
  }, [])

  const handleBlockUpdate = useCallback(
    (blockId: string, updates: Pick<TimelineBlock, "table" | "startTime" | "endTime">) => {
      setBlocks((prev) => prev.map((block) => (
        block.id === blockId
          ? { ...block, ...updates }
          : block
      )))
      setSelectedBlock((prev) => (
        prev && prev.id === blockId
          ? { ...prev, ...updates }
          : prev
      ))
    },
    []
  )

  const handleOpenNewReservation = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    const defaultTime = isSelectedDateToday && isWithinService(currentTime, activeService.start, activeService.end)
      ? ceilToQuarterHour(currentTime)
      : activeService.start

    next.set("action", "new")
    next.set("date", toIsoDate(selectedDate))
    next.set("service", servicePeriodId)
    next.set("time", defaultTime)
    next.delete("id")
    next.delete("detail")
    next.delete("table")
    next.delete("zone")
    next.delete("duration")
    next.delete("durationMax")

    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [activeService.end, activeService.start, currentTime, isSelectedDateToday, pathname, router, searchParams, selectedDate, servicePeriodId])

  const handleEmptySlotClick = useCallback((payload: { tableId: string; time: string; duration: number; durationMax: number; partySize: number }) => {
    const next = new URLSearchParams(searchParams.toString())
    const selectedLane = timelineTableLanes.find((lane) => lane.id === payload.tableId)
    next.set("action", "new")
    next.set("time", payload.time)
    next.set("table", payload.tableId)
    if (selectedLane) next.set("zone", selectedLane.zone)
    else next.delete("zone")
    next.set("date", toIsoDate(selectedDate))
    next.set("service", servicePeriodId)
    next.set("partySize", payload.partySize.toString())
    next.set("duration", payload.duration.toString())
    next.set("durationMax", payload.durationMax.toString())
    next.delete("id")
    next.delete("detail")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, selectedDate, servicePeriodId])

  const handleScrollChange = useCallback(() => {}, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentLocalTime24())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key.toLowerCase()) {
        case "g":
          setShowGhosts((v) => !v)
          break
        case "n":
          handleOpenNewReservation()
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleOpenNewReservation])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TimelineTopBar
        zoom={zoom}
        onZoomChange={setZoom}
        zoneFilter={zoneFilter}
        onZoneFilterChange={setZoneFilter}
        partySizeFilter={partySizeFilter}
        onPartySizeFilterChange={setPartySizeFilter}
        showGhosts={showGhosts}
        onShowGhostsChange={setShowGhosts}
        servicePeriodId={servicePeriodId}
        onServicePeriodChange={setServicePeriodId}
        selectedDate={selectedDate}
        onSelectedDateChange={(date) => setSelectedDate(startOfLocalDay(date))}
        onNewReservation={handleOpenNewReservation}
      />

      {isMobile ? (
        <TimelineMobile
          blocks={displayedBlocks}
          zoneFilter={zoneFilter}
          onZoneFilterChange={setZoneFilter}
          partySizeFilter={partySizeFilter}
          showGhosts={showGhosts}
          onBlockClick={handleBlockClick}
          serviceStart={activeService.start}
          serviceEnd={activeService.end}
          nowTime={nowTimeForTimeline}
        />
      ) : (
        <TimelineGrid
          blocks={displayedBlocks}
          zoom={zoom}
          zoneFilter={zoneFilter}
          partySizeFilter={partySizeFilter}
          showGhosts={showGhosts}
          detailOpen={detailOpen}
          onScrollChange={handleScrollChange}
          scrollContainerRef={scrollContainerRef}
          onBlockClick={handleBlockClick}
          onBlockUpdate={handleBlockUpdate}
          onEmptySlotClick={handleEmptySlotClick}
          serviceStart={activeService.start}
          serviceEnd={activeService.end}
          nowTime={nowTimeForTimeline}
        />
      )}

      <TimelineDetailPanel
        block={selectedBlock}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
