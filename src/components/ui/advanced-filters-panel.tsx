"use client"

import { useState, useEffect } from "react"
import { X, Filter, CalendarIcon, Save, Search } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import type { FilterState, FilterPreset, AdvancedFiltersProps } from "@/types/filters"

export function AdvancedFiltersPanel({
  isOpen,
  onClose,
  currentFilters,
  onFiltersChange,
  resultCount,
  presets,
  onSavePreset,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters)
  const [categorySearch, setCategorySearch] = useState("")
  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Debounce filter changes for performance
  const debouncedFilters = useDebounce(localFilters, 150)

  // Apply debounced filters
  useEffect(() => {
    onFiltersChange(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  // Sync with external filter changes
  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const updateFilters = (updates: Partial<FilterState>) => {
    setLocalFilters((prev) => ({ ...prev, ...updates }))
    setActivePreset(null) // Clear active preset when manually changing filters
  }

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      status: [],
      categories: [],
      tags: [],
      priceRange: { min: 0, max: 100 },
      dateRange: { start: null, end: null },
      hasPhoto: null,
      hasCustomizations: null,
      searchQuery: "",
    }
    setLocalFilters(defaultFilters)
    setActivePreset(null)
  }

  const applyPreset = (preset: FilterPreset) => {
    const newFilters = { ...localFilters, ...preset.filters }
    setLocalFilters(newFilters)
    setActivePreset(preset.id)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status.length > 0) count++
    if (localFilters.categories.length > 0) count++
    if (localFilters.tags.length > 0) count++
    if (localFilters.priceRange.min > 0 || localFilters.priceRange.max < 100) count++
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++
    if (localFilters.hasPhoto !== null) count++
    if (localFilters.hasCustomizations !== null) count++
    return count
  }

  // Mock data
  const mockCategories = [
    { id: "appetizers", name: "Appetizers", count: 12 },
    { id: "salads", name: "Salads", count: 8 },
    { id: "pizzas", name: "Pizzas", count: 15 },
    { id: "pasta", name: "Pasta", count: 10 },
    { id: "desserts", name: "Desserts", count: 7 },
    { id: "beverages", name: "Beverages", count: 9 },
  ]

  const filteredCategories = mockCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  )

  const statusOptions = [
    { value: "live", label: "Live", count: 47, color: "bg-green-500" },
    { value: "draft", label: "Draft", count: 12, color: "bg-gray-500" },
    { value: "hidden", label: "Hidden", count: 8, color: "bg-neutral-500" },
    { value: "soldout", label: "Sold Out", count: 3, color: "bg-amber-500" },
  ]

  const dietaryTags = [
    { value: "vegan", label: "Vegan", count: 23 },
    { value: "vegetarian", label: "Vegetarian", count: 35 },
    { value: "gluten-free", label: "Gluten-Free", count: 18 },
    { value: "dairy-free", label: "Dairy-Free", count: 15 },
  ]

  const attributeTags = [
    { value: "spicy", label: "Spicy", count: 12 },
    { value: "popular", label: "Popular", count: 28 },
    { value: "new", label: "New", count: 7 },
    { value: "chefs-pick", label: "Chef's Pick", count: 9 },
  ]

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <SheetTitle>Advanced Filters</SheetTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="secondary" className="text-sm">
                {resultCount} items match
              </Badge>
              {getActiveFilterCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-sm underline">
                  Clear all
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              {/* Quick Presets */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Quick Presets</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={activePreset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "rounded-full whitespace-nowrap",
                        activePreset === preset.id && "bg-orange-500 hover:bg-orange-600 text-white",
                      )}
                    >
                      <span className="mr-1">{preset.icon}</span>
                      {preset.name}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSavePresetModal(true)}
                    className="rounded-full whitespace-nowrap"
                  >
                    + Custom
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Status Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Status</h3>
                  {localFilters.status.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.status.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={localFilters.status.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const newStatus = checked
                            ? [...localFilters.status, option.value]
                            : localFilters.status.filter((s) => s !== option.value)
                          updateFilters({ status: newStatus })
                        }}
                      />
                      <Label htmlFor={`status-${option.value}`} className="flex items-center gap-2 cursor-pointer">
                        <span className={cn("h-2 w-2 rounded-full", option.color)} />
                        {option.label}
                        <span className="text-xs text-muted-foreground">({option.count})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Categories</h3>
                  {localFilters.categories.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.categories.length}
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        categories: mockCategories.map((c) => c.id),
                      })
                    }
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ categories: [] })}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={localFilters.categories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [...localFilters.categories, category.id]
                            : localFilters.categories.filter((c) => c !== category.id)
                          updateFilters({ categories: newCategories })
                        }}
                      />
                      <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2 cursor-pointer">
                        {category.name}
                        <span className="text-xs text-muted-foreground">({category.count})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Tags</h3>
                  {localFilters.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.tags.length}
                    </Badge>
                  )}
                </div>

                {/* Dietary Tags */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Dietary Tags</h4>
                  {dietaryTags.map((tag) => (
                    <div key={tag.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.value}`}
                        checked={localFilters.tags.includes(tag.value)}
                        onCheckedChange={(checked) => {
                          const newTags = checked
                            ? [...localFilters.tags, tag.value]
                            : localFilters.tags.filter((t) => t !== tag.value)
                          updateFilters({ tags: newTags })
                        }}
                      />
                      <Label htmlFor={`tag-${tag.value}`} className="flex items-center gap-2 cursor-pointer">
                        {tag.label}
                        <span className="text-xs text-muted-foreground">({tag.count})</span>
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Attribute Tags */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Attribute Tags</h4>
                  {attributeTags.map((tag) => (
                    <div key={tag.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.value}`}
                        checked={localFilters.tags.includes(tag.value)}
                        onCheckedChange={(checked) => {
                          const newTags = checked
                            ? [...localFilters.tags, tag.value]
                            : localFilters.tags.filter((t) => t !== tag.value)
                          updateFilters({ tags: newTags })
                        }}
                      />
                      <Label htmlFor={`tag-${tag.value}`} className="flex items-center gap-2 cursor-pointer">
                        {tag.label}
                        <span className="text-xs text-muted-foreground">({tag.count})</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <span className="text-sm text-muted-foreground">
                    ${localFilters.priceRange.min} - ${localFilters.priceRange.max}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[localFilters.priceRange.min, localFilters.priceRange.max]}
                  onValueChange={([min, max]) => updateFilters({ priceRange: { min, max } })}
                  className="py-4"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="min-price" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={localFilters.priceRange.min}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: {
                            ...localFilters.priceRange,
                            min: Number(e.target.value),
                          },
                        })
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="max-price" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={localFilters.priceRange.max}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: {
                            ...localFilters.priceRange,
                            max: Number(e.target.value),
                          },
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ priceRange: { min: 0, max: 10 } })}
                    className="flex-1"
                  >
                    Under $10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ priceRange: { min: 10, max: 20 } })}
                    className="flex-1"
                  >
                    $10-$20
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ priceRange: { min: 20, max: 100 } })}
                    className="flex-1"
                  >
                    $20+
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Last Updated</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date-from" className="text-xs">
                      From
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-from"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localFilters.dateRange.start && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.dateRange.start ? (
                            format(localFilters.dateRange.start, "MMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localFilters.dateRange.start || undefined}
                          onSelect={(date) =>
                            updateFilters({
                              dateRange: { ...localFilters.dateRange, start: date || null },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs">
                      To
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-to"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localFilters.dateRange.end && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.dateRange.end ? (
                            format(localFilters.dateRange.end, "MMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localFilters.dateRange.end || undefined}
                          onSelect={(date) =>
                            updateFilters({
                              dateRange: { ...localFilters.dateRange, end: date || null },
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        dateRange: {
                          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          end: new Date(),
                        },
                      })
                    }
                    className="flex-1"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateFilters({
                        dateRange: {
                          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          end: new Date(),
                        },
                      })
                    }
                    className="flex-1"
                  >
                    Last 30 days
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Additional Filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Additional Filters</h3>

                {/* Has Photo */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Has Photo</Label>
                  <RadioGroup
                    value={localFilters.hasPhoto === null ? "all" : localFilters.hasPhoto ? "with" : "without"}
                    onValueChange={(value) => {
                      const hasPhoto = value === "all" ? null : value === "with" ? true : false
                      updateFilters({ hasPhoto })
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="photo-all" />
                      <Label htmlFor="photo-all" className="cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with" id="photo-with" />
                      <Label htmlFor="photo-with" className="cursor-pointer">
                        With Photo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="without" id="photo-without" />
                      <Label htmlFor="photo-without" className="cursor-pointer">
                        Without Photo
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Has Customizations */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Has Customizations</Label>
                  <RadioGroup
                    value={
                      localFilters.hasCustomizations === null
                        ? "all"
                        : localFilters.hasCustomizations
                          ? "with"
                          : "without"
                    }
                    onValueChange={(value) => {
                      const hasCustomizations = value === "all" ? null : value === "with" ? true : false
                      updateFilters({ hasCustomizations })
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="custom-all" />
                      <Label htmlFor="custom-all" className="cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with" id="custom-with" />
                      <Label htmlFor="custom-with" className="cursor-pointer">
                        Has Customizations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="without" id="custom-without" />
                      <Label htmlFor="custom-without" className="cursor-pointer">
                        No Customizations
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t bg-white p-4 flex justify-between items-center shadow-lg">
            <Button variant="outline" onClick={() => setShowSavePresetModal(true)} className="gap-2">
              <Save className="h-4 w-4" />
              Save as Preset
            </Button>
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600">
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <SavePresetModal
          isOpen={showSavePresetModal}
          onClose={() => setShowSavePresetModal(false)}
          currentFilters={localFilters}
          onSave={onSavePreset}
        />
      )}
    </>
  )
}

function SavePresetModal({
  isOpen,
  onClose,
  currentFilters,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  currentFilters: FilterState
  onSave: (name: string, filters: FilterState) => void
}) {
  const [presetName, setPresetName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("⭐")

  const icons = ["⭐", "📷", "💰", "🕐", "🔥", "✨", "🎯", "💎"]

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName, currentFilters)
      onClose()
      setPresetName("")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Save Filter Preset</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="e.g., Popular Pizzas"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon) => (
                <Button
                  key={icon}
                  variant={selectedIcon === icon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn("text-lg", selectedIcon === icon && "bg-orange-500 hover:bg-orange-600")}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Filters</Label>
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              {currentFilters.status.length > 0 && <div>Status: {currentFilters.status.join(", ")}</div>}
              {currentFilters.categories.length > 0 && (
                <div>Categories: {currentFilters.categories.length} selected</div>
              )}
              {currentFilters.tags.length > 0 && <div>Tags: {currentFilters.tags.length} selected</div>}
              {(currentFilters.priceRange.min > 0 || currentFilters.priceRange.max < 100) && (
                <div>
                  Price: ${currentFilters.priceRange.min} - ${currentFilters.priceRange.max}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!presetName.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Save Preset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
