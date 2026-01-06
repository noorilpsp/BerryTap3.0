"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  ChevronDown,
  X,
  ClipboardList,
  PlusCircle,
  Tag,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react"
import { QuickAdjustDrawer } from "@/components/inventory/quick-adjust-drawer"
import { SKUDetailDrawer } from "@/components/inventory/sku-detail-drawer"
import Link from "next/link"

interface SKU {
  skuId: string
  code: string
  name: string
  description: string
  emoji: string
  category: string
  categoryId: string
  baseUnit: string
  unitLabel: string
  costPerUnit: number
  currency: string
  stock: {
    onHand: number
    reserved: number
    available: number
    parLevel: number
    percentOfPar: number
    status: "good" | "low" | "critical" | "out" | "over"
    trend: number
    trendDirection: "up" | "down" | "neutral"
    affectedOrders?: number
  }
  expiry: { date: string; daysLeft: number } | null
  perishable: boolean
  shelfLifeDays: number
  lastPO: { poId: string; date: string; poNumber: string }
  supplier: { id: string; name: string; preferred: boolean }
  costTrend: "up" | "down" | "stable"
  costHistory: number[]
  tags: string[]
  locationId: string
  imageUrl: string
}

const mockSKUs: SKU[] = [
  {
    skuId: "sku_eggs_fr",
    code: "EGG001",
    name: "Free-range Eggs",
    description: "Carton of 30",
    emoji: "🥚",
    category: "Dairy",
    categoryId: "cat_dairy",
    baseUnit: "pc",
    unitLabel: "pieces",
    costPerUnit: 0.15,
    currency: "EUR",
    stock: {
      onHand: 120,
      reserved: 12,
      available: 108,
      parLevel: 200,
      percentOfPar: 60,
      status: "low",
      trend: -15,
      trendDirection: "down",
    },
    expiry: null,
    perishable: true,
    shelfLifeDays: 21,
    lastPO: { poId: "po_1842", date: "2024-11-12", poNumber: "1842" },
    supplier: { id: "sup_farmfresh", name: "Farm Fresh", preferred: false },
    costTrend: "up",
    costHistory: [0.12, 0.13, 0.14, 0.14, 0.15],
    tags: ["organic", "local"],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_beef_tend",
    code: "BEF001",
    name: "Beef Tenderloin",
    description: "Prime grade",
    emoji: "🥩",
    category: "Proteins",
    categoryId: "cat_proteins",
    baseUnit: "kg",
    unitLabel: "kilograms",
    costPerUnit: 24.5,
    currency: "EUR",
    stock: {
      onHand: 0,
      reserved: 0,
      available: 0,
      parLevel: 15,
      percentOfPar: 0,
      status: "out",
      trend: -100,
      trendDirection: "down",
      affectedOrders: 12,
    },
    expiry: null,
    perishable: true,
    shelfLifeDays: 5,
    lastPO: { poId: "po_1838", date: "2024-11-10", poNumber: "1838" },
    supplier: { id: "sup_meatmasters", name: "Meat Masters", preferred: true },
    costTrend: "up",
    costHistory: [22.0, 23.0, 23.5, 24.0, 24.5],
    tags: ["premium"],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_flour_ap",
    code: "FLR001",
    name: "All-purpose Flour",
    description: "25kg bag",
    emoji: "🌾",
    category: "Dry Goods",
    categoryId: "cat_dry",
    baseUnit: "kg",
    unitLabel: "kilograms",
    costPerUnit: 0.8,
    currency: "EUR",
    stock: {
      onHand: 25,
      reserved: 0,
      available: 25,
      parLevel: 20,
      percentOfPar: 125,
      status: "good",
      trend: 0,
      trendDirection: "neutral",
    },
    expiry: null,
    perishable: false,
    shelfLifeDays: 365,
    lastPO: { poId: "po_1835", date: "2024-11-08", poNumber: "1835" },
    supplier: { id: "sup_grainco", name: "Grain Co", preferred: false },
    costTrend: "down",
    costHistory: [0.85, 0.84, 0.82, 0.81, 0.8],
    tags: [],
    locationId: "loc_dry",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_mozz_fresh",
    code: "MOZ001",
    name: "Mozzarella Fresh",
    description: "250g ball",
    emoji: "🧀",
    category: "Dairy",
    categoryId: "cat_dairy",
    baseUnit: "pc",
    unitLabel: "pieces",
    costPerUnit: 3.2,
    currency: "EUR",
    stock: {
      onHand: 2,
      reserved: 0,
      available: 2,
      parLevel: 10,
      percentOfPar: 20,
      status: "critical",
      trend: -80,
      trendDirection: "down",
    },
    expiry: { date: "2024-11-17", daysLeft: 2 },
    perishable: true,
    shelfLifeDays: 7,
    lastPO: { poId: "po_1851", date: "2024-11-13", poNumber: "1851" },
    supplier: { id: "sup_dairydirect", name: "Dairy Direct", preferred: false },
    costTrend: "up",
    costHistory: [2.9, 3.0, 3.1, 3.15, 3.2],
    tags: ["italian"],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_chicken_br",
    code: "CHK001",
    name: "Chicken Breast",
    description: "Skinless, boneless",
    emoji: "🍗",
    category: "Proteins",
    categoryId: "cat_proteins",
    baseUnit: "kg",
    unitLabel: "kilograms",
    costPerUnit: 8.9,
    currency: "EUR",
    stock: {
      onHand: 12,
      reserved: 3.5,
      available: 8.5,
      parLevel: 20,
      percentOfPar: 60,
      status: "low",
      trend: 8,
      trendDirection: "up",
    },
    expiry: { date: "2024-11-18", daysLeft: 3 },
    perishable: true,
    shelfLifeDays: 4,
    lastPO: { poId: "po_1849", date: "2024-11-14", poNumber: "1849" },
    supplier: { id: "sup_meatmasters", name: "Meat Masters", preferred: true },
    costTrend: "stable",
    costHistory: [8.9, 8.9, 8.85, 8.9, 8.9],
    tags: [],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_olive_ev",
    code: "OLV001",
    name: "Olive Oil Extra Virgin",
    description: "5L tin",
    emoji: "🫒",
    category: "Dry Goods",
    categoryId: "cat_dry",
    baseUnit: "L",
    unitLabel: "liters",
    costPerUnit: 12.0,
    currency: "EUR",
    stock: {
      onHand: 8.5,
      reserved: 0,
      available: 8.5,
      parLevel: 10,
      percentOfPar: 85,
      status: "good",
      trend: 0,
      trendDirection: "neutral",
    },
    expiry: null,
    perishable: false,
    shelfLifeDays: 730,
    lastPO: { poId: "po_1820", date: "2024-10-28", poNumber: "1820" },
    supplier: { id: "sup_medimports", name: "Med Imports", preferred: false },
    costTrend: "stable",
    costHistory: [12.0, 12.0, 12.0, 11.9, 12.0],
    tags: ["italian", "premium"],
    locationId: "loc_dry",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_salmon_atl",
    code: "SAL001",
    name: "Atlantic Salmon",
    description: "Fresh fillet",
    emoji: "🐟",
    category: "Seafood",
    categoryId: "cat_seafood",
    baseUnit: "kg",
    unitLabel: "kilograms",
    costPerUnit: 18.5,
    currency: "EUR",
    stock: {
      onHand: 4.2,
      reserved: 1.5,
      available: 2.7,
      parLevel: 8,
      percentOfPar: 52,
      status: "low",
      trend: -25,
      trendDirection: "down",
    },
    expiry: { date: "2024-11-16", daysLeft: 1 },
    perishable: true,
    shelfLifeDays: 3,
    lastPO: { poId: "po_1852", date: "2024-11-14", poNumber: "1852" },
    supplier: { id: "sup_seafoodking", name: "Seafood King", preferred: true },
    costTrend: "up",
    costHistory: [17.0, 17.5, 18.0, 18.25, 18.5],
    tags: ["sustainable"],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    skuId: "sku_cream_heavy",
    code: "CRM001",
    name: "Heavy Cream",
    description: "1L carton",
    emoji: "🥛",
    category: "Dairy",
    categoryId: "cat_dairy",
    baseUnit: "L",
    unitLabel: "liters",
    costPerUnit: 4.5,
    currency: "EUR",
    stock: {
      onHand: 14,
      reserved: 2,
      available: 12,
      parLevel: 20,
      percentOfPar: 70,
      status: "low",
      trend: 23,
      trendDirection: "up",
    },
    expiry: { date: "2024-11-18", daysLeft: 3 },
    perishable: true,
    shelfLifeDays: 14,
    lastPO: { poId: "po_1851", date: "2024-11-13", poNumber: "1851" },
    supplier: { id: "sup_dairydirect", name: "Dairy Direct", preferred: false },
    costTrend: "stable",
    costHistory: [4.5, 4.5, 4.4, 4.45, 4.5],
    tags: [],
    locationId: "loc_main",
    imageUrl: "/placeholder.svg?height=40&width=40",
  },
]

