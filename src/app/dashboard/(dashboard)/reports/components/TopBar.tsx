"use client"

import { useState } from "react"
import { Calendar, Download, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { ReportsFilters } from "../types/reports.types"

interface TopBarProps {
  filters: ReportsFilters
  onFiltersChange: (filters: Partial<ReportsFilters>) => void
  compareMode: "off" | "previous" | "yoy"
  onCompareModeChange: (mode: "off" | "previous" | "yoy") => void
  onExport: () => void
  onRefresh: () => void
  onToggleFilters: () => void
}

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "Month to Date", value: "mtd" },
  { label: "Quarter to Date", value: "qtd" },
  { label: "Year to Date", value: "ytd" },
]

const CHANNELS = [
  { id: "dine_in", label: "Dine-in" },
  { id: "takeout", label: "Takeout" },
  { id: "delivery", label: "Delivery" },
  { id: "catering", label: "Catering" },
]

const CATEGORIES = [
  { id: "appetizers", label: "Appetizers" },
  { id: "main_course", label: "Main Course" },
  { id: "desserts", label: "Desserts" },
  { id: "beverages", label: "Beverages" },
  { id: "salads", label: "Salads" },
]

export function TopBar({
  filters,
  onFiltersChange,
  compareMode,
  onCompareModeChange,
  onExport,
  onRefresh,
  onToggleFilters,
}: TopBarProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [localFilters, setLocalFilters] = useState<Partial<ReportsFilters>>(filters)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const activeFilterCount = (localFilters.channels?.length || 0) + (localFilters.categories?.length || 0)

  const handleToggleChannel = (channelId: string) => {
    const current = localFilters.channels || []
    const updated = current.includes(channelId) ? current.filter((id) => id !== channelId) : [...current, channelId]
    setLocalFilters({ ...localFilters, channels: updated })
  }

  const handleToggleCategory = (categoryId: string) => {
    const current = localFilters.categories || []
    const updated = current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]
    setLocalFilters({ ...localFilters, categories: updated })
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleResetFilters = () => {
    setLocalFilters({ channels: [], categories: [] })
    onFiltersChange({ channels: [], categories: [] })
  }

  return (
    <Card className="border-x-0 border-t-0 rounded-md">
      <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">Reports & Analytics</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Comprehensive insights into your restaurant performance
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 space-y-4">
                  {/* Order Channels Section */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Order Channels</Label>
                    <div className="space-y-2">
                      {CHANNELS.map((channel) => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={channel.id}
                            checked={localFilters.channels?.includes(channel.id) || false}
                            onCheckedChange={() => handleToggleChannel(channel.id)}
                          />
                          <Label htmlFor={channel.id} className="text-sm font-normal cursor-pointer">
                            {channel.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Item Categories Section */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Item Categories</Label>
                    <div className="space-y-2">
                      {CATEGORIES.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={localFilters.categories?.includes(category.id) || false}
                            onCheckedChange={() => handleToggleCategory(category.id)}
                          />
                          <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1 h-8">
                      Apply
                    </Button>
                    <Button variant="outline" onClick={handleResetFilters} className="flex-1 h-8 bg-transparent">
                      Reset
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="hidden md:flex bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExport}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>Export as Excel</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Schedule Report (Coming Soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={onToggleFilters} className="lg:hidden bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Date Range & Compare Row */}
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          <div className="flex-1 space-y-2 min-w-0">
            <Label className="text-xs text-muted-foreground">Date Range</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({ datePreset: preset.value })}
                  className="text-xs whitespace-nowrap flex-shrink-0"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Badge variant="secondary" className="text-xs">
                Oct 15 - Nov 12, 2025 (29 days)
              </Badge>
            </div>
          </div>

          <div className="space-y-2 flex-shrink-0">
            <Label className="text-xs text-muted-foreground">Compare</Label>
            <Select value={compareMode} onValueChange={(value: any) => onCompareModeChange(value)}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="previous">Previous Period</SelectItem>
                <SelectItem value="yoy">Year over Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}
