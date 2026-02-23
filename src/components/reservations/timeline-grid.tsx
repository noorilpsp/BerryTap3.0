"use client"

import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  type ZoomLevel,
  type TimelineBlock as TBlock,
  zones,
  getTablesForZone,
  getGhostsForTable,
  getMergedForTable,
  getTimeLabels,
  getSlotWidth,
} from "@/lib/timeline-data"
import { ReservationBlock, GhostBlockComponent, MergedBlockComponent } from "./timeline-block"

interface TimelineGridProps {
  blocks: TBlock[]
  zoom: ZoomLevel
  zoneFilter: string
  partySizeFilter: string
  showGhosts: boolean
  detailOpen?: boolean
  onScrollChange: (scrollLeft: number) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onBlockClick: (block: TBlock) => void
  onBlockUpdate: (blockId: string, updates: Pick<TBlock, "table" | "startTime" | "endTime">) => void
  onEmptySlotClick: (payload: { tableId: string; time: string; duration: number; durationMax: number; partySize: number }) => void
  serviceStart: string
  serviceEnd: string
  nowTime: string | null
}

const LANE_HEIGHT = 56
const ZONE_HEADER_HEIGHT = 32
const TIME_HEADER_HEIGHT = 28
const SLOT_FEEDBACK_MS = 260
const DRAG_START_THRESHOLD_PX = 7
const WIDTH_RESIZE_THRESHOLD_PX = 24

