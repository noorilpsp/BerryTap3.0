"use client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Clock,
  User,
  Users,
  ChefHat,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { DrilldownData, ReportsFilters, Order } from "../types/reports.types"

interface DrilldownDrawerProps {
  open: boolean
  onClose: () => void
  data: DrilldownData | null
  filters: ReportsFilters
}

export function DrilldownDrawer({ open, onClose, data, filters }: DrilldownDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  if (!data) return null

  if (data.type === "kpi") {
    return renderKpiDrilldown(open, onClose, data, filters, currentPage, setCurrentPage, ordersPerPage)
  }

  if (data.type !== "order" || !isOrder(data.data)) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl pl-6 pr-6">
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>Details view for {data.metric}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Detailed drilldown view for {data.metric} is not yet implemented.
                </p>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const order = data.data as Order

  const subtotal = order.subtotal ?? 0
  const tax = order.tax ?? 0
  const tip = order.tip ?? 0
  const total = order.total ?? 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl pl-6 pr-6">
        <SheetHeader>
          <SheetTitle>Order #{order.orderNumber}</SheetTitle>
          <SheetDescription>
            {new Date(order.placedAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-200px)] mt-4 overflow-y-auto scrollbar-hide">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Order Status Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Closed at {new Date(order.closedAt).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="text-lg font-semibold">{order.duration} min</p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Guests</p>
                        <p className="text-lg font-semibold">{order.guests}</p>
                      </div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tip</span>
                    <span className="text-green-600">${tip.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Channel & Server Info */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Channel</p>
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{order.channelLabel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Server</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{order.server?.name ?? "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {/* Order Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start pb-3 border-b last:pb-0 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">${(item.total ?? 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <p className="text-sm font-mono">{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                      <p className="text-sm font-medium">#{order.orderNumber}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Table</p>
                      <p className="text-sm font-medium">{order.table}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="text-sm font-medium">{order.paymentMethodLabel}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Avg Price per Guest</p>
                      <p className="text-sm font-medium">${(total / (order.guests || 1)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Tip %</p>
                      <p className="text-sm font-medium">{((tip / (subtotal + tax || 1)) * 100 || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Voided</span>
                    <Badge variant={order.void ? "destructive" : "outline"}>{order.void ? "Yes" : "No"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Refunded</span>
                    <Badge variant={order.refund ? "destructive" : "outline"}>{order.refund ? "Yes" : "No"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Event Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Placed */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      </div>
                      <div className="pt-1 pb-8">
                        <p className="text-sm font-semibold">Order Placed</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.placedAt).toLocaleTimeString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.guests} {order.guests === 1 ? "guest" : "guests"} • {order.channelLabel}
                        </p>
                      </div>
                    </div>

                    {/* Items Confirmed */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      </div>
                      <div className="pt-1 pb-8">
                        <p className="text-sm font-semibold">Items Confirmed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.placedAt).getTime() + 60000 > new Date().getTime()
                            ? new Date(order.placedAt).toLocaleTimeString()
                            : new Date(Date.parse(order.placedAt) + 60000).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"} ready for kitchen
                        </p>
                      </div>
                    </div>

                    {/* Kitchen Preparing */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      </div>
                      <div className="pt-1 pb-8">
                        <p className="text-sm font-semibold">Kitchen Preparing</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.parse(order.placedAt) + 120000).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Estimated prep time: 12 min</p>
                      </div>
                    </div>

                    {/* Order Ready */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      </div>
                      <div className="pt-1 pb-8">
                        <p className="text-sm font-semibold">Order Ready</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.parse(order.placedAt) + 780000).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Served to table by {order.server?.name ?? "staff"}
                        </p>
                      </div>
                    </div>

                    {/* Payment Processed */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      </div>
                      <div className="pt-1 pb-8">
                        <p className="text-sm font-semibold">Payment Processed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.parse(order.placedAt) + 1500000).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.paymentMethodLabel} • ${total.toFixed(2)} (Tip: ${tip.toFixed(2)})
                        </p>
                      </div>
                    </div>

                    {/* Order Closed */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-semibold">Order Closed</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.closedAt).toLocaleTimeString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total duration: {order.duration} minutes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function renderKpiDrilldown(
  open: boolean,
  onClose: () => void,
  data: DrilldownData,
  filters: ReportsFilters,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  ordersPerPage: number,
) {
  const { metric, kpiData, orders, channels, timeseries } = data.data
  const kpiMetric = kpiData?.[metric]

  // Calculate pagination values
  const totalOrders = orders?.length || 0
  const totalPages = Math.ceil(totalOrders / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = orders?.slice(startIndex, endIndex) || []

  if (!kpiMetric) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl pl-6 pr-6">
          <SheetHeader>
            <SheetTitle>{data.title}</SheetTitle>
            <SheetDescription>No data available</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case "currency":
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      case "percentage":
        return `${(value * 100).toFixed(1)}%`
      case "minutes":
        return `${value.toFixed(1)} min`
      case "ratio":
        return value.toFixed(2)
      default:
        return value.toLocaleString()
    }
  }

  const changePercent = (kpiMetric.delta * 100).toFixed(1)
  const changeIcon =
    kpiMetric.deltaType === "increase" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : kpiMetric.deltaType === "decrease" ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : null

  // Generate mock breakdown data based on metric type
  const getBreakdownData = () => {
    switch (metric) {
      case "revenue":
      case "netSales":
        return channels?.map((ch) => ({
          label: ch.label,
          value: ch.revenue,
          percentage: ch.percentage,
          color: ch.color,
        }))
      case "orders":
        return channels?.map((ch) => ({
          label: ch.label,
          value: ch.orders,
          percentage: ch.percentage,
          color: ch.color,
        }))
      case "avgCheck":
        return channels?.map((ch) => ({
          label: ch.label,
          value: ch.avgCheck,
          percentage: (ch.avgCheck / 24.5) * 100,
          color: ch.color,
        }))
      case "covers":
        return [
          { label: "Lunch Service", value: Math.round(kpiMetric.current * 0.35), percentage: 35, color: "#3b82f6" },
          { label: "Dinner Service", value: Math.round(kpiMetric.current * 0.5), percentage: 50, color: "#10b981" },
          { label: "Late Night", value: Math.round(kpiMetric.current * 0.15), percentage: 15, color: "#f59e0b" },
        ]
      case "tableTurnover":
        return [
          { label: "Quick Service Tables", value: 3.2, percentage: 40, color: "#10b981" },
          { label: "Standard Tables", value: 2.3, percentage: 45, color: "#3b82f6" },
          { label: "Extended Dining", value: 1.5, percentage: 15, color: "#f59e0b" },
        ]
      case "avgTicketTime":
        return [
          { label: "0-20 min", value: Math.round(kpiMetric.current * 0.25), percentage: 25, color: "#10b981" },
          { label: "20-30 min", value: Math.round(kpiMetric.current * 0.45), percentage: 45, color: "#3b82f6" },
          { label: "30-45 min", value: Math.round(kpiMetric.current * 0.2), percentage: 20, color: "#f59e0b" },
          { label: "45+ min", value: Math.round(kpiMetric.current * 0.1), percentage: 10, color: "#ef4444" },
        ]
      default:
        return []
    }
  }

  const breakdownData = getBreakdownData()

  // Get recent trend data (last 7 days from timeseries)
  const recentTrend = timeseries?.slice(-7) || []

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl pl-6 pr-6">
        <SheetHeader>
          <SheetTitle>{data.title}</SheetTitle>
          <SheetDescription>Detailed analysis for {filters.datePreset || "selected period"}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-200px)] mt-4 overflow-y-auto scrollbar-hide">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Current Value Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Current Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">{formatValue(kpiMetric.current, kpiMetric.unit)}</p>
                      <p className="text-sm text-muted-foreground mt-1">This period</p>
                    </div>
                    {changeIcon && (
                      <div className="flex items-center gap-2">
                        {changeIcon}
                        <span
                          className={`text-sm font-medium ${
                            kpiMetric.deltaType === "increase" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {changePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Period Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Period</span>
                    <span className="text-sm font-semibold">{formatValue(kpiMetric.current, kpiMetric.unit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Previous Period</span>
                    <span className="text-sm font-semibold">{formatValue(kpiMetric.previous, kpiMetric.unit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Change</span>
                    <span
                      className={`text-sm font-bold ${
                        kpiMetric.deltaType === "increase" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatValue(kpiMetric.current - kpiMetric.previous, kpiMetric.unit)} ({changePercent}%)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">7-Day Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentTrend.map((day, idx) => {
                      const value =
                        metric === "revenue"
                          ? day.revenue
                          : metric === "orders"
                            ? day.orders
                            : metric === "avgCheck"
                              ? day.avgCheck
                              : metric === "covers"
                                ? day.covers
                                : 0
                      const max = Math.max(...recentTrend.map((d) => d[metric as keyof typeof d] as number))
                      const percentage = (value / max) * 100

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">{day.dayOfWeek.substring(0, 3)}</span>
                            <span className="font-medium">{formatValue(value, kpiMetric.unit)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Peak Day</p>
                        <p className="text-sm font-semibold">
                          {recentTrend.length > 0
                            ? recentTrend.reduce((max, day) => {
                                const dayValue = day[metric as keyof typeof day] as number
                                const maxValue = max[metric as keyof typeof max] as number
                                return dayValue > maxValue ? day : max
                              }).dayOfWeek
                            : "N/A"}
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Low Day</p>
                        <p className="text-sm font-semibold">
                          {recentTrend.length > 0
                            ? recentTrend.reduce((min, day) => {
                                const dayValue = day[metric as keyof typeof day] as number
                                const minValue = min[metric as keyof typeof min] as number
                                return dayValue < minValue ? day : min
                              }).dayOfWeek
                            : "N/A"}
                        </p>
                      </div>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-4">
              {/* Breakdown by Category */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {metric === "revenue" || metric === "netSales"
                      ? "Revenue by Channel"
                      : metric === "orders"
                        ? "Orders by Channel"
                        : metric === "avgCheck"
                          ? "Average Check by Channel"
                          : metric === "covers"
                            ? "Covers by Service Period"
                            : metric === "tableTurnover"
                              ? "Turnover by Table Type"
                              : "Time Distribution"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {breakdownData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatValue(item.value, kpiMetric.unit)}</p>
                            <p className="text-xs text-muted-foreground">{item.percentage.toFixed(0)}%</p>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color, width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              {(metric === "revenue" || metric === "orders") && orders && orders.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Top Orders This Period</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {totalOrders} total {totalOrders === 1 ? "order" : "orders"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paginatedOrders.map((order, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center pb-3 border-b last:pb-0 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">Order #{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.channelLabel} • {order.server.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">${order.total.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {metric === "revenue" || metric === "netSales" ? (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        ) : metric === "orders" ? (
                          <ShoppingCart className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Utensils className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {kpiMetric.deltaType === "increase" ? "Performance Improving" : "Attention Needed"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {kpiMetric.deltaType === "increase"
                            ? `Your ${metric} has increased by ${changePercent}% compared to the previous period.`
                            : `Your ${metric} has decreased by ${changePercent}% compared to the previous period.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function isOrder(data: any): data is Order {
  return (
    data &&
    typeof data === "object" &&
    "orderId" in data &&
    "orderNumber" in data &&
    "placedAt" in data &&
    "items" in data
  )
}
