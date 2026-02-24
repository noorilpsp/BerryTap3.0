"use client"

import React from "react"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { FloorplanScene, type TableStatusInfo } from "@/components/shared/floorplan-scene"
import type { FloorTable, SectionId } from "@/lib/floor-map-data"
import { sectionConfig, getSectionBounds, tables as allTablesData, floorStatusConfig, stageConfig, minutesAgo, currentServer } from "@/lib/floor-map-data"
import { getTableDetailById, getTableDetailFallback } from "@/lib/table-detail-data"
import type { Wave, WaveStatus } from "@/lib/table-detail-data"
import { Users, Clock, AlertTriangle, Flame, Wine, UtensilsCrossed, Cake } from "lucide-react"
import {
  ZOOM_LEVELS,
  EASING,
  DURATIONS,
  getAnimatedDuration,
  zoomToPoint,
} from "@/lib/animation-config"
import { useMapGestures, usePrefersReducedMotion } from "@/hooks/use-map-gestures"
import type { PlacedElement } from "@/lib/floorplan-types"

interface MapCanvasProps {
  tables: FloorTable[]
  ownTableIds: string[]
  filterMode: string
  highlightedTableId: string | null
  highlightType: "search" | "alert" | null
  statusFilter: string | null
  onTableTap: (tableId: string) => void
  onTableLongPress: (tableId: string, e: React.MouseEvent | React.TouchEvent) => void
  onScaleChange: (scale: number) => void
  scale: number
  offset: { x: number; y: number }
  onOffsetChange: (offset: { x: number; y: number }) => void
  isTransitioning: boolean
  focusedTableId: string | null
  focusedSection: SectionId | null
  onSectionTap: (sectionId: SectionId | null) => void
  entering: boolean
  floorplanElements?: PlacedElement[]
  onFitToScreen?: () => void
}

