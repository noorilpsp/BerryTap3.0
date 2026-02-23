"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Star,
  Cake,
  Heart,
  AlertTriangle,
  Sparkles,
  Repeat,
  DollarSign,
  Accessibility,
  Dog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type ListReservation,
  type ListTagType,
  type GroupByOption,
  getStatusBadge,
  getRiskDisplay,
  formatTimeShort,
  groupReservations,
} from "@/lib/listview-data"
import { cn } from "@/lib/utils"

type SortField = "time" | "guestName" | "partySize" | "table" | "status" | "risk" | "server" | "zone"
type SortDir = "asc" | "desc"

interface ListDataTableProps {
  reservations: ListReservation[]
  groupBy: GroupByOption
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onDeselectAll: () => void
  onOpenDetail: (reservation: ListReservation) => void
  focusedRowId: string | null
  onFocusRow: (id: string | null) => void
}

function TagIcon({ type }: { type: ListTagType }) {
  const cls = "h-3 w-3"
  switch (type) {
    case "vip": return <Star className={cn(cls, "text-amber-400")} />
    case "birthday": return <Cake className={cn(cls, "text-pink-400")} />
    case "anniversary": return <Heart className={cn(cls, "text-rose-400")} />
    case "allergy": return <AlertTriangle className={cn(cls, "text-amber-400")} />
    case "first-timer": return <Sparkles className={cn(cls, "text-cyan-400")} />
    case "regular": return <Repeat className={cn(cls, "text-blue-400")} />
    case "high-value": return <DollarSign className={cn(cls, "text-emerald-400")} />
    case "wheelchair": return <Accessibility className={cn(cls, "text-purple-400")} />
    case "service-dog": return <Dog className={cn(cls, "text-amber-300")} />
  }
}

function sortReservations(reservations: ListReservation[], field: SortField, dir: SortDir): ListReservation[] {
  return [...reservations].sort((a, b) => {
    let cmp = 0
    switch (field) {
      case "time": {
        const [ah, am] = a.time.split(":").map(Number)
        const [bh, bm] = b.time.split(":").map(Number)
        cmp = (ah * 60 + am) - (bh * 60 + bm)
        break
      }
      case "guestName": cmp = a.guestName.localeCompare(b.guestName); break
      case "partySize": cmp = a.partySize - b.partySize; break
      case "table": cmp = (a.table ?? "zzz").localeCompare(b.table ?? "zzz"); break
      case "status": cmp = a.status.localeCompare(b.status); break
      case "risk": {
        const riskOrder = { low: 0, medium: 1, high: 2 }
        cmp = riskOrder[a.risk] - riskOrder[b.risk]
        break
      }
      case "server": cmp = (a.server ?? "zzz").localeCompare(b.server ?? "zzz"); break
      case "zone": cmp = (a.zone ?? "zzz").localeCompare(b.zone ?? "zzz"); break
    }
    return dir === "asc" ? cmp : -cmp
  })
}

