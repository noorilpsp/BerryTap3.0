"use client"

import { Radio, LayoutGrid, Map, ChevronDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FilterMode, ViewMode, SectionId, FloorTableStatus, FloorTable } from "@/lib/floor-map-data"
import { sectionConfig, floorStatusConfig, tables as allTablesData } from "@/lib/floor-map-data"
import { CommandSearch } from "./command-search"
import { useState, useRef, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { SavedFloorplan } from "@/lib/floorplan-storage"

// ── Types ────────────────────────────────────────────────────────────────────

interface MapTopBarProps {
  filterMode: FilterMode
  viewMode: ViewMode
  serverSection: SectionId
  tables: FloorTable[]
  statusFilter: FloorTableStatus | null
  sectionFilter: SectionId | null
  activeFilterChips: string[]
  ownTableIds: string[]
  allFloorplans: SavedFloorplan[]
  activeFloorplanId: string | null
  onFilterModeChange: (mode: FilterMode) => void
  onViewModeChange: (mode: ViewMode) => void
  onTableSelect: (tableId: string) => void
  onStatusFilterChange: (status: FloorTableStatus | null) => void
  onSectionFilterChange: (section: SectionId | null) => void
  onClearAllFilters: () => void
  onFloorplanChange: (floorplanId: string) => void
}

// ── Section counts ───────────────────────────────────────────────────────────

function getSectionCounts(): Record<SectionId, number> {
  const counts: Record<string, number> = {}
  for (const t of allTablesData) {
    counts[t.section] = (counts[t.section] || 0) + 1
  }
  return counts as Record<SectionId, number>
}

// ── Component ────────────────────────────────────────────────────────────────

export function MapTopBar({
  filterMode,
  viewMode,
  serverSection,
  tables,
  statusFilter,
  sectionFilter,
  activeFilterChips,
  ownTableIds,
  allFloorplans,
  activeFloorplanId,
  onFilterModeChange,
  onViewModeChange,
  onTableSelect,
  onStatusFilterChange,
  onSectionFilterChange,
  onClearAllFilters,
  onFloorplanChange,
}: MapTopBarProps) {
  const isMobile = useIsMobile()

  return (
    <header className="relative z-30 flex flex-col border-b border-border/40 bg-card/80 backdrop-blur-md">
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2.5 md:gap-3 md:px-5">
        {/* Branding */}
        <div className="flex items-center gap-2 mr-0.5 shrink-0">
          <Radio className="h-4 w-4 text-primary" />
          <span className="hidden font-mono text-[10px] font-bold tracking-wider text-primary sm:inline">
            BERRYTAP
          </span>
        </div>

        <div className="h-5 w-px bg-border/40 shrink-0 hidden sm:block" />

        {/* Command Search */}
        <CommandSearch
          tables={tables}
          ownTableIds={ownTableIds}
          onSelect={onTableSelect}
          onStatusFilter={(s) => onStatusFilterChange(s as FloorTableStatus)}
        />

        {/* Assignment filter */}
        {!isMobile && (
          <DropdownFilter
            label={
              filterMode === "all"
                ? "All Tables"
                : filterMode === "my_section"
                  ? sectionConfig[serverSection].name
                  : `My Tables (${ownTableIds.length})`
            }
            activeValue={filterMode}
            options={[
              { value: "all", label: "All Tables" },
              { value: "my_section", label: `My Section (${sectionConfig[serverSection].name})` },
              { value: "my_tables", label: `My Tables (${ownTableIds.length})` },
            ]}
            onSelect={(v) => onFilterModeChange(v as FilterMode)}
          />
        )}

        {/* Section filter */}
        <SectionFilter
          value={sectionFilter}
          onChange={onSectionFilterChange}
          isMobile={isMobile ?? false}
        />

        {/* Status filter (desktop only -- mobile uses stats bar taps) */}
        {!isMobile && (
          <StatusFilter
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        )}

        {/* Floorplan tabs */}
        {!isMobile && (
          <FloorplanSelector
            allFloorplans={allFloorplans}
            activeFloorplanId={activeFloorplanId}
            onFloorplanChange={onFloorplanChange}
          />
        )}

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center rounded-xl border border-border/40 bg-secondary/30 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 rounded-lg px-2 text-[11px] font-mono font-semibold transition-all",
              viewMode === "grid"
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 rounded-lg px-2 text-[11px] font-mono font-semibold transition-all",
              viewMode === "map"
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("map")}
            aria-label="Map view"
            aria-pressed={viewMode === "map"}
          >
            <Map className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Map</span>
          </Button>
        </div>
      </div>

      {/* Active filter chips row */}
      {activeFilterChips.length > 0 && (
        <div className="flex items-center gap-1.5 border-t border-border/20 px-3 py-1.5 md:px-5">
          <span className="mr-1 text-[10px] text-muted-foreground/50 hidden sm:inline">Filters:</span>
          {activeFilterChips.map((chip) => (
            <span
              key={chip}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary"
            >
              {chip}
              <button
                type="button"
                onClick={() => {
                  // Determine which filter to remove
                  const statusKeys = Object.keys(floorStatusConfig)
                  const sectionKeys = Object.keys(sectionConfig)
                  if (statusKeys.includes(chip.toLowerCase())) {
                    onStatusFilterChange(null)
                  } else if (sectionKeys.some((s) => sectionConfig[s as SectionId].name === chip)) {
                    onSectionFilterChange(null)
                  } else {
                    onFilterModeChange("all")
                  }
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
                aria-label={`Remove ${chip} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearAllFilters}
            className="ml-auto text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </header>
  )
}

// ── Generic Dropdown ─────────────────────────────────────────────────────────

function DropdownFilter({
  label,
  activeValue,
  options,
  onSelect,
}: {
  label: string
  activeValue: string
  options: { value: string; label: string }[]
  onSelect: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-2.5 py-1.5 font-mono text-[11px] transition-all hover:border-primary/30",
          open && "border-primary/40 bg-secondary/50"
        )}
      >
        <span className="text-muted-foreground truncate max-w-[120px]">{label}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/60 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] rounded-xl glass-surface-strong shadow-2xl animate-fade-slide-in overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
                activeValue === opt.value && "text-primary"
              )}
            >
              {activeValue === opt.value && <Check className="h-3 w-3 text-primary" />}
              {activeValue !== opt.value && <span className="w-3" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section Filter ───────────────────────────────────────────────────────────

function SectionFilter({
  value,
  onChange,
  isMobile,
}: {
  value: SectionId | null
  onChange: (section: SectionId | null) => void
  isMobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const counts = getSectionCounts()
  const sections: SectionId[] = ["patio", "bar", "main"]

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const label = value ? sectionConfig[value].name : (isMobile ? "Sec" : "All Sections")

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-2.5 py-1.5 font-mono text-[11px] transition-all hover:border-primary/30",
          open && "border-primary/40 bg-secondary/50",
          value && "border-primary/30 text-primary"
        )}
      >
        <span className="text-muted-foreground truncate max-w-[100px]">{label}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/60 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[190px] rounded-xl glass-surface-strong shadow-2xl animate-fade-slide-in overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
              !value && "text-primary"
            )}
          >
            {!value ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
            All Sections
          </button>
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false) }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
                value === s && "text-primary"
              )}
            >
              <div className="flex items-center gap-2">
                {value === s ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
                {sectionConfig[s].name}
              </div>
              <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Status Filter ────────────────────────────────────────────────────────────

function StatusFilter({
  value,
  onChange,
}: {
  value: FloorTableStatus | null
  onChange: (status: FloorTableStatus | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const statusOrder: FloorTableStatus[] = ["urgent", "active", "billing", "free"]

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const label = value ? floorStatusConfig[value].label : "All Status"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-2.5 py-1.5 font-mono text-[11px] transition-all hover:border-primary/30",
          open && "border-primary/40 bg-secondary/50",
          value && "border-primary/30 text-primary"
        )}
      >
        {value && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: floorStatusConfig[value].color }}
          />
        )}
        <span className="text-muted-foreground truncate">{label}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/60 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[170px] rounded-xl glass-surface-strong shadow-2xl animate-fade-slide-in overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
              !value && "text-primary"
            )}
          >
            {!value ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
            All Statuses
          </button>
          {statusOrder.map((s) => {
            const cfg = floorStatusConfig[s]
            return (
              <button
                key={s}
                type="button"
                onClick={() => { onChange(s); setOpen(false) }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
                  value === s && "text-primary"
                )}
              >
                {value === s ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                />
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Floorplan Selector Component
function FloorplanSelector({
  allFloorplans,
  activeFloorplanId,
  onFloorplanChange,
}: {
  allFloorplans: SavedFloorplan[]
  activeFloorplanId: string | null
  onFloorplanChange: (floorplanId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const activeFloorplan = allFloorplans.find(fp => fp.id === activeFloorplanId)
  const label = activeFloorplan ? activeFloorplan.name : "Demo Layout"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-2.5 py-1.5 font-mono text-[11px] transition-all hover:border-primary/30",
          open && "border-primary/40 bg-secondary/50"
        )}
      >
        <Map className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-muted-foreground truncate max-w-[120px]">{label}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/60 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] rounded-xl glass-surface-strong shadow-2xl animate-fade-slide-in overflow-hidden">
          <button
            type="button"
            onClick={() => {
              onFloorplanChange("demo")
              setOpen(false)
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
              !activeFloorplanId && "text-primary"
            )}
          >
            {!activeFloorplanId ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
            Demo Layout
          </button>
          {allFloorplans.map((fp) => (
            <button
              key={fp.id}
              type="button"
              onClick={() => {
                onFloorplanChange(fp.id)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent/40",
                activeFloorplanId === fp.id && "text-primary"
              )}
            >
              {activeFloorplanId === fp.id ? <Check className="h-3 w-3 text-primary" /> : <span className="w-3" />}
              {fp.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
