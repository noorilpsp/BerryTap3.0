"use client"

import { Clock, MapPin, Users, AlertTriangle, Split, Timer, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ActiveMerge } from "@/lib/merge-split-data"

interface ActiveMergesPanelProps {
  merges: ActiveMerge[]
  onSplit: (mergeId: string) => void
  onViewDetails: (mergeId: string) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

export function ActiveMergesPanel({ merges, onSplit, onViewDetails }: ActiveMergesPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Merges
          <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-[10px]">
            {merges.length}
          </Badge>
        </h2>
      </div>

      {merges.map((merge) => (
        <Card
          key={merge.id}
          className="group glass-surface overflow-hidden border-emerald-500/20 bg-emerald-500/5 p-0 transition-colors hover:border-emerald-500/30"
        >
          <div className="p-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-400">
                  {merge.tables.join(" + ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {merge.combinedSeats} seats
                </span>
              </div>
              <Badge
                variant="secondary"
                className={
                  merge.status === "in_use"
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-blue-500/30 bg-blue-500/15 text-blue-400"
                }
              >
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                    merge.status === "in_use" ? "bg-emerald-400" : "bg-blue-400"
                  }`}
                />
                {merge.status === "in_use" ? "In use" : "Reserved"}
              </Badge>
            </div>

            <Separator className="my-2 bg-border/30" />

            {/* Info rows */}
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3 w-3 shrink-0" />
                <span>
                  {merge.reservation.guest} ({merge.reservation.partySize}p)
                </span>
                {merge.reservation.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="h-4 border-border/40 px-1 text-[9px]">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{merge.zone}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                <span>
                  {merge.reservation.seatedAt
                    ? `Since ${formatTime(merge.reservation.seatedAt)}`
                    : `Merge window: ${formatTime(merge.reservation.reservedFor!)}`}
                  {" "}--{" "}
                  {formatTime(merge.reservation.estimatedEnd)}
                </span>
              </div>

              {merge.conflictNote && (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>{merge.conflictNote}</span>
                </div>
              )}

              {merge.autoSplitAt && (
                <div className="flex items-center gap-2 text-amber-400/80">
                  <Timer className="h-3 w-3 shrink-0" />
                  <span>Auto-split at {formatTime(merge.autoSplitAt)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                onClick={() => onSplit(merge.id)}
              >
                <Split className="h-3 w-3" />
                Split Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 border-border/40 text-xs hover:bg-secondary/80"
                onClick={() => onViewDetails(merge.id)}
              >
                Details
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
