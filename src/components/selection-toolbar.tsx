"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle, EyeOff, Copy, X, MoreVertical, Trash2, Tag, FolderPlus } from "lucide-react"

interface SelectionToolbarProps {
  selectedCount: number
  totalCount: number
  isAllSelected: boolean
  onSelectAll: () => void
  onClearSelection: () => void
  onQuickAction: (action: string) => void
  onMoreAction: (action: string) => void
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onQuickAction,
  onMoreAction,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null

  const isIndeterminate = selectedCount > 0 && !isAllSelected

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none animate-in slide-in-from-bottom-full duration-300">
      <div className="pointer-events-auto bg-gray-900 text-white rounded-full lg:rounded-full md:rounded-t-xl sm:rounded-t-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4 w-full max-w-4xl">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all visible items"
            className="border-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 min-h-0 min-w-0"
            ref={(el) => {
              if (el && isIndeterminate) {
                (el as any).indeterminate = true
              }
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium" aria-live="polite">
              {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
            </span>
            <button onClick={onClearSelection} className="text-xs text-gray-300 hover:text-white underline text-left min-h-0 min-w-0">
              Clear selection
            </button>
          </div>
        </div>

        {/* Center Section - Quick Actions (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAction("mark-live")}
                  className="text-green-400 hover:text-green-300 hover:bg-green-950/50 min-h-0 min-w-0"
                >
                  <CheckCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Live</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAction("mark-soldout")}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/50 min-h-0 min-w-0"
                >
                  <AlertCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark Sold Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAction("hide")}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 min-h-0 min-w-0"
                >
                  <EyeOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hide Items</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAction("duplicate")}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 min-h-0 min-w-0"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 min-h-0 min-w-0">
                <MoreVertical className="w-4 h-4 mr-2" />
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50 overflow-visible">
              {/* Status Actions */}
              <DropdownMenuItem onClick={() => onMoreAction("set-status")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Set Status To
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Tag Actions */}
              <DropdownMenuItem onClick={() => onMoreAction("tags")}>
                <Tag className="w-4 h-4 mr-2" />
                Tags
              </DropdownMenuItem>

              {/* Category Actions */}
              <DropdownMenuItem onClick={() => onMoreAction("categories")}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Categories
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Destructive Actions */}
              <DropdownMenuItem onClick={() => onMoreAction("delete")} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected Items
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost" onClick={onClearSelection} className="text-white hover:bg-gray-800 min-h-0 min-w-0">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
