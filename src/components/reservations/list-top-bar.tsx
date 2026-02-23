"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  SlidersHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  type ListReservationStatus,
  type GroupByOption,
  SERVERS,
  ZONES,
  PARTY_RANGES,
  TIME_RANGES,
} from "@/lib/listview-data"
import { cn } from "@/lib/utils"

type StatusTab = "all" | ListReservationStatus

interface ActiveFilter {
  category: string
  value: string
}

interface ListTopBarProps {
  totalReservations: number
  totalCovers: number
  statusCounts: Partial<Record<ListReservationStatus, number>>
  selectedDate: Date
  // Callbacks
  onSelectedDateChange: (date: Date) => void
  onSearchChange: (query: string) => void
  onStatusFilter: (status: StatusTab) => void
  activeStatuses: ListReservationStatus[]
  onGroupByChange: (groupBy: GroupByOption) => void
  activeGroupBy: GroupByOption
  activeFilters: ActiveFilter[]
  onAddFilter: (filter: ActiveFilter) => void
  onRemoveFilter: (filter: ActiveFilter) => void
  onClearFilters: () => void
  onExport: () => void
  onNewReservation: () => void
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

const GROUP_BY_OPTIONS: { key: GroupByOption; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "time", label: "Time (30-min)" },
  { key: "zone", label: "Zone" },
  { key: "server", label: "Server" },
  { key: "party-size", label: "Party Size" },
  { key: "none", label: "None (flat)" },
]

