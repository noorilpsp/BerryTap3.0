"use client"

import React from "react"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Magnet,
  Trash2,
  Download,
  LayoutGrid,
  Users,
  Save,
  FolderOpen,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface BuilderToolbarProps {
  canUndo: boolean
  canRedo: boolean
  showGrid: boolean
  snapToGrid: boolean
  zoom: number
  elementCount: number
  totalSeats: number
  currentFloorplanName?: string
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onToggleGrid: () => void
  onToggleSnap: () => void
  onClearAll: () => void
  onExport: () => void
  onSave: () => void
  onLoad: () => void
  onImport: () => void
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  destructive?: boolean
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-md transition-all duration-150",
              active
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              destructive && "hover:text-destructive hover:bg-destructive/10",
              disabled && "opacity-30 pointer-events-none"
            )}
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-popover text-popover-foreground border-border text-xs"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function BuilderToolbar({
  canUndo,
  canRedo,
  showGrid,
  snapToGrid,
  zoom,
  elementCount,
  totalSeats,
  currentFloorplanName,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleGrid,
  onToggleSnap,
  onClearAll,
  onExport,
  onSave,
  onLoad,
  onImport,
}: BuilderToolbarProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight leading-none">
              FloorCraft
            </span>
            {currentFloorplanName && (
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {currentFloorplanName}
              </span>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/50" />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={Undo2}
            label="Undo (Ctrl+Z)"
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo (Ctrl+Shift+Z)"
            onClick={onRedo}
            disabled={!canRedo}
          />
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/50" />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={ZoomOut}
            label="Zoom Out"
            onClick={onZoomOut}
          />
          <button
            onClick={onResetZoom}
            className="h-8 px-2 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150 min-w-[52px] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolbarButton
            icon={ZoomIn}
            label="Zoom In"
            onClick={onZoomIn}
          />
          <ToolbarButton
            icon={Maximize2}
            label="Reset View"
            onClick={onResetZoom}
          />
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/50" />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={Grid3X3}
            label="Toggle Grid"
            onClick={onToggleGrid}
            active={showGrid}
          />
          <ToolbarButton
            icon={Magnet}
            label="Snap to Grid"
            onClick={onToggleSnap}
            active={snapToGrid}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 mr-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="font-mono">{elementCount}</span>
            <span className="hidden sm:inline">elements</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span className="font-mono">{totalSeats}</span>
            <span className="hidden sm:inline">seats</span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/50" />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={Save}
            label="Save Floorplan"
            onClick={onSave}
          />
          <ToolbarButton
            icon={FolderOpen}
            label="Load Floorplan"
            onClick={onLoad}
          />
          <ToolbarButton
            icon={Upload}
            label="Import JSON File"
            onClick={onImport}
          />
          <ToolbarButton
            icon={Download}
            label="Export as JSON"
            onClick={onExport}
          />
          <ToolbarButton
            icon={Trash2}
            label="Clear All"
            onClick={onClearAll}
            destructive
          />
        </div>
      </div>
    </header>
  )
}
