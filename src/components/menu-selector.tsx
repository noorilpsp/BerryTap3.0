"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface Menu {
  id: string
  label: string
  icon?: React.ElementType
}

export interface MenuSelectorProps {
  menus: Menu[]
  selected: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  className?: string
}

export function MenuSelector({
  menus,
  selected,
  onChange,
  placeholder = "Search menus...",
  className,
}: MenuSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter menus based on search query
  const filteredMenus = React.useMemo(() => {
    if (!searchQuery.trim()) return menus
    const query = searchQuery.toLowerCase()
    return menus.filter((menu) => menu.label.toLowerCase().includes(query))
  }, [menus, searchQuery])

  // Get selected menu objects
  const selectedMenus = React.useMemo(() => {
    return menus.filter((menu) => selected.includes(menu.id))
  }, [menus, selected])

  // Toggle menu selection
  const toggleMenu = (menuId: string) => {
    if (selected.includes(menuId)) {
      onChange(selected.filter((id) => id !== menuId))
    } else {
      onChange([...selected, menuId])
    }
  }

  // Remove menu from selection
  const removeMenu = (menuId: string) => {
    onChange(selected.filter((id) => id !== menuId))
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected Menus as Chips */}
      {selectedMenus.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1">
            {selectedMenus.map((menu) => {
              const Icon = menu.icon
              return (
                <Badge
                  key={menu.id}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs rounded-full"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{menu.label}</span>
                  <button
                    onClick={() => removeMenu(menu.id)}
                    className="flex items-center justify-center rounded-full hover:bg-muted-foreground/20 transition-colors !w-4 !h-4 !min-w-4 !min-h-4 !max-w-4 !max-h-4"
                    style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px' }}
                    aria-label={`Remove ${menu.label}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )
            })}
          </div>
          <Separator />
        </>
      )}

      {/* Scrollable Menu List */}
      <ScrollArea className="h-[122px] rounded-md border">
        {filteredMenus.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No menus found
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredMenus.map((menu) => {
              const Icon = menu.icon
              const isSelected = selected.includes(menu.id)

              return (
                <label
                  key={menu.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-muted/50 active:bg-muted",
                    isSelected && "bg-muted",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMenu(menu.id)}
                    className="shrink-0 !h-3.5 !w-3.5 !min-w-3.5 !min-h-3.5 !max-w-3.5 !max-h-3.5"
                    style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px' }}
                  />
                  {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="text-sm font-medium leading-none">{menu.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Selection Count */}
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} {selected.length === 1 ? "menu" : "menus"} selected
        </p>
      )}
    </div>
  )
}
