"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users2, CalendarIcon, Filter, Download, Info, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Crown } from 'lucide-react'
import { format } from "date-fns"
import { KPICard } from "@/components/customer-insights/kpi-card"
import { TopCustomers } from "@/components/customer-insights/top-customers"
import { AlertsWidget } from "@/components/customer-insights/alerts-widget"
import { InsightsWidget } from "@/components/customer-insights/insights-widget"
import { SegmentationTabs } from "@/components/customer-insights/segmentation-tabs"
import { TopCustomersTable } from "@/components/customer-insights/top-customers-table"
import { InsightsSidebar } from "@/components/customer-insights/insights-sidebar"
import { CustomerProfileDrawer } from "@/components/customer-insights/customer-profile-drawer"

export default function CustomerInsightsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 10, 1),
    to: new Date(2024, 10, 15),
  })
  const [filters, setFilters] = useState({
    segments: ["all"],
    visitTypes: ["all"],
    spendingRange: [0, 2000],
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const kpiData = [
    {
      title: "Total Customers",
      value: "2,847",
      delta: "+12.5%",
      trend: "up" as const,
      sparklineData: [2234, 2156, 2298, 2401, 2378, 2456, 2534, 2601, 2689, 2734, 2798, 2847],
      comparison: "vs: 2,534",
      icon: Users2,
    },
    {
      title: "New vs Returning",
      value: "68%",
      delta: "+3.2%",
      trend: "up" as const,
      sparklineData: [65, 64, 66, 67, 66, 67, 68, 68, 69, 68, 68, 68],
      comparison: "vs: 65%/35%",
      subtitle: "Returning",
    },
    {
      title: "Avg Spend/Customer",
      value: "$142.50",
      delta: "+8.3%",
      trend: "up" as const,
      sparklineData: [128.4, 131.2, 129.8, 133.5, 135.7, 137.2, 139.4, 140.1, 141.8, 143.2, 144.9, 142.5],
      comparison: "vs: $131.40",
    },
    {
      title: "Visit Frequency",
      value: "3.4 visits",
      delta: "+0.4",
      trend: "up" as const,
      sparklineData: [3.0, 3.0, 3.1, 3.1, 3.2, 3.2, 3.3, 3.3, 3.4, 3.4, 3.4, 3.4],
      comparison: "vs: 3.0",
    },
    {
      title: "Retention Rate",
      value: "76.3%",
      delta: "+4.1%",
      trend: "up" as const,
      sparklineData: [72.2, 73.0, 73.5, 74.0, 74.5, 75.0, 75.5, 75.8, 76.0, 76.2, 76.3, 76.3],
      comparison: "vs: 72.2%",
      subtitle: "2,172 of 2,847",
    },
    {
      title: "Churn Rate",
      value: "18.7%",
      delta: "-2.3%",
      trend: "down" as const,
      sparklineData: [22.1, 21.8, 21.5, 20.9, 20.4, 19.8, 19.5, 19.2, 19.0, 18.9, 18.8, 18.7],
      comparison: "vs: 21.0%",
      subtitle: "533 at-risk",
    },
    {
      title: "Avg Lifetime Value",
      value: "$1,284.75",
      delta: "+15.2%",
      trend: "up" as const,
      sparklineData: [1089.2, 1105.4, 1132.8, 1156.3, 1178.9, 1201.5, 1225.7, 1248.2, 1265.4, 1279.8, 1296.3, 1284.75],
      comparison: "vs: $1,115.20",
    },
    {
      title: "Peak Visit Day",
      value: "Saturday",
      subtitle: "847 visits",
      delta: "",
      trend: "neutral" as const,
      sparklineData: [412, 385, 428, 456, 678, 847, 641],
      comparison: "vs: Friday (792)",
    },
  ]

  const handleCustomerClick = (customerName: string) => {
    setSelectedCustomer(customerName)
    setIsProfileOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Users2 className="w-7 h-7 text-primary" />
              <h1 className="text-3xl font-bold">Customer Insights</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                      : "Select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Filters Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Customer Segment:</p>
                      <div className="space-y-2">
                        {["All Customers", "VIP Customers", "Regular Customers", "New Customers", "At-Risk Customers"].map(
                          (segment) => (
                            <div key={segment} className="flex items-center space-x-2">
                              <Checkbox id={segment} />
                              <label htmlFor={segment} className="text-sm cursor-pointer">
                                {segment}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div>
                      <p className="text-sm font-medium mb-2">Visit Type:</p>
                      <div className="space-y-2">
                        {["All Types", "Dine-In", "Takeout", "Delivery", "Curbside"].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={type} />
                            <label htmlFor={type} className="text-sm cursor-pointer">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div>
                      <p className="text-sm font-medium mb-2">Spending Range:</p>
                      <Slider
                        min={0}
                        max={2000}
                        step={50}
                        value={filters.spendingRange}
                        onValueChange={(value) => setFilters({ ...filters, spendingRange: value })}
                        className="mt-4"
                      />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>${filters.spendingRange[0]}</span>
                        <span>${filters.spendingRange[1]}+</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2 flex justify-between">
                    <Button variant="ghost" size="sm">
                      Reset
                    </Button>
                    <Button size="sm">Apply Filters</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 xl:flex-row">
          {/* Main Content Area (60% on desktop) */}
          <div className="flex-1 space-y-6 xl:max-w-[60%]">
            {/* KPI Dashboard - 8 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </div>

            {/* Segmentation Tabs */}
            <SegmentationTabs />

            {/* Top Customers Table */}
            <TopCustomersTable onCustomerClick={handleCustomerClick} />
          </div>

          {/* Sidebar (40% on desktop) */}
          <aside className="w-full xl:w-[40%] xl:max-w-[480px] space-y-6">
            <InsightsSidebar onCustomerClick={handleCustomerClick} />
          </aside>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      <CustomerProfileDrawer
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customerName={selectedCustomer || ""}
      />
    </div>
  )
}
