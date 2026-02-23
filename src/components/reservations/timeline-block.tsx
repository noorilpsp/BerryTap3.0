"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type PointerEvent } from "react"
import { Clock } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type TimelineBlock as TBlock,
  type GhostBlock,
  type MergedBlock,
  type ZoomLevel,
  getBlockColor,
  getPartiallySeatedRatio,
  getStatusDot,
  getStatusLabel,
  formatTime24h,
  timeToOffset,
  offsetToPixel,
} from "@/lib/timeline-data"

// ── Reservation Block ────────────────────────────────────────────────────────

interface ReservationBlockProps {
  block: TBlock
  zoom: ZoomLevel
  slotWidth?: number
  onClick: (block: TBlock) => void
  axisStart: string
  disableHoverScale?: boolean
  onDragStart?: (event: PointerEvent<HTMLDivElement>, block: TBlock) => void
  onResizeStart?: (event: PointerEvent<HTMLDivElement>, block: TBlock) => void
  isGhosted?: boolean
  isInvalidDrop?: boolean
}

function offsetToPixelAdaptive(offset: number, zoom: ZoomLevel, slotWidth?: number): number {
  if (!slotWidth) return offsetToPixel(offset, zoom)
  const slotMinutes = zoom === "1hr" ? 60 : zoom === "30min" ? 30 : 15
  return (offset / slotMinutes) * slotWidth
}

