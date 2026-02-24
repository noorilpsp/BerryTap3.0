"use client"

import { cn } from "@/lib/utils"
import {
  NutOff,
  Leaf,
  LeafyGreen,
  Wheat,
  MilkOff,
  Shell,
  Pencil,
  Plus,
  Check,
  CircleDot,
  Pause,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Seat, SeatItem, DietaryFlag } from "@/lib/table-detail-data"
import { dietaryConfig } from "@/lib/table-detail-data"

interface SeatDetailPanelProps {
  seat: Seat
  className?: string
}

const dietaryIcons: Record<DietaryFlag, typeof NutOff> = {
  nut_allergy: NutOff,
  vegetarian: Leaf,
  vegan: LeafyGreen,
  gluten_free: Wheat,
  dairy_free: MilkOff,
  shellfish_allergy: Shell,
}

const statusIcons: Record<string, { icon: typeof Check; color: string; label: string }> = {
  served:  { icon: Check,     color: "text-emerald-400", label: "Served" },
  ready:   { icon: CircleDot, color: "text-red-400",     label: "Ready" },
  cooking: { icon: CircleDot, color: "text-amber-400",   label: "Cooking" },
  held:    { icon: Pause,     color: "text-muted-foreground", label: "Held" },
}

export function SeatDetailPanel({ seat, className }: SeatDetailPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] p-4 shadow-lg shadow-black/20",
        "bg-[hsl(225,15%,9%)]/90 backdrop-blur-xl",
        "animate-fade-slide-in",
        className
      )}
      role="region"
      aria-label={`Seat ${seat.number} details`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground font-mono tracking-wide">
          Seat {seat.number}
        </h3>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </div>

      {/* Dietary flags */}
      {seat.dietary.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {seat.dietary.map((d) => {
            const cfg = dietaryConfig[d]
            const Icon = dietaryIcons[d]
            return (
              <span
                key={d}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
                  "bg-white/[0.04] border border-white/[0.06]"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                <span className="text-secondary-foreground">{cfg.label}</span>
              </span>
            )
          })}
        </div>
      )}

      {/* Notes */}
      {seat.notes.length > 0 && (
        <div className="mb-3">
          {seat.notes.map((note, i) => (
            <p key={i} className="text-sm text-muted-foreground italic">
              &quot;{note}&quot;
            </p>
          ))}
        </div>
      )}

      {/* Order summary */}
      {seat.itemCount > 0 && (
        <>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Ordered: {seat.itemCount} items
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums font-mono">
              &euro;{seat.orderTotal.toFixed(2)}
            </span>
          </div>

          {seat.items && seat.items.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {seat.items.map((item, i) => (
                <SeatItemRow key={i} item={item} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Add items action */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs bg-transparent border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Items to Seat {seat.number}
      </Button>
    </div>
  )
}

function SeatItemRow({ item }: { item: SeatItem }) {
  const sts = statusIcons[item.status]
  const Icon = sts?.icon ?? Check

  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="flex-1 truncate text-secondary-foreground">
        {item.name}
        {item.allergyFlag && (
          <AlertTriangle className="ml-1 inline-block h-3 w-3 text-amber-400" />
        )}
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <Icon className={cn("h-3 w-3", sts?.color)} />
        <span className={cn("text-xs font-mono", sts?.color)}>
          {sts?.label}
        </span>
      </span>
    </li>
  )
}
