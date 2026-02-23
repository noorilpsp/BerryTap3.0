"use client"

import { useState, useCallback } from "react"
import {
  AlertTriangle,
  Minimize2,
  Maximize2,
  Wand2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type UnassignedReservation,
  unassignedReservations,
  formatTime12h,
} from "@/lib/floorplan-data"

interface UnassignedDockProps {
  onHighlightTables?: (partySize: number) => void
  className?: string
}

export function FloorplanUnassignedDock({ onHighlightTables, className }: UnassignedDockProps) {
  const [minimized, setMinimized] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDragStart = useCallback(
    (e: React.DragEvent, res: UnassignedReservation) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ id: res.id, partySize: res.partySize }))
      e.dataTransfer.effectAllowed = "move"
      setDraggingId(res.id)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
  }, [])

  if (unassignedReservations.length === 0) return null

  return (
    <div className={cn(
      "glass-surface-strong rounded-xl transition-all duration-200",
      minimized ? "p-2" : "p-3",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-foreground">
            UNASSIGNED
          </span>
          <Badge variant="outline" className="h-4 rounded-full border-amber-500/40 bg-amber-500/10 px-1.5 text-[9px] font-bold text-amber-300">
            {unassignedReservations.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setMinimized(!minimized)}
          aria-label={minimized ? "Expand unassigned" : "Minimize unassigned"}
        >
          {minimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
        </Button>
      </div>

      {/* Cards */}
      {!minimized && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {unassignedReservations.map((res) => (
              <div
                key={res.id}
                draggable
                onDragStart={(e) => handleDragStart(e, res)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex min-w-[140px] shrink-0 cursor-grab flex-col rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition-all",
                  "hover:border-zinc-600 hover:bg-zinc-800/60 active:cursor-grabbing active:scale-95",
                  draggingId === res.id && "opacity-50 scale-95"
                )}
                role="listitem"
                aria-label={`${res.guestName}, party of ${res.partySize}, ${formatTime12h(res.time)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate max-w-20">
                    {res.guestName} ({res.partySize})
                  </span>
                  {res.risk === "high" && (
                    <AlertTriangle className="h-3 w-3 shrink-0 text-rose-400" />
                  )}
                </div>
                <span className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {formatTime12h(res.time)}
                  {res.risk === "high" && (
                    <span className="ml-1 text-rose-400">
                      {res.riskScore}% risk
                    </span>
                  )}
                </span>
                <span className="mt-1 text-[9px] text-zinc-500">{res.needsTableType}</span>

                {/* Auto-suggest button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 h-5 justify-start p-0 text-[9px] text-cyan-400 hover:text-cyan-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onHighlightTables?.(res.partySize)
                  }}
                >
                  <Wand2 className="mr-1 h-2.5 w-2.5" />
                  Auto-suggest
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] text-zinc-600 hidden sm:block">
            Drag onto a table to assign, or click auto-suggest
          </p>
        </>
      )}
    </div>
  )
}
