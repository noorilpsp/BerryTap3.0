"use client"

import { AlertTriangle, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KitchenDelayItem } from "@/app/actions/kitchen-delay-detection"

interface KitchenDelayAlertProps {
  items: KitchenDelayItem[]
  onDismiss: () => void
}

export function KitchenDelayAlert({ items, onDismiss }: KitchenDelayAlertProps) {
  if (items.length === 0) return null

  const previewItems = items.slice(0, 3)
  const extraCount = Math.max(0, items.length - previewItems.length)
  const maxMinutes = Math.max(...items.map((i) => i.minutesLate))

  return (
    <div className="animate-fade-slide-in mx-3 mb-2 rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-600/25 via-orange-600/20 to-amber-500/15 px-3 py-2.5 shadow-[0_10px_28px_rgba(251,146,60,0.25)] ring-1 ring-amber-400/40 md:mx-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/35 px-1.5 text-[10px] font-bold text-amber-100">
              {items.length}
            </span>
            <h3 className="text-sm font-semibold text-amber-50">Kitchen Delay</h3>
          </div>
          <p className="mt-1 truncate text-xs text-amber-100">
            {previewItems
              .map((i) => `${i.minutesLate}m late${i.station ? ` (${i.station})` : ""}`)
              .join(" • ")}
            {extraCount > 0 ? ` • +${extraCount} more` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-amber-100/80 transition-colors hover:bg-black/20 hover:text-white"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
        <span className="text-[11px] text-amber-100/90">
          {maxMinutes >= 20 ? "Critical" : "Warning"}: {items.length} item(s) past due
        </span>
      </div>
    </div>
  )
}
