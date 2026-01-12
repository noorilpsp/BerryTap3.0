"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  PackageIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  FileTextIcon,
  CalendarIcon,
  DownloadIcon,
  TrendingDownIcon,
  RecycleIcon,
  ShoppingCartIcon,
  RepeatIcon,
  PlusIcon,
  PlayIcon,
  EditIcon,
  MoreVerticalIcon,
  StarIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock Data
const inventoryValueTrend = [
  { date: "Nov 1", value: 45230, target: 45000, receiving: false },
  { date: "Nov 2", value: 45890, target: 45000, receiving: false },
  { date: "Nov 3", value: 46520, target: 45000, receiving: true },
  { date: "Nov 4", value: 47100, target: 45000, receiving: false },
  { date: "Nov 5", value: 47890, target: 45000, receiving: false },
  { date: "Nov 6", value: 47650, target: 45000, receiving: false },
  { date: "Nov 7", value: 46990, target: 45000, receiving: false },
  { date: "Nov 8", value: 46450, target: 45000, receiving: false },
  { date: "Nov 9", value: 47200, target: 45000, receiving: true },
  { date: "Nov 10", value: 48100, target: 45000, receiving: false },
  { date: "Nov 11", value: 47890, target: 45000, receiving: false },
  { date: "Nov 12", value: 47560, target: 45000, receiving: false },
  { date: "Nov 13", value: 47340, target: 45000, receiving: false },
  { date: "Nov 14", value: 47950, target: 45000, receiving: false },
  { date: "Nov 15", value: 47832, target: 45000, receiving: false },
]

const inventoryByCategory = [
  { category: "Proteins", emoji: "🥩", value: 14350, percent: 30, fill: "hsl(var(--chart-1))" },
  { category: "Dairy", emoji: "🧀", value: 9580, percent: 20, fill: "hsl(var(--chart-2))" },
  { category: "Produce", emoji: "🥬", value: 8230, percent: 17, fill: "hsl(var(--chart-3))" },
  { category: "Beverages", emoji: "🍷", value: 8945, percent: 19, fill: "hsl(var(--chart-4))" },
  { category: "Dry Goods", emoji: "🌾", value: 6727, percent: 14, fill: "hsl(var(--chart-5))" },
]

const topMovers = [
  { rank: 1, name: "Eggs", emoji: "🥚", consumed: "2,400 pc", value: 360 },
  { rank: 2, name: "Chicken", emoji: "🍗", consumed: "45 kg", value: 401 },
  { rank: 3, name: "Milk", emoji: "🥛", consumed: "120 L", value: 144 },
  { rank: 4, name: "Butter", emoji: "🧈", consumed: "18 kg", value: 144 },
  { rank: 5, name: "Tomatoes", emoji: "🍅", consumed: "35 kg", value: 123 },
  { rank: 6, name: "Mozzarella", emoji: "🧀", consumed: "28 pc", value: 90 },
  { rank: 7, name: "Salmon", emoji: "🐟", consumed: "12 kg", value: 222 },
  { rank: 8, name: "Lettuce", emoji: "🥬", consumed: "22 kg", value: 62 },
  { rank: 9, name: "Onions", emoji: "🧅", consumed: "30 kg", value: 27 },
  { rank: 10, name: "Potatoes", emoji: "🥔", consumed: "40 kg", value: 34 },
]

const foodCostTrend = [
  { week: "Week 1", value: 27.5, target: 28 },
  { week: "Week 2", value: 29.2, target: 28 },
  { week: "Week 3", value: 32.1, target: 28 },
  { week: "Week 4", value: 28.8, target: 28 },
  { week: "Week 5", value: 26.4, target: 28 },
  { week: "Week 6", value: 27.9, target: 28 },
  { week: "Week 7", value: 25.8, target: 28 },
  { week: "Week 8", value: 29.6, target: 28 },
]

