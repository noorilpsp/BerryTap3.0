"use client"

import Link from "next/link"
import { ArrowLeft, CreditCard, Flame, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TableDetail } from "@/lib/table-data"

interface ActionBarProps {
  table: TableDetail
  onFireWave: (waveId: string) => void
  onAddItems?: () => void
  onSend?: () => void
  onBill?: () => void
  isOrdering?: boolean
  hasPendingSend?: boolean
  canBill?: boolean
  canFireWave?: boolean
  nextFireWaveLabel?: string | null
  onFireNextWave?: () => void
}

export function ActionBar({
  table,
  onFireWave,
  onAddItems,
  onSend,
  onBill,
  isOrdering = false,
  hasPendingSend = false,
  canBill = true,
  canFireWave,
  nextFireWaveLabel,
  onFireNextWave,
}: ActionBarProps) {
  const heldWave = table.waves.find((w) => w.status === "held")
  const showSend = isOrdering && hasPendingSend
  const fireEnabled = canFireWave ?? !!heldWave
  const fireLabel = nextFireWaveLabel ?? "Fire Wave"

  return (
    <div className="table-detail-action-bar fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 border-t border-border bg-card px-3 py-2.5 md:px-4 md:py-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Add Items */}
        {onAddItems ? (
          <Button
            data-action="add-items"
            size="sm"
            variant="outline"
            className="flex-1 min-w-[100px] gap-1.5 text-xs bg-transparent border border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 transition-all"
            onClick={onAddItems}
          >
            {isOrdering ? (
              <>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Table
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add Items
              </>
            )}
          </Button>
        ) : (
          <Button
            data-action="add-items"
            size="sm"
            variant="outline"
            className="flex-1 min-w-[100px] gap-1.5 text-xs bg-transparent border border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 transition-all"
            asChild
          >
            <Link href={`/take-order/${table.id}`}>
              <Plus className="h-3.5 w-3.5" />
              Add Items
            </Link>
          </Button>
        )}

        {/* Fire Wave */}
        <Button
          data-action="fire-wave"
          size="sm"
          variant="outline"
          className={cn(
            "flex-1 min-w-[100px] gap-1.5 text-xs bg-transparent border transition-all",
            fireEnabled
              ? "border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-amber-300 animate-pulse-ring"
              : "border-amber-500/30 text-amber-400/40 cursor-not-allowed"
          )}
          onClick={() => {
            if (onFireNextWave) {
              onFireNextWave()
              return
            }
            if (heldWave) onFireWave(heldWave.id)
          }}
          disabled={!fireEnabled}
        >
          <Flame className="h-3.5 w-3.5" />
          {fireLabel}
        </Button>

        {/* Kitchen */}
        <Button
          data-action="kitchen"
          size="sm"
          variant="outline"
          className="flex-1 min-w-[100px] gap-1.5 text-xs bg-transparent border border-blue-500/50 text-blue-400 hover:border-blue-400 hover:text-blue-300 transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Kitchen
        </Button>

        {/* Bill */}
        <Button
          data-action="bill"
          data-bill-mode={showSend ? "send" : canBill ? "bill" : "disabled"}
          size="sm"
          variant="outline"
          className={cn(
            "flex-1 min-w-[100px] gap-1.5 text-xs bg-transparent border transition-all",
            showSend
              ? "border-emerald-500/50 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200"
              : canBill
                ? "border-violet-500/50 text-violet-400 hover:border-violet-400 hover:text-violet-300"
                : "border-violet-500/30 text-violet-400/40 cursor-not-allowed"
          )}
          onClick={() => {
            if (showSend) {
              onSend?.()
              return
            }
            if (!canBill) return
            onBill?.()
          }}
          disabled={!showSend && !canBill}
        >
          <CreditCard className="h-3.5 w-3.5" />
          {showSend ? "Send" : "Bill"}
        </Button>
      </div>
    </div>
  )
}