export function TimelineGrid({
  blocks,
  zoom,
  zoneFilter,
  partySizeFilter,
  showGhosts,
  detailOpen = false,
  onScrollChange,
  scrollContainerRef,
  onBlockClick,
  onBlockUpdate,
  onEmptySlotClick,
  serviceStart,
  serviceEnd,
  nowTime,
}: TimelineGridProps) {
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set())
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [hoveredSlot, setHoveredSlot] = useState<{ tableId: string; index: number } | null>(null)
  const [activeSlot, setActiveSlot] = useState<{ tableId: string; index: number } | null>(null)
  const [interactionBlockId, setInteractionBlockId] = useState<string | null>(null)
  const [interactionInvalid, setInteractionInvalid] = useState(false)
  const [draftOverrides, setDraftOverrides] = useState<Record<string, Pick<TBlock, "table" | "startTime" | "endTime">>>({})
  const slotFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }
  const toTime24 = (totalMinutes: number) => {
    const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
    const h = Math.floor(normalized / 60).toString().padStart(2, "0")
    const m = (normalized % 60).toString().padStart(2, "0")
    return `${h}:${m}`
  }

  const timeLabels = getTimeLabels(zoom, serviceStart, serviceEnd)
  const columnCount = Math.max(1, timeLabels.length)
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  const clickSlotMinutes = 15
  const subSlotsPerColumn = zoom === "1hr" ? 4 : zoom === "30min" ? 2 : 1
  const minSlotWidth = zoom === "1hr" ? 60 : zoom === "30min" ? 46 : 34
  const baseSlotWidth = getSlotWidth(zoom)
  const adaptiveBaseWidth = viewportWidth > 0 ? viewportWidth : columnCount * baseSlotWidth
  const slotWidth = Math.max(minSlotWidth, adaptiveBaseWidth / columnCount)
  const subSlotWidth = slotWidth / subSlotsPerColumn
  const totalWidth = Math.max(adaptiveBaseWidth, columnCount * slotWidth)
  const serviceStartMin = toMinutes(serviceStart)
  let serviceEndMin = toMinutes(serviceEnd)
  if (serviceEndMin <= serviceStartMin) serviceEndMin += 24 * 60
  const normalize = (min: number) => (min < serviceStartMin ? min + 24 * 60 : min)
  const denormalize = (min: number) => {
    let next = min
    while (next >= 24 * 60) next -= 24 * 60
    while (next < 0) next += 24 * 60
    return next
  }
  const normalizeRange = (startTime: string, endTime: string): { start: number; end: number } => {
    const startRaw = toMinutes(startTime)
    const endRaw = toMinutes(endTime)
    const start = normalize(startRaw)
    let end = normalize(endRaw)
    if (end <= start) end += 24 * 60
    return { start, end }
  }
  const getSubSlotIndex = (clickX: number) => {
    const totalSubSlots = timeLabels.length * subSlotsPerColumn
    return Math.max(
      0,
      Math.min(totalSubSlots - 1, Math.floor(clickX / subSlotWidth))
    )
  }
  const hoveredColumnIndex = hoveredSlot
    ? Math.floor(hoveredSlot.index / subSlotsPerColumn)
    : null
  const nowPixel = useMemo(() => {
    if (!nowTime) return null
    let nowMin = toMinutes(nowTime)
    if (nowMin < serviceStartMin) nowMin += 24 * 60
    if (nowMin < serviceStartMin || nowMin > serviceEndMin) return null
    return ((nowMin - serviceStartMin) / slotMinutes) * slotWidth
  }, [nowTime, serviceEndMin, serviceStartMin, slotMinutes, slotWidth])
  const overlapsService = (start: string, end: string) => {
    const startMin = normalize(toMinutes(start))
    const endMin = normalize(toMinutes(end))
    return startMin < serviceEndMin && endMin > serviceStartMin
  }
  const matchesPartyFilter = useCallback((partySize: number) => {
    if (partySizeFilter === "1-2") return partySize <= 2
    if (partySizeFilter === "3-4") return partySize >= 3 && partySize <= 4
    if (partySizeFilter === "5-6") return partySize >= 5 && partySize <= 6
    if (partySizeFilter === "7+") return partySize >= 7
    return true
  }, [partySizeFilter])

  const toggleZone = (zoneId: string) => {
    setCollapsedZones((prev) => {
      const next = new Set(prev)
      if (next.has(zoneId)) next.delete(zoneId)
      else next.add(zoneId)
      return next
    })
  }

  // Handle scroll sync
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      onScrollChange(scrollContainerRef.current.scrollLeft)
      setScrollTop(scrollContainerRef.current.scrollTop)
    }
  }, [onScrollChange, scrollContainerRef])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const syncWidth = () => {
      const nextWidth = el.clientWidth
      setViewportWidth((prev) => {
        if (prev === 0) return nextWidth
        return Math.abs(nextWidth - prev) >= WIDTH_RESIZE_THRESHOLD_PX ? nextWidth : prev
      })
    }
    syncWidth()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => syncWidth())
      observer.observe(el)
      return () => observer.disconnect()
    }

    window.addEventListener("resize", syncWidth)
    return () => window.removeEventListener("resize", syncWidth)
  }, [scrollContainerRef])

  // Scroll to NOW on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (nowPixel === null) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" })
        return
      }
      const target = nowPixel - scrollContainerRef.current.clientWidth / 3
      scrollContainerRef.current.scrollTo({ left: Math.max(0, target), behavior: "smooth" })
    }
  }, [zoom, nowPixel, scrollContainerRef])

  useEffect(() => {
    return () => {
      if (slotFeedbackTimerRef.current) {
        clearTimeout(slotFeedbackTimerRef.current)
      }
    }
  }, [])

  const flashActiveSlot = useCallback((next: { tableId: string; index: number }) => {
    setActiveSlot(next)
    if (slotFeedbackTimerRef.current) {
      clearTimeout(slotFeedbackTimerRef.current)
    }
    slotFeedbackTimerRef.current = setTimeout(() => {
      setActiveSlot((prev) => (
        prev && prev.tableId === next.tableId && prev.index === next.index ? null : prev
      ))
      slotFeedbackTimerRef.current = null
    }, SLOT_FEEDBACK_MS)
  }, [])

  const filteredZones = zoneFilter === "all" ? zones : zones.filter(z => z.id === zoneFilter)
  const displayedBlocks = useMemo(
    () => blocks.map((block) => {
      const override = draftOverrides[block.id]
      return override ? { ...block, ...override } : block
    }),
    [blocks, draftOverrides]
  )
  const filteredTablesByZone = useMemo(() => {
    return new Map(
      filteredZones.map((zone) => {
        const tables = getTablesForZone(zone.id).filter((table) => {
          if (partySizeFilter === "all") return true
          // Show table if it has a direct block matching the party filter
          if (displayedBlocks.some((block) => (
            block.table === table.id
            && matchesPartyFilter(block.partySize)
            && overlapsService(block.startTime, block.endTime)
          ))) return true
          // Also show merge-slave tables whose primary table has a matching block
          const merge = getMergedForTable(table.id)
          if (merge) {
            return displayedBlocks.some((block) => (
              block.table === merge.mergedWith
              && matchesPartyFilter(block.partySize)
              && overlapsService(block.startTime, block.endTime)
            ))
          }
          return false
        })
        return [zone.id, tables]
      })
    )
  }, [displayedBlocks, filteredZones, matchesPartyFilter, partySizeFilter])
  const laneBands = useMemo(() => {
    let cursor = TIME_HEADER_HEIGHT
    const bands: Array<{ tableId: string; startY: number; endY: number }> = []
    filteredZones.forEach((zone) => {
      cursor += ZONE_HEADER_HEIGHT
      if (collapsedZones.has(zone.id)) return
      ;(filteredTablesByZone.get(zone.id) ?? []).forEach((table) => {
        bands.push({ tableId: table.id, startY: cursor, endY: cursor + LANE_HEIGHT })
        cursor += LANE_HEIGHT
      })
    })
    return bands
  }, [collapsedZones, filteredTablesByZone, filteredZones])

  const getTableAtClientY = useCallback((clientY: number): string | null => {
    const container = scrollContainerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const y = clientY - rect.top + container.scrollTop
    const band = laneBands.find((entry) => y >= entry.startY && y < entry.endY)
    return band?.tableId ?? null
  }, [laneBands, scrollContainerRef])

  const getTimelineX = useCallback((clientX: number) => {
    const container = scrollContainerRef.current
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    return clientX - rect.left + container.scrollLeft
  }, [scrollContainerRef])

  const hasCollision = useCallback((blockId: string, tableId: string, startMin: number, endMin: number) => {
    const overlapsBlock = displayedBlocks
      .filter((block) => block.id !== blockId && block.table === tableId)
      .some((block) => {
        const range = normalizeRange(block.startTime, block.endTime)
        return startMin < range.end && endMin > range.start
      })
    if (overlapsBlock) return true

    const merged = getMergedForTable(tableId)
    if (!merged) return false
    const mergedRange = normalizeRange(merged.startTime, merged.endTime)
    return startMin < mergedRange.end && endMin > mergedRange.start
  }, [displayedBlocks])

  const startMove = useCallback((event: ReactPointerEvent<HTMLDivElement>, block: TBlock) => {
    if (block.status === "completed") {
      event.preventDefault()
      event.stopPropagation()
      onBlockClick(block)
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const pointerOffsetPx = event.clientX - rect.left
    const originRange = normalizeRange(block.startTime, block.endTime)
    const duration = Math.max(15, originRange.end - originRange.start)
    const minStart = serviceStartMin
    const maxStart = Math.max(minStart, serviceEndMin - duration)
    const dragStartX = event.clientX
    const dragStartY = event.clientY
    let moved = false
    let dragActivated = false
    let latestInvalid = false
    let latestDraft: Pick<TBlock, "table" | "startTime" | "endTime"> = {
      table: block.table,
      startTime: block.startTime,
      endTime: block.endTime,
    }

    const handleMove = (nextEvent: globalThis.PointerEvent) => {
      const distance = Math.hypot(nextEvent.clientX - dragStartX, nextEvent.clientY - dragStartY)
      if (!moved && distance <= DRAG_START_THRESHOLD_PX) {
        return
      }
      moved = true
      if (!dragActivated) {
        dragActivated = true
        setInteractionBlockId(block.id)
        setInteractionInvalid(false)
        setDraftOverrides({
          [block.id]: {
            table: block.table,
            startTime: block.startTime,
            endTime: block.endTime,
          },
        })
      }
      const x = getTimelineX(nextEvent.clientX) - pointerOffsetPx
      const snappedStart = Math.round((serviceStartMin + (x / subSlotWidth) * clickSlotMinutes - serviceStartMin) / clickSlotMinutes) * clickSlotMinutes + serviceStartMin
      const proposedStart = Math.max(minStart, Math.min(maxStart, snappedStart))
      const proposedEnd = proposedStart + duration
      const tableFromPointer = getTableAtClientY(nextEvent.clientY)
      const proposedTable = tableFromPointer ?? block.table
      const invalid = hasCollision(block.id, proposedTable, proposedStart, proposedEnd)
      latestInvalid = invalid
      latestDraft = {
        table: proposedTable,
        startTime: toTime24(denormalize(proposedStart)),
        endTime: toTime24(denormalize(proposedEnd)),
      }

      setInteractionInvalid(invalid)
      setDraftOverrides({
        [block.id]: latestDraft,
      })
    }

    const finish = () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleCancel)

      const nextStart = normalize(toMinutes(latestDraft.startTime))
      const nextEnd = normalizeRange(latestDraft.startTime, latestDraft.endTime).end
      const nextTable = latestDraft.table

      if (!moved) {
        if (dragActivated) {
          setDraftOverrides({})
          setInteractionBlockId(null)
          setInteractionInvalid(false)
        }
        onBlockClick(block)
        return
      }

      if (!latestInvalid && !hasCollision(block.id, nextTable, nextStart, nextEnd)) {
        onBlockUpdate(block.id, {
          table: nextTable,
          startTime: toTime24(denormalize(nextStart)),
          endTime: toTime24(denormalize(nextEnd)),
        })
      }

      if (dragActivated) {
        setDraftOverrides({})
        setInteractionBlockId(null)
        setInteractionInvalid(false)
      }
    }

    const handleUp = () => {
      finish()
    }

    const handleCancel = () => {
      if (dragActivated) {
        setDraftOverrides({})
        setInteractionBlockId(null)
        setInteractionInvalid(false)
      }
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleCancel)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleCancel)
  }, [
    clickSlotMinutes,
    denormalize,
    getTableAtClientY,
    getTimelineX,
    hasCollision,
    normalize,
    normalizeRange,
    onBlockClick,
    onBlockUpdate,
    serviceEndMin,
    serviceStartMin,
    subSlotWidth,
    toTime24,
  ])

  const startResize = useCallback((event: ReactPointerEvent<HTMLDivElement>, block: TBlock) => {
    if (block.status === "completed") {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const originRange = normalizeRange(block.startTime, block.endTime)
    const minEnd = originRange.start + 15
    const blocksOnTable = displayedBlocks
      .filter((entry) => entry.id !== block.id && entry.table === block.table)
      .map((entry) => normalizeRange(entry.startTime, entry.endTime))
    const nextNeighbor = blocksOnTable
      .map((entry) => entry.start)
      .filter((start) => start >= originRange.end)
      .sort((a, b) => a - b)[0]
    const merged = getMergedForTable(block.table)
    const mergedStart = merged ? normalizeRange(merged.startTime, merged.endTime).start : undefined
    const maxByNeighbor = Math.min(
      nextNeighbor ?? serviceEndMin,
      mergedStart ?? serviceEndMin,
      serviceEndMin
    )
    const maxEnd = Math.max(minEnd, maxByNeighbor)
    const startClientX = event.clientX
    let latestDraft: Pick<TBlock, "table" | "startTime" | "endTime"> = {
      table: block.table,
      startTime: block.startTime,
      endTime: block.endTime,
    }

    setInteractionBlockId(block.id)
    setInteractionInvalid(false)
    setDraftOverrides({
      [block.id]: {
        table: block.table,
        startTime: block.startTime,
        endTime: block.endTime,
      },
    })

    const handleMove = (nextEvent: globalThis.PointerEvent) => {
      const deltaPx = nextEvent.clientX - startClientX
      const deltaSlots = Math.round(deltaPx / subSlotWidth)
      const deltaMinutes = deltaSlots * clickSlotMinutes
      const proposedEnd = Math.max(minEnd, Math.min(maxEnd, originRange.end + deltaMinutes))
      latestDraft = {
        table: block.table,
        startTime: block.startTime,
        endTime: toTime24(denormalize(proposedEnd)),
      }
      setDraftOverrides({
        [block.id]: latestDraft,
      })
    }

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleCancel)
      if (latestDraft.endTime !== block.endTime) {
        onBlockUpdate(block.id, {
          table: block.table,
          startTime: block.startTime,
          endTime: latestDraft.endTime,
        })
      }
      setDraftOverrides({})
      setInteractionBlockId(null)
      setInteractionInvalid(false)
    }

    const handleCancel = () => {
      setDraftOverrides({})
      setInteractionBlockId(null)
      setInteractionInvalid(false)
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
      window.removeEventListener("pointercancel", handleCancel)
    }

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    window.addEventListener("pointercancel", handleCancel)
  }, [
    clickSlotMinutes,
    denormalize,
    displayedBlocks,
    normalizeRange,
    onBlockUpdate,
    serviceEndMin,
    subSlotWidth,
    toTime24,
  ])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full flex-1 min-h-0">
        {/* Left sidebar: table labels */}
        <div className="hidden w-[140px] shrink-0 border-r border-zinc-800/50 lg:flex lg:flex-col">
          <div
            className="flex items-center border-b border-zinc-800/40 bg-zinc-950/90 px-3"
            style={{ height: TIME_HEADER_HEIGHT }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tables
            </span>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div style={{ transform: `translateY(-${scrollTop}px)` }}>
              {filteredZones.map((zone) => {
                const tables = filteredTablesByZone.get(zone.id) ?? []
                const isCollapsed = collapsedZones.has(zone.id)

                return (
                  <div key={zone.id}>
                    {/* Zone header */}
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 border-b border-zinc-800/30 bg-zinc-900/50 px-3"
                      style={{ height: ZONE_HEADER_HEIGHT }}
                      onClick={() => toggleZone(zone.id)}
                      aria-expanded={!isCollapsed}
                      aria-label={`${zone.name} zone, ${isCollapsed ? "collapsed" : "expanded"}`}
                    >
                      {isCollapsed
                        ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {zone.name}
                      </span>
                    </button>

                    {/* Table rows */}
                    {!isCollapsed && tables.map((table) => {
                      const isTableFocused = hoveredSlot?.tableId === table.id || activeSlot?.tableId === table.id

                      return (
                        <div
                          key={table.id}
                          className="flex items-center border-b border-zinc-800/20 px-3"
                          style={{ height: LANE_HEIGHT }}
                        >
                          <span className={`text-xs font-semibold transition-colors ${isTableFocused ? "text-emerald-300" : "text-foreground"}`}>
                            {table.label}
                          </span>
                          <span className={`ml-1.5 text-[10px] transition-colors ${isTableFocused ? "text-emerald-400/90" : "text-muted-foreground"}`}>
                            {table.seats}p
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main scrollable timeline area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto scrollbar-none"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ width: totalWidth, minHeight: "100%" }}>
            {/* Time header */}
            <div
              className="sticky top-0 z-30 border-b border-zinc-800/40 bg-zinc-950/95 backdrop-blur-sm"
              style={{ height: TIME_HEADER_HEIGHT }}
            >
              {timeLabels.map((label, i) => (
                <div
                  key={`tl-${i}`}
                  className={`absolute top-1.5 text-[10px] tabular-nums ${
                    hoveredColumnIndex === i
                      ? "text-emerald-300"
                      : "text-muted-foreground"
                  }`}
                  style={{ left: i * slotWidth }}
                >
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>

            {/* Vertical grid lines */}
            {timeLabels.map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute border-l border-zinc-800/25"
                style={{ top: TIME_HEADER_HEIGHT, left: i * slotWidth, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              />
            ))}
            {(zoom === "1hr" || zoom === "30min") && Array.from({ length: timeLabels.length * subSlotsPerColumn - 1 }, (_, i) => i + 1)
              .filter((i) => i % subSlotsPerColumn !== 0)
              .map((i) => (
                <div
                  key={`sub-grid-${i}`}
                  className="absolute border-l border-zinc-800/15"
                  style={{ top: TIME_HEADER_HEIGHT, left: i * subSlotWidth, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
                />
              ))}

            {/* NOW line - full height */}
            {nowPixel !== null && (
              <div
                className="tl-now-line absolute z-20 pointer-events-none"
                style={{ top: TIME_HEADER_HEIGHT, left: nowPixel, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              >
                <div className="flex h-full flex-col items-center">
                  <div className="h-full w-0.5 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                </div>
              </div>
            )}

            {/* Past overlay */}
            {nowPixel !== null && (
              <div
                className="absolute bg-zinc-950/20 pointer-events-none"
                style={{ top: TIME_HEADER_HEIGHT, left: 0, width: nowPixel, height: `calc(100% - ${TIME_HEADER_HEIGHT}px)` }}
              />
            )}

            {/* Zone + table lanes */}
            {filteredZones.map((zone) => {
              const tables = filteredTablesByZone.get(zone.id) ?? []
              const isCollapsed = collapsedZones.has(zone.id)

              return (
                <div key={zone.id}>
                  {/* Zone header row */}
                  <div
                    className="flex items-center border-b border-zinc-800/30 bg-zinc-900/30 px-4 lg:px-0"
                    style={{ height: ZONE_HEADER_HEIGHT }}
                  >
                    {/* Mobile zone label (hidden on desktop since sidebar shows it) */}
                    <button
                      type="button"
                      className="flex items-center gap-1.5 lg:hidden"
                      onClick={() => toggleZone(zone.id)}
                    >
                      {isCollapsed
                        ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {zone.name}
                      </span>
                    </button>
                  </div>

                  {/* Table lanes */}
                  {!isCollapsed && tables.map((table) => {
                    const laneBlocksAll = displayedBlocks.filter((block) => block.table === table.id).filter((block) =>
                      overlapsService(block.startTime, block.endTime)
                    )
                    const laneBlocks = laneBlocksAll.filter((block) => matchesPartyFilter(block.partySize))
                    const ghosts = getGhostsForTable(table.id, {
                      serviceStart,
                      serviceEnd,
                      nowTime,
                      blocks: displayedBlocks,
                    }).filter((ghost) =>
                      overlapsService(ghost.predictedTime, ghost.endTime)
                    )
                    const mergedRaw = getMergedForTable(table.id)
                    const merged = mergedRaw && overlapsService(mergedRaw.startTime, mergedRaw.endTime) ? mergedRaw : null

                    return (
                      <div
                        key={table.id}
                        className="relative border-b border-zinc-800/20"
                        style={{ height: LANE_HEIGHT }}
                      >
                        {/* Mobile table label */}
                        <div className="absolute left-2 top-1 z-10 flex items-center gap-1 lg:hidden">
                          <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-bold text-foreground backdrop-blur-sm">
                            {table.label} {table.seats}p
                          </span>
                        </div>

                        {/* Per-slot hover / active highlight */}
                        {(hoveredSlot?.tableId === table.id || activeSlot?.tableId === table.id) && (
                          <>
                            {activeSlot?.tableId === table.id && (
                              <div
                                className="absolute inset-y-0 bg-cyan-400/15 pointer-events-none"
                                style={{
                                  left: activeSlot.index * subSlotWidth,
                                  width: subSlotWidth,
                                }}
                              />
                            )}
                            {hoveredSlot?.tableId === table.id && (
                              <div
                                className="absolute inset-y-0 bg-emerald-400/10 pointer-events-none"
                                style={{
                                  left: hoveredSlot.index * subSlotWidth,
                                  width: subSlotWidth,
                                }}
                              />
                            )}
                          </>
                        )}

                        {/* Hover highlight for empty areas */}
                        <div
                          className="absolute inset-0 cursor-cell hover:bg-emerald-500/[0.03] transition-colors duration-150"
                          onMouseMove={(event) => {
                            if (interactionBlockId) return
                            const rect = event.currentTarget.getBoundingClientRect()
                            const clickX = event.clientX - rect.left
                            setHoveredSlot({ tableId: table.id, index: getSubSlotIndex(clickX) })
                          }}
                          onMouseLeave={() => {
                            setHoveredSlot((prev) => (prev?.tableId === table.id ? null : prev))
                          }}
                          onClick={(event) => {
                            if (interactionBlockId) return
                            const rect = event.currentTarget.getBoundingClientRect()
                            const clickX = event.clientX - rect.left
                            const subSlotIndex = getSubSlotIndex(clickX)
                            flashActiveSlot({ tableId: table.id, index: subSlotIndex })
                            const selectedTime = toTime24(serviceStartMin + subSlotIndex * clickSlotMinutes)
                            const selectedMin = normalize(toMinutes(selectedTime))
                            const nextBlockStartMin = laneBlocksAll
                              .map((block) => normalize(toMinutes(block.startTime)))
                              .filter((startMin) => startMin > selectedMin)
                              .sort((a, b) => a - b)[0]
                            const boundaryMin = Math.min(nextBlockStartMin ?? serviceEndMin, serviceEndMin)
                            const rawAvailable = Math.max(15, boundaryMin - selectedMin)
                            const roundedAvailable = Math.max(15, Math.floor(rawAvailable / 15) * 15)
                            const defaultDuration = Math.min(90, roundedAvailable)

                            onEmptySlotClick({
                              tableId: table.id,
                              time: selectedTime,
                              duration: defaultDuration,
                              durationMax: roundedAvailable,
                              partySize: table.seats,
                            })
                          }}
                          aria-label={`Create reservation on ${table.label}`}
                        />

                        {/* Merged block indicator */}
                        {merged && (
                          <MergedBlockComponent
                            merged={merged}
                            zoom={zoom}
                            axisStart={serviceStart}
                            slotWidth={slotWidth}
                          />
                        )}

                        {/* Reservation blocks */}
                        {laneBlocks.map((block) => (
                          <ReservationBlock
                            key={block.id}
                            block={block}
                            zoom={zoom}
                            slotWidth={slotWidth}
                            onClick={onBlockClick}
                            disableHoverScale={detailOpen}
                            onDragStart={block.status === "completed" ? undefined : startMove}
                            onResizeStart={block.status === "completed" ? undefined : startResize}
                            isGhosted={interactionBlockId === block.id}
                            isInvalidDrop={interactionBlockId === block.id && interactionInvalid}
                            axisStart={serviceStart}
                          />
                        ))}

                        {/* Ghost blocks */}
                        {showGhosts && ghosts.map((ghost) => (
                          <GhostBlockComponent
                            key={ghost.id}
                            ghost={ghost}
                            zoom={zoom}
                            slotWidth={slotWidth}
                            axisStart={serviceStart}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
