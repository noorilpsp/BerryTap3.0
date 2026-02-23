"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export type CalendarViewMode = "week" | "month"

interface CalendarTopBarProps {
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  title: string
}

export function CalendarTopBar({
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  title,
}: CalendarTopBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass-surface-strong">
      {/* Main row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        {/* Left: Title + nav */}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-foreground sm:text-lg">
            {title}
          </h1>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-zinc-700 bg-zinc-800/60 px-2.5 text-xs text-foreground hover:bg-zinc-700/60"
              onClick={onToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onNext}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center: View toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/60 p-0.5">
          <button
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === "week"
                ? "bg-emerald-600 text-emerald-50 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onViewModeChange("week")}
            role="tab"
            aria-selected={viewMode === "week"}
          >
            Week
          </button>
          <button
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === "month"
                ? "bg-emerald-600 text-emerald-50 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onViewModeChange("month")}
            role="tab"
            aria-selected={viewMode === "month"}
          >
            Month
          </button>
        </div>

        {/* Right: Filters + New */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-label="Toggle filters"
          >
            {filtersOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
          </Button>

          {/* Desktop filters */}
          <div className="hidden items-center gap-2 md:flex">
            <Select defaultValue="all-services">
              <SelectTrigger className="h-7 w-[130px] border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="all-services" className="text-foreground text-xs">All Services</SelectItem>
                <SelectItem value="lunch" className="text-foreground text-xs">Lunch</SelectItem>
                <SelectItem value="dinner" className="text-foreground text-xs">Dinner</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-zones">
              <SelectTrigger className="h-7 w-[120px] border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
                <SelectValue placeholder="All Zones" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="all-zones" className="text-foreground text-xs">All Zones</SelectItem>
                <SelectItem value="main" className="text-foreground text-xs">Main Dining</SelectItem>
                <SelectItem value="patio" className="text-foreground text-xs">Patio</SelectItem>
                <SelectItem value="private" className="text-foreground text-xs">Private Room</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-channels">
              <SelectTrigger className="h-7 w-[130px] border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="all-channels" className="text-foreground text-xs">All Channels</SelectItem>
                <SelectItem value="phone" className="text-foreground text-xs">Phone</SelectItem>
                <SelectItem value="online" className="text-foreground text-xs">Online</SelectItem>
                <SelectItem value="walk-in" className="text-foreground text-xs">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            className="hidden bg-emerald-600 text-emerald-50 hover:bg-emerald-500 md:flex"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/50 px-4 py-3 md:hidden">
          <Select defaultValue="all-services">
            <SelectTrigger className="h-8 flex-1 border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              <SelectItem value="all-services" className="text-foreground text-xs">All Services</SelectItem>
              <SelectItem value="lunch" className="text-foreground text-xs">Lunch</SelectItem>
              <SelectItem value="dinner" className="text-foreground text-xs">Dinner</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-zones">
            <SelectTrigger className="h-8 flex-1 border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              <SelectItem value="all-zones" className="text-foreground text-xs">All Zones</SelectItem>
              <SelectItem value="main" className="text-foreground text-xs">Main Dining</SelectItem>
              <SelectItem value="patio" className="text-foreground text-xs">Patio</SelectItem>
              <SelectItem value="private" className="text-foreground text-xs">Private Room</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-channels">
            <SelectTrigger className="h-8 flex-1 border-zinc-700 bg-zinc-800/60 text-xs text-foreground">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-900">
              <SelectItem value="all-channels" className="text-foreground text-xs">All Channels</SelectItem>
              <SelectItem value="phone" className="text-foreground text-xs">Phone</SelectItem>
              <SelectItem value="online" className="text-foreground text-xs">Online</SelectItem>
              <SelectItem value="walk-in" className="text-foreground text-xs">Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mobile FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-5 z-50 h-14 w-14 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 md:hidden"
        aria-label="New Reservation"
      >
        <Plus className="h-6 w-6 text-emerald-50" />
      </Button>
    </header>
  )
}
