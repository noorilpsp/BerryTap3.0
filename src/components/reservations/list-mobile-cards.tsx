"use client"

import { useState, useRef, useCallback } from "react"
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Cake,
  Heart,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type ListReservation,
  type ListReservationStatus,
  type GroupByOption,
  getStatusBadge,
  getRiskDisplay,
  formatTime12h,
  groupReservations,
} from "@/lib/listview-data"
import { cn } from "@/lib/utils"

type StatusTab = "all" | ListReservationStatus

interface ListMobileCardsProps {
  reservations: ListReservation[]
  groupBy: GroupByOption
  onSearchChange: (query: string) => void
  activeStatuses: ListReservationStatus[]
  onStatusFilter: (status: StatusTab) => void
  onOpenDetail: (reservation: ListReservation) => void
}

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "waitlist", label: "Waitlist" },
  { key: "arriving", label: "Arriving" },
  { key: "late", label: "Late" },
  { key: "confirmed", label: "Upcoming" },
  { key: "seated", label: "Seated" },
  { key: "completed", label: "Completed" },
  { key: "no-show", label: "No-Show" },
  { key: "cancelled", label: "Cancelled" },
]

function SwipeCard({
  reservation,
  onOpenDetail,
}: {
  reservation: ListReservation
  onOpenDetail: (r: ListReservation) => void
}) {
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const statusBadge = getStatusBadge(reservation.status, reservation.courseStage)
  const riskDisplay = getRiskDisplay(reservation.risk)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX
    const diff = startX.current - currentX.current
    if (diff > 50 && cardRef.current) {
      cardRef.current.style.transform = `translateX(-${Math.min(diff - 50, 160)}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = startX.current - currentX.current
    if (diff > 120) {
      setSwiped(true)
      if (cardRef.current) cardRef.current.style.transform = "translateX(-160px)"
    } else {
      setSwiped(false)
      if (cardRef.current) cardRef.current.style.transform = "translateX(0)"
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe reveal */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button className="flex w-20 items-center justify-center bg-rose-600 text-xs font-medium text-rose-50">
          No-Show
        </button>
        <button className="flex w-20 items-center justify-center bg-zinc-700 text-xs font-medium text-zinc-200">
          Cancel
        </button>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className={cn(
          "relative rounded-xl border p-3 backdrop-blur-sm transition-transform",
          statusBadge.cardClass,
          statusBadge.pulseClass
        )}
        style={{ borderStyle: statusBadge.borderStyle }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!swiped) onOpenDetail(reservation)
          else {
            setSwiped(false)
            if (cardRef.current) cardRef.current.style.transform = "translateX(0)"
          }
        }}
      >
        {/* Row 1: Name + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {reservation.tags.some((t) => t.type === "vip") && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
            {reservation.tags.some((t) => t.type === "birthday") && <Cake className="h-3 w-3 text-pink-400" />}
            {reservation.tags.some((t) => t.type === "anniversary") && <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />}
            <span className={cn("text-sm font-medium text-foreground", statusBadge.nameClass)}>{reservation.guestName}</span>
          </div>
          <span className="text-xs tabular-nums font-mono text-zinc-400">{formatTime12h(reservation.time)}</span>
        </div>

        {/* Row 2: Party + Table + Server */}
        <div className="mt-1 text-xs text-zinc-400">
          {reservation.partySize} guests
          {reservation.table && <> &middot; {reservation.table}</>}
          {reservation.server && <> &middot; {reservation.server}</>}
        </div>

        {/* Row 3: Tags */}
        {reservation.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {reservation.tags.map((tag, i) => (
              <span key={i} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                {tag.detail ?? tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Risk + Status */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", riskDisplay.dotClass)} />
              {riskDisplay.label} risk
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              statusBadge.pillClass,
              statusBadge.bgClass, statusBadge.textClass
            )} style={{ borderStyle: statusBadge.borderStyle }}>
              <span
                className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", statusBadge.dotClass)}
                style={statusBadge.dotColor ? { backgroundColor: statusBadge.dotColor } : undefined}
              />
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-2.5 flex items-center gap-2 border-t border-zinc-800/50 pt-2.5">
          {(reservation.status === "arriving" || reservation.status === "late" || reservation.status === "confirmed" || reservation.status === "unconfirmed") && (
            <>
              <Button size="sm" className="h-7 bg-emerald-600 text-[10px] text-emerald-50 hover:bg-emerald-500 flex-1">
                Seat Now
              </Button>
              <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700 flex-1">
                Text
              </Button>
            </>
          )}
          {reservation.status === "seated" && (
            <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700 flex-1">
              Print Check
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-zinc-400 hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 w-44">
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Change Table</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Assign Server</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="text-xs text-rose-400 focus:bg-zinc-800">No-Show</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-rose-400 focus:bg-zinc-800">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export function ListMobileCards({
  reservations,
  groupBy,
  onSearchChange,
  activeStatuses,
  onStatusFilter,
  onOpenDetail,
}: ListMobileCardsProps) {
  const [searchValue, setSearchValue] = useState("")
  const getStatusCount = useCallback((status: StatusTab): number => {
    if (status === "all") return reservations.length
    if (status === "confirmed") {
      return reservations.filter((r) => r.status === "confirmed" || r.status === "unconfirmed").length
    }
    return reservations.filter((r) => r.status === status).length
  }, [reservations])
  const isStatusActive = (status: StatusTab): boolean => {
    if (status === "all") return activeStatuses.length === 0
    return activeStatuses.includes(status)
  }
  const selectedStatusCount = activeStatuses.length

  const groups = groupReservations(reservations, groupBy)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Sticky search + filters */}
      <div className="sticky top-0 z-40 glass-surface-strong px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                onSearchChange(e.target.value)
              }}
              placeholder="Search..."
              className="h-8 border-zinc-700 bg-zinc-800/60 pl-8 pr-8 text-xs placeholder:text-zinc-500"
            />
            {searchValue && (
              <button
                onClick={() => { setSearchValue(""); onSearchChange("") }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300">
                Filters <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900">
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Party Size</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Zone</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800">Server</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300",
                  selectedStatusCount > 0 && "border-emerald-600/50 bg-emerald-500/10 text-emerald-300"
                )}
              >
                Status
                {selectedStatusCount > 0 && (
                  <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-bold text-emerald-300">
                    {selectedStatusCount}
                  </span>
                )}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900">
              {STATUS_TABS.map((tab) => {
                const isActive = isStatusActive(tab.key)
                return (
                  <DropdownMenuItem
                    key={tab.key}
                    onClick={() => onStatusFilter(tab.key)}
                    className={cn(
                      "flex items-center justify-between gap-3 text-xs text-zinc-300 focus:bg-zinc-800",
                      isActive && "text-emerald-300"
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-700/60 text-zinc-400"
                    )}>
                      {getStatusCount(tab.key)}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.label || "flat"}>
              {group.label && (
                <div className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {group.label}
                  <span className="ml-1.5 text-[10px] text-zinc-600">({group.reservations.length})</span>
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                {group.reservations.map((r) => (
                  <SwipeCard key={r.id} reservation={r} onOpenDetail={onOpenDetail} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500"
        aria-label="New Reservation"
      >
        <Plus className="h-5 w-5 text-emerald-50" />
      </Button>
    </div>
  )
}
