"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { AdvancedFiltersPanel } from "@/components/advanced-filters-panel"
import type { FilterState, FilterPreset } from "@/types/filters"
import { toast } from "sonner"

export default function AdvancedFiltersDemo() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    categories: [],
    tags: [],
    priceRange: { min: 0, max: 100 },
    dateRange: { start: null, end: null },
    hasPhoto: null,
    hasCustomizations: null,
    searchQuery: "",
  })
  const [resultCount, setResultCount] = useState(127)
  const [presets, setPresets] = useState<FilterPreset[]>([
    {
      id: "needs-photos",
      name: "Needs Photos",
      icon: "📷",
      filters: { hasPhoto: false },
    },
    {
      id: "high-value",
      name: "High Value",
      icon: "💰",
      filters: { priceRange: { min: 20, max: 100 } },
    },
    {
      id: "recent",
      name: "Recently Updated",
      icon: "🕐",
      filters: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      },
    },
    {
      id: "popular",
      name: "Popular Items",
      icon: "🔥",
      filters: { tags: ["popular"] },
    },
  ])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // Simulate result count update based on filters
    let count = 127
    if (newFilters.status.length > 0) count -= 20
    if (newFilters.categories.length > 0) count -= 30
    if (newFilters.tags.length > 0) count -= 15
    if (newFilters.priceRange.min > 0 || newFilters.priceRange.max < 100) count -= 10
    if (newFilters.hasPhoto === false) count -= 25
    setResultCount(Math.max(count, 12))
  }

  const handleSavePreset = (name: string, filters: FilterState) => {
    const newPreset: FilterPreset = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      icon: "⭐",
      filters,
    }
    setPresets([...presets, newPreset])
    toast.success(`Preset "${name}" saved successfully!`)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.categories.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.hasPhoto !== null) count++
    if (filters.hasCustomizations !== null) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Filters Demo</h1>
          <p className="text-gray-600">
            Comprehensive filtering system with presets, real-time results, and multiple filter types
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                {resultCount} items found
                {getActiveFilterCount() > 0 &&
                  ` • ${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? "s" : ""} active`}
              </p>
            </div>
            <Button onClick={() => setIsFiltersOpen(true)} className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Filter className="h-4 w-4" />
              Advanced Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 bg-white text-orange-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-sm font-medium mb-2">Active Filters:</h3>
              <div className="space-y-1 text-sm">
                {filters.status.length > 0 && (
                  <div>
                    <span className="font-medium">Status:</span> {filters.status.join(", ")}
                  </div>
                )}
                {filters.categories.length > 0 && (
                  <div>
                    <span className="font-medium">Categories:</span> {filters.categories.length} selected
                  </div>
                )}
                {filters.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span> {filters.tags.join(", ")}
                  </div>
                )}
                {(filters.priceRange.min > 0 || filters.priceRange.max < 100) && (
                  <div>
                    <span className="font-medium">Price Range:</span> ${filters.priceRange.min} - $
                    {filters.priceRange.max}
                  </div>
                )}
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <div>
                    <span className="font-medium">Date Range:</span> {filters.dateRange.start?.toLocaleDateString()} -{" "}
                    {filters.dateRange.end?.toLocaleDateString()}
                  </div>
                )}
                {filters.hasPhoto !== null && (
                  <div>
                    <span className="font-medium">Has Photo:</span> {filters.hasPhoto ? "Yes" : "No"}
                  </div>
                )}
                {filters.hasCustomizations !== null && (
                  <div>
                    <span className="font-medium">Has Customizations:</span> {filters.hasCustomizations ? "Yes" : "No"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mock Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: Math.min(resultCount, 9) }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-md mb-3" />
                <h3 className="font-medium mb-1">Menu Item {i + 1}</h3>
                <p className="text-sm text-gray-600 mb-2">Delicious description of the item</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">${(10 + i * 2).toFixed(2)}</span>
                  <span className="text-xs text-gray-500">Category</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdvancedFiltersPanel
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        currentFilters={filters}
        onFiltersChange={handleFiltersChange}
        resultCount={resultCount}
        presets={presets}
        onSavePreset={handleSavePreset}
      />
    </div>
  )
}