export function ListDataTable({
  reservations,
  groupBy,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onOpenDetail,
  focusedRowId,
  onFocusRow,
}: ListDataTableProps) {
  const [sortField, setSortField] = useState<SortField>("time")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const tableRef = useRef<HTMLDivElement>(null)

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }, [sortField])

  const toggleCollapse = useCallback((label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const sorted = sortReservations(reservations, sortField, sortDir)
  const groups = groupReservations(sorted, groupBy)

  const allVisibleIds = groups.flatMap((g) =>
    collapsedGroups.has(g.label) ? [] : g.reservations.map((r) => r.id)
  )
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id))

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return
      const flatList = groups.flatMap((g) =>
        collapsedGroups.has(g.label) ? [] : g.reservations
      )
      if (!flatList.length) return

      const currentIdx = flatList.findIndex((r) => r.id === focusedRowId)

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          const nextIdx = currentIdx < flatList.length - 1 ? currentIdx + 1 : 0
          onFocusRow(flatList[nextIdx].id)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : flatList.length - 1
          onFocusRow(flatList[prevIdx].id)
          break
        }
        case "Enter": {
          if (focusedRowId) {
            const r = flatList.find((r) => r.id === focusedRowId)
            if (r) onOpenDetail(r)
          }
          break
        }
        case " ": {
          if (focusedRowId) {
            e.preventDefault()
            onToggleSelect(focusedRowId)
          }
          break
        }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [groups, collapsedGroups, focusedRowId, onFocusRow, onOpenDetail, onToggleSelect])

  function SortHeader({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) {
    const active = sortField === field
    return (
      <button
        onClick={() => toggleSort(field)}
        className={cn(
          "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors",
          active && "text-emerald-400",
          className
        )}
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        {children}
        <ArrowUpDown className={cn("h-3 w-3", active && "text-emerald-400")} />
      </button>
    )
  }

  return (
    <div ref={tableRef} className="flex-1 overflow-auto" role="table" aria-label="Reservations list">
      {/* Table header */}
      <div
        className="sticky top-0 z-10 grid grid-cols-[40px_repeat(9,minmax(0,1fr))_40px] items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-4 py-2 backdrop-blur-sm lg:px-6"
        role="row"
      >
        <div role="columnheader">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => {
              if (checked) onSelectAll(allVisibleIds)
              else onDeselectAll()
            }}
            className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            aria-label="Select all reservations"
          />
        </div>
        <SortHeader field="time">Time</SortHeader>
        <SortHeader field="guestName">Guest</SortHeader>
        <SortHeader field="partySize">Party</SortHeader>
        <SortHeader field="table">Table</SortHeader>
        <SortHeader field="status">Status</SortHeader>
        <SortHeader field="risk">Risk</SortHeader>
        <SortHeader field="server">Server</SortHeader>
        <SortHeader field="zone">Zone</SortHeader>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Tags</div>
        <div className="sr-only">Actions</div>
      </div>

      {/* Groups and rows */}
      {groups.map((group) => (
        <div key={group.label || "flat"} role="rowgroup">
          {/* Group header */}
          {group.label && (
            <button
              onClick={() => toggleCollapse(group.label)}
              className="flex w-full items-center gap-2 border-b border-zinc-800/50 bg-zinc-900/60 px-4 py-1.5 text-left lg:px-6"
              aria-expanded={!collapsedGroups.has(group.label)}
            >
              {collapsedGroups.has(group.label) ? (
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {group.label}
              </span>
              <span className="rounded-full bg-zinc-800 px-1.5 text-[10px] font-bold tabular-nums text-zinc-500">
                {group.reservations.length}
              </span>
            </button>
          )}

          {/* Rows */}
          {!collapsedGroups.has(group.label) &&
            group.reservations.map((r, idx) => {
              const statusBadge = getStatusBadge(r.status, r.courseStage)
              const riskDisplay = getRiskDisplay(r.risk)
              const isSelected = selectedIds.has(r.id)
              const isFocused = focusedRowId === r.id

              return (
                <div
                  key={r.id}
                  role="row"
                  tabIndex={-1}
                  onClick={() => onOpenDetail(r)}
                  onMouseEnter={() => onFocusRow(r.id)}
                  className={cn(
                    "group grid cursor-pointer grid-cols-[40px_repeat(9,minmax(0,1fr))_40px] items-center gap-2 border-b border-zinc-800/30 px-4 py-2 transition-colors lg:px-6",
                    "hover:bg-zinc-800/50",
                    isFocused && "bg-zinc-800/40",
                    isSelected && "bg-emerald-500/5",
                    statusBadge.rowClass,
                    statusBadge.pulseClass,
                    idx < 20 && "list-row-stagger"
                  )}
                  style={{ "--row-index": idx } as React.CSSProperties}
                  aria-label={`${formatTimeShort(r.time)}, ${r.guestName}, party of ${r.partySize}, ${r.table ?? "no table"}, ${statusBadge.label}, ${riskDisplay.label} risk`}
                >
                  {/* Checkbox */}
                  <div role="cell" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(r.id)}
                      className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      aria-label={`Select ${r.guestName}`}
                    />
                  </div>

                  {/* Time */}
                  <div role="cell" className="text-xs tabular-nums font-mono text-zinc-300">
                    {formatTimeShort(r.time)}
                  </div>

                  {/* Guest */}
                  <div role="cell" className="flex items-center gap-1.5 truncate">
                    {r.tags.some((t) => t.type === "vip") && <Star className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400" />}
                    {r.tags.some((t) => t.type === "birthday") && <Cake className="h-3 w-3 shrink-0 text-pink-400" />}
                    {r.tags.some((t) => t.type === "anniversary") && <Heart className="h-3 w-3 shrink-0 text-rose-400 fill-rose-400" />}
                    <span className={cn(
                      "truncate text-xs font-medium",
                      statusBadge.nameClass ?? (r.status === "cancelled" || r.status === "no-show" ? "text-zinc-500 line-through" : "text-foreground")
                    )}>
                      {r.guestName}
                    </span>
                  </div>

                  {/* Party */}
                  <div role="cell" className="text-center text-xs tabular-nums text-zinc-300">
                    {r.partySize}
                  </div>

                  {/* Table */}
                  <div role="cell" className={cn(
                    "text-xs font-mono tabular-nums",
                    r.table ? "text-zinc-300" : "text-amber-400"
                  )}>
                    {r.table ?? "\u2014"}
                  </div>

                  {/* Status badge */}
                  <div role="cell">
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

                  {/* Risk */}
                  <div role="cell">
                    {r.status !== "completed" && r.status !== "cancelled" && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", riskDisplay.dotClass)} />
                        {riskDisplay.label}
                      </span>
                    )}
                  </div>

                  {/* Server */}
                  <div role="cell" className="text-xs text-zinc-400 truncate">
                    {r.server ?? "\u2014"}
                  </div>

                  {/* Zone */}
                  <div role="cell" className="text-xs text-zinc-400 truncate">
                    {r.zone ?? "\u2014"}
                  </div>

                  {/* Tags */}
                  <div role="cell" className="flex items-center gap-1 overflow-hidden">
                    {r.tags.filter((t) => t.type !== "vip" && t.type !== "birthday" && t.type !== "anniversary").map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                      >
                        <TagIcon type={tag.type} />
                        {tag.detail ?? tag.label}
                      </span>
                    ))}
                    {r.status === "completed" && r.checkAmount && (
                      <span className="text-[10px] text-zinc-500">${r.checkAmount}</span>
                    )}
                    {r.cancelledNote && (
                      <span className="text-[10px] text-zinc-500">{r.cancelledNote}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div role="cell" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-foreground transition-opacity"
                          aria-label={`Actions for ${r.guestName}`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 w-48">
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Seat Now</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Text Guest</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Call Guest</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground" asChild>
                          <Link href={`?action=edit&id=${r.id}`}>Edit Reservation</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Change Table</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Change Time</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Assign Server</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Move to Waitlist</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-rose-400 focus:bg-zinc-800 focus:text-rose-300">Mark as No-Show</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-rose-400 focus:bg-zinc-800 focus:text-rose-300">Cancel Reservation</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">View Guest Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground">Add Note</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}
