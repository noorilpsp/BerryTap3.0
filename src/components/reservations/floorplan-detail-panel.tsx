"use client"

import {
  Star,
  ShellIcon,
  Cake,
  Heart,
  CreditCard,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Armchair,
  MessageSquare,
  Pencil,
  CalendarPlus,
  History,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  type FloorTableState,
  getServerForTable,
  getRevenueForTable,
  getCourseLabel,
  formatTime12h,
} from "@/lib/floorplan-data"
import { useState } from "react"

interface DetailPanelProps {
  state: FloorTableState | null
  open: boolean
  onClose: () => void
}

function getTagIcon(tagType: string, size: string = "h-3 w-3") {
  switch (tagType) {
    case "vip":         return <Star className={cn(size, "text-amber-400")} />
    case "allergy":     return <ShellIcon className={cn(size, "text-rose-400")} />
    case "birthday":    return <Cake className={cn(size, "text-pink-400")} />
    case "anniversary": return <Heart className={cn(size, "text-pink-400")} />
    case "high-value":  return <CreditCard className={cn(size, "text-emerald-400")} />
    case "window":      return <Armchair className={cn(size, "text-blue-400")} />
    default:            return null
  }
}

export function FloorplanDetailPanel({ state, open, onClose }: DetailPanelProps) {
  const [showHistory, setShowHistory] = useState(false)

  if (!state) return null

  const { table } = state
  const server = getServerForTable(table.id)
  const revenue = getRevenueForTable(table.id)
  const hasCurrent = state.currentGuest && (state.status === "seated" || state.status === "arriving-soon")
  const hasNext = !!state.nextReservation

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[340px] border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-0 sm:max-w-[380px] overflow-y-auto scrollbar-none"
      >
        <SheetHeader className="border-b border-zinc-800/50 px-5 pt-5 pb-4">
          <SheetTitle className="flex items-center gap-2 text-base text-foreground">
            <span className="font-bold">{table.label}</span>
            <span className="text-sm text-muted-foreground font-normal">
              {table.seats} seats{table.areaLabel ? ` \u00B7 ${table.areaLabel}` : ""}
            </span>
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs">
            <span>Zone: {table.zone === "main" ? "Main Dining" : table.zone === "patio" ? "Patio" : "Private Room"}</span>
            {server && (
              <>
                <span className="text-zinc-600">{"\u00B7"}</span>
                <span>Server: {server.name}</span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col divide-y divide-zinc-800/40">
          {/* Current occupant */}
          {hasCurrent && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <ChevronDown className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Current ({formatTime12h(state.seatedAt!)} - ~{state.estClearTime ? formatTime12h(state.estClearTime) : "?"})
                </span>
              </div>
              <div className="rounded-lg bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {state.currentGuest} ({state.currentPartySize})
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn(
                    "font-medium",
                    state.currentCourse === "paying" || state.currentCourse === "check-printed" || state.currentCourse === "check-requested"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  )}>
                    {state.currentCourse ? getCourseLabel(state.currentCourse) : "Seated"}
                  </span>
                  {state.estClearTime && (
                    <>
                      <span className="text-zinc-600">{"\u00B7"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Est. clear {formatTime12h(state.estClearTime)}
                      </span>
                    </>
                  )}
                </div>
                {revenue && revenue.currentCheck > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <CreditCard className="h-3 w-3 text-emerald-400" />
                    <span className="text-foreground font-medium">${revenue.currentCheck.toFixed(2)}</span>
                  </div>
                )}
                {state.seatedAt && (
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Duration: {getDuration(state.seatedAt, "19:23")}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-[10px] text-muted-foreground hover:text-foreground">
                  View Order
                </Button>
              </div>
            </div>
          )}

          {/* Next reservation */}
          {hasNext && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <ChevronDown className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Next ({formatTime12h(state.nextReservation!.time)})
                </span>
              </div>
              <div className="rounded-lg bg-zinc-900/60 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {state.nextReservation!.guestName} ({state.nextReservation!.partySize})
                  </span>
                  {state.nextReservation!.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {getTagIcon(tag.type)}
                      <span className="text-[9px] text-muted-foreground">{tag.label}</span>
                    </span>
                  ))}
                </div>
                {state.nextReservation!.visitCount && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <User className="h-2.5 w-2.5" />
                    {state.nextReservation!.visitCount}th visit
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1.5">
                  <Button size="sm" className="h-7 bg-emerald-600 text-[10px] text-emerald-50 hover:bg-emerald-500">
                    <Armchair className="mr-1 h-3 w-3" />
                    Seat Now
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-foreground hover:bg-zinc-800">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Text Guest
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground hover:text-foreground">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* After next */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <ChevronDown className="h-3 w-3 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">After</span>
            </div>
            <div className="rounded-lg bg-zinc-900/60 p-3">
              <span className="text-xs text-muted-foreground">
                {state.afterNext ?? "No upcoming reservations"}
              </span>
              {!state.afterNext?.includes("reservation") && (
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  <CalendarPlus className="mr-1 h-3 w-3" />
                  Book This Slot
                </Button>
              )}
            </div>
          </div>

          {/* Table History */}
          <div className="px-5 py-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <History className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Table History (Today)
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {state.todayHistory.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No prior seatings today</span>
                ) : (
                  state.todayHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-zinc-900/40 px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{h.time}</span>
                        <span className="text-xs text-foreground">{h.guest} ({h.partySize})</span>
                      </div>
                      {h.check > 0 && (
                        <span className="text-[10px] text-emerald-400 font-medium">${h.check}</span>
                      )}
                    </div>
                  ))
                )}
                <div className="flex items-center gap-4 pt-1 text-[10px] text-muted-foreground">
                  <span>Total turns: {state.turnsToday}</span>
                  {state.avgTurnTime > 0 && <span>Avg turn: {state.avgTurnTime}min</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function getDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}