export function MapCanvas({
  tables,
  ownTableIds,
  highlightedTableId,
  highlightType,
  statusFilter,
  onTableTap,
  onTableLongPress,
  onScaleChange,
  scale,
  offset,
  onOffsetChange,
  isTransitioning,
  focusedTableId,
  focusedSection,
  onSectionTap,
  entering,
  floorplanElements = [],
  onFitToScreen,
}: MapCanvasProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [appeared, setAppeared] = useState(false)

  const snapMinScale = ZOOM_LEVELS.level1.scale * 0.5
  const snapMaxScale = ZOOM_LEVELS.level2.scale * 1.5

  const handleScaleFromGesture = useCallback(
    (newScale: number, origin?: { x: number; y: number }) => {
      if (origin) {
        const container = gestureState.containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const center = { x: rect.width / 2, y: rect.height / 2 }
          const newOffset = zoomToPoint(scale, newScale, origin, offset, center)
          onOffsetChange(newOffset)
        }
      }
      onScaleChange(Math.min(snapMaxScale, Math.max(snapMinScale, newScale)))
    },
    [scale, offset, onOffsetChange, onScaleChange, snapMinScale, snapMaxScale]
  )

  const gestureState = useMapGestures({
    scale,
    offset,
    onOffsetChange,
    onScaleChange: handleScaleFromGesture,
    minScale: snapMinScale,
    maxScale: snapMaxScale,
    enabled: !isTransitioning,
  })

  useEffect(() => {
    if (entering && !appeared) {
      const timer = setTimeout(() => setAppeared(true), reducedMotion ? 1 : 400)
      return () => clearTimeout(timer)
    }
  }, [entering, appeared, reducedMotion])

  useEffect(() => {
    setAppeared(false)
    const timer = setTimeout(() => setAppeared(true), reducedMotion ? 1 : 400)
    return () => clearTimeout(timer)
  }, [reducedMotion])

  const transitionDuration = getAnimatedDuration(
    DURATIONS.zoomIn,
    typeof window !== "undefined" ? window.innerWidth : 1024,
    reducedMotion
  )

  const sections: SectionId[] = ["patio", "bar", "main"]

  const sortedForEntry = [...tables].sort((a, b) => {
    const priority: Record<string, number> = { urgent: 0, active: 1, billing: 2, free: 3, closed: 4 }
    return (priority[a.status] ?? 5) - (priority[b.status] ?? 5)
  })

  // ── Build FloorplanScene props from FloorTable data ───────────────────
  // Map table data to element IDs for the shared scene
  const tableStatuses: TableStatusInfo[] = React.useMemo(() => {
    if (floorplanElements.length === 0) return []
    // Elements with seats (tables + seating like booths) - same filter as convertElementsToTables
    const tableEls = floorplanElements.filter(
      (el) => (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
    )
    return tableEls.map((el, i) => {
      const table = tables.find((t) => t.number === i + 1)
      // Get rich detail data for this table
      const detail = table && table.status !== "free"
        ? (getTableDetailById(table.id) ??
          getTableDetailFallback(
            table.id,
            table.number,
            table.section,
            sectionConfig[table.section].name,
            table.guests,
            table.status,
            table.seatedAt,
          ))
        : null
      return {
        elementId: el.id,
        tableNumber: i + 1,
        status: table?.status ?? ("free" as const),
        guests: table?.guests ?? 0,
        capacity: table?.capacity ?? el.seats ?? 4,
        stage: table?.stage ?? null,
        seatedAt: table?.seatedAt,
        serverName: detail?.server?.name ?? null,
        serverId: detail?.server?.id ?? null,
        waves: detail?.waves ?? [],
        alerts: detail?.alerts ?? [],
      }
    })
  }, [floorplanElements, tables])

  const dimmedTableIds = React.useMemo(() => {
    const set = new Set<string>()
    if (floorplanElements.length === 0) return set
    const tableEls = floorplanElements.filter(
      (el) => (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
    )
    tableEls.forEach((el, i) => {
      const table = tables.find((t) => t.number === i + 1)
      if (!table) return
      const dimmedByStatus = statusFilter !== null && table.status !== statusFilter
      const dimmedByFocus = focusedTableId !== null && table.id !== focusedTableId
      if (dimmedByStatus || dimmedByFocus) {
        set.add(el.id)
      }
    })
    return set
  }, [floorplanElements, tables, statusFilter, focusedTableId])

  // Map element ID taps back to table IDs for the parent
  const elementToTableId = React.useMemo(() => {
    const map = new Map<string, string>()
    if (floorplanElements.length === 0) return map
    const tableEls = floorplanElements.filter(
      (el) => (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
    )
    tableEls.forEach((el, i) => {
      map.set(el.id, `t${i + 1}`)
    })
    return map
  }, [floorplanElements])

  const handleSceneTableTap = useCallback(
    (elementId: string) => {
      const tableId = elementToTableId.get(elementId)
      if (tableId) onTableTap(tableId)
    },
    [elementToTableId, onTableTap]
  )

  const handleSceneTableLongPress = useCallback(
    (elementId: string, e: React.MouseEvent | React.TouchEvent) => {
      const tableId = elementToTableId.get(elementId)
      if (tableId) onTableLongPress(tableId, e)
    },
    [elementToTableId, onTableLongPress]
  )

  return (
    <div
      ref={gestureState.containerRef}
      className={cn(
        "relative h-full overflow-hidden bg-background",
        gestureState.isDragging ? "cursor-grabbing" : "cursor-grab",
        entering && "animate-map-enter",
      )}
      onMouseDown={gestureState.handleMouseDown}
      onMouseMove={gestureState.handleMouseMove}
      onMouseUp={gestureState.handleMouseUp}
      onMouseLeave={gestureState.handleMouseUp}
      onTouchStart={gestureState.handleTouchStart}
      onTouchMove={gestureState.handleTouchMove}
      onTouchEnd={gestureState.handleTouchEnd}
      role="application"
      aria-label="Restaurant floor map"
    >
      {/* Subtle radial vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, hsl(225 15% 4% / 0.5) 100%)",
        }}
      />

      <div
        className={cn(
          "relative h-full w-full gpu-layer",
          isTransitioning && "will-change-transform"
        )}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isTransitioning
            ? `transform ${transitionDuration}ms ${EASING.standard}`
            : "none",
        }}
      >
        {/* Render entire floorplan scene when custom floorplan is loaded */}
        {floorplanElements.length > 0 ? (
          <FloorplanScene
            elements={floorplanElements}
            mode="view"
            tableStatuses={tableStatuses}
            ownTableIds={ownTableIds}
            highlightedId={highlightedTableId}
            dimmedIds={dimmedTableIds}
            onTableTap={handleSceneTableTap}
            onTableLongPress={handleSceneTableLongPress}
            appeared={appeared}
          />
        ) : (
          <>
            {/* Default section zones for demo data */}
            {sections.map((sectionId) => {
              const bounds = getSectionBounds(sectionId, allTablesData)
              if (!bounds) return null

              const isFocusedByTable = focusedTableId
                ? allTablesData.find((t) => t.id === focusedTableId)?.section === sectionId
                : true

              const isFocusedSection = focusedSection === null || focusedSection === sectionId
              const isSelectedSection = focusedSection === sectionId

              return (
                <button
                  type="button"
                  key={sectionId}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSectionTap(sectionId)
                  }}
                  className={cn(
                    "absolute rounded-2xl section-zone transition-all duration-500 cursor-pointer group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    focusedTableId && !isFocusedByTable && "focus-dim-active",
                    focusedSection && !isFocusedSection && "opacity-15 blur-[2px] scale-95",
                    isSelectedSection && "ring-2 ring-primary/40 bg-primary/5 scale-105 shadow-2xl shadow-primary/20",
                    !focusedSection && "hover:bg-white/[0.02] hover:ring-1 hover:ring-white/10",
                  )}
                  style={{
                    left: bounds.x,
                    top: bounds.y - 28,
                    width: bounds.width,
                    height: bounds.height + 28,
                  }}
                  aria-label={`${sectionConfig[sectionId].name} section, click to focus`}
                >
                  <span
                    className={cn(
                      "absolute -top-0 left-4 rounded-b-md px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest",
                      "transition-all duration-500",
                      isSelectedSection
                        ? "bg-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-secondary/80 text-muted-foreground",
                      scale > ZOOM_LEVELS.level2.scale * 0.8 && !isSelectedSection && "opacity-50",
                      !focusedSection && "group-hover:bg-white/10 group-hover:text-foreground",
                    )}
                  >
                    {sectionConfig[sectionId].name}
                  </span>
                </button>
              )
            })}

            {/* Default table nodes for demo data */}
            {sortedForEntry.map((table, i) => {
              const isOwn = ownTableIds.includes(table.id)
              const dimmedByStatus = statusFilter !== null && table.status !== statusFilter
              const dimmedByFocus = focusedTableId !== null && table.id !== focusedTableId
              const isHighlighted = highlightedTableId === table.id

              return (
                <DefaultTableNode
                  key={table.id}
                  table={table}
                  isOwn={isOwn}
                  dimmed={dimmedByStatus || dimmedByFocus}
                  highlighted={isHighlighted}
                  onTap={onTableTap}
                  onLongPress={onTableLongPress}
                  entryIndex={i}
                  appeared={appeared}
                />
              )
            })}
          </>
        )}
      </div>

      {/* Fit to Screen Button */}
      {onFitToScreen && floorplanElements.length > 0 && (
        <button
          type="button"
          onClick={onFitToScreen}
          className="absolute top-4 right-4 glass-surface-strong rounded-lg px-3 py-2 text-xs font-semibold shadow-lg hover:bg-primary/10 transition-all border border-border/50"
        >
          Fit to Screen
        </button>
      )}

      {/* Mini-map */}
      {scale > ZOOM_LEVELS.level1.scale * 1.2 && (
        <div className="absolute bottom-4 left-4 glass-surface-strong rounded-xl p-2.5 shadow-2xl animate-fade-slide-in">
          <p className="mb-1.5 font-mono text-[8px] font-bold uppercase tracking-widest text-primary/70">
            Overview
          </p>
          <div className="relative h-16 w-24 rounded-md bg-background/60">
            {allTablesData.map((t) => {
              const x = (t.position.x / 1060) * 88 + 4
              const y = (t.position.y / 380) * 52 + 4
              return (
                <span
                  key={t.id}
                  className={cn(
                    "absolute block h-1.5 w-1.5 rounded-full",
                    t.status === "free" && "bg-emerald-400",
                    t.status === "active" && "bg-amber-400",
                    t.status === "urgent" && "bg-red-400",
                    t.status === "billing" && "bg-blue-400",
                    t.status === "closed" && "bg-muted-foreground/30"
                  )}
                  style={{ left: x, top: y }}
                />
              )
            })}
            <div
              className="absolute rounded border border-primary/50 bg-primary/10 transition-all duration-200"
              style={{
                left: Math.max(0, 20 - offset.x / 12),
                top: Math.max(0, 10 - offset.y / 8),
                width: Math.max(12, 36 / (scale / ZOOM_LEVELS.level1.scale)),
                height: Math.max(8, 20 / (scale / ZOOM_LEVELS.level1.scale)),
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Default Table Node (used when no custom floorplan is loaded) ─────────

const statusBgClasses: Record<string, string> = {
  free: "bg-emerald-500/10 border-emerald-400/40",
  active: "bg-amber-500/10 border-amber-400/40",
  urgent: "bg-red-500/10 border-red-400/50",
  billing: "bg-blue-500/10 border-blue-400/40",
  closed: "bg-secondary/50 border-border/50",
}

const statusTextClasses: Record<string, string> = {
  free: "text-emerald-400",
  active: "text-amber-400",
  urgent: "text-red-400",
  billing: "text-blue-400",
  closed: "text-muted-foreground",
}

const statusGlowClass: Record<string, string> = {
  free: "glow-free",
  active: "glow-active",
  urgent: "glow-urgent",
  billing: "glow-billing",
  closed: "glow-closed",
}

// ── Wave mini icons ─────────────────────────────────────────────────────────

function WaveDot({ type, status }: { type: string; status: WaveStatus }) {
  const dotColors: Record<WaveStatus, string> = {
    served: "bg-emerald-400",
    ready: "bg-red-400 animate-pulse",
    cooking: "bg-amber-400",
    held: "bg-muted-foreground/30",
    not_started: "bg-muted-foreground/15",
  }
  const icons: Record<string, typeof Wine> = {
    drinks: Wine,
    food: UtensilsCrossed,
    dessert: Cake,
  }
  const Icon = icons[type]
  if (!Icon) return null

  return (
    <div className="flex items-center gap-0.5">
      <Icon className="h-2.5 w-2.5 text-muted-foreground/50" />
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[status])} />
    </div>
  )
}

// ── Rich Table Node ─────────────────────────────────────────────────────────

function DefaultTableNode({
  table,
  isOwn,
  dimmed,
  highlighted,
  onTap,
  onLongPress,
  entryIndex,
  appeared,
}: {
  table: FloorTable
  isOwn: boolean
  dimmed: boolean
  highlighted: boolean
  onTap: (tableId: string) => void
  onLongPress: (tableId: string, e: React.MouseEvent | React.TouchEvent) => void
  entryIndex: number
  appeared: boolean
}) {
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFree = table.status === "free"
  const isUrgent = table.status === "urgent"
  const elapsed = table.seatedAt ? minutesAgo(table.seatedAt) : null

  // Get rich detail data
  const detail = React.useMemo(() => {
    if (isFree) return null
    return getTableDetailById(table.id) ??
      getTableDetailFallback(
        table.id,
        table.number,
        table.section,
        sectionConfig[table.section].name,
        table.guests,
        table.status,
        table.seatedAt,
      )
  }, [table, isFree])

  const waves = detail?.waves ?? []
  const alerts = detail?.alerts ?? []
  const serverName = detail?.server?.name ?? null
  const serverIsYou = detail?.server?.id === currentServer.id
  const hasAlert = alerts.length > 0

  // Size: give enough room for info
  const baseWidth = table.shape === "rectangle" ? 96 : 64
  const baseHeight = table.shape === "booth" ? 72 : 64
  const nodeWidth = isFree ? baseWidth : Math.max(baseWidth, 110)
  const nodeHeight = isFree ? baseHeight : Math.max(baseHeight, 100)
  const rotation = table.rotation ?? 0

  // Center the expanded node on the original position
  const offsetX = (nodeWidth - baseWidth) / 2
  const offsetY = (nodeHeight - baseHeight) / 2

  const shapeClasses: Record<string, string> = {
    round: isFree ? "rounded-full" : "rounded-2xl",
    square: "rounded-xl",
    rectangle: "rounded-xl",
    booth: "rounded-2xl",
  }

  // Status accent line colors
  const accentColors: Record<string, string> = {
    free: "from-emerald-400/80 to-emerald-400/20",
    active: "from-amber-400/80 to-amber-400/20",
    urgent: "from-red-400/80 to-red-400/20",
    billing: "from-blue-400/80 to-blue-400/20",
    closed: "from-muted-foreground/40 to-muted-foreground/10",
  }

  return (
    <button
      type="button"
      onClick={() => onTap(table.id)}
      onPointerDown={(e) => {
        longPressTimer.current = setTimeout(() => {
          onLongPress(table.id, e as unknown as React.MouseEvent)
        }, 500)
      }}
      onPointerUp={() => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
      }}
      onPointerLeave={() => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
      }}
      className={cn(
        "absolute border status-transitioning gpu-layer group",
        shapeClasses[table.shape],
        statusBgClasses[table.status],
        statusGlowClass[table.status],
        isUrgent && "animate-pulse-ring",
        dimmed && "opacity-15 pointer-events-none",
        !dimmed && isOwn && "ring-1 ring-primary/40 ring-offset-1 ring-offset-background",
        highlighted && "animate-highlight-pulse",
        table.status === "closed" && "border-dashed",
        !dimmed && "hover:scale-105 hover:brightness-110 cursor-pointer transition-all duration-200",
        !appeared && "animate-node-appear",
        "focus-dim",
        isFree ? "flex items-center justify-center" : "flex flex-col overflow-hidden",
      )}
      style={{
        left: table.position.x - offsetX,
        top: table.position.y - offsetY,
        width: nodeWidth,
        height: nodeHeight,
        transform: `rotate(${rotation}deg)`,
        "--node-index": entryIndex,
      } as React.CSSProperties}
      aria-label={`Table ${table.number}, ${table.status}${table.guests ? `, ${table.guests} guests` : ""}`}
    >
      {/* ── Free table: simple centered display ── */}
      {isFree ? (
        <div className="flex flex-col items-center gap-0.5">
          <span className={cn("font-mono text-sm font-bold", statusTextClasses[table.status])}>
            {table.number}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-emerald-400/60">
            {table.capacity}p
          </span>
        </div>
      ) : (
        <>
          {/* ── Top accent gradient line ── */}
          <div className={cn("h-[2px] w-full bg-gradient-to-r shrink-0", accentColors[table.status])} />

          {/* ── Header row: number + guests + time ── */}
          <div className="flex items-center gap-1 px-1.5 pt-1">
            <span className={cn("font-mono text-xs font-bold leading-none", statusTextClasses[table.status])}>
              T{table.number}
            </span>
            <div className="flex items-center gap-0.5 text-muted-foreground/60">
              <Users className="h-2.5 w-2.5" />
              <span className="font-mono text-[9px]">{table.guests}</span>
            </div>
            {elapsed !== null && (
              <span className={cn(
                "ml-auto font-mono text-[9px] leading-none",
                elapsed > 40 ? "text-red-400" : elapsed > 25 ? "text-amber-400/70" : "text-muted-foreground/40"
              )}>
                {elapsed}m
              </span>
            )}
          </div>

          {/* ── Wave progress dots ── */}
          {waves.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 px-1.5 pt-0.5">
              {waves.map((w) => (
                <WaveDot key={w.type} type={w.type} status={w.status} />
              ))}
            </div>
          )}

          {/* ── Alert indicator ── */}
          {hasAlert && (
            <div className="flex items-center justify-center gap-0.5 pt-0.5">
              <Flame className="h-2.5 w-2.5 text-red-400 animate-pulse" />
              <span className="font-mono text-[8px] font-bold text-red-400 uppercase tracking-wider truncate max-w-[70px]">
                {alerts[0].type === "food_ready" ? "READY" : alerts[0].type === "no_checkin" ? "NO CHK" : "ALERT"}
              </span>
            </div>
          )}

          {/* ── Server tag ── */}
          {serverName && (
            <div className="mt-auto px-1.5 pb-1">
              <span className={cn(
                "font-mono text-[8px] leading-none truncate block",
                serverIsYou ? "text-primary/80 font-bold" : "text-muted-foreground/40"
              )}>
                {serverIsYou ? "YOU" : serverName}
              </span>
            </div>
          )}
        </>
      )}
    </button>
  )
}
