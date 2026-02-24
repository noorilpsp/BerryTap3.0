"use client"

import React from "react"

import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FloorTable, FloorTableStatus } from "@/lib/floor-map-data"
import { floorStatusConfig, stageConfig } from "@/lib/floor-map-data"
import { ZOOM_LEVELS } from "@/lib/animation-config"

interface MapTableNodeProps {
  table: FloorTable
  scale: number
  isOwn: boolean
  dimmed: boolean
  highlighted: boolean
  highlightType: "search" | "alert" | null
  onTap: (tableId: string) => void
  onLongPress: (tableId: string, e: React.MouseEvent | React.TouchEvent) => void
  entryIndex: number
  appeared: boolean
}

const statusGlowClass: Record<FloorTableStatus, string> = {
  free: "glow-free",
  active: "glow-active",
  urgent: "glow-urgent",
  billing: "glow-billing",
  closed: "glow-closed",
}

const statusBgClasses: Record<FloorTableStatus, string> = {
  free: "bg-emerald-500/10 border-emerald-400/40",
  active: "bg-amber-500/10 border-amber-400/40",
  urgent: "bg-red-500/10 border-red-400/50",
  billing: "bg-blue-500/10 border-blue-400/40",
  closed: "bg-secondary/50 border-border/50",
}

const statusTextClasses: Record<FloorTableStatus, string> = {
  free: "text-emerald-400",
  active: "text-amber-400",
  urgent: "text-red-400",
  billing: "text-blue-400",
  closed: "text-muted-foreground",
}

export function MapTableNode({
  table,
  scale,
  isOwn,
  dimmed,
  highlighted,
  highlightType,
  onTap,
  onLongPress,
  entryIndex,
  appeared,
}: MapTableNodeProps) {
  const cfg = floorStatusConfig[table.status]
  const longPressTimer = { current: null as ReturnType<typeof setTimeout> | null }

  function handlePointerDown(e: React.PointerEvent) {
    longPressTimer.current = setTimeout(() => {
      onLongPress(table.id, e as unknown as React.MouseEvent)
    }, 500)
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleClick() {
    onTap(table.id)
  }

  // Use builder dimensions if available, otherwise fall back to defaults
  const hasBuilderDimensions = table.width !== undefined && table.height !== undefined
  const width = hasBuilderDimensions ? table.width : (table.shape === "rectangle" ? 96 : 64)
  const height = hasBuilderDimensions ? table.height : (table.shape === "booth" ? 72 : 64)
  const rotation = table.rotation || 0

  const nodeStyle: React.CSSProperties = {
    "--node-index": entryIndex,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${rotation}deg)`,
  } as React.CSSProperties

  // Shape-specific styles
  const shapeClasses = {
    round: "rounded-full",
    square: "rounded-xl",
    rectangle: "rounded-lg",
    booth: "rounded-2xl",
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={cn(
        "absolute flex items-center justify-center border status-transitioning gpu-layer",
        shapeClasses[table.shape],
        statusBgClasses[table.status],
        statusGlowClass[table.status],
        table.status === "urgent" && "animate-pulse-ring",
        dimmed && "opacity-15 pointer-events-none",
        !dimmed && isOwn && "ring-1 ring-primary/40 ring-offset-1 ring-offset-background",
        highlighted && highlightType === "alert" && "animate-highlight-pulse-urgent",
        highlighted && highlightType === "search" && "animate-highlight-pulse",
        table.status === "closed" && "border-dashed",
        !dimmed && "hover:scale-110 hover:brightness-125 cursor-pointer transition-transform duration-150",
        !appeared && "animate-node-appear",
        "focus-dim",
      )}
      style={{
        left: table.position.x,
        top: table.position.y,
        ...nodeStyle,
      }}
      aria-label={`Table ${table.number}, ${cfg.label}${table.guests ? `, ${table.guests} guests` : ""}`}
    >
      <span className={cn("font-mono text-sm font-bold", statusTextClasses[table.status])}>
        {table.number}
      </span>
    </button>
  )
}
