"use client"
import { useState, useEffect } from "react"
import { Search, Plus, LayoutGrid, LayoutList } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"

interface MenusToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  onAddMenu: () => void
  totalMenus?: number
}

export function MenusToolbar({
  searchQuery,
  onSearchChange,
  selectedView,
  onViewChange,
  onAddMenu,
  totalMenus = 0,
}: MenusToolbarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 250)

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery)
      setIsSearching(false)
    }
  }, [debouncedSearchQuery, searchQuery, onSearchChange])

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    setIsSearching(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card border border-border rounded-lg p-4">
        {/* Search Input */}
        <div className="flex-1 min-w-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="menus-search"
            placeholder={`Search ${totalMenus} menus...`}
            className="pl-10"
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search menus"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button
              variant={selectedView === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewChange("list")}
              className="h-9 w-9"
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedView === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewChange("grid")}
              className="h-9 w-9"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          <Button onClick={onAddMenu} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Menu</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