const cogsByCategory = [
  {
    category: "Proteins",
    emoji: "🥩",
    cogs: 6234,
    percentOfTotal: 33.8,
    revenue: 21450,
    costPercent: 29.1,
    target: 30,
    status: "good",
  },
  {
    category: "Dairy",
    emoji: "🧀",
    cogs: 3456,
    percentOfTotal: 18.7,
    revenue: 12340,
    costPercent: 28.0,
    target: 28,
    status: "good",
  },
  {
    category: "Produce",
    emoji: "🥬",
    cogs: 2890,
    percentOfTotal: 15.7,
    revenue: 8670,
    costPercent: 33.3,
    target: 30,
    status: "high",
  },
  {
    category: "Beverages",
    emoji: "🍷",
    cogs: 2345,
    percentOfTotal: 12.7,
    revenue: 9380,
    costPercent: 25.0,
    target: 25,
    status: "good",
  },
  {
    category: "Dry Goods",
    emoji: "🌾",
    cogs: 1890,
    percentOfTotal: 10.2,
    revenue: 6300,
    costPercent: 30.0,
    target: 32,
    status: "good",
  },
  {
    category: "Other",
    emoji: "📦",
    cogs: 1641,
    percentOfTotal: 8.9,
    revenue: 4200,
    costPercent: 39.1,
    target: 35,
    status: "high",
  },
]

const wasteByReason = [
  { reason: "Spoilage/Expired", value: 374.8, percent: 42, events: 65 },
  { reason: "Over-prep", value: 249.87, percent: 28, events: 45 },
  { reason: "Quality Issues", value: 133.86, percent: 15, events: 24 },
  { reason: "Damaged", value: 80.32, percent: 9, events: 14 },
  { reason: "Other", value: 53.55, percent: 6, events: 8 },
]

const wasteByCategory = [
  { category: "Produce", emoji: "🥬", value: 339.11, percent: 38, events: 78 },
  { category: "Dairy", emoji: "🧀", value: 214.18, percent: 24, events: 34 },
  { category: "Proteins", emoji: "🥩", value: 169.56, percent: 19, events: 22 },
  { category: "Beverages", emoji: "🍷", value: 107.09, percent: 12, events: 15 },
  { category: "Other", emoji: "🌾", value: 62.46, percent: 7, events: 7 },
]

const stockHealthDistribution = [
  { status: "Healthy", color: "hsl(var(--chart-1))", skuCount: 611, percent: 72, value: 34439 },
  { status: "Low", color: "hsl(var(--chart-2))", skuCount: 153, percent: 18, value: 8610 },
  { status: "Critical", color: "hsl(var(--chart-3))", skuCount: 51, percent: 6, value: 2868 },
  { status: "Out", color: "hsl(var(--destructive))", skuCount: 17, percent: 2, value: 0 },
  { status: "Overstock", color: "hsl(var(--chart-5))", skuCount: 15, percent: 2, value: 1915 },
]

