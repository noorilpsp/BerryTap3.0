"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Plus, Download, LayoutList, LayoutGrid, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { GuestSegment, SortOption, ViewMode } from "@/lib/guests-data"
import { SEGMENT_COUNTS } from "@/lib/guests-data"

interface GuestTopBarProps {
  search: string
  onSearchChange: (val: string) => void
  segment: GuestSegment | "all"
  onSegmentChange: (seg: GuestSegment | "all") => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  onAddGuest: () => void
  filteredCount: number
}

const segments: { key: GuestSegment | "all"; label: string; count: number }[] = [
  { key: "all", label: "All", count: SEGMENT_COUNTS.all },
  { key: "vip", label: "VIP", count: SEGMENT_COUNTS.vip },
  { key: "regular", label: "Regulars", count: SEGMENT_COUNTS.regular },
  { key: "new", label: "New", count: SEGMENT_COUNTS.new },
  { key: "at_risk", label: "At Risk", count: SEGMENT_COUNTS.at_risk },
  { key: "flagged", label: "Flagged", count: SEGMENT_COUNTS.flagged },
]

const sortLabels: Record<SortOption, string> = {
  last_visit: "Last Visit",
  total_visits: "Total Visits",
  ltv: "Lifetime Value",
  name: "Name A-Z",
  risk_score: "VIP Score",
}

export function GuestTopBar({
  search, onSearchChange, segment, onSegmentChange,
  sort, onSortChange, view, onViewChange, onAddGuest, filteredCount,
}: GuestTopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="flex flex-col gap-3 border-b border-border/50 bg-card/60 px-4 py-3 backdrop-blur-sm lg:px-6">
      {/* Row 1: Title + Search + Add */}
      <div className="flex items-center gap-3">
        <h1 className="hidden text-lg font-semibold text-foreground lg:block">Guest Profiles</h1>

        <div
          className={cn(
            "relative flex flex-1 items-center rounded-lg border bg-secondary/50 transition-all",
            searchFocused ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
          )}
        >
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search guests"
          />
          {!search && (
            <kbd className="mr-3 hidden rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
              {"Ctrl+K"}
            </kbd>
          )}
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="mr-3 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <Button
          size="sm"
          onClick={onAddGuest}
          className="shrink-0 gap-1.5 bg-emerald-600 text-emerald-50 hover:bg-emerald-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Guest</span>
        </Button>
      </div>

      {/* Row 2: Segments */}
      <div
        ref={scrollRef}
        className="scrollbar-none -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 lg:-mx-6 lg:px-6"
        role="tablist"
        aria-label="Guest segments"
      >
        {segments.map((seg) => (
          <button
            key={seg.key}
            role="tab"
            aria-selected={segment === seg.key}
            onClick={() => onSegmentChange(seg.key)}
            className={cn(
              "guest-segment-tab flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              segment === seg.key
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {seg.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              segment === seg.key
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-muted-foreground"
            )}>
              {seg.count}
            </span>
          </button>
        ))}
      </div>

      {/* Row 3: Sort + View + Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                Sort: {sortLabels[sort]}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-border/50 bg-popover/95 backdrop-blur-md">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onSortChange(key)}
                  className={cn(sort === key && "bg-primary/10 text-primary")}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-md border border-border/50 bg-secondary/30">
            <button
              onClick={() => onViewChange("list")}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-l-md transition-all",
                view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewChange("cards")}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-r-md transition-all",
                view === "cards" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Card view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{filteredCount} guests</span>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Live search count announcement */}
      {search && (
        <div className="sr-only" role="status" aria-live="polite">
          {filteredCount} guests found matching &quot;{search}&quot;
        </div>
      )}
    </div>
  )
}
