"use client"

import { useRef, useState, useCallback } from "react"
import { Star, ShellIcon, Cake, Heart, Accessibility, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type FloorTableState,
  type HeatMapMode,
  type ZoneId,
  type FloorTable,
  getServerForTable,
  getRevenueForTable,
  getTurnTimeForTable,
  getAvailabilityColor,
  getRevenueHeatColor,
  getTurnTimeHeatColor,
  getCourseLabel,
  formatTime12h,
} from "@/lib/floorplan-data"

interface TableNodeProps {
  state: FloorTableState
  heatMap: HeatMapMode
  zone: ZoneId
  isSelected: boolean
  whatIfMode: boolean
  onSelect: (tableId: string) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

function getStatusClasses(state: FloorTableState, heatMap: HeatMapMode): { border: string; bg: string; glow: string } {
  if (heatMap === "availability") {
    return getAvailabilityColor(state.status)
  }
  if (heatMap === "revenue") {
    const rev = getRevenueForTable(state.table.id)
    return { border: "border-zinc-600", bg: getRevenueHeatColor(rev?.currentCheck ?? 0), glow: "" }
  }
  if (heatMap === "turn-time") {
    const turn = getTurnTimeForTable(state.table.id)
    return { border: "border-zinc-600", bg: getTurnTimeHeatColor(turn), glow: "" }
  }
  if (heatMap === "server-load") {
    const server = getServerForTable(state.table.id)
    if (!server) return { border: "border-zinc-700", bg: "bg-zinc-800/30", glow: "" }
    const colorMap: Record<string, { border: string; bg: string; glow: string }> = {
      purple: { border: "border-purple-500/60", bg: server.load === "high" ? "bg-purple-500/25" : "bg-purple-500/10", glow: server.load === "high" ? "shadow-[0_0_12px_rgba(168,85,247,0.3)]" : "" },
      teal: { border: "border-teal-500/60", bg: server.load === "high" ? "bg-teal-500/25" : server.load === "medium" ? "bg-teal-500/15" : "bg-teal-500/8", glow: "" },
      amber: { border: "border-amber-500/60", bg: "bg-amber-500/8", glow: "" },
      cyan: { border: "border-cyan-500/60", bg: "bg-cyan-500/8", glow: "" },
      pink: { border: "border-pink-500/60", bg: "bg-pink-500/8", glow: "" },
    }
    return colorMap[server.color] ?? { border: "border-zinc-700", bg: "bg-zinc-800/30", glow: "" }
  }

  // Default (off)
  switch (state.status) {
    case "empty":         return { border: "border-zinc-700", bg: "bg-zinc-800/20", glow: "" }
    case "reserved":      return { border: "border-blue-500", bg: "bg-blue-500/10", glow: "" }
    case "seated":        return { border: "border-emerald-500", bg: "bg-emerald-500/15", glow: "" }
    case "arriving-soon": return { border: "border-amber-500", bg: "bg-amber-500/10", glow: "" }
    case "high-risk":     return { border: "border-rose-500", bg: "bg-rose-500/10", glow: "" }
    case "completed":     return { border: "border-zinc-600", bg: "bg-zinc-800/30", glow: "" }
    case "merged":        return { border: "border-zinc-700 border-dashed", bg: "bg-zinc-800/10", glow: "" }
  }
}

function getTagIcon(tagType: string) {
  switch (tagType) {
    case "vip":         return <Star className="h-2.5 w-2.5 text-amber-400" />
    case "allergy":     return <ShellIcon className="h-2.5 w-2.5 text-rose-400" />
    case "birthday":    return <Cake className="h-2.5 w-2.5 text-pink-400" />
    case "anniversary": return <Heart className="h-2.5 w-2.5 text-pink-400" />
    case "wheelchair":  return <Accessibility className="h-2.5 w-2.5 text-blue-400" />
    case "high-value":  return <CreditCard className="h-2.5 w-2.5 text-emerald-400" />
    default:            return null
  }
}

function getStatusLabel(status: FloorTableState["status"]): string {
  switch (status) {
    case "empty": return "Open"
    case "completed": return "Turning"
    case "merged": return "Merged"
    case "reserved": return "Reserved"
    case "arriving-soon": return "Arriving"
    case "high-risk": return "At Risk"
    default: return ""
  }
}

export function FloorplanTableNode({
  state,
  heatMap,
  zone,
  isSelected,
  whatIfMode,
  onSelect,
  onDragOver,
  onDrop,
}: TableNodeProps) {
  const nodeRef = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [dropTarget, setDropTarget] = useState(false)

  const { table } = state
  const styles = getStatusClasses(state, heatMap)
  const isDimmed = zone !== "all" && table.zone !== zone
  const isMerged = state.status === "merged"

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropTarget(true)
      onDragOver?.(e)
    },
    [onDragOver]
  )

  const handleDragLeave = useCallback(() => {
    setDropTarget(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDropTarget(false)
      onDrop?.(e)
    },
    [onDrop]
  )

  // Guest display info
  const showGuest = state.currentGuest && (state.status === "seated" || state.status === "arriving-soon")
  const showNext = state.nextReservation && !showGuest
  const displayName = showGuest ? state.currentGuest : showNext ? state.nextReservation?.guestName : null
  const displaySize = showGuest ? state.currentPartySize : showNext ? state.nextReservation?.partySize : null
  const displayTime = showGuest
    ? (state.currentCourse ? getCourseLabel(state.currentCourse) : undefined)
    : showNext
    ? formatTime12h(state.nextReservation!.time)
    : undefined
  const displayTags = showGuest ? [] : (state.nextReservation?.tags ?? [])

  // Revenue overlay text
  const revenue = getRevenueForTable(table.id)
  const turnTime = getTurnTimeForTable(table.id)
  const server = getServerForTable(table.id)

  const isPulsing = state.status === "arriving-soon" || state.status === "high-risk"

  // ARIA label
  const ariaLabel = `Table ${table.label}, ${table.seats} seats${table.areaLabel ? `, ${table.areaLabel} area` : ""}, ${table.zone === "main" ? "Main Dining" : table.zone === "patio" ? "Patio" : "Private Room"}${state.currentGuest ? `, currently occupied by ${state.currentGuest}` : ""}${state.nextReservation ? `, next reservation ${state.nextReservation.guestName} at ${formatTime12h(state.nextReservation.time)}` : ""}`

  return (
    <button
      ref={nodeRef}
      onClick={() => onSelect(table.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "absolute flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none",
        table.shape === "round" ? "rounded-full" : "rounded-lg",
        "border-2",
        styles.border,
        styles.bg,
        styles.glow,
        isDimmed && "opacity-20 pointer-events-none",
        isSelected && "ring-2 ring-cyan-400/60 ring-offset-1 ring-offset-zinc-950",
        (isHovered && !isDimmed) && "scale-[1.08] z-30 shadow-lg shadow-black/40",
        isPulsing && "fp-pulse-table",
        dropTarget && state.status === "empty" && "ring-2 ring-emerald-400/60 fp-drop-accept",
        dropTarget && state.status !== "empty" && "ring-2 ring-rose-400/60 fp-drop-reject",
        whatIfMode && isSelected && "border-dashed border-amber-400/60",
        "fp-table-appear"
      )}
      style={{
        left: `${table.x}%`,
        top: `${table.y}%`,
        width: `${table.width}%`,
        height: `${table.height}%`,
      }}
      aria-label={ariaLabel}
      role="button"
      tabIndex={isDimmed ? -1 : 0}
    >
      {/* Table label + seats */}
      <span className="text-[10px] font-bold text-foreground leading-none">{table.label}</span>
      <span className="text-[8px] text-muted-foreground leading-none mt-0.5">{table.seats}p</span>

      {/* Guest / status info */}
      {displayName && (
        <span className="mt-0.5 max-w-full truncate text-[8px] font-medium text-foreground/90 leading-none px-1">
          {displayName} ({displaySize})
        </span>
      )}
      {displayTime && (
        <span className="text-[7px] text-muted-foreground leading-none mt-0.5 max-w-full truncate px-1">
          {displayTime}
        </span>
      )}

      {/* Status label for empty/completed/merged */}
      {!displayName && state.status !== "seated" && (
        <span className={cn(
          "mt-0.5 text-[7px] font-medium leading-none",
          state.status === "empty" ? "text-zinc-500" : state.status === "completed" ? "text-zinc-400" : "text-zinc-500"
        )}>
          {getStatusLabel(state.status)}
        </span>
      )}

      {/* Tags */}
      {displayTags.length > 0 && (
        <div className="mt-0.5 flex items-center gap-0.5">
          {displayTags.slice(0, 3).map((tag, i) => (
            <span key={i}>{getTagIcon(tag.type)}</span>
          ))}
        </div>
      )}

      {/* Heat map overlays */}
      {heatMap === "revenue" && revenue && revenue.currentCheck > 0 && (
        <span className="absolute -top-1 -right-1 rounded bg-emerald-600/80 px-1 py-0.5 text-[7px] font-bold text-emerald-50 leading-none">
          ${revenue.currentCheck}
        </span>
      )}
      {heatMap === "turn-time" && turnTime && turnTime.seatedDurationMin > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 rounded px-1 py-0.5 text-[7px] font-bold leading-none",
          turnTime.status === "fast" ? "bg-emerald-600/80 text-emerald-50" :
          turnTime.status === "on-target" ? "bg-amber-600/80 text-amber-50" :
          "bg-rose-600/80 text-rose-50"
        )}>
          {turnTime.seatedDurationMin}m
        </span>
      )}
      {heatMap === "server-load" && server && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-zinc-900/90 px-1 py-0.5 text-[6px] font-bold leading-none text-foreground whitespace-nowrap">
          {server.name}
        </span>
      )}
    </button>
  )
}
