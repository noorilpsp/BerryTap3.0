"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type HeatMapMode,
  type ZoneId,
  type FloorTableState,
  floorTables,
  serverSections,
} from "@/lib/floorplan-data"
import { FloorplanTableNode } from "./floorplan-table-node"

interface CanvasProps {
  tableStates: FloorTableState[]
  heatMap: HeatMapMode
  zone: ZoneId
  selectedTable: string | null
  whatIfMode: boolean
  highlightedSeats?: number | null
  onSelectTable: (id: string) => void
}

// Zone boundaries for labels and overlays
const zoneBounds = {
  main:    { x: 3, y: 5, w: 66, h: 82, label: "MAIN DINING" },
  patio:   { x: 3, y: 88, w: 84, h: 11, label: "PATIO" },
  private: { x: 76, y: 12, w: 20, h: 65, label: "PRIVATE ROOM" },
}

export function FloorplanCanvas({
  tableStates,
  heatMap,
  zone,
  selectedTable,
  whatIfMode,
  onSelectTable,
  highlightedSeats,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })

  // Zoom controls
  const zoomIn = useCallback(() => setScale((s) => Math.min(2.5, s + 0.25)), [])
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, s - 0.25)), [])
  const resetView = useCallback(() => { setScale(1); setTranslate({ x: 0, y: 0 }) }, [])

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale((s) => Math.max(0.5, Math.min(2.5, s + delta)))
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  // Pan with mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button[role='button']")) return
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      translateStart.current = { ...translate }
    },
    [translate]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy })
    },
    [isPanning]
  )

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  // Touch pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsPanning(true)
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        translateStart.current = { ...translate }
      }
    },
    [translate]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - panStart.current.x
      const dy = e.touches[0].clientY - panStart.current.y
      setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy })
    },
    [isPanning]
  )

  const handleTouchEnd = useCallback(() => setIsPanning(false), [])

  // Server section overlays (only in server-load mode)
  const renderServerOverlays = heatMap === "server-load"

  return (
    <div className="relative flex-1 overflow-hidden bg-zinc-950">
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-900/90 text-foreground hover:bg-zinc-800"
          onClick={zoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-900/90 text-foreground hover:bg-zinc-800"
          onClick={zoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-900/90 text-foreground hover:bg-zinc-800"
          onClick={resetView}
          aria-label="Reset view"
        >
          <Maximize className="h-3.5 w-3.5" />
        </Button>
        <span className="mt-1 text-center text-[8px] text-muted-foreground tabular-nums font-mono">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative h-full w-full transition-transform duration-100"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(220 15% 8%) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(220 15% 8%) 1px, transparent 1px)
              `,
              backgroundSize: "5% 5%",
            }}
          />

          {/* Zone regions */}
          {Object.entries(zoneBounds).map(([zoneId, bounds]) => {
            const isDimmed = zone !== "all" && zone !== zoneId
            return (
              <div
                key={zoneId}
                className={cn(
                  "absolute border transition-all duration-300",
                  zoneId === "patio"
                    ? "border-dashed border-zinc-700/40 rounded-xl"
                    : "border-zinc-800/30 rounded-lg",
                  isDimmed && "opacity-20"
                )}
                style={{
                  left: `${bounds.x}%`,
                  top: `${bounds.y}%`,
                  width: `${bounds.w}%`,
                  height: `${bounds.h}%`,
                }}
              >
                <span className={cn(
                  "absolute top-1.5 left-2 text-[8px] font-bold uppercase tracking-[0.15em] pointer-events-none",
                  zoneId === "patio" ? "text-zinc-600" : "text-zinc-700"
                )}>
                  {bounds.label}
                </span>
              </div>
            )
          })}

          {/* Server section overlays */}
          {renderServerOverlays && serverSections.map((section) => {
            const sectionTables = floorTables.filter((t) => section.tables.includes(t.id))
            if (sectionTables.length === 0) return null
            const minX = Math.min(...sectionTables.map((t) => t.x)) - 2
            const minY = Math.min(...sectionTables.map((t) => t.y)) - 2
            const maxX = Math.max(...sectionTables.map((t) => t.x + t.width)) + 2
            const maxY = Math.max(...sectionTables.map((t) => t.y + t.height)) + 2
            return (
              <div
                key={section.id}
                className="absolute rounded-lg border border-dashed pointer-events-none transition-all duration-500"
                style={{
                  left: `${minX}%`,
                  top: `${minY}%`,
                  width: `${maxX - minX}%`,
                  height: `${maxY - minY}%`,
                  borderColor: `${section.colorHex}40`,
                  backgroundColor: `${section.colorHex}08`,
                }}
              >
                <span
                  className="absolute -top-2 left-2 rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                  style={{ backgroundColor: `${section.colorHex}30`, color: section.colorHex }}
                >
                  {section.name} ({section.activeTables} active)
                </span>
              </div>
            )
          })}

          {/* Merged table connectors */}
          {floorTables
            .filter((t) => t.mergedWith && t.id < t.mergedWith)
            .map((t) => {
              const partner = floorTables.find((p) => p.id === t.mergedWith)
              if (!partner) return null
              const x1 = t.x + t.width / 2
              const y1 = t.y + t.height / 2
              const x2 = partner.x + partner.width / 2
              const y2 = partner.y + partner.height / 2
              const isDimmed = zone !== "all" && t.zone !== zone
              return (
                <svg
                  key={`merge-${t.id}-${partner.id}`}
                  className={cn(
                    "absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300",
                    isDimmed && "opacity-20"
                  )}
                >
                  <line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="hsl(220 15% 35%)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="fp-merge-line"
                  />
                </svg>
              )
            })}

          {/* Table Nodes */}
          {tableStates.map((state) => (
              <FloorplanTableNode
                key={state.table.id}
                state={state}
                heatMap={heatMap}
                zone={zone}
                isSelected={selectedTable === state.table.id}
                whatIfMode={whatIfMode}
                onSelect={onSelectTable}
              />
          ))}
        </div>
      </div>
    </div>
  )
}
