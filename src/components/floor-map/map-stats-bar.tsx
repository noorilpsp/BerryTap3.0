"use client"

import { cn } from "@/lib/utils"
import type { TableColorState } from "@/lib/table-color-state"
import { TABLE_CARD_COLOR_STATES, TABLE_COLOR_STATES } from "@/lib/table-color-state"

interface MapStatsBarProps {
  counts: Record<TableColorState, number>
  activeStatusFilter: TableColorState | null
  onStatusFilter: (status: TableColorState | null) => void
}

const statusOrder: TableColorState[] = [
  "needs_attention",
  "food_ready",
  "bill_requested",
  "occupied",
  "reserved",
  "available",
  "cleaning",
]

export function MapStatsBar({
  counts,
  activeStatusFilter,
  onStatusFilter,
}: MapStatsBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-card/60 px-4 py-2 backdrop-blur-sm md:px-6">
      {statusOrder.map((status) => {
        const cfg = TABLE_COLOR_STATES[status]
        const cardCfg = TABLE_CARD_COLOR_STATES[status]
        const count = counts[status]
        const isActive = activeStatusFilter === status

        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatusFilter(isActive ? null : status)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all",
              cardCfg.bgClass,
              cardCfg.borderClass,
              cardCfg.textClass,
              isActive && "ring-2 ring-offset-1 ring-offset-background ring-primary/40 bg-white/3",
              !isActive && "hover:brightness-125"
            )}
            aria-label={`${cfg.label}: ${count} tables`}
            aria-pressed={isActive}
          >
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", cfg.dotClass)}
            />
            <span className="tabular-nums">{count}</span>
            <span className="hidden text-muted-foreground sm:inline">{cfg.label}</span>
          </button>
        )
      })}
    </div>
  )
}
