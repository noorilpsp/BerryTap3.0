"use client"

import { useState, useEffect } from "react"
import {
  getAllFloorplans,
  getActiveFloorplanId,
  setActiveFloorplanId,
  type SavedFloorplan,
} from "@/lib/floorplan-storage"
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
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FloorplanSelectorProps {
  onFloorplanChange: (floorplan: SavedFloorplan | null) => void
}

export function FloorplanSelector({ onFloorplanChange }: FloorplanSelectorProps) {
  const [floorplans, setFloorplans] = useState<SavedFloorplan[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setFloorplans(getAllFloorplans())
    setActiveId(getActiveFloorplanId())
  }, [])

  const activePlan = floorplans.find((f) => f.id === activeId)

  const handleSelect = (floorplan: SavedFloorplan) => {
    setActiveFloorplanId(floorplan.id)
    setActiveId(floorplan.id)
    onFloorplanChange(floorplan)
  }

  const handleUseDemo = () => {
    setActiveFloorplanId(null)
    setActiveId(null)
    onFloorplanChange(null)
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
            {activePlan?.name ?? "Demo Layout"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Select Floorplan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Demo option */}
        <DropdownMenuItem
          onClick={handleUseDemo}
          className="gap-3 py-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Demo Layout</p>
            <p className="text-xs text-muted-foreground">Built-in sample</p>
          </div>
          {!activeId && (
            <Check className="h-4 w-4 text-primary shrink-0" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Saved floorplans */}
        {floorplans.map((fp) => {
          const tableCount = fp.elements.filter(
            (el) => (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
          ).length
          const isActive = fp.id === activeId

          return (
            <DropdownMenuItem
              key={fp.id}
              onClick={() => handleSelect(fp)}
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
          <Link href="/builder" className="gap-3 py-2.5 cursor-pointer">
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