export function ReservationBlock({
  block,
  zoom,
  slotWidth,
  onClick,
  axisStart,
  disableHoverScale = false,
  onDragStart,
  onResizeStart,
  isGhosted = false,
  isInvalidDrop = false,
}: ReservationBlockProps) {
  const [isPressFeedbackActive, setIsPressFeedbackActive] = useState(false)
  const pressFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startOff = timeToOffset(block.startTime, axisStart)
  const endOff = timeToOffset(block.endTime, axisStart)
  const leftPx = offsetToPixelAdaptive(startOff, zoom, slotWidth)
  const widthPx = offsetToPixelAdaptive(endOff - startOff, zoom, slotWidth)
  const colors = getBlockColor(block)
  const dot = getStatusDot(block)
  const partialRatio = getPartiallySeatedRatio(block)
  const statusLabel = getStatusLabel(block)
  const isNoShow = block.status === "no-show"

  // Tag icons
  const tagIcons = block.tags.map((t) => {
    switch (t.type) {
      case "vip":        return { symbol: "\u2605", label: t.label }
      case "allergy":    return { symbol: "\uD83E\uDD90", label: t.label }
      case "birthday":   return { symbol: "\uD83C\uDF82", label: t.label }
      case "anniversary": return { symbol: "\uD83D\uDC8D", label: t.label }
      case "first-timer": return { symbol: "\u2726", label: t.label }
      default:           return { symbol: "\u25CF", label: t.label }
    }
  })

  const mergeLabel = block.mergedWith ? `${block.table}+${block.mergedWith} MERGED` : null

  useEffect(() => {
    return () => {
      if (pressFeedbackTimerRef.current) {
        clearTimeout(pressFeedbackTimerRef.current)
      }
    }
  }, [])

  const triggerPressFeedback = () => {
    setIsPressFeedbackActive(true)
    if (pressFeedbackTimerRef.current) {
      clearTimeout(pressFeedbackTimerRef.current)
    }
    pressFeedbackTimerRef.current = setTimeout(() => {
      setIsPressFeedbackActive(false)
      pressFeedbackTimerRef.current = null
    }, 140)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "tl-block absolute top-1 bottom-1 rounded-[8px] transform-gpu",
                "transition-[transform,box-shadow] duration-120",
                !disableHoverScale && "hover:z-10 hover:scale-[1.05]",
                "active:scale-[1.05]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950",
                onDragStart ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-pointer",
                colors.container,
                colors.withBlur && "backdrop-blur-sm",
                colors.pulse,
                isPressFeedbackActive && "z-10 scale-[1.05]",
                isGhosted && "opacity-85 z-40 ring-1 ring-cyan-300/50 shadow-xl shadow-black/40",
                isInvalidDrop && "ring-1 ring-rose-400/60"
              )}
              style={{
                left: leftPx,
                width: Math.max(widthPx, 40),
                borderStyle: colors.borderStyle,
              }}
              onClick={() => {
                if (!onDragStart) onClick(block)
              }}
              onPointerDown={(event) => {
                if (!event.isPrimary) return
                if (event.pointerType !== "touch" && event.button !== 0) return
                triggerPressFeedback()
                onDragStart?.(event, block)
              }}
              onKeyDown={(e) => { if (e.key === "Enter") onClick(block) }}
              aria-label={`${block.guestName}, party of ${block.partySize}, ${block.table}, ${formatTime24h(block.startTime)}, ${statusLabel}${block.tags.map(t => `, ${t.label}`).join("")}`}
            >
              {partialRatio !== null && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]">
                  <div className="absolute inset-y-0 left-0 bg-emerald-500/15" style={{ width: `${partialRatio}%` }} />
                  <div className="absolute inset-y-0 right-0 bg-cyan-500/15" style={{ width: `${100 - partialRatio}%` }} />
                  <div className="absolute inset-y-0 w-px bg-zinc-600/70" style={{ left: `${partialRatio}%` }} />
                </div>
              )}
              <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden px-2 py-1">
                {/* Top row: name, party size, risk dot */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "truncate text-[11px] font-semibold leading-tight",
                    isNoShow && "line-through",
                    colors.text
                  )}>
                    {block.guestName}
                  </span>
                  <span className={cn("shrink-0 text-[10px]", colors.text)}>
                    ({block.partySize})
                  </span>
                  <span className="relative ml-auto h-2.5 w-2.5 shrink-0">
                    <span className={cn("absolute inset-0 rounded-full", dot.className)} style={dot.style} />
                    {dot.pulseClass && (
                      <span className={cn("absolute -inset-1.5 rounded-full", dot.pulseClass)} />
                    )}
                  </span>
                </div>

                {/* Middle: status */}
                <div className="flex items-center gap-1 min-w-0">
                  {block.status === "late" && <Clock className="h-2.5 w-2.5 shrink-0 text-rose-300" />}
                  <span className={cn("truncate text-[10px]", colors.statusText)}>
                    {statusLabel}
                  </span>
                </div>

                {/* Bottom: tags + merge label */}
                {(tagIcons.length > 0 || mergeLabel) && (
                  <div className="flex items-center gap-1 min-w-0">
                    {tagIcons.map((t, i) => (
                      <span key={i} className="text-[10px] text-zinc-100/95" title={t.label}>
                        {t.symbol}
                      </span>
                    ))}
                    {mergeLabel && (
                      <Badge variant="outline" className="h-4 border-zinc-600 px-1 text-[8px] text-zinc-400">
                        {mergeLabel}
                      </Badge>
                    )}
                  </div>
                )}

                {/* High risk badge */}
                {block.risk === "high" && block.riskScore && (
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    <Badge className="h-4 bg-rose-600 px-1 text-[8px] font-bold text-rose-50">
                      {block.riskScore}%
                    </Badge>
                  </div>
                )}

                {onResizeStart && (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${block.guestName}`}
                    className="absolute inset-y-0 right-0 w-2 cursor-ew-resize rounded-r-md bg-transparent hover:bg-cyan-400/20 touch-none"
                    onPointerDown={(event) => {
                      if (!event.isPrimary) return
                      if (event.pointerType !== "touch" && event.button !== 0) return
                      event.stopPropagation()
                      onResizeStart(event, block)
                    }}
                  />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] border-zinc-700 bg-zinc-900 text-foreground">
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{block.guestName} ({block.partySize})</p>
              <p>{block.table}{block.mergedWith ? ` + ${block.mergedWith}` : ""}</p>
              <p>{formatTime24h(block.startTime)} - {formatTime24h(block.endTime)}</p>
              <p className={colors.statusText}>{statusLabel}</p>
              {block.tags.map((t, i) => (
                <p key={i} className="text-muted-foreground">{t.label}{t.detail ? `: ${t.detail}` : ""}</p>
              ))}
              {block.notes && <p className="text-muted-foreground italic">{block.notes}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent className="border-zinc-700 bg-zinc-900">
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Seat Now</ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Text Guest</ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Assign Server</ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground" asChild>
          <Link
            href={`?action=edit&id=${block.id}&guestName=${encodeURIComponent(block.guestName)}&time=${block.startTime}&partySize=${block.partySize}&table=${block.table}`}
          >
            Edit Reservation
          </Link>
        </ContextMenuItem>
        <ContextMenuItem className="text-foreground focus:bg-zinc-800 focus:text-foreground">Move to Waitlist</ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-400">Cancel</ContextMenuItem>
        <ContextMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-400">No-Show</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ── Ghost Block ──────────────────────────────────────────────────────────────

interface GhostBlockComponentProps {
  ghost: GhostBlock
  zoom: ZoomLevel
  slotWidth?: number
  axisStart: string
}

export function GhostBlockComponent({ ghost, zoom, slotWidth, axisStart }: GhostBlockComponentProps) {
  const startOff = timeToOffset(ghost.predictedTime, axisStart)
  const endOff = timeToOffset(ghost.endTime, axisStart)
  const leftPx = offsetToPixelAdaptive(startOff, zoom, slotWidth)
  const widthPx = offsetToPixelAdaptive(endOff - startOff, zoom, slotWidth)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="tl-ghost-block absolute top-1.5 bottom-1.5 cursor-pointer rounded-md border border-dotted border-zinc-500/20 bg-transparent hover:border-zinc-500/35"
          style={{ left: leftPx, width: Math.max(widthPx, 40) }}
          aria-label={`Predicted available slot: ${ghost.label}`}
        >
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <span className="text-[10px] italic text-zinc-400/50">{ghost.label}</span>
            {ghost.conditional && (
              <span className="text-[9px] italic text-zinc-500/45">({ghost.conditional})</span>
            )}
            <span className="mt-0.5 text-[9px] italic text-zinc-500/45">(predicted)</span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="border-zinc-700 bg-zinc-900 text-foreground">
        <div className="text-xs">
          <p className="font-semibold">Predicted Available Slot</p>
          <p>{ghost.label}</p>
          {ghost.conditional && <p className="text-muted-foreground">{ghost.conditional}</p>}
          <p className="mt-1 text-emerald-400">Click to book this slot</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// ── Merged Block Indicator ───────────────────────────────────────────────────

interface MergedBlockComponentProps {
  merged: MergedBlock
  zoom: ZoomLevel
  slotWidth?: number
  axisStart: string
}

export function MergedBlockComponent({ merged, zoom, slotWidth, axisStart }: MergedBlockComponentProps) {
  const startOff = timeToOffset(merged.startTime, axisStart)
  const endOff = timeToOffset(merged.endTime, axisStart)
  const leftPx = offsetToPixelAdaptive(startOff, zoom, slotWidth)
  const widthPx = offsetToPixelAdaptive(endOff - startOff, zoom, slotWidth)

  return (
    <div
      className="absolute top-1 bottom-1 rounded-[8px] border border-zinc-600/35 bg-zinc-700/20"
      style={{ left: leftPx, width: widthPx }}
    >
      <div className="flex h-full items-center justify-center">
        <span className="text-[10px] text-zinc-500">
          MERGED WITH {merged.mergedWith}
        </span>
      </div>
    </div>
  )
}