const categories = [
  { id: "cat_proteins", name: "Proteins", count: 124 },
  { id: "cat_produce", name: "Produce", count: 156 },
  { id: "cat_dairy", name: "Dairy", count: 89 },
  { id: "cat_dry", name: "Dry Goods", count: 203 },
  { id: "cat_seafood", name: "Seafood", count: 67 },
  { id: "cat_beverages", name: "Beverages", count: 178 },
  { id: "cat_packaging", name: "Packaging", count: 30 },
]

const stockStatuses = [
  { id: "low", name: "Low Stock", count: 127 },
  { id: "critical", name: "Critical", count: 23 },
  { id: "out", name: "Out of Stock", count: 8 },
  { id: "over", name: "Overstocked", count: 12 },
  { id: "good", name: "Healthy", count: 689 },
]

const locations = [
  { id: "loc_main", name: "Main Kitchen" },
  { id: "loc_bar", name: "Bar" },
  { id: "loc_prep", name: "Prep Station" },
  { id: "loc_cold", name: "Cold Storage" },
  { id: "loc_dry", name: "Dry Storage" },
]

export default function SKUsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["low", "critical"])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([])
  const [adjustDrawerOpen, setAdjustDrawerOpen] = useState(false)
  const [selectedSKUForAdjust, setSelectedSKUForAdjust] = useState<SKU | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedSKUForDetail, setSelectedSKUForDetail] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Filter SKUs based on active filters
  const filteredSKUs = mockSKUs.filter((sku) => {
    if (
      searchQuery &&
      !sku.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sku.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(sku.categoryId)) {
      return false
    }
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(sku.stock.status)) {
      return false
    }
    if (selectedLocation && sku.locationId !== selectedLocation) {
      return false
    }
    return true
  })

  const totalPages = Math.ceil(filteredSKUs.length / itemsPerPage)
  const paginatedSKUs = filteredSKUs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const activeFilters: Array<{ type: string; label: string; value: string }> = []

  selectedStatuses.forEach((status) => {
    const statusObj = stockStatuses.find((s) => s.id === status)
    if (statusObj) {
      activeFilters.push({ type: "status", label: statusObj.name, value: status })
    }
  })

  selectedCategories.forEach((catId) => {
    const cat = categories.find((c) => c.id === catId)
    if (cat) {
      activeFilters.push({ type: "category", label: cat.name, value: catId })
    }
  })

  if (selectedLocation) {
    const loc = locations.find((l) => l.id === selectedLocation)
    if (loc) {
      activeFilters.push({ type: "location", label: loc.name, value: selectedLocation })
    }
  }

  const removeFilter = (type: string, value: string) => {
    if (type === "status") {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== value))
    } else if (type === "category") {
      setSelectedCategories(selectedCategories.filter((c) => c !== value))
    } else if (type === "location") {
      setSelectedLocation("")
    }
  }

  const clearAllFilters = () => {
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedLocation("")
    setSearchQuery("")
  }

  const toggleSKUSelection = (skuId: string) => {
    setSelectedSKUs((prev) => (prev.includes(skuId) ? prev.filter((id) => id !== skuId) : [...prev, skuId]))
  }

  const toggleAllSKUs = () => {
    if (selectedSKUs.length === paginatedSKUs.length) {
      setSelectedSKUs([])
    } else {
      setSelectedSKUs(paginatedSKUs.map((sku) => sku.skuId))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">🟢 Good</Badge>
      case "low":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">🟡 Low</Badge>
        )
      case "critical":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">🔴 Critical</Badge>
      case "out":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">🔴 OUT</Badge>
      case "over":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">🔵 Over</Badge>
      default:
        return null
    }
  }

  const getTrendDisplay = (trend: number, direction: string) => {
    if (direction === "neutral" || trend === 0) {
      return <span className="text-xs text-muted-foreground">═ Stable</span>
    }
    if (direction === "up") {
      return (
        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />▲ +{trend}% WoW
        </span>
      )
    }
    return (
      <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <TrendingDown className="w-3 h-3" />▼ {trend}% WoW
      </span>
    )
  }

  const handleAdjustStock = (sku: SKU) => {
    setSelectedSKUForAdjust(sku)
    setAdjustDrawerOpen(true)
  }

  const handleViewSKUDetail = (skuId: string) => {
    setSelectedSKUForDetail(skuId)
    setDetailDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/inventory" className="hover:text-foreground">
              ← Inventory
            </Link>
            <span>/</span>
            <span>SKUs & Ingredients</span>
          </div>
          <h1 className="text-2xl font-bold">SKUs & Ingredients</h1>
          <p className="text-sm text-muted-foreground">Manage your ingredient catalog and stock levels</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New SKU
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU code, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[140px] bg-transparent">
                Category
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm mb-2">Category</div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="all-categories"
                    checked={selectedCategories.length === 0}
                    onCheckedChange={() => setSelectedCategories([])}
                  />
                  <label htmlFor="all-categories" className="text-sm cursor-pointer flex-1">
                    All Categories
                  </label>
                </div>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id],
                        )
                      }}
                    />
                    <label htmlFor={cat.id} className="text-sm cursor-pointer flex-1">
                      {cat.name}
                      <span className="text-muted-foreground ml-2">({cat.count})</span>
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Stock Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[140px] bg-transparent">
                Stock Status
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm mb-2">Stock Status</div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="all-statuses"
                    checked={selectedStatuses.length === 0}
                    onCheckedChange={() => setSelectedStatuses([])}
                  />
                  <label htmlFor="all-statuses" className="text-sm cursor-pointer flex-1">
                    All Statuses
                  </label>
                </div>
                {stockStatuses.map((status) => (
                  <div key={status.id} className="flex items-center gap-2">
                    <Checkbox
                      id={status.id}
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => {
                        setSelectedStatuses((prev) =>
                          prev.includes(status.id) ? prev.filter((s) => s !== status.id) : [...prev, status.id],
                        )
                      }}
                    />
                    <label htmlFor={status.id} className="text-sm cursor-pointer flex-1">
                      {status.name}
                      <span className="text-muted-foreground ml-2">({status.count})</span>
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Location Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[140px] bg-transparent">
                Location
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm mb-2">Location</div>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="all-locations"
                    checked={!selectedLocation}
                    onCheckedChange={() => setSelectedLocation("")}
                  />
                  <label htmlFor="all-locations" className="text-sm cursor-pointer flex-1">
                    All Locations
                  </label>
                </div>
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center gap-2">
                    <Checkbox
                      id={loc.id}
                      checked={selectedLocation === loc.id}
                      onCheckedChange={() => setSelectedLocation(loc.id)}
                    />
                    <label htmlFor={loc.id} className="text-sm cursor-pointer flex-1">
                      {loc.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            {activeFilters.map((filter, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {filter.label}
                <button onClick={() => removeFilter(filter.type, filter.value)} className="hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
        )}
      </Card>

      {/* Bulk Actions */}
      {selectedSKUs.length > 0 && (
        <Card className="bg-muted border-primary/20">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm font-medium">{selectedSKUs.length} selected</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <ClipboardList className="w-4 h-4 mr-2" />
                Create PO
              </Button>
              <Button variant="outline" size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Adjust Stock
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="w-4 h-4 mr-2" />
                Add Tags
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedSKUs.length === paginatedSKUs.length && paginatedSKUs.length > 0}
                    onCheckedChange={toggleAllSKUs}
                    aria-label="Select all SKUs"
                  />
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                    SKU <ArrowUpDown className="w-3 h-3 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[250px]">Name / Details</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="min-w-[180px]">On Hand</TableHead>
                <TableHead className="w-[80px]">Reserved</TableHead>
                <TableHead className="w-[80px]">Par Level</TableHead>
                <TableHead className="w-[100px]">Avg Cost</TableHead>
                <TableHead className="w-[100px]">Last PO</TableHead>
                <TableHead className="w-[140px]">Supplier</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSKUs.map((sku) => (
                <TableRow
                  key={sku.skuId}
                  className={`${selectedSKUs.includes(sku.skuId) ? "bg-primary/5" : ""} ${
                    sku.stock.status === "out" ? "border-l-4 border-l-red-500" : ""
                  } ${sku.expiry && sku.expiry.daysLeft <= 2 ? "border-l-4 border-l-orange-500" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedSKUs.includes(sku.skuId)}
                      onCheckedChange={() => toggleSKUSelection(sku.skuId)}
                      aria-label={`Select ${sku.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{sku.code}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        <span className="mr-2">{sku.emoji}</span>
                        {sku.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{sku.description}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>
                          €{sku.costPerUnit.toFixed(2)}/{sku.baseUnit}
                        </span>
                        {sku.expiry && (
                          <>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={
                                sku.expiry.daysLeft <= 1
                                  ? "border-red-500/50 text-red-600 dark:text-red-400"
                                  : "border-orange-500/50 text-orange-600 dark:text-orange-400"
                              }
                            >
                              Exp: {sku.expiry.daysLeft}d
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sku.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={sku.stock.percentOfPar}
                          className="h-2 flex-1"
                          indicatorClassName={
                            sku.stock.percentOfPar === 0
                              ? "bg-red-500"
                              : sku.stock.percentOfPar <= 25
                                ? "bg-red-500"
                                : sku.stock.percentOfPar <= 50
                                  ? "bg-orange-500"
                                  : sku.stock.percentOfPar <= 75
                                    ? "bg-yellow-500"
                                    : sku.stock.percentOfPar <= 100
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                          }
                        />
                        <span className="text-sm font-medium min-w-[60px]">
                          {sku.stock.onHand} {sku.baseUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(sku.stock.status)}
                        {getTrendDisplay(sku.stock.trend, sku.stock.trendDirection)}
                      </div>
                      {sku.stock.affectedOrders && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {sku.stock.affectedOrders} orders ⚠️
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{sku.stock.reserved}</TableCell>
                  <TableCell className="text-sm">{sku.stock.parLevel}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">€{sku.costPerUnit.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {sku.costTrend === "up" && "📈"}
                        {sku.costTrend === "down" && "📉"}
                        {sku.costTrend === "stable" && "━"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {new Date(sku.lastPO.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">PO #{sku.lastPO.poNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{sku.supplier.name}</div>
                      {sku.supplier.preferred && (
                        <Badge variant="outline" className="text-xs">
                          ⭐ Preferred
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleAdjustStock(sku)}>
                        ± Adjust
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/inventory/purchase-orders/new?sku=${sku.skuId}`}>📋 PO</Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewSKUDetail(sku.skuId)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>📝 Edit SKU</DropdownMenuItem>
                          <DropdownMenuItem>📊 View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>📜 View Ledger</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>🔗 Link to Menu Items</DropdownMenuItem>
                          <DropdownMenuItem>🏷️ Manage Tags</DropdownMenuItem>
                          <DropdownMenuItem>📋 Add to Count Sheet</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>📤 Export History</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">🗑️ Delete SKU</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredSKUs.length)}{" "}
            of {filteredSKUs.length} SKUs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 5 && <span className="text-sm text-muted-foreground">...</span>}
              {totalPages > 5 && (
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {itemsPerPage} / page
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 25, 50, 100].map((count) => (
                  <DropdownMenuItem key={count} onClick={() => setItemsPerPage(count)}>
                    {count} per page
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Quick Adjust Drawer */}
      <QuickAdjustDrawer open={adjustDrawerOpen} onOpenChange={setAdjustDrawerOpen} sku={selectedSKUForAdjust} />

      {/* SKU Detail Drawer */}
      <SKUDetailDrawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} skuId={selectedSKUForDetail} />
    </div>
  )
}
