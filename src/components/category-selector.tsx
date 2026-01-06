"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface Category {
  id: string
  label: string
  icon?: React.ElementType
}

export interface CategorySelectorProps {
  categories: Category[]
  selected: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  className?: string
}

export function CategorySelector({
  categories,
  selected,
  onChange,
  placeholder = "Search categories...",
  className,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter categories based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase()
    return categories.filter((category) => category.label.toLowerCase().includes(query))
  }, [categories, searchQuery])

  // Get selected category objects
  const selectedCategories = React.useMemo(() => {
    return categories.filter((category) => selected.includes(category.id))
  }, [categories, selected])

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId))
    } else {
      onChange([...selected, categoryId])
    }
  }

  // Remove category from selection
  const removeCategory = (categoryId: string) => {
    onChange(selected.filter((id) => id !== categoryId))
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

      {/* Selected Categories as Chips */}
      {selectedCategories.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map((category) => {
              const Icon = category.icon
              return (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs rounded-full"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{category.label}</span>
                  <button
                    onClick={() => removeCategory(category.id)}
                    className="flex items-center justify-center rounded-full hover:bg-muted-foreground/20 transition-colors !w-4 !h-4 !min-w-4 !min-h-4 !max-w-4 !max-h-4"
                    style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', maxWidth: '16px', maxHeight: '16px' }}
                    aria-label={`Remove ${category.label}`}
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

      {/* Scrollable Category List */}
      <ScrollArea className="h-[122px] rounded-md border">
        {filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No categories found
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              const isSelected = selected.includes(category.id)

              return (
                <label
                  key={category.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-muted/50 active:bg-muted",
                    isSelected && "bg-muted",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCategory(category.id)}
                    className="shrink-0 !h-3.5 !w-3.5 !min-w-3.5 !min-h-3.5 !max-w-3.5 !max-h-3.5"
                    style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px' }}
                  />
                  {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="text-sm font-medium leading-none">{category.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Selection Count */}
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} {selected.length === 1 ? "category" : "categories"} selected
        </p>
      )}
    </div>
  )
}
