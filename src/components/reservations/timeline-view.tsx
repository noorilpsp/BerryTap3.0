"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  getCurrentLocalTime24,
  getTimelineBlocksFromReservations,
  getTableLanesFromStore,
  tableLanes as fallbackTableLanes,
  type ZoomLevel,
  type TimelineBlock,
} from "@/lib/timeline-data"
import { useReservationsData } from "@/lib/reservations/reservationsDataContext"
import { useReservationsSelectedDate } from "@/lib/reservations/useReservationsSelectedDate"
import { useRestaurantMutations } from "@/lib/hooks/useRestaurantMutations"
import { useRestaurantStore } from "@/store/restaurantStore"
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
  const { updateReservation } = useRestaurantMutations()

  const [zoom, setZoom] = useState<ZoomLevel>("30min")
  const [zoneFilter, setZoneFilter] = useState("all")
  const [partySizeFilter, setPartySizeFilter] = useState("all")
  const [showGhosts, setShowGhosts] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => getCurrentLocalTime24())
  const { selectedDate, selectedIsoDate, setSelectedDate } = useReservationsSelectedDate()
  const { reservations, config } = useReservationsData()
  const [servicePeriodId, setServicePeriodId] = useState<string | null>(null)
  useEffect(() => {
    if (servicePeriodId === null && config.servicePeriods.length > 0) {
      const now = getCurrentLocalTime24()
      const active = config.servicePeriods.find((p) =>
        isWithinService(now, p.start, p.end)
      )
      setServicePeriodId(active?.id ?? config.servicePeriods[0]?.id ?? "dinner")
    }
  }, [config.servicePeriods, servicePeriodId])
  const effectiveServicePeriodId = servicePeriodId ?? config.servicePeriods[0]?.id ?? "dinner"
  const [selectedBlock, setSelectedBlock] = useState<TimelineBlock | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const storeTables = useRestaurantStore((s) => s.tables)
  const tableLanes = useMemo(
    () => (storeTables.length > 0 ? getTableLanesFromStore(storeTables) : fallbackTableLanes),
    [storeTables]
  )
  const validTableIds = useMemo(() => new Set(tableLanes.map((l) => l.id)), [tableLanes])
  const uuidToDisplay = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of storeTables) m.set(t.id, `T${t.number}`)
    return m
  }, [storeTables])
  const blocks = useMemo(() => {
    const resolveTable = (raw: string | null | undefined): string | null => {
      if (!raw?.trim()) return null
      const s = raw.trim()
      if (uuidToDisplay.has(s)) return uuidToDisplay.get(s) ?? null
      return s
    }
    return getTimelineBlocksFromReservations(
      reservations.map((r) => {
        const resolved = resolveTable(r.table ?? r.tableId)
        return {
          id: r.id,
          guestName: r.guestName,
          partySize: r.partySize,
          time: r.time,
          table: resolved,
          tableId: resolved,
          status: r.status,
          risk: r.risk,
          tags: r.tags,
          date: r.date ?? undefined,
        }
      }),
      validTableIds
    )
  }, [reservations, validTableIds, uuidToDisplay])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const activeService =
    config.servicePeriods.find((period) => period.id === effectiveServicePeriodId)
    ?? config.servicePeriods[0]
  const isSelectedDateToday = isSameLocalDay(selectedDate, new Date())
  const nowTimeForTimeline = isSelectedDateToday ? currentTime : null
  const displayedBlocks = blocks.filter((b) => b.date === selectedIsoDate)

  const handleBlockClick = useCallback((block: TimelineBlock) => {
    setSelectedBlock(block)
    setDetailOpen(true)
  }, [])

  const handleBlockUpdate = useCallback(
    async (blockId: string, updates: Pick<TimelineBlock, "table" | "startTime" | "endTime">) => {
      const tableId = updates.table ?? null
      await updateReservation(blockId, {
        tableId: typeof tableId === "string" ? tableId : null,
        reservationTime: updates.startTime,
      })
      setSelectedBlock((prev) =>
        prev && prev.id === blockId ? { ...prev, ...updates } : prev
      )
    },
    [updateReservation]
  )

  const handleOpenNewReservation = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    const defaultTime = isSelectedDateToday && isWithinService(currentTime, activeService.start, activeService.end)
      ? ceilToQuarterHour(currentTime)
      : activeService.start

    next.set("action", "new")
    next.set("date", selectedIsoDate)
    next.set("service", effectiveServicePeriodId)
    next.set("time", defaultTime)
    next.delete("id")
    next.delete("detail")
    next.delete("table")
    next.delete("zone")
    next.delete("duration")
    next.delete("durationMax")

    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [activeService.end, activeService.start, currentTime, effectiveServicePeriodId, isSelectedDateToday, pathname, router, searchParams, selectedIsoDate])

  const handleEmptySlotClick = useCallback((payload: { tableId: string; time: string; duration: number; durationMax: number; partySize: number }) => {
    const next = new URLSearchParams(searchParams.toString())
    const selectedLane = tableLanes.find((lane) => lane.id === payload.tableId)
    next.set("action", "new")
    next.set("time", payload.time)
    next.set("table", payload.tableId)
    if (selectedLane) next.set("zone", selectedLane.zone)
    else next.delete("zone")
    next.set("date", selectedIsoDate)
    next.set("service", effectiveServicePeriodId)
    next.set("partySize", payload.partySize.toString())
    next.set("duration", payload.duration.toString())
    next.set("durationMax", payload.durationMax.toString())
    next.delete("id")
    next.delete("detail")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, selectedIsoDate, effectiveServicePeriodId, tableLanes])

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
        servicePeriodId={effectiveServicePeriodId}
        onServicePeriodChange={setServicePeriodId}
        selectedDate={selectedDate}
        onSelectedDateChange={(date) => setSelectedDate(startOfLocalDay(date))}
        onNewReservation={handleOpenNewReservation}
      />

      {isMobile ? (
        <TimelineMobile
          tableLanes={tableLanes}
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
          tableLanes={tableLanes}
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
