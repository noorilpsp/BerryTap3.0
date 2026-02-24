"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react" // Import Minus and Plus components

import { cn } from "@/lib/utils"
import type { FloorTableStatus } from "@/lib/floor-map-data"
import { floorStatusConfig } from "@/lib/floor-map-data"

interface StatusCount {
  free: number
  active: number
  urgent: number
  billing: number
  closed: number
}

interface MapStatsBarProps {
  counts: StatusCount
  activeStatusFilter: FloorTableStatus | null
  onStatusFilter: (status: FloorTableStatus | null) => void
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
}

const statusOrder: FloorTableStatus[] = ["free", "active", "urgent", "billing"]

const statusGlowBg: Record<string, string> = {
  free: "bg-emerald-500/10 border-emerald-400/30 text-emerald-400",
  active: "bg-amber-500/10 border-amber-400/30 text-amber-400",
  urgent: "bg-red-500/10 border-red-400/30 text-red-400",
  billing: "bg-blue-500/10 border-blue-400/30 text-blue-400",
}

const statusActiveGlow: Record<string, string> = {
  free: "ring-emerald-400/50 bg-emerald-500/20",
  active: "ring-amber-400/50 bg-amber-500/20",
  urgent: "ring-red-400/50 bg-red-500/20",
  billing: "ring-blue-400/50 bg-blue-500/20",
}

export function MapStatsBar({
  counts,
  activeStatusFilter,
  onStatusFilter,
}: MapStatsBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-card/60 px-4 py-2 backdrop-blur-sm md:px-6">
      {statusOrder.map((status) => {
        const cfg = floorStatusConfig[status]
        const count = counts[status]
        const isActive = activeStatusFilter === status

        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatusFilter(isActive ? null : status)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all",
              statusGlowBg[status],
              isActive && `ring-2 ring-offset-1 ring-offset-background ${statusActiveGlow[status]}`,
              !isActive && "hover:brightness-125"
            )}
            aria-label={`${cfg.label}: ${count} tables`}
            aria-pressed={isActive}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
            />
            <span className="tabular-nums">{count}</span>
            <span className="hidden text-muted-foreground sm:inline">{cfg.label}</span>
          </button>
        )
      })}
    </div>
  )
}