function FilterDropdown({
  label,
  options,
  category,
  activeFilters,
  onSelect,
}: {
  label: string
  options: readonly string[]
  category: string
  activeFilters: ActiveFilter[]
  onSelect: (filter: ActiveFilter) => void
}) {
  const active = activeFilters.filter((f) => f.category === category)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-700/60 hover:text-foreground",
            active.length > 0 && "border-emerald-600/50 bg-emerald-500/10 text-emerald-300"
          )}
        >
          {label}
          {active.length > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-bold text-emerald-300">
              {active.length}
            </span>
          )}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="border-zinc-700 bg-zinc-900">
        {options.map((opt) => {
          const isActive = active.some((f) => f.value === opt)
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onSelect({ category, value: opt })}
              className={cn(
                "text-xs text-zinc-300 focus:bg-zinc-800 focus:text-foreground",
                isActive && "bg-emerald-500/10 text-emerald-300"
              )}
            >
              {isActive && <span className="mr-2 text-emerald-400">{"✓"}</span>}
              {opt}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ListTopBar({
  totalReservations,
  totalCovers,
  statusCounts,
  selectedDate,
  onSelectedDateChange,
  onSearchChange,
  onStatusFilter,
  activeStatuses,
  onGroupByChange,
  activeGroupBy,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onExport,
  onNewReservation,
}: ListTopBarProps) {
  const [searchValue, setSearchValue] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(
    (val: string) => {
      setSearchValue(val)
      onSearchChange(val)
    },
    [onSearchChange]
  )

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchFocused && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [searchFocused])

  const getStatusCount = (status: StatusTab): number => {
    if (status === "all") return totalReservations
    if (status === "confirmed") return (statusCounts["confirmed"] ?? 0) + (statusCounts["unconfirmed"] ?? 0)
    return statusCounts[status] ?? 0
  }
  const isStatusActive = (status: StatusTab): boolean => {
    if (status === "all") return activeStatuses.length === 0
    return activeStatuses.includes(status)
  }
  const selectedStatusCount = activeStatuses.length
  const hasActiveChipFilters = activeFilters.length > 0 || selectedStatusCount > 0
  const fullDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const shiftDateByDays = useCallback((days: number) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + days)
    onSelectedDateChange(next)
  }, [onSelectedDateChange, selectedDate])

  return (
    <header className="sticky top-0 z-40 glass-surface-strong" role="banner">
      {/* Row 1: Title, date nav, search, new reservation */}
      <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="text-sm font-semibold text-foreground">List View</h1>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-8 items-center gap-1.5 px-2 text-xs font-medium text-zinc-300 hover:text-foreground sm:inline-flex"
              >
                <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
                <span>{fullDateLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto border-zinc-800 bg-zinc-900 p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return
                  onSelectedDateChange(date)
                  setDateOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="hidden items-center gap-0.5 sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              aria-label="Previous day"
              onClick={() => shiftDateByDays(-1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              aria-label="Next day"
              onClick={() => shiftDateByDays(1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search guests, phone, notes, table..."
            className="h-8 border-zinc-700 bg-zinc-800/60 pl-8 pr-8 text-xs placeholder:text-zinc-500 focus-visible:ring-emerald-500/30"
            aria-label="Search reservations"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {!searchValue && !searchFocused && (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1 text-[10px] text-zinc-500">/</kbd>
          )}
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-800/60 text-xs text-foreground hover:bg-zinc-700/60">
                Dinner <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900">
              <DropdownMenuItem className="text-xs text-foreground focus:bg-zinc-800">Lunch (11:30 AM - 2:30 PM)</DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-foreground focus:bg-zinc-800">Dinner (5:00 PM - 11:00 PM)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="h-8 bg-emerald-600 text-xs text-emerald-50 hover:bg-emerald-500"
            onClick={onNewReservation}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Res
          </Button>
        </div>
      </div>

      {/* Row 2: Filters + summary + group by + export */}
      <div className="flex items-center gap-2 border-t border-zinc-800/50 px-4 py-2 lg:px-6">
        <div className="hidden items-center gap-1.5 overflow-x-auto scrollbar-none lg:flex">
          <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Filters</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-700/60",
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
            <DropdownMenuContent align="start" className="border-zinc-700 bg-zinc-900">
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
          <FilterDropdown label="Party Size" options={PARTY_RANGES} category="party-size" activeFilters={activeFilters} onSelect={onAddFilter} />
          <FilterDropdown label="Time" options={TIME_RANGES} category="time" activeFilters={activeFilters} onSelect={onAddFilter} />
          <FilterDropdown label="Zone" options={ZONES} category="zone" activeFilters={activeFilters} onSelect={onAddFilter} />
          <FilterDropdown label="Server" options={SERVERS} category="server" activeFilters={activeFilters} onSelect={onAddFilter} />
        </div>

        <div className="ml-auto hidden items-center gap-3 shrink-0 md:flex">
          <span className="text-xs text-zinc-400">
            <span className="tabular-nums font-medium text-foreground">{totalReservations}</span> reservations
            {" · "}
            <span className="tabular-nums font-medium text-foreground">{totalCovers}</span> covers
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-700/60">
                Group By <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900">
              {GROUP_BY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => onGroupByChange(opt.key)}
                  className={cn(
                    "text-xs text-zinc-300 focus:bg-zinc-800",
                    activeGroupBy === opt.key && "text-emerald-300"
                  )}
                >
                  {activeGroupBy === opt.key && <span className="mr-2 text-emerald-400">{"✓"}</span>}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-7 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-700/60" onClick={onExport}>
            <Download className="mr-1 h-3 w-3" /> Export
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveChipFilters && (
        <div className="flex items-center gap-1.5 border-t border-zinc-800/50 px-4 py-1.5 lg:px-6">
          {activeStatuses.map((status) => {
            const label = STATUS_TABS.find((tab) => tab.key === status)?.label ?? status
            return (
              <Badge
                key={`status-${status}`}
                variant="secondary"
                className="gap-1 bg-zinc-800 text-[10px] text-zinc-300 hover:bg-zinc-700"
              >
                {`Status: ${label}`}
                <button onClick={() => onStatusFilter(status)} className="ml-0.5 text-zinc-500 hover:text-foreground" aria-label={`Remove ${label} status`}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )
          })}
          {activeFilters.map((f) => (
            <Badge
              key={`${f.category}-${f.value}`}
              variant="secondary"
              className="gap-1 bg-zinc-800 text-[10px] text-zinc-300 hover:bg-zinc-700"
            >
              {f.value}
              <button onClick={() => onRemoveFilter(f)} className="ml-0.5 text-zinc-500 hover:text-foreground" aria-label={`Remove ${f.value} filter`}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => {
              onClearFilters()
              onStatusFilter("all")
            }}
            className="text-[10px] text-zinc-500 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </header>
  )
}

export type { StatusTab, ActiveFilter }
