"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type TimelineBlock,
  getBlockColor,
  getStatusDot,
  getStatusLabel,
  formatTime24h,
} from "@/lib/timeline-data"

interface TimelineDetailPanelProps {
  block: TimelineBlock | null
  open: boolean
  onClose: () => void
}

export function TimelineDetailPanel({ block, open, onClose }: TimelineDetailPanelProps) {
  if (!block) return null

  const colors = getBlockColor(block)
  const dot = getStatusDot(block)
  const statusLabel = getStatusLabel(block)

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-[360px] border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-0 sm:w-[400px] data-[state=open]:duration-120 data-[state=closed]:duration-90"
      >
        <SheetHeader className="border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2 text-foreground">
                {block.guestName}
                <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", dot.className)} style={dot.style} />
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Party of {block.partySize}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5" style={{ maxHeight: "calc(100dvh - 80px)" }}>
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("border border-zinc-700 bg-zinc-900/80 text-xs", colors.statusText)}>
              {statusLabel}
            </Badge>
            {block.risk === "high" && block.riskScore && (
              <Badge className="bg-rose-600 text-rose-50 text-xs border-none">
                {block.riskScore}% no-show risk
              </Badge>
            )}
          </div>

          {/* Time + Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {formatTime24h(block.startTime)} - {formatTime24h(block.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {block.table}
                {block.mergedWith && ` + ${block.mergedWith} (merged)`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{block.partySize} guests</span>
            </div>
            {block.courseProgress && (
              <div className="flex items-center gap-3 text-sm">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground capitalize">{block.courseProgress.replace("-", " ")}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {block.tags.length > 0 && (
            <>
              <Separator className="bg-zinc-800/50" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {block.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-zinc-700 text-xs text-foreground"
                    >
                      {tag.label}
                      {tag.detail && `: ${tag.detail}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {block.notes && (
            <>
              <Separator className="bg-zinc-800/50" />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
                <p className="text-sm text-muted-foreground italic">{block.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator className="bg-zinc-800/50" />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800/40 text-foreground hover:bg-zinc-700/60"
            >
              <UtensilsCrossed className="mr-1.5 h-3.5 w-3.5" />
              Seat Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800/40 text-foreground hover:bg-zinc-700/60"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Text Guest
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800/40 text-foreground hover:bg-zinc-700/60"
            >
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call Guest
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-800/40 text-foreground hover:bg-zinc-700/60"
            >
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Assign Server
            </Button>
          </div>

          {/* Danger zone */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" size="sm" className="border-rose-800/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300">
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button variant="outline" size="sm" className="border-rose-800/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300">
              No-Show
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
