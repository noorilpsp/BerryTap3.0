"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Target, CalendarIcon, Search, RotateCw, Download, Plus, ChevronDown, X } from 'lucide-react'
import { KPICard } from "@/components/promotions/kpi-card"
import { promotionKPIs } from "@/lib/promotion-data"
import { PromotionsTable } from "@/components/promotions/promotions-table"
import { mockPromotions } from "@/lib/promotions-table-data"
import { AnalyticsDashboard } from "@/components/promotions/analytics-dashboard"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CreatePromotionWizard } from "@/components/promotions/create-promotion-wizard"
import { CalendarView } from "@/components/promotions/calendar-view"
import { InsightsSidebar } from "@/components/promotions/insights-sidebar"

export default function PromotionsPage() {
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 10, 1),
    to: new Date(2024, 10, 30),
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    all: true,
    active: true,
    scheduled: true,
    paused: true,
    expired: false,
  })
  const [createWizardOpen, setCreateWizardOpen] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="flex min-h-0 h-full w-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Page Header */}
        <header role="banner" aria-label="Promotions page header" className="bg-card border-b border-border p-6 lg:p-8 space-y-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-chart-1" aria-hidden="true" />
              <h1 id="page-title" className="text-3xl font-bold">
                Promotions
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">Updated 2m ago</p>
          </div>

          {/* Controls Row 1: Date Range & Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal min-w-[280px]", !date && "text-muted-foreground")}
                  aria-label="Select date range"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {date?.from && date?.to ? (
                    <>
                      {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Quick Presets</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Today
                      </Button>
                      <Button variant="outline" size="sm">
                        Yesterday
                      </Button>
                      <Button variant="outline" size="sm">
                        Last 7 days
                      </Button>
                      <Button variant="outline" size="sm">
                        Last 30 days
                      </Button>
                      <Button variant="default" size="sm">
                        This Month ✓
                      </Button>
                      <Button variant="outline" size="sm">
                        Last Month
                      </Button>
                    </div>
                  </div>
                  <Calendar mode="range" selected={{ from: date.from, to: date.to }} className="rounded-md border" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search promotions..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                role="searchbox"
                aria-label="Search promotions by name, type, or category"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Controls Row 2: Filters & Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" aria-label="Filter by status">
                  <span className="text-lg" aria-hidden="true">
                    ⚡
                  </span>
                  All Status
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Status Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={statusFilters.all} onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, all: checked })}>
                  All Statuses
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.active} onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, active: checked })}>
                  <span className="mr-2">🟢</span> Active (12)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilters.scheduled}
                  onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, scheduled: checked })}
                >
                  <span className="mr-2">🔵</span> Scheduled (8)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.paused} onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, paused: checked })}>
                  <span className="mr-2">🟡</span> Paused (5)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.expired} onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, expired: checked })}>
                  <span className="mr-2">🔴</span> Expired (22)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <div className="flex gap-2 p-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Clear
                  </Button>
                  <Button size="sm" className="flex-1">
                    Apply
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" aria-label="Filter by category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="mr-2">📁</span> All Categories
                </SelectItem>
                <SelectItem value="beverages">Beverages (15)</SelectItem>
                <SelectItem value="food">Food (18)</SelectItem>
                <SelectItem value="appetizers">Appetizers (8)</SelectItem>
                <SelectItem value="desserts">Desserts (6)</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]" aria-label="Filter by type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="mr-2">🏷️</span> All Types
                </SelectItem>
                <SelectItem value="percentage">Percentage Discount (18)</SelectItem>
                <SelectItem value="fixed">Fixed Discount (12)</SelectItem>
                <SelectItem value="bogo">BOGO (8)</SelectItem>
                <SelectItem value="happy_hour">Happy Hour (9)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {/* Refresh Button */}
            <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh promotions data" disabled={isRefreshing}>
              <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <span className="mr-2">📄</span> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">📑</span> Export as PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">📊</span> Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Export Settings</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked>Include analytics data</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Include customer segments</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Include item breakdown</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Promotion Button */}
            <Button className="gap-2" onClick={() => setCreateWizardOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Promotion
            </Button>
          </div>
        </header>

        {/* KPI Section */}
        <section aria-labelledby="kpi-section-title" role="region" className="p-6 lg:p-8">
          <h2 id="kpi-section-title" className="sr-only">
            Key Performance Indicators
          </h2>

          {/* Desktop & Tablet Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Promotion metrics">
            {promotionKPIs.map((kpi) => (
              <KPICard key={kpi.id} {...kpi} />
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4" role="list" aria-label="Promotion metrics">
              {promotionKPIs.map((kpi) => (
                <div key={kpi.id} className="snap-center min-w-[280px] flex-shrink-0">
                  <KPICard {...kpi} />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {promotionKPIs.map((_, index) => (
                <div key={index} className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-primary" : "border-2 border-muted")} />
              ))}
            </div>
          </div>
        </section>

        {/* Calendar View Section */}
        <CalendarView />

        {/* Promotions Table */}
        <section aria-labelledby="promotions-table-title" role="region" className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="promotions-table-title" className="text-2xl font-bold">
              🎯 Active Promotions
            </h2>
            <Badge variant="secondary" className="text-sm">
              Showing 1-10 of {mockPromotions.length}
            </Badge>
          </div>
          <PromotionsTable data={mockPromotions} />
        </section>

        {/* Analytics Dashboard Section */}
        <AnalyticsDashboard />

        {/* Create Promotion Wizard */}
        <CreatePromotionWizard open={createWizardOpen} onOpenChange={setCreateWizardOpen} />
      </div>

      {/* Insights Sidebar */}
      <InsightsSidebar />
    </div>
  )
}
