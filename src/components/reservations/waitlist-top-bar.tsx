"use client"

import { ChevronDown, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type SortMode,
  CURRENT_DATE,
  SERVICE_PERIOD,
  getActiveStats,
} from "@/lib/waitlist-data"
import { cn } from "@/lib/utils"

type SignalFilter = "ready" | "warning" | "overdue" | "no-match"

interface WaitlistTopBarProps {
  onAddParty: () => void
  sortMode: SortMode
  sortOptions: { value: SortMode; label: string }[]
  onSortModeChange: (mode: SortMode) => void
  signalCounts: {
    total: number
    readyNow: number
    warning: number
    overdue: number
    noMatch: number
  }
  selectedSignalFilters: SignalFilter[]
  onToggleSignalFilter: (filter: SignalFilter) => void
  onClearSignalFilters: () => void
}

export function WaitlistTopBar({
  onAddParty,
  sortMode,
  sortOptions,
  onSortModeChange,
  signalCounts,
  selectedSignalFilters,
  onToggleSignalFilter,
  onClearSignalFilters,
}: WaitlistTopBarProps) {
  const stats = getActiveStats()
  const selectedSignalCount = selectedSignalFilters.length

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-zinc-100 lg:text-xl">Waitlist</h1>
          <span className="text-sm text-zinc-500">{CURRENT_DATE}</span>
          <Badge variant="outline" className="border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300">
            {SERVICE_PERIOD}
          </Badge>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 lg:gap-3">
          <div className="hidden items-center gap-1 xl:flex">
            <button
              type="button"
              onClick={onClearSignalFilters}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                selectedSignalCount === 0
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-300"
              )}
              aria-label="Show all waitlist parties"
            >
              All {signalCounts.total}
            </button>
            <button
              type="button"
              onClick={() => onToggleSignalFilter("ready")}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                selectedSignalFilters.includes("ready")
                  ? "bg-emerald-500/20 text-emerald-100"
                  : "bg-emerald-500/10 text-emerald-300/90 hover:bg-emerald-500/20"
              )}
              aria-label="Filter ready-now"
            >
              Ready {signalCounts.readyNow}
            </button>
            <button
              type="button"
              onClick={() => onToggleSignalFilter("overdue")}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                selectedSignalFilters.includes("overdue")
                  ? "bg-rose-500/20 text-rose-100"
                  : "bg-rose-500/10 text-rose-300/90 hover:bg-rose-500/20"
              )}
              aria-label="Filter overdue"
            >
              Overdue {signalCounts.overdue}
            </button>
            <button
              type="button"
              onClick={() => onToggleSignalFilter("warning")}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                selectedSignalFilters.includes("warning")
                  ? "bg-amber-500/20 text-amber-100"
                  : "bg-amber-500/10 text-amber-300/90 hover:bg-amber-500/20"
              )}
              aria-label="Filter warning"
            >
              Warning {signalCounts.warning}
            </button>
            <button
              type="button"
              onClick={() => onToggleSignalFilter("no-match")}
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                selectedSignalFilters.includes("no-match")
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/70 hover:text-zinc-300"
              )}
              aria-label="Filter no-match"
            >
              No Match {signalCounts.noMatch}
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-auto rounded-md border-zinc-700 bg-zinc-800/60 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700/70 md:inline-flex xl:hidden"
              >
                States
                {selectedSignalCount > 0 && (
                  <span className="ml-1 rounded-full bg-zinc-700 px-1.5 text-[10px] font-bold text-zinc-100">
                    {selectedSignalCount}
                  </span>
                )}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 border-zinc-800 bg-zinc-900">
              <DropdownMenuItem
                onClick={onClearSignalFilters}
                className={cn(
                  "text-xs focus:bg-zinc-800",
                  selectedSignalCount === 0 ? "text-zinc-100" : "text-zinc-400"
                )}
              >
                All ({signalCounts.total})
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuCheckboxItem
                checked={selectedSignalFilters.includes("ready")}
                onCheckedChange={() => onToggleSignalFilter("ready")}
                onSelect={(event) => event.preventDefault()}
                className="pl-2 pr-7 text-xs text-emerald-300 focus:bg-zinc-800 focus:text-emerald-200 [&>span]:left-auto [&>span]:right-2"
              >
                Ready ({signalCounts.readyNow})
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedSignalFilters.includes("overdue")}
                onCheckedChange={() => onToggleSignalFilter("overdue")}
                onSelect={(event) => event.preventDefault()}
                className="pl-2 pr-7 text-xs text-rose-300 focus:bg-zinc-800 focus:text-rose-200 [&>span]:left-auto [&>span]:right-2"
              >
                Overdue ({signalCounts.overdue})
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedSignalFilters.includes("warning")}
                onCheckedChange={() => onToggleSignalFilter("warning")}
                onSelect={(event) => event.preventDefault()}
                className="pl-2 pr-7 text-xs text-amber-300 focus:bg-zinc-800 focus:text-amber-200 [&>span]:left-auto [&>span]:right-2"
              >
                Warning ({signalCounts.warning})
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedSignalFilters.includes("no-match")}
                onCheckedChange={() => onToggleSignalFilter("no-match")}
                onSelect={(event) => event.preventDefault()}
                className="pl-2 pr-7 text-xs text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 [&>span]:left-auto [&>span]:right-2"
              >
                No Match ({signalCounts.noMatch})
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-1 md:flex">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortModeChange(opt.value)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                  sortMode === opt.value
                    ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]"
                    : "text-zinc-500 hover:bg-zinc-800/70 hover:text-zinc-300"
                }`}
                aria-label={`Sort by ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">
              Active: <span className="font-semibold text-zinc-200">{stats.parties} parties</span>{" "}
              &middot; <span className="font-semibold text-zinc-200">{stats.guests} guests</span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={onAddParty}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add to Waitlist
          </Button>
        </div>
      </div>
    </div>
  )
}
