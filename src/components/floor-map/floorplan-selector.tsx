"use client"

import { useState, useEffect } from "react"
import {
  getAllFloorplansDb,
  getActiveFloorplanDb,
  setActiveFloorplanIdDb,
  type SavedFloorplan,
} from "@/lib/floorplan-storage-db"
import { useLocation } from "@/lib/contexts/LocationContext"

export type FloorplanOption = { id: string; name: string }
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Map, Check, LayoutGrid, Users, Plus } from "lucide-react"
import { Link } from "@/components/ui/link"
import { cn } from "@/lib/utils"
import type { PlacedElement } from "@/lib/floorplan-types"

interface FloorplanSelectorProps {
  onFloorplanChange: (floorplan: SavedFloorplan | null) => void
  /** When provided, use these instead of loading. Used when page gets data from FloorMapView API. */
  allFloorplans?: FloorplanOption[]
  activeFloorplanId?: string | null
}

export function FloorplanSelector({
  onFloorplanChange,
  allFloorplans: allFloorplansProp,
  activeFloorplanId: activeIdProp,
}: FloorplanSelectorProps) {
  const { currentLocationId } = useLocation()
  const [floorplansLegacy, setFloorplansLegacy] = useState<SavedFloorplan[]>([])
  const [activeIdLegacy, setActiveIdLegacy] = useState<string | null>(null)

  useEffect(() => {
    if (!currentLocationId || allFloorplansProp) return
    let cancelled = false
    async function load() {
      const [all, active] = await Promise.all([
        getAllFloorplansDb(currentLocationId!),
        getActiveFloorplanDb(currentLocationId!),
      ])
      if (cancelled) return
      setFloorplansLegacy(all)
      setActiveIdLegacy(active?.id ?? null)
    }
    load()
    return () => { cancelled = true }
  }, [currentLocationId, allFloorplansProp])

  const floorplans = allFloorplansProp
    ? allFloorplansProp.map((fp) => ({ id: fp.id, name: fp.name, elements: [] as PlacedElement[], totalSeats: 0 }))
    : floorplansLegacy
  const activeId = activeIdProp ?? activeIdLegacy

  const activePlan = floorplans.find((f) => f.id === activeId)

  const handleSelect = async (floorplan: SavedFloorplan | { id: string; name: string }) => {
    if (!currentLocationId) return
    if (!allFloorplansProp) {
      await setActiveFloorplanIdDb(currentLocationId, floorplan.id)
    }
    const full = "elements" in floorplan && Array.isArray(floorplan.elements) ? floorplan : null
    onFloorplanChange(full ?? { id: floorplan.id, name: floorplan.name, elements: [], totalSeats: 0 } as SavedFloorplan)
  }

  if (floorplans.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 bg-transparent border-border/60 text-xs font-medium"
        >
          <Map className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">
            {activePlan?.name ?? "Select floorplan"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Select Floorplan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Saved floorplans */}
        {floorplans.map((fp) => {
          const elements = "elements" in fp ? fp.elements : []
          const tableCount = elements.filter(
            (el: PlacedElement) => (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
          ).length
          const isActive = fp.id === activeId

          return (
            <DropdownMenuItem
              key={fp.id}
              onClick={() => handleSelect(fp as SavedFloorplan)}
              className={cn("gap-3 py-2.5", isActive && "bg-accent/50")}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isActive ? "bg-primary/10" : "bg-secondary"
              )}>
                <Map className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fp.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" />
                    {fp.elements.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {fp.totalSeats}
                  </span>
                  <span>{tableCount} tables</span>
                </div>
              </div>
              {isActive && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        {/* Create new */}
        <DropdownMenuItem asChild>
          <Link prefetch={true} href="/builder" className="gap-3 py-2.5 cursor-pointer">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">Create New</p>
              <p className="text-xs text-muted-foreground">Open builder</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
