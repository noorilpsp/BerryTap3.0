"use client"

import { BellRing, Bike, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Seat, OrderItem } from "@/lib/table-data"
import { getReadyItems, getSeatForItem } from "@/lib/table-data"

interface FoodReadyAlertProps {
  seats: Seat[]
  onDismiss: () => void
  onAcknowledge: () => void
}

export function FoodReadyAlert({ seats, onDismiss, onAcknowledge }: FoodReadyAlertProps) {
  const readyItems = getReadyItems(seats)
  if (readyItems.length === 0) return null
  const previewItems = readyItems.slice(0, 3)
  const extraCount = Math.max(0, readyItems.length - previewItems.length)

  return (
    <div className="animate-fade-slide-in mx-3 mb-2 rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-500/28 via-orange-500/22 to-amber-300/10 px-3 py-2.5 shadow-[0_10px_28px_rgba(251,146,60,0.28)] ring-1 ring-amber-300/35 md:mx-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-black shadow-[0_0_10px_rgba(252,211,77,0.45)]">
              <BellRing className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/35 px-1.5 text-[10px] font-bold text-amber-100">
            {readyItems.length}
            </span>
            <h3 className="text-sm font-semibold text-amber-50">Ready for Pickup</h3>
          </div>
          <p className="mt-1 truncate text-xs text-amber-100">
            {previewItems
              .map((item) => {
                const seat = getSeatForItem(seats, item.id)
                return `${item.name}${seat ? ` (S${seat.number})` : ""}`
              })
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
      <div className="mt-2 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-amber-100/45 bg-black/20 px-2.5 text-xs text-amber-50 hover:bg-black/30"
          onClick={onDismiss}
        >
          <Bike className="mr-1 h-3.5 w-3.5" />
          Call Runner
        </Button>
        <Button
          size="sm"
          className="h-7 bg-emerald-400 px-2.5 text-xs font-semibold text-black hover:bg-emerald-300"
          onClick={onAcknowledge}
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          On My Way
        </Button>
      </div>
    </div>
  )
}
