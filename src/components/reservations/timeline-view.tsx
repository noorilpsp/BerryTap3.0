"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  getCurrentLocalTime24,
  getTimelineBlocksFromReservations,
  type ZoomLevel,
  type TimelineBlock,
  type TableLane,
} from "@/lib/timeline-data"
import { useReservationsData } from "@/lib/reservations/reservationsDataContext"
import { getZoneLabel } from "@/lib/reservations/zones"
import { useReservationsSelectedDate } from "@/lib/reservations/useReservationsSelectedDate"
import { useRestaurantMutations } from "@/lib/hooks/useRestaurantMutations"
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

function getTimelineLaneGroupId(table: { floorPlanId?: string | null; section?: string | null }): string {
  const floorPlanId = table.floorPlanId?.trim()
  if (floorPlanId) return floorPlanId
  const section = table.section?.trim()
  if (section) return section
  return "__unassigned__"
}

export function TimelineView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { updateReservation } = useRestaurantMutations()

  const [zoom, setZoom] = useState<ZoomLevel>("30min")
  const [floorplanFilter, setFloorplanFilter] = useState("all")
  const [partySizeFilter, setPartySizeFilter] = useState("all")
  const [showGhosts, setShowGhosts] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => getCurrentLocalTime24())
  const { selectedDate, selectedIsoDate, setSelectedDate } = useReservationsSelectedDate()
  const { reservations, config, tables } = useReservationsData()
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
  const allLanes = useMemo<TableLane[]>(() => {
    return tables
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((t) => ({
        id: `T${t.number}`,
        label: `T${t.number}`,
        seats: t.capacity,
        zone: getTimelineLaneGroupId(t),
      }))
  }, [tables])

  const filteredLanes = useMemo(() => {
    if (floorplanFilter === "all") return allLanes
    return allLanes.filter((l) => l.zone === floorplanFilter)
  }, [allLanes, floorplanFilter])

  const timelineFloorplans = useMemo(() => {
    const floorplanLabels = new Map((config.floorplans ?? []).map((p) => [p.id, p.name]))
    const seen = new Set<string>()
    const options = allLanes
      .map((lane) => lane.zone)
      .filter((id) => {
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map((id) => ({
        id,
        name: (
          id === "__unassigned__"
            ? "Unassigned"
            : floorplanLabels.get(id) ?? getZoneLabel(id, config.sectionLabels)
        ),
      }))
      .sort((a, b) => {
        if (a.id === "__unassigned__") return -1
        if (b.id === "__unassigned__") return 1
        return a.name.localeCompare(b.name)
      })
    const hasUnassigned = options.some((plan) => plan.id === "__unassigned__")
    return {
      plans: options.filter((plan) => plan.id !== "__unassigned__"),
      hasUnassigned,
      options,
    }
  }, [allLanes, config.floorplans, config.sectionLabels])

  const validTableIds = useMemo(() => new Set(filteredLanes.map((l) => l.id)), [filteredLanes])
  const uuidToDisplay = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of allLanes) {
      const n = t.label?.trim()
      m.set(t.id, n || t.id)
    }
    return m
  }, [allLanes])
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
    next.set("action", "new")
    next.set("time", payload.time)
    next.set("table", payload.tableId)
    // Do not set zone preference from Timeline floorplan grouping.
    next.delete("zone")
    next.set("date", selectedIsoDate)
    next.set("service", effectiveServicePeriodId)
    next.set("partySize", payload.partySize.toString())
    next.set("duration", payload.duration.toString())
    next.set("durationMax", payload.durationMax.toString())
    next.delete("id")
    next.delete("detail")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, selectedIsoDate, effectiveServicePeriodId])

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
        floorplans={timelineFloorplans.options}
        floorplanFilter={floorplanFilter}
        onFloorplanFilterChange={setFloorplanFilter}
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
          tableLanes={filteredLanes}
          zones={timelineFloorplans.options.map((p) => ({ id: p.id, name: p.name }))}
          blocks={displayedBlocks}
          zoneFilter={floorplanFilter}
          onZoneFilterChange={setFloorplanFilter}
          partySizeFilter={partySizeFilter}
          showGhosts={showGhosts}
          onBlockClick={handleBlockClick}
          serviceStart={activeService.start}
          serviceEnd={activeService.end}
          nowTime={nowTimeForTimeline}
        />
      ) : (
        <TimelineGrid
          tableLanes={filteredLanes}
          zones={timelineFloorplans.options.map((p) => ({ id: p.id, name: p.name }))}
          blocks={displayedBlocks}
          zoom={zoom}
          zoneFilter={floorplanFilter}
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
