"use client"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  MoreVertical,
  Package,
  Lock,
  CheckCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  Mail,
  BarChart3,
  FileText,
  AlertTriangle,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

interface SKUDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skuId: string | null
}

export function SKUDetailDrawer({ open, onOpenChange, skuId }: SKUDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data based on spec
  const skuDetail = {
    skuId: "sku_eggs_fr",
    code: "EGG001",
    name: "Free-range Eggs",
    description: "Carton of 30, Grade A",
    emoji: "🥚",
    imageUrl: "/assorted-eggs.png",
    category: { id: "cat_dairy", name: "Dairy", emoji: "🧀" },
    inventoryType: "ingredient",
    perishable: true,
    shelfLifeDays: 21,
    tags: ["organic", "local"],
    createdAt: "2024-10-15T09:00:00Z",
    createdBy: { id: "user_sarah", name: "Sarah M." },
    updatedAt: "2024-11-10T14:30:00Z",
    updatedBy: { id: "user_john", name: "John D." },
    baseUnit: { id: "pc", name: "piece", symbol: "pc" },
    conversions: [
      { unit: "carton", factor: 30, label: "Carton (30)" },
      { unit: "tray", factor: 180, label: "Tray (180)" },
      { unit: "pallet", factor: 2160, label: "Pallet" },
    ],
    stock: {
      onHand: 120,
      reserved: 12,
      available: 108,
      parLevel: 200,
      percentOfPar: 60,
      status: "low",
      locationId: "loc_main",
      locationName: "Main Kitchen",
    },
    costing: {
      avgCost: 0.15,
      lastCost: 0.15,
      lowestCost90d: 0.12,
      highestCost90d: 0.16,
      currency: "EUR",
      valuationMethod: "weighted_average",
      currentStockValue: 18.0,
      costTrend: [
        { date: "Sep", cost: 0.12 },
        { date: "Oct 1", cost: 0.14 },
        { date: "Oct 15", cost: 0.16 },
        { date: "Nov 1", cost: 0.15 },
        { date: "Nov 15", cost: 0.15 },
      ],
    },
    reorder: {
      parLevel: 200,
      reorderPoint: 50,
      reorderQty: 150,
      avgLeadTimeDays: 2,
      autoReorder: false,
      safetyStock: 30,
      economicOrderQty: 180,
    },
    storage: {
      location: "Main Kitchen → Cold Storage → Shelf B2",
      temperature: "2-4°C",
      temperatureType: "refrigerated",
      handlingNotes: "Keep refrigerated. Check for cracks before use.",
      allergens: ["eggs"],
    },
  }

  const ledgerEntries = [
    {
      id: "mov_001",
      date: "2024-11-15T14:30:00Z",
      type: "consumption",
      typeLabel: "Consumed",
      typeEmoji: "🍽️",
      qty: -24,
      balance: 120,
      reference: "8 orders",
      user: { name: "System" },
    },
    {
      id: "mov_002",
      date: "2024-11-15T12:15:00Z",
      type: "consumption",
      typeLabel: "Consumed",
      typeEmoji: "🍽️",
      qty: -18,
      balance: 144,
      reference: "6 orders",
      user: { name: "System" },
    },
    {
      id: "mov_003",
      date: "2024-11-14T22:00:00Z",
      type: "consumption",
      typeLabel: "Consumed (Daily)",
      typeEmoji: "🍽️",
      qty: -42,
      balance: 162,
      reference: "14 orders",
      user: { name: "System" },
    },
    {
      id: "mov_004",
      date: "2024-11-14T09:15:00Z",
      type: "waste",
      typeLabel: "Waste",
      typeEmoji: "🗑️",
      qty: -6,
      balance: 204,
      reference: "Cracked",
      user: { name: "Maria L." },
    },
    {
      id: "mov_005",
      date: "2024-11-12T11:30:00Z",
      type: "received",
      typeLabel: "Received",
      typeEmoji: "📦",
      qty: 150,
      costPerUnit: 0.15,
      balance: 210,
      reference: "PO #1842",
      supplier: "Farm Fresh",
      user: { name: "John D." },
    },
    {
      id: "mov_006",
      date: "2024-11-10T18:00:00Z",
      type: "count_adjustment",
      typeLabel: "Count Adjustment",
      typeEmoji: "🧮",
      qty: -6,
      balance: 96,
      reference: "Count #45 Variance",
      user: { name: "Sarah M." },
    },
    {
      id: "mov_007",
      date: "2024-11-08T10:00:00Z",
      type: "received",
      typeLabel: "Received",
      typeEmoji: "📦",
      qty: 150,
      costPerUnit: 0.14,
      balance: 102,
      reference: "PO #1835",
      supplier: "Farm Fresh",
      user: { name: "John D." },
    },
    {
      id: "mov_008",
      date: "2024-11-05T15:00:00Z",
      type: "transfer_out",
      typeLabel: "Transfer Out",
      typeEmoji: "🔄",
      qty: -30,
      balance: -48,
      reference: "TRF #12 → Bar",
      user: { name: "Mike R." },
    },
  ]

  const vendors = {
    preferred: {
      id: "sup_farmfresh",
      name: "Farm Fresh",
      isPreferred: true,
      pricePerUnit: 0.15,
      priceTrend: "+2%",
      leadTimeDays: 2,
      minOrderQty: 60,
      minOrderLabel: "2 cartons",
      reliability: 94,
      vendorSku: "FF-EGG-30FR",
      contactEmail: "orders@farmfresh.com",
      contactPhone: "+31 20 555 1234",
      lastOrderDate: "Nov 12, 2024",
      lastOrderPO: "1842",
    },
    others: [
      {
        id: "sup_organic",
        name: "Organic Farms Co.",
        pricePerUnit: 0.18,
        leadTimeDays: 3,
        minOrderQty: 90,
        lastOrderDate: "Sep 5, 2024",
      },
      {
        id: "sup_metro",
        name: "Metro Cash & Carry",
        pricePerUnit: 0.14,
        leadTimeDays: 0,
        minOrderQty: 180,
        lastOrderDate: "Aug 20, 2024",
        note: "Emergency",
      },
    ],
  }

  const poHistory = [
    { poNumber: "1842", date: "Nov 12", supplier: "Farm Fresh", qty: 150, cost: 22.5, status: "received" },
    { poNumber: "1835", date: "Nov 8", supplier: "Farm Fresh", qty: 150, cost: 21.0, status: "received" },
    { poNumber: "1821", date: "Nov 1", supplier: "Farm Fresh", qty: 150, cost: 21.0, status: "received" },
    { poNumber: "1808", date: "Oct 25", supplier: "Farm Fresh", qty: 150, cost: 21.0, status: "received" },
    { poNumber: "1795", date: "Oct 18", supplier: "Organic Co.", qty: 90, cost: 16.2, status: "received" },
    { poNumber: "1780", date: "Oct 11", supplier: "Farm Fresh", qty: 150, cost: 19.5, status: "received" },
  ]

  const bomUsage = {
    summary: {
      totalRecipes: 12,
      avgPerServing: 2.3,
      topRecipe: { name: "Classic Omelet", salesCount: 847 },
      avgCostContribution: 0.35,
    },
    recipes: [
      {
        bomId: "bom_omelet",
        name: "Classic Omelet",
        emoji: "🍳",
        category: "Breakfast",
        menuItemId: "M001",
        qtyPerServing: 3,
        unit: "pc",
        costContribution: 0.45,
        costPercent: 28,
        sales7d: 847,
        consumed7d: 2541,
      },
      {
        bomId: "bom_benedict",
        name: "Eggs Benedict",
        emoji: "🥗",
        category: "Breakfast",
        menuItemId: "M003",
        qtyPerServing: 2,
        unit: "pc",
        costContribution: 0.3,
        costPercent: 12,
        sales7d: 234,
        consumed7d: 468,
      },
      {
        bomId: "bom_brulee",
        name: "Crème Brûlée",
        emoji: "🍰",
        category: "Desserts",
        menuItemId: "M045",
        qtyPerServing: 4,
        unit: "pc",
        yieldPercent: 85,
        note: "yolks only",
        costContribution: 0.6,
        costPercent: 18,
        sales7d: 89,
        consumed7d: 356,
      },
      {
        bomId: "bom_caesar",
        name: "Caesar Salad",
        emoji: "🥪",
        category: "Salads",
        menuItemId: "M022",
        qtyPerServing: 1,
        unit: "pc",
        costContribution: 0.15,
        costPercent: 5,
        sales7d: 156,
        consumed7d: 156,
      },
    ],
    consumptionByRecipe: [
      { name: "Classic Omelet", consumed: 2541, percent: 52 },
      { name: "Eggs Benedict", consumed: 468, percent: 10 },
      { name: "Crème Brûlée", consumed: 356, percent: 7 },
      { name: "Caesar Salad", consumed: 156, percent: 3 },
      { name: "Other (8)", consumed: 1326, percent: 28 },
    ],
    totalConsumed7d: 4847,
  }

  const analytics = {
    metrics30d: {
      totalConsumed: 4847,
      consumedTrend: "+12%",
      totalCost: 727.05,
      costTrend: "+15%",
      wasteRate: 2.4,
      wasteTrend: "-0.8%",
      turnoverRate: 8.2,
      turnoverTrend: "+1.2x",
    },
    consumptionByDay: [
      { day: "Mon", consumed: 142 },
      { day: "Tue", consumed: 128 },
      { day: "Wed", consumed: 118 },
      { day: "Thu", consumed: 131 },
      { day: "Fri", consumed: 156 },
      { day: "Sat", consumed: 178, isPeak: true },
      { day: "Sun", consumed: 164 },
    ],
    waste: {
      total30d: 118,
      totalValue: 17.7,
      byReason: [
        { reason: "Cracked/Damaged", qty: 68, percent: 58 },
        { reason: "Expired", qty: 32, percent: 27 },
        { reason: "Prep Waste", qty: 12, percent: 10 },
        { reason: "Other", qty: 6, percent: 5 },
      ],
      tip: "Cracked eggs are 58% of waste. Consider inspecting on receive.",
    },
    forecast: [
      { day: "Today", currentStock: 120, predictedUsage: 38, recommendedAction: null },
      { day: "+1", currentStock: 82, predictedUsage: 42, recommendedAction: null },
      { day: "+2", currentStock: 40, predictedUsage: 35, recommendedAction: "order", alert: "Below reorder point" },
      { day: "+3", currentStock: 5, predictedUsage: 48, recommendedAction: "stockout", alert: "Stockout" },
      { day: "+4", currentStock: -43, predictedUsage: 52, recommendedAction: "stockout", alert: "Stockout" },
    ],
    recommendation: {
      action: "Order 150 pc by tomorrow to avoid stockout",
      urgency: "high",
    },
  }

  const balanceOverTime = [
    { date: "Oct 20", balance: 180 },
    { date: "Oct 23", balance: 210 },
    { date: "Oct 26", balance: 150 },
    { date: "Oct 29", balance: 180 },
    { date: "Nov 1", balance: 210 },
    { date: "Nov 4", balance: 160 },
    { date: "Nov 7", balance: 102 },
    { date: "Nov 10", balance: 96 },
    { date: "Nov 13", balance: 210 },
    { date: "Nov 15", balance: 120 },
  ]

  const consumptionTrend = [
    { day: "Mon1", value: 142 },
    { day: "Tue1", value: 152 },
    { day: "Wed1", value: 138 },
    { day: "Thu1", value: 165 },
    { day: "Fri1", value: 182 },
    { day: "Sat1", value: 195 },
    { day: "Sun1", value: 178 },
    { day: "Mon2", value: 145 },
    { day: "Tue2", value: 158 },
    { day: "Wed2", value: 142 },
    { day: "Thu2", value: 168 },
    { day: "Fri2", value: 188 },
    { day: "Sat2", value: 205 },
    { day: "Sun2", value: 185 },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] p-0 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <img
                src={skuDetail.imageUrl || "/placeholder.svg"}
                alt={skuDetail.name}
                className="w-20 h-20 rounded-lg object-cover border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <SheetTitle className="text-xl">
                    {skuDetail.emoji} {skuDetail.name}
                  </SheetTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicate SKU</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {skuDetail.code} • {skuDetail.category.name} •{" "}
                  {skuDetail.perishable ? "Perishable" : "Non-perishable"}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skuDetail.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Stock Summary */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Package className="h-3.5 w-3.5" />
                  <span className="text-xs">ON HAND</span>
                </div>
                <div className="text-lg font-semibold">{skuDetail.stock.onHand} pc</div>
                <div className="text-xs text-muted-foreground">{skuDetail.stock.locationName}</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="text-xs">RESERVED</span>
                </div>
                <div className="text-lg font-semibold">{skuDetail.stock.reserved} pc</div>
                <div className="text-xs text-muted-foreground">4 orders</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">AVAILABLE</span>
                </div>
                <div className="text-lg font-semibold">{skuDetail.stock.available} pc</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">PAR LEVEL</span>
                </div>
                <div className="text-lg font-semibold">{skuDetail.stock.parLevel} pc</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {skuDetail.stock.percentOfPar}%
                </Badge>
              </div>
            </div>

            {/* Stock Progress Bar */}
            <div className="mt-4">
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center px-2 text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="ml-auto mr-auto">Critical</span>
                  <span className="ml-auto mr-auto">Low</span>
                  <span className="ml-auto mr-auto">Good</span>
                  <span className="ml-auto">Par: {skuDetail.stock.parLevel}</span>
                </div>
                <div
                  className="absolute inset-y-0 left-0 bg-warning/60"
                  style={{ width: `${(skuDetail.stock.onHand / skuDetail.stock.parLevel) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-warning" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                ± Adjust Stock
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                📋 Create PO
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                🔄 Transfer
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="ledger"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Ledger
              </TabsTrigger>
              <TabsTrigger
                value="vendors"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Vendors & POs
              </TabsTrigger>
              <TabsTrigger
                value="bom"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                BOM Usage
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <Tabs value={activeTab} className="w-full">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">BASIC INFORMATION</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">SKU Code</span>
                    <span className="font-medium">{skuDetail.code}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{skuDetail.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{skuDetail.description}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">
                      {skuDetail.category.emoji} {skuDetail.category.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Inventory Type</span>
                    <span className="font-medium capitalize">{skuDetail.inventoryType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Perishable</span>
                    <span className="font-medium">Yes • {skuDetail.shelfLifeDays} day shelf life</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">Oct 15, 2024 by {skuDetail.createdBy.name}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Last Modified</span>
                    <span className="font-medium">Nov 10, 2024 by {skuDetail.updatedBy.name}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Units & Conversions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">UNITS & CONVERSIONS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Base Unit</span>
                    <span className="font-medium">
                      {skuDetail.baseUnit.symbol} ({skuDetail.baseUnit.name})
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2">Conversions:</p>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Factor</TableHead>
                            <TableHead>Example</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {skuDetail.conversions.map((conversion) => (
                            <TableRow key={conversion.unit}>
                              <TableCell>{conversion.label}</TableCell>
                              <TableCell>= {conversion.factor} pc</TableCell>
                              <TableCell className="text-muted-foreground">
                                1 {conversion.unit} = {conversion.factor} pieces
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Conversion
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Costing */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">COSTING</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">AVG COST</div>
                    <div className="text-lg font-semibold">€{skuDetail.costing.avgCost.toFixed(2)}/pc</div>
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% YoY
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">LAST COST</div>
                    <div className="text-lg font-semibold">€{skuDetail.costing.lastCost.toFixed(2)}/pc</div>
                    <div className="text-xs text-muted-foreground mt-1">Nov 12</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">LOWEST 90d</div>
                    <div className="text-lg font-semibold">€{skuDetail.costing.lowestCost90d.toFixed(2)}/pc</div>
                    <div className="text-xs text-muted-foreground mt-1">Sep 2</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">HIGHEST 90d</div>
                    <div className="text-lg font-semibold">€{skuDetail.costing.highestCost90d.toFixed(2)}/pc</div>
                    <div className="text-xs text-muted-foreground mt-1">Oct 18</div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-3">Cost Trend (90 Days):</p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={skuDetail.costing.costTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" domain={[0.1, 0.18]} />
                        <RechartsTooltip
                          contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                          formatter={(value: number) => `€${value.toFixed(2)}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="cost"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-sm space-y-1 mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valuation Method:</span>
                    <span className="font-medium">{skuDetail.costing.valuationMethod.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Stock Value:</span>
                    <span className="font-medium">
                      €{skuDetail.costing.currentStockValue.toFixed(2)} ({skuDetail.stock.onHand} pc × €
                      {skuDetail.costing.avgCost.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reorder Settings */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">REORDER SETTINGS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Par Level</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skuDetail.reorder.parLevel} pc</span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reorder Point</span>
                    <span className="font-medium">{skuDetail.reorder.reorderPoint} pc (25% of par)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reorder Qty</span>
                    <span className="font-medium">{skuDetail.reorder.reorderQty} pc (to reach par)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Lead Time</span>
                    <span className="font-medium">{skuDetail.reorder.avgLeadTimeDays} days (avg from supplier)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Auto-reorder</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skuDetail.reorder.autoReorder ? "Enabled" : "Disabled"}</span>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Safety Stock</span>
                    <span className="font-medium">{skuDetail.reorder.safetyStock} pc (15% buffer)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Economic Order Qty</span>
                    <span className="font-medium">{skuDetail.reorder.economicOrderQty} pc (suggested)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Storage & Handling */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">STORAGE & HANDLING</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Storage Location</span>
                    <span className="font-medium">{skuDetail.storage.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="font-medium capitalize">
                      {skuDetail.storage.temperature} ({skuDetail.storage.temperatureType})
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Handling Notes</span>
                    <span className="font-medium text-right max-w-xs">{skuDetail.storage.handlingNotes}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Allergens</span>
                    <span className="font-medium">🥚 {skuDetail.storage.allergens.join(", ")}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ledger Tab */}
            <TabsContent value="ledger" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Stock Movements</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search movements..." className="pl-9" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="consumption">Consumed</SelectItem>
                    <SelectItem value="waste">Waste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Movement Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">↓ IN</div>
                  <div className="text-lg font-semibold text-green-600">+450 pc</div>
                  <div className="text-xs text-muted-foreground">3 POs</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">↑ OUT</div>
                  <div className="text-lg font-semibold text-orange-600">-380 pc</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">± ADJUST</div>
                  <div className="text-lg font-semibold">-12 pc</div>
                  <div className="text-xs text-muted-foreground">2 counts</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">⚖️ NET</div>
                  <div className="text-lg font-semibold text-green-600">+58 pc</div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          <div>
                            {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span>{entry.typeEmoji}</span>
                            <span className="text-sm">{entry.typeLabel}</span>
                          </div>
                          {entry.supplier && <div className="text-xs text-muted-foreground">{entry.supplier}</div>}
                        </TableCell>
                        <TableCell
                          className={cn("text-right font-medium", entry.qty > 0 ? "text-green-600" : "text-orange-600")}
                        >
                          {entry.qty > 0 ? "+" : ""}
                          {entry.qty} pc
                          {entry.costPerUnit && (
                            <div className="text-xs text-muted-foreground">@€{entry.costPerUnit.toFixed(2)}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{entry.balance} pc</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.reference}</TableCell>
                        <TableCell className="text-sm">{entry.user.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Showing 1-10 of 156 movements</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="ghost" size="sm">
                    2
                  </Button>
                  <Button variant="ghost" size="sm">
                    3
                  </Button>
                  <span className="text-muted-foreground">...</span>
                  <Button variant="ghost" size="sm">
                    16
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Balance Over Time Chart */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Balance Over Time</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceOverTime}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <RechartsTooltip
                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="hsl(var(--primary))"
                        fill="url(#balanceGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Vendors & POs Tab */}
            <TabsContent value="vendors" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Vendors & Purchase Orders</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>

              {/* Preferred Vendor */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">PREFERRED VENDOR</h3>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{vendors.preferred.name}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Set Default
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">PRICE</div>
                      <div className="text-lg font-semibold">€{vendors.preferred.pricePerUnit.toFixed(2)}/pc</div>
                      <div className="text-xs text-green-600">▲ {vendors.preferred.priceTrend} MoM</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">LEAD TIME</div>
                      <div className="text-lg font-semibold">{vendors.preferred.leadTimeDays} days</div>
                      <div className="text-xs text-muted-foreground">Avg</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">MIN ORDER</div>
                      <div className="text-lg font-semibold">{vendors.preferred.minOrderQty} pc</div>
                      <div className="text-xs text-muted-foreground">{vendors.preferred.minOrderLabel}</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">RELIABILITY</div>
                      <div className="flex items-center justify-center gap-1">
                        <Progress value={vendors.preferred.reliability} className="w-12 h-2" />
                        <span className="text-sm font-semibold">{vendors.preferred.reliability}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">On-time</div>
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendor SKU:</span>
                      <span className="font-medium">{vendors.preferred.vendorSku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">
                        {vendors.preferred.contactEmail} • {vendors.preferred.contactPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Order:</span>
                      <span className="font-medium">
                        {vendors.preferred.lastOrderDate} (PO #{vendors.preferred.lastOrderPO})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Create PO
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Vendor
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>

              {/* Other Vendors */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">OTHER VENDORS</h3>
                <div className="space-y-2">
                  {vendors.others.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            €{vendor.pricePerUnit.toFixed(2)}/pc • {vendor.leadTimeDays} day lead • Min:{" "}
                            {vendor.minOrderQty} pc
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last: {vendor.lastOrderDate} {vendor.note && `(${vendor.note})`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            PO
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PO History */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">PURCHASE ORDER HISTORY</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poHistory.map((po) => (
                        <TableRow key={po.poNumber}>
                          <TableCell className="font-medium">#{po.poNumber}</TableCell>
                          <TableCell>{po.date}</TableCell>
                          <TableCell>{po.supplier}</TableCell>
                          <TableCell className="text-right">{po.qty} pc</TableCell>
                          <TableCell className="text-right">€{po.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                              ✅ {po.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="link" className="w-full">
                  View All POs →
                </Button>
              </div>

              {/* Price Comparison Chart */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">PRICE COMPARISON</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" dataKey="leadTime" name="Lead Time" unit=" days" tick={{ fontSize: 12 }} />
                      <YAxis
                        type="number"
                        dataKey="price"
                        name="Price"
                        unit="€"
                        tick={{ fontSize: 12 }}
                        domain={[0.12, 0.2]}
                      />
                      <RechartsTooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                        formatter={(value: number, name: string) => [
                          name === "price" ? `€${value.toFixed(2)}` : `${value} days`,
                          name,
                        ]}
                      />
                      <Scatter
                        name="Vendors"
                        data={[
                          { leadTime: 2, price: 0.15, name: "Farm Fresh" },
                          { leadTime: 3, price: 0.18, name: "Organic Farms" },
                          { leadTime: 0, price: 0.14, name: "Metro" },
                        ]}
                        fill="hsl(var(--primary))"
                      >
                        {[
                          { leadTime: 2, price: 0.15, name: "Farm Fresh" },
                          { leadTime: 3, price: 0.18, name: "Organic Farms" },
                          { leadTime: 0, price: 0.14, name: "Metro" },
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* BOM Usage Tab */}
            <TabsContent value="bom" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">BOM / Recipe Usage</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Link Recipe
                </Button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This ingredient is used in{" "}
                  <span className="font-semibold text-foreground">{bomUsage.summary.totalRecipes} recipes</span> across
                  3 menu categories
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">🍳 RECIPES</div>
                  <div className="text-lg font-semibold">{bomUsage.summary.totalRecipes}</div>
                  <div className="text-xs text-muted-foreground">using egg</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">📊 AVG</div>
                  <div className="text-lg font-semibold">{bomUsage.summary.avgPerServing} pc</div>
                  <div className="text-xs text-muted-foreground">per serve</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">🔥 TOP</div>
                  <div className="text-lg font-semibold">{bomUsage.summary.topRecipe.name}</div>
                  <div className="text-xs text-muted-foreground">{bomUsage.summary.topRecipe.salesCount} sold</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">💰 COST</div>
                  <div className="text-lg font-semibold">€{bomUsage.summary.avgCostContribution.toFixed(2)}/svg</div>
                  <div className="text-xs text-muted-foreground">avg cont.</div>
                </div>
              </div>

              {/* Linked Recipes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">LINKED RECIPES</h3>
                <div className="space-y-3">
                  {bomUsage.recipes.map((recipe) => (
                    <div key={recipe.bomId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">
                            {recipe.emoji} {recipe.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {recipe.category} • Menu Item #{recipe.menuItemId}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Recipe
                        </Button>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uses:</span>
                          <span className="font-medium">
                            {recipe.qtyPerServing} {recipe.unit} / serving
                            {recipe.note && ` (${recipe.note})`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Egg cost contribution:</span>
                          <span className="font-medium">
                            €{recipe.costContribution.toFixed(2)} ({recipe.costPercent}% of recipe cost)
                          </span>
                        </div>
                      </div>

                      {recipe.bomId === "bom_omelet" && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Eggs</span>
                              <span>€0.45 (28%)</span>
                            </div>
                            <Progress value={28} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Cheese</span>
                              <span>€0.22 (14%)</span>
                            </div>
                            <Progress value={14} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Other</span>
                              <span>€0.93 (58%)</span>
                            </div>
                            <Progress value={58} className="h-2" />
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        7-day sales: <span className="font-medium text-foreground">{recipe.sales7d} portions</span> →{" "}
                        <span className="font-medium text-foreground">{recipe.consumed7d} eggs consumed</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="link" className="w-full">
                    + 8 more recipes... Show All →
                  </Button>
                </div>
              </div>

              {/* Consumption by Recipe */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">CONSUMPTION BY RECIPE (7 Days)</h3>
                <div className="space-y-2">
                  {bomUsage.consumptionByRecipe.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.consumed} ({item.percent}%)
                        </span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Total:{" "}
                  <span className="font-medium text-foreground">
                    {bomUsage.totalConsumed7d} eggs consumed this week
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Analytics</h3>
                <div className="flex gap-2">
                  <Select defaultValue="30d">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">KEY METRICS (Last 30 Days)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">📦 TOTAL CONSUMED</div>
                    <div className="text-lg font-semibold">{analytics.metrics30d.totalConsumed} pc</div>
                    <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {analytics.metrics30d.consumedTrend}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">💰 TOTAL COST</div>
                    <div className="text-lg font-semibold">€{analytics.metrics30d.totalCost.toFixed(2)}</div>
                    <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {analytics.metrics30d.costTrend}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">🗑️ WASTE RATE</div>
                    <div className="text-lg font-semibold">{analytics.metrics30d.wasteRate}%</div>
                    <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingDown className="h-3 w-3" />
                      {analytics.metrics30d.wasteTrend}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">📈 TURN RATE</div>
                    <div className="text-lg font-semibold">{analytics.metrics30d.turnoverRate}x</div>
                    <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      {analytics.metrics30d.turnoverTrend}
                    </div>
                  </div>
                </div>
              </div>

              {/* Consumption Trend */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">CONSUMPTION TREND</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={consumptionTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Daily Consumption"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Usage Patterns */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">USAGE PATTERNS</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-3">By Day of Week:</p>
                    <div className="space-y-2">
                      {analytics.consumptionByDay.map((item) => (
                        <div key={item.day} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.day}</span>
                            <span className="text-muted-foreground">
                              {item.consumed} {item.isPeak && "← Peak"}
                            </span>
                          </div>
                          <Progress value={(item.consumed / 200) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3">By Hour:</p>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { hour: "8AM", value: 45 },
                            { hour: "10AM", value: 32 },
                            { hour: "12PM", value: 38 },
                            { hour: "2PM", value: 12 },
                            { hour: "6PM", value: 28 },
                            { hour: "8PM", value: 22 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip
                            contentStyle={{
                              background: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waste Tracking */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">WASTE TRACKING</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    Total Waste (30 days):{" "}
                    <span className="font-semibold">
                      {analytics.waste.total30d} pc (€{analytics.waste.totalValue.toFixed(2)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">By Reason:</p>
                  <div className="space-y-2">
                    {analytics.waste.byReason.map((item) => (
                      <div key={item.reason} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.reason}</span>
                          <span className="text-muted-foreground">
                            {item.qty} pc ({item.percent}%)
                          </span>
                        </div>
                        <Progress value={item.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900 dark:text-yellow-200">💡 Tip: {analytics.waste.tip}</p>
                </div>
              </div>

              {/* Forecasting */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">FORECASTING</h3>
                <p className="text-sm text-muted-foreground">Predicted Consumption (Next 7 Days):</p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Predicted Usage</TableHead>
                        <TableHead>Recommended Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.forecast.map((item, idx) => (
                        <TableRow
                          key={idx}
                          className={
                            item.recommendedAction === "stockout"
                              ? "bg-red-500/5"
                              : item.recommendedAction === "order"
                                ? "bg-yellow-500/5"
                                : ""
                          }
                        >
                          <TableCell className="font-medium">{item.day}</TableCell>
                          <TableCell className="text-right">{item.currentStock}</TableCell>
                          <TableCell className="text-right">{item.predictedUsage}</TableCell>
                          <TableCell>
                            {item.recommendedAction === "stockout" ? (
                              <Badge variant="destructive">🔴 Stockout</Badge>
                            ) : item.recommendedAction === "order" ? (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                                ⚠️ Order
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {item.alert && <span className="text-xs text-muted-foreground ml-2">← {item.alert}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">🎯 Recommendation:</p>
                  <p className="text-sm">{analytics.recommendation.action}</p>
                  <Button className="mt-3">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Suggested PO
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