const savedReports = [
  {
    id: "rpt_001",
    name: "Weekly Inventory Summary",
    type: "Valuation",
    schedule: "Every Mon",
    lastRun: "Nov 11",
    starred: true,
  },
  {
    id: "rpt_002",
    name: "Monthly COGS Report",
    type: "COGS",
    schedule: "1st of month",
    lastRun: "Nov 1",
    starred: true,
  },
  { id: "rpt_003", name: "Daily Waste Log", type: "Waste", schedule: "Daily 6 PM", lastRun: "Today", starred: false },
  {
    id: "rpt_004",
    name: "Low Stock Alert",
    type: "Stock Health",
    schedule: "Daily 8 AM",
    lastRun: "Today",
    starred: false,
  },
  {
    id: "rpt_005",
    name: "Supplier Performance",
    type: "Purchasing",
    schedule: "Monthly",
    lastRun: "Nov 1",
    starred: false,
  },
  {
    id: "rpt_006",
    name: "Category Profitability",
    type: "COGS",
    schedule: "On demand",
    lastRun: "Nov 10",
    starred: false,
  },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("nov-1-15")
  const [location, setLocation] = useState("all")
  const [category, setCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/inventory" className="hover:text-foreground">
              Inventory
            </Link>
            <span>/</span>
            <span>Reports</span>
          </div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for inventory management</p>
        </div>
        <Button>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Date Range & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nov-1-15">Nov 1 - Nov 15, 2024</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7">Last 7 Days</SelectItem>
                  <SelectItem value="last-30">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="main">Main Kitchen</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="proteins">Proteins</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="produce">Produce</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Custom"].map((quick) => (
              <Button key={quick} variant="outline" size="sm">
                {quick}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cogs" className="text-xs sm:text-sm">
            <DollarSignIcon className="w-4 h-4 mr-2" />
            COGS
          </TabsTrigger>
          <TabsTrigger value="consumption" className="text-xs sm:text-sm">
            <TrendingDownIcon className="w-4 h-4 mr-2" />
            Consumption
          </TabsTrigger>
          <TabsTrigger value="waste" className="text-xs sm:text-sm">
            <RecycleIcon className="w-4 h-4 mr-2" />
            Waste
          </TabsTrigger>
          <TabsTrigger value="stock" className="text-xs sm:text-sm">
            <PackageIcon className="w-4 h-4 mr-2" />
            Stock Health
          </TabsTrigger>
          <TabsTrigger value="purchasing" className="text-xs sm:text-sm">
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            Purchasing
          </TabsTrigger>
          <TabsTrigger value="turnover" className="text-xs sm:text-sm">
            <RepeatIcon className="w-4 h-4 mr-2" />
            Turnover
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<DollarSignIcon className="w-5 h-5" />}
              label="Inventory Value"
              value="€47,832"
              change={3.2}
              changeLabel="vs last period"
              positive
            />
            <MetricCard
              icon={<TrendingUpIcon className="w-5 h-5" />}
              label="COGS (Period)"
              value="€18,456"
              change={-5.1}
              changeLabel="vs last period"
              positive
            />
            <MetricCard
              icon={<RepeatIcon className="w-5 h-5" />}
              label="Turnover Rate"
              value="4.2x"
              change={0.3}
              changeLabel="vs last period"
              positive
              changePrefix="+"
              changeSuffix="x"
            />
            <MetricCard
              icon={<RecycleIcon className="w-5 h-5" />}
              label="Waste Rate"
              value="2.8%"
              change={-0.4}
              changeLabel="vs last period"
              positive
              changeSuffix="%"
            />
          </div>

          {/* Inventory Value Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inventoryValueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, "Value"]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    name="Total Value"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    name="Target (€45k)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export Chart
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  <Button variant="link" className="text-sm">
                    View Details →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Movers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Movers (Consumption)</CardTitle>
                <CardDescription>This Period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMovers.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-6">{item.rank}</span>
                        <span>{item.emoji}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.consumed}</span>
                        <span className="font-medium w-16 text-right">€{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total consumption:</span>
                    <span>€2,847</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="link" className="text-sm">
                    View All →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Required */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/inventory/skus?status=low">
                  <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔴</span>
                      <div>
                        <p className="font-medium">23 items below par level</p>
                        <p className="text-sm text-muted-foreground">5 critical (OUT)</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/inventory/skus?expiring=3">
                  <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🟡</span>
                      <div>
                        <p className="font-medium">12 items expiring within 3 days</p>
                        <p className="text-sm text-muted-foreground">€456 at risk</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/inventory/purchase-orders?status=overdue">
                  <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🟠</span>
                      <div>
                        <p className="font-medium">3 POs overdue</p>
                        <p className="text-sm text-muted-foreground">€1,890 pending</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/inventory/stockcounts?status=pending">
                  <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔵</span>
                      <div>
                        <p className="font-medium">3 counts pending reconciliation</p>
                        <p className="text-sm text-muted-foreground">€362.40 variance</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Today</p>
                    <div className="space-y-2">
                      <ActivityItem time="14:30" icon="📦" text="PO #1858 received (€567)" />
                      <ActivityItem time="12:15" icon="🔄" text="Transfer #TR-158 shipped" />
                      <ActivityItem time="10:00" icon="🧮" text="Count #CS-089 started" />
                      <ActivityItem time="09:30" icon="📝" text="SKU BEF001 adjusted (-2kg)" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Yesterday</p>
                    <div className="space-y-2">
                      <ActivityItem time="17:45" icon="🧮" text="Count #CS-087 completed" />
                      <ActivityItem time="16:00" icon="📦" text="PO #1857 sent to supplier" />
                      <ActivityItem time="14:30" icon="🔄" text="Transfer #TR-157 received" />
                      <ActivityItem time="11:00" icon="🗑️" text="Waste logged: €45.20" />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="link" className="text-sm">
                    View All Activity →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COGS & Valuation Tab */}
        <TabsContent value="cogs" className="space-y-6">
          {/* Period Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Opening Inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€45,230</p>
                <p className="text-sm text-muted-foreground">Nov 1, 2024</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">+€21,058</p>
                <p className="text-sm text-muted-foreground">34 POs received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>COGS</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">-€18,456</p>
                <p className="text-sm text-muted-foreground">Food cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Closing Inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€47,832</p>
                <p className="text-sm text-muted-foreground">Nov 15, 2024</p>
              </CardContent>
            </Card>
          </div>

          {/* COGS Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>COGS Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Opening Inventory</span>
                  <span>€45,230.00</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Purchases</span>
                  <span>+€21,058.00</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Transfer In</span>
                  <span>+€1,234.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>= Goods Available</span>
                  <span>€67,522.00</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Closing Inventory</span>
                  <span>-€47,832.00</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Transfer Out</span>
                  <span>-€1,234.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>= Cost of Goods Sold</span>
                  <span>€18,456.00</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between">
                  <span>Revenue (Period)</span>
                  <span>€62,340.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Food Cost %</span>
                  <span>29.6%</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Food Cost %</span>
                  <span>28.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Variance</span>
                  <Badge variant="destructive">+1.6% (Over)</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export for Accounting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Food Cost % Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Food Cost % Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={foodCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[20, 35]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Food Cost %"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    name="Target 28%"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* COGS by Category */}
          <Card>
            <CardHeader>
              <CardTitle>COGS by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">COGS</th>
                      <th className="text-right p-2">% of Total</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Cost %</th>
                      <th className="text-right p-2">Target</th>
                      <th className="text-right p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cogsByCategory.map((cat) => (
                      <tr key={cat.category} className="border-b">
                        <td className="p-2">
                          <span className="mr-2">{cat.emoji}</span>
                          {cat.category}
                        </td>
                        <td className="text-right p-2">€{cat.cogs.toLocaleString()}</td>
                        <td className="text-right p-2">{cat.percentOfTotal}%</td>
                        <td className="text-right p-2">€{cat.revenue.toLocaleString()}</td>
                        <td className="text-right p-2">{cat.costPercent}%</td>
                        <td className="text-right p-2">{cat.target}%</td>
                        <td className="text-right p-2">
                          <Badge variant={cat.status === "good" ? "default" : "destructive"}>
                            {cat.status === "good" ? "🟢 Good" : "🔴 High"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="p-2">TOTAL</td>
                      <td className="text-right p-2">€18,456</td>
                      <td className="text-right p-2">100%</td>
                      <td className="text-right p-2">€62,340</td>
                      <td className="text-right p-2">29.6%</td>
                      <td className="text-right p-2">28%</td>
                      <td className="text-right p-2">
                        <Badge variant="outline">🟡 Watch</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-900 dark:text-orange-100">
                  <AlertTriangleIcon className="w-4 h-4 inline mr-2" />
                  Produce and Other categories are above target - review pricing and waste
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waste Tab */}
        <TabsContent value="waste" className="space-y-6">
          {/* Waste Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Waste (Period)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€892.40</p>
                <p className="text-sm text-muted-foreground">156 events</p>
                <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>+12% vs last</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Waste Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">2.8%</p>
                <p className="text-sm text-muted-foreground">of consumption</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <ArrowDownIcon className="w-4 h-4" />
                  <span>-0.4% vs last</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>VS Target</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">+0.8%</p>
                <p className="text-sm text-muted-foreground">Above 2% target</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Potential Savings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€267/month</p>
                <p className="text-sm text-muted-foreground">if at target</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waste by Reason */}
            <Card>
              <CardHeader>
                <CardTitle>Waste by Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wasteByReason.map((item) => (
                    <div key={item.reason}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.reason}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        €{item.value.toFixed(2)} • {item.events} events
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Waste by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Waste by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wasteByCategory.map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          <span className="mr-2">{item.emoji}</span>
                          {item.category}
                        </span>
                        <span>{item.percent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div className="bg-destructive h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        €{item.value.toFixed(2)} • {item.events} events
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Log Waste */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Log Waste Event
              </Button>
              <Button variant="outline">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Health Tab */}
        <TabsContent value="stock" className="space-y-6">
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Health Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockHealthDistribution.map((item) => (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.status}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-6 mb-1">
                      <div
                        className="h-6 rounded-full flex items-center px-3 text-white text-xs"
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      >
                        {item.skuCount} SKUs
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">€{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Out of Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Out of Stock (17)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">🥩 Beef Tenderloin</span>
                    <span className="float-right text-muted-foreground">Nov 12 • 3 days</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">🦞 Lobster Tails</span>
                    <span className="float-right text-muted-foreground">Nov 10 • 5 days</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">🦀 Crab Meat</span>
                    <span className="float-right text-muted-foreground">Nov 11 • 4 days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="link" className="w-full">
                    View All Out of Stock →
                  </Button>
                  <Button className="w-full">Create PO for Out of Stock</Button>
                </div>
              </CardContent>
            </Card>

            {/* Expiring Soon */}
            <Card>
              <CardHeader>
                <CardTitle>Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-2 border rounded">
                    <div>
                      <span className="text-2xl mr-2">🔴</span>
                      <span className="font-medium">Today</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">5 items</p>
                      <p className="text-sm text-muted-foreground">€89.50</p>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <div>
                      <span className="text-2xl mr-2">🟠</span>
                      <span className="font-medium">Tomorrow</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">8 items</p>
                      <p className="text-sm text-muted-foreground">€156.20</p>
                    </div>
                  </div>
                  <div className="flex justify-between p-2 border rounded">
                    <div>
                      <span className="text-2xl mr-2">🟡</span>
                      <span className="font-medium">2-3 Days</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">12 items</p>
                      <p className="text-sm text-muted-foreground">€234.80</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium">Total at risk: €892.80</p>
                <Button variant="link" className="w-full mt-2">
                  View Expiry Calendar →
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consumption Report Tab */}
        <TabsContent value="consumption" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Consumption</CardDescription>
                <CardTitle className="text-2xl">€28,456</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUpIcon className="w-4 h-4 mr-1 text-red-500" />
                  <span className="text-red-500">+8.2%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Daily Consumption</CardDescription>
                <CardTitle className="text-2xl">€1,897</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUpIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+3.1%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Top Category</CardDescription>
                <CardTitle className="text-2xl">Proteins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">€9,234 (32.4% of total)</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Items Consumed</CardDescription>
                <CardTitle className="text-2xl">1,234</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Across 456 SKUs</div>
              </CardContent>
            </Card>
          </div>

          {/* Consumption Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Trend</CardTitle>
              <CardDescription>Daily consumption value over the period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { date: "Nov 1", value: 1845, weekday: "Mon" },
                    { date: "Nov 2", value: 1923, weekday: "Tue" },
                    { date: "Nov 3", value: 2104, weekday: "Wed" },
                    { date: "Nov 4", value: 1876, weekday: "Thu" },
                    { date: "Nov 5", value: 2287, weekday: "Fri" },
                    { date: "Nov 6", value: 2456, weekday: "Sat" },
                    { date: "Nov 7", value: 2189, weekday: "Sun" },
                    { date: "Nov 8", value: 1912, weekday: "Mon" },
                    { date: "Nov 9", value: 1998, weekday: "Tue" },
                    { date: "Nov 10", value: 2123, weekday: "Wed" },
                    { date: "Nov 11", value: 1867, weekday: "Thu" },
                    { date: "Nov 12", value: 2345, weekday: "Fri" },
                    { date: "Nov 13", value: 2512, weekday: "Sat" },
                    { date: "Nov 14", value: 2278, weekday: "Sun" },
                    { date: "Nov 15", value: 1945, weekday: "Mon" },
                  ]}
                >
                  <defs>
                    <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#consumptionGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">Weekend peaks indicate higher dining volume</div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Consumption by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Consumption by Category</CardTitle>
                <CardDescription>Value breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "🥩 Proteins", value: 9234, percent: 32.4, color: "bg-red-500" },
                    { category: "🧀 Dairy", value: 6890, percent: 24.2, color: "bg-blue-500" },
                    { category: "🥬 Produce", value: 5678, percent: 20.0, color: "bg-green-500" },
                    { category: "🍷 Beverages", value: 4234, percent: 14.9, color: "bg-purple-500" },
                    { category: "🌾 Dry Goods", value: 2420, percent: 8.5, color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">€{item.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Consumed Items */}
            <Card>
              <CardHeader>
                <CardTitle>Top Consumed Items</CardTitle>
                <CardDescription>By quantity and value</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { rank: 1, name: "🥚 Eggs", qty: "2,400 pc", value: 360 },
                      { rank: 2, name: "🍗 Chicken", qty: "45 kg", value: 401 },
                      { rank: 3, name: "🥛 Milk", qty: "120 L", value: 144 },
                      { rank: 4, name: "🧈 Butter", qty: "18 kg", value: 144 },
                      { rank: 5, name: "🍅 Tomatoes", qty: "35 kg", value: 123 },
                    ].map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell className="font-medium">{item.rank}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">€{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Consumption Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Patterns</CardTitle>
              <CardDescription>By day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { day: "Mon", value: 1867, avg: 1897 },
                    { day: "Tue", value: 1973, avg: 1897 },
                    { day: "Wed", value: 2076, avg: 1897 },
                    { day: "Thu", value: 1872, avg: 1897 },
                    { day: "Fri", value: 2287, avg: 1897 },
                    { day: "Sat", value: 2484, avg: 1897 },
                    { day: "Sun", value: 2234, avg: 1897 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line dataKey="avg" stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchasing Report Tab */}
        <TabsContent value="purchasing" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Purchases</CardDescription>
                <CardTitle className="text-2xl">€21,058</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingDownIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">-4.2%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Purchase Orders</CardDescription>
                <CardTitle className="text-2xl">34</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Avg €619 per PO</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Suppliers</CardDescription>
                <CardTitle className="text-2xl">12</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">28 total suppliers</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Lead Time</CardDescription>
                <CardTitle className="text-2xl">2.3 days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingDownIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">-0.2 days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Trend</CardTitle>
              <CardDescription>Purchase value and order count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={[
                    { date: "Nov 1", value: 1234, orders: 3 },
                    { date: "Nov 2", value: 2456, orders: 5 },
                    { date: "Nov 3", value: 890, orders: 2 },
                    { date: "Nov 4", value: 1567, orders: 4 },
                    { date: "Nov 5", value: 3234, orders: 6 },
                    { date: "Nov 6", value: 567, orders: 1 },
                    { date: "Nov 7", value: 234, orders: 1 },
                    { date: "Nov 8", value: 2890, orders: 5 },
                    { date: "Nov 9", value: 1456, orders: 3 },
                    { date: "Nov 10", value: 2123, orders: 4 },
                    { date: "Nov 11", value: 890, orders: 2 },
                    { date: "Nov 12", value: 1678, orders: 3 },
                    { date: "Nov 13", value: 2345, orders: 4 },
                    { date: "Nov 14", value: 1234, orders: 3 },
                    { date: "Nov 15", value: 1260, orders: 2 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Suppliers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers by Spend</CardTitle>
                <CardDescription>This period</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">POs</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { rank: 1, name: "Meat Masters", pos: 8, spend: 6234 },
                      { rank: 2, name: "Fresh Farms", pos: 12, spend: 4567 },
                      { rank: 3, name: "Dairy Direct", pos: 6, spend: 3890 },
                      { rank: 4, name: "Seafood King", pos: 5, spend: 2456 },
                      { rank: 5, name: "Beverage Co", pos: 3, spend: 1911 },
                    ].map((item) => (
                      <TableRow key={item.rank}>
                        <TableCell className="font-medium">{item.rank}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.pos}</TableCell>
                        <TableCell className="text-right">€{item.spend.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Supplier Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>On-time delivery rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Meat Masters", rate: 95, color: "bg-green-500" },
                    { name: "Fresh Farms", rate: 88, color: "bg-green-500" },
                    { name: "Dairy Direct", rate: 92, color: "bg-green-500" },
                    { name: "Seafood King", rate: 78, color: "bg-yellow-500" },
                    { name: "Beverage Co", rate: 100, color: "bg-green-500" },
                  ].map((supplier) => (
                    <div key={supplier.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{supplier.name}</span>
                        <span className="font-medium">{supplier.rate}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${supplier.color}`} style={{ width: `${supplier.rate}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Purchases by Category</CardTitle>
              <CardDescription>Breakdown of purchase spend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { category: "Proteins", value: 7234, orders: 12 },
                    { category: "Produce", value: 5678, orders: 18 },
                    { category: "Dairy", value: 4567, orders: 10 },
                    { category: "Beverages", value: 2345, orders: 6 },
                    { category: "Dry Goods", value: 1234, orders: 4 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Turnover Report Tab */}
        <TabsContent value="turnover" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inventory Turnover Rate</CardDescription>
                <CardTitle className="text-2xl">4.2x</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUpIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+0.3x</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Days on Hand</CardDescription>
                <CardTitle className="text-2xl">11.4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingDownIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">-0.8 days</span>
                  <span className="text-muted-foreground ml-1">improved</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Inventory Value</CardDescription>
                <CardTitle className="text-2xl">€46,531</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Over period</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Stock Efficiency</CardDescription>
                <CardTitle className="text-2xl">87%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUpIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500">+2%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Turnover Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Turnover Rate Trend</CardTitle>
              <CardDescription>Monthly turnover ratio over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { month: "May", turnover: 3.8, target: 4.0 },
                    { month: "Jun", turnover: 4.0, target: 4.0 },
                    { month: "Jul", turnover: 3.9, target: 4.0 },
                    { month: "Aug", turnover: 4.1, target: 4.0 },
                    { month: "Sep", turnover: 4.0, target: 4.0 },
                    { month: "Oct", turnover: 4.3, target: 4.0 },
                    { month: "Nov", turnover: 4.2, target: 4.0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line dataKey="turnover" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line dataKey="target" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Turnover by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Turnover by Category</CardTitle>
              <CardDescription>Category performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Turnover Rate</TableHead>
                    <TableHead className="text-right">Days on Hand</TableHead>
                    <TableHead className="text-right">Avg Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { category: "🥩 Proteins", rate: 5.2, days: 7.0, value: 14350, status: "good" },
                    { category: "🧀 Dairy", rate: 6.8, days: 5.4, value: 9580, status: "excellent" },
                    { category: "🥬 Produce", rate: 8.1, days: 4.5, value: 8230, status: "excellent" },
                    { category: "🍷 Beverages", rate: 3.2, days: 11.4, value: 8945, status: "fair" },
                    { category: "🌾 Dry Goods", rate: 2.1, days: 17.4, value: 6727, status: "slow" },
                  ].map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">{item.rate.toFixed(1)}x</TableCell>
                      <TableCell className="text-right">{item.days.toFixed(1)}</TableCell>
                      <TableCell className="text-right">€{item.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "excellent"
                              ? "default"
                              : item.status === "good"
                                ? "secondary"
                                : item.status === "fair"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {item.status === "excellent" && "🟢"}
                          {item.status === "good" && "🟡"}
                          {item.status === "fair" && "🟠"}
                          {item.status === "slow" && "🔴"} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Fast Movers */}
            <Card>
              <CardHeader>
                <CardTitle>Fast Movers</CardTitle>
                <CardDescription>Top 5 items by turnover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "🥬 Lettuce", rate: 12.5, days: 2.9 },
                    { name: "🥚 Eggs", rate: 11.2, days: 3.3 },
                    { name: "🥛 Milk", rate: 9.8, days: 3.7 },
                    { name: "🍅 Tomatoes", rate: 9.2, days: 4.0 },
                    { name: "🍗 Chicken", rate: 8.5, days: 4.3 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.days} days on hand</div>
                      </div>
                      <Badge variant="default">{item.rate}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slow Movers */}
            <Card>
              <CardHeader>
                <CardTitle>Slow Movers</CardTitle>
                <CardDescription>Items needing attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "🌾 Specialty Flour", rate: 1.2, days: 30.4, value: 234 },
                    { name: "🧂 Rare Spices", rate: 1.5, days: 24.3, value: 189 },
                    { name: "🍾 Premium Wine", rate: 1.8, days: 20.3, value: 567 },
                    { name: "🥫 Canned Goods", rate: 2.0, days: 18.3, value: 345 },
                    { name: "🫙 Specialty Oils", rate: 2.2, days: 16.6, value: 456 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.days} days • €{item.value} tied up
                        </div>
                      </div>
                      <Badge variant="destructive">{item.rate}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered insights to improve turnover</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Reduce Par Levels for Slow Movers</div>
                    <div className="text-sm text-muted-foreground">
                      5 items have turnover below 2x. Consider reducing par levels to free up €1,791 in capital.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2Icon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Produce Category Performing Well</div>
                    <div className="text-sm text-muted-foreground">
                      8.1x turnover is above target. Maintain current ordering patterns.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUpIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Increase Beverage Turnover</div>
                    <div className="text-sm text-muted-foreground">
                      Current 3.2x is below target 4.0x. Review menu engineering and promotions.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-6">
          {/* Saved Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Saved Reports</CardTitle>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-8"></th>
                      <th className="text-left p-2">Report Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Schedule</th>
                      <th className="text-left p-2">Last Run</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-accent">
                        <td className="p-2">
                          {report.starred && <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                        </td>
                        <td className="p-2 font-medium">{report.name}</td>
                        <td className="p-2">{report.type}</td>
                        <td className="p-2">{report.schedule}</td>
                        <td className="p-2">{report.lastRun}</td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <PlayIcon className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreVerticalIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Report Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Report Builder</CardTitle>
              <CardDescription>Create a custom report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input id="report-name" placeholder="New Custom Report" className="mt-2" />
              </div>

              <div>
                <Label>Report Type</Label>
                <RadioGroup defaultValue="cogs" className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {["COGS", "Stock", "Waste", "Purchasing", "Movement"].map((type) => (
                    <div key={type}>
                      <RadioGroupItem value={type.toLowerCase()} id={type.toLowerCase()} className="peer sr-only" />
                      <Label
                        htmlFor={type.toLowerCase()}
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-2xl mb-2">
                          {type === "COGS" && "💰"}
                          {type === "Stock" && "📦"}
                          {type === "Waste" && "🗑️"}
                          {type === "Purchasing" && "🛒"}
                          {type === "Movement" && "🔄"}
                        </span>
                        <span className="text-sm font-medium">{type}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>From Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Group By</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter By</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="proteins">Proteins</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button>Preview Report</Button>
                <Button variant="outline">Save Report</Button>
                <Button variant="outline">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs for Consumption, Purchasing, and Turnover */}
        <TabsContent value="consumption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consumption Report</CardTitle>
              <CardDescription>Coming soon - Track consumption patterns and trends</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="purchasing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchasing Report</CardTitle>
              <CardDescription>Coming soon - Analyze purchasing trends and supplier performance</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="turnover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Turnover Report</CardTitle>
              <CardDescription>Coming soon - Monitor inventory turnover rates</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  positive,
  changePrefix = "",
  changeSuffix = "%",
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: number
  changeLabel: string
  positive: boolean
  changePrefix?: string
  changeSuffix?: string
}) {
  const isPositiveChange = change > 0
  const changeColor = positive
    ? isPositiveChange
      ? "text-green-600"
      : "text-red-600"
    : isPositiveChange
      ? "text-red-600"
      : "text-green-600"

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardDescription>{label}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold mb-2">{value}</p>
        <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
          {isPositiveChange ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
          <span>
            {changePrefix}
            {Math.abs(change)}
            {changeSuffix} {changeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ time, icon, text }: { time: string; icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-muted-foreground w-12">{time}</span>
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
