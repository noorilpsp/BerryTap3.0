"use client"

import { useState } from "react"
import {
  CalendarDays,
  Eye,
  Filter,
  Plus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  restaurantConfig,
  formatTime24h,
  type ZoomLevel,
} from "@/lib/timeline-data"

interface TimelineTopBarProps {
  zoom: ZoomLevel
  onZoomChange: (z: ZoomLevel) => void
  zoneFilter: string
  onZoneFilterChange: (zone: string) => void
  partySizeFilter: string
  onPartySizeFilterChange: (filter: string) => void
  showGhosts: boolean
  onShowGhostsChange: (v: boolean) => void
  servicePeriodId: string
  onServicePeriodChange: (serviceId: string) => void
  selectedDate: Date
  onSelectedDateChange: (date: Date) => void
  onNewReservation: () => void
}

export function TimelineTopBar({
  zoom,
  onZoomChange,
  zoneFilter,
  onZoneFilterChange,
  partySizeFilter,
  onPartySizeFilterChange,
  showGhosts,
  onShowGhostsChange,
  servicePeriodId,
  onServicePeriodChange,
  selectedDate,
  onSelectedDateChange,
  onNewReservation,
}: TimelineTopBarProps) {
  const [desktopDateOpen, setDesktopDateOpen] = useState(false)
  const [mobileDateOpen, setMobileDateOpen] = useState(false)

  const zoneLabels: Record<string, string> = {
    all: "All Zones",
    main: "Main Dining",
    patio: "Patio",
    private: "Private Room",
  }
  const partyFilterLabels: Record<string, string> = {
    all: "All Parties",
    "1-2": "1-2p",
    "3-4": "3-4p",
    "5-6": "5-6p",
    "7+": "7+p",
  }
  const activeService =
    restaurantConfig.servicePeriods.find((p) => p.id === servicePeriodId)
    ?? restaurantConfig.servicePeriods[0]
  const fullDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const shortDateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <header className="sticky top-0 z-50 glass-surface-strong">
      {/* Row 1: Title, date, service period, CTA */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
          <h1 className="shrink-0 text-sm font-semibold text-foreground lg:text-base">Timeline View</h1>
          <Popover open={desktopDateOpen} onOpenChange={setDesktopDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-8 shrink-0 items-center gap-1.5 px-2 text-sm font-normal text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                <CalendarDays className="h-4 w-4 text-emerald-400" />
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
                  setDesktopDateOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Desktop/Tablet inline controls */}
          <div className="hidden h-5 w-px shrink-0 bg-zinc-700/50 md:block" />
          <div className="hidden shrink-0 items-center gap-1 md:flex">
            {(["1hr", "30min", "15min"] as ZoomLevel[]).map((z) => (
              <Button
                key={z}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2.5 text-xs font-medium",
                  zoom === z
                    ? "bg-zinc-700/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onZoomChange(z)}
              >
                {z}
              </Button>
            ))}
          </div>

          <div className="hidden h-5 w-px shrink-0 bg-zinc-700/50 md:block" />
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  {zoneLabels[zoneFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                {Object.entries(zoneLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onZoneFilterChange(key)}
                    className={cn(
                      "text-foreground focus:bg-zinc-800 focus:text-foreground",
                      zoneFilter === key && "bg-zinc-800"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  {partyFilterLabels[partySizeFilter] ?? "All Parties"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                {Object.entries(partyFilterLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onPartySizeFilterChange(key)}
                    className={cn(
                      "text-foreground focus:bg-zinc-800 focus:text-foreground",
                      partySizeFilter === key && "bg-zinc-800"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden h-5 w-px shrink-0 bg-zinc-700/50 md:block" />
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ghost Blocks</span>
            <Switch
              checked={showGhosts}
              onCheckedChange={onShowGhostsChange}
              className="data-[state=checked]:bg-emerald-600"
              aria-label="Toggle ghost blocks"
            />
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="timeline-service-period-btn border-zinc-700 bg-zinc-800/60 text-zinc-100 hover:bg-zinc-700/60 focus-visible:ring-zinc-600">
                {activeService
                  ? `${activeService.label} ${formatTime24h(activeService.start)}-${formatTime24h(activeService.end)}`
                  : "Service"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="border-zinc-700 bg-zinc-900">
              {restaurantConfig.servicePeriods.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => onServicePeriodChange(p.id)}
                  className={cn(
                    "text-foreground focus:bg-zinc-800 focus:text-foreground",
                    servicePeriodId === p.id && "bg-zinc-800"
                  )}
                >
                  {p.label} ({formatTime24h(p.start)} - {formatTime24h(p.end)})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500"
            onClick={onNewReservation}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Row 2: Zoom, zone filter, ghost toggle */}
      <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-2 md:hidden lg:px-6">
        <div className="flex items-center gap-3">
          {/* Zoom levels */}
          <div className="flex items-center gap-1">
            {(["1hr", "30min", "15min"] as ZoomLevel[]).map((z) => (
              <Button
                key={z}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2.5 text-xs font-medium",
                  zoom === z
                    ? "bg-zinc-700/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onZoomChange(z)}
              >
                {z}
              </Button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden h-5 w-px bg-zinc-700/50 sm:block" />

          {/* Zone filter */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  {zoneLabels[zoneFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                {Object.entries(zoneLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onZoneFilterChange(key)}
                    className={cn(
                      "text-foreground focus:bg-zinc-800 focus:text-foreground",
                      zoneFilter === key && "bg-zinc-800"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Party size filter */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  {partyFilterLabels[partySizeFilter] ?? "All Parties"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-zinc-700 bg-zinc-900">
                {Object.entries(partyFilterLabels).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onPartySizeFilterChange(key)}
                    className={cn(
                      "text-foreground focus:bg-zinc-800 focus:text-foreground",
                      partySizeFilter === key && "bg-zinc-800"
                    )}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Ghost blocks toggle */}
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ghost Blocks</span>
          <Switch
            checked={showGhosts}
            onCheckedChange={onShowGhostsChange}
            className="data-[state=checked]:bg-emerald-600"
            aria-label="Toggle ghost blocks"
          />
        </div>
      </div>

      {/* Mobile: Service + time row */}
      <div className="flex items-center border-t border-zinc-800/50 px-4 py-2 md:hidden">
        <Popover open={mobileDateOpen} onOpenChange={setMobileDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto items-center gap-2 px-0 py-0 text-xs text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="h-3 w-3 text-emerald-400" />
              <span className="font-medium text-foreground">{shortDateLabel}</span>
              <span>
                {activeService
                  ? `${activeService.label} ${formatTime24h(activeService.start)}-${formatTime24h(activeService.end)}`
                  : "Service"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto border-zinc-800 bg-zinc-900 p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) return
                onSelectedDateChange(date)
                setMobileDateOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile FAB */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 md:hidden"
        aria-label="New Reservation"
        onClick={onNewReservation}
      >
        <Plus className="h-5 w-5 text-emerald-50" />
      </Button>
    </header>
  )
}
