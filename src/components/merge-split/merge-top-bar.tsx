"use client"

import { Calendar, ChevronDown, Plus, History, Combine, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MergeTopBarProps {
  activeMergeCount: number
  availableCombosCount: number
  onNewMerge: () => void
  onViewHistory: () => void
}

export function MergeTopBar({
  activeMergeCount,
  availableCombosCount,
  onNewMerge,
  onViewHistory,
}: MergeTopBarProps) {
  return (
    <header className="glass-surface-strong sticky top-0 z-30 flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4">
      {/* Left: Title and context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
            <Combine className="h-4 w-4 text-cyan-400" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Table Merge & Split</h1>
        </div>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <Calendar className="h-3.5 w-3.5" />
          <span>Fri, Jan 17</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 border-border/50 bg-secondary/50 text-xs">
              Dinner
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Lunch</DropdownMenuItem>
            <DropdownMenuItem>Dinner</DropdownMenuItem>
            <DropdownMenuItem>Late Night</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Stats and actions */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <Layers className="h-3 w-3" />
          Active: {activeMergeCount}
        </Badge>
        <Badge variant="secondary" className="gap-1.5 border border-border/50 bg-secondary/50 text-muted-foreground">
          Combos: {availableCombosCount}
        </Badge>

        <div className="mx-1 h-5 w-px bg-border/50" />

        <Button size="sm" className="gap-1.5" onClick={onNewMerge}>
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Merge</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 border-border/50" onClick={onViewHistory}>
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </div>
    </header>
  )
}
