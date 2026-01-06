"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Download, ChevronDown, TrendingUp, TrendingDown, Sparkles, AlertTriangle, Lightbulb, Star, X, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import {
  ComposedChart,
  LineChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import {
  revenueTimelineData,
  redemptionRateData,
  usageHeatmapData,
  promotionTypeData,
  topPerformingItems,
  performanceScores,
  aiInsights
} from "@/lib/analytics-data"

const COLORS = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
  muted: "hsl(var(--muted-foreground))",
  gridline: "hsl(var(--gridline))"
}

// Custom Tooltip Components
const RevenueTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Card className="p-3 shadow-lg">
        <div className="space-y-1">
          <p className="text-sm font-medium">{data.date}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Actual:</span>
            <span className="font-semibold">€{data.actual.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Baseline:</span>
            <span>€{data.baseline.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Lift:</span>
            <span className="text-success font-semibold">+€{data.lift.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    )
  }
  return null
}

const RedemptionTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Card className="p-3 shadow-lg">
        <div className="space-y-1">
          <p className="text-sm font-medium">{data.week}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Actual Rate:</span>
            <span className="font-semibold">{data.actual.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Moving Avg:</span>
            <span>{data.movingAvg.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Redemptions:</span>
            <span>{data.redemptions}</span>
          </div>
        </div>
      </Card>
    )
  }
  return null
}

const HeatmapCell = ({ day, hour, value }: { day: string; hour: string; value: number }) => {
  const getColor = (val: number) => {
    if (val <= 10) return "bg-muted/50"
    if (val <= 30) return "bg-chart-3/40"
    if (val <= 50) return "bg-chart-3/70"
    return "bg-chart-3"
  }

  return (
    <div
      className={`h-10 rounded hover:scale-105 transition-transform cursor-pointer ${getColor(value)}`}
      title={`${day} ${hour}: ${value} redemptions`}
    />
  )
}

export function AnalyticsDashboard() {
  const [timePeriod, setTimePeriod] = useState("last_30_days")
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([])

  const handleDismissInsight = (id: string) => {
    setDismissedInsights([...dismissedInsights, id])
  }

  const handleExportChart = (format: string) => {
    console.log(`[v0] Exporting chart as ${format}`)
    // Export logic would go here
  }

  const visibleInsights = aiInsights.filter((insight) => !dismissedInsights.includes(insight.id))

  return (
    <section aria-labelledby="analytics-section-title" className="p-6 lg:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-chart-1" aria-hidden="true" />
          <h2 id="analytics-section-title" className="text-2xl font-bold">
            Performance Analytics
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Period Selector */}
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_90_days">Last 90 days</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
              <SelectItem value="last_month">Last month</SelectItem>
              <SelectItem value="this_quarter">This quarter</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {/* Compare Toggle */}
          <Button variant={compareEnabled ? "default" : "outline"} onClick={() => setCompareEnabled(!compareEnabled)}>
            Compare
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Revenue Impact Timeline - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Impact Timeline</CardTitle>
              <CardDescription>Before, during, and after promotion comparison</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Chart
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportChart("png")}>Export as PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportChart("svg")}>Export as SVG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportChart("csv")}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportChart("pdf")}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label="Revenue impact timeline chart">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={revenueTimelineData} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.chart1} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.chart1} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridline} opacity={0.3} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `€${(value / 1000).toFixed(1)}K`}
                  tick={{ fontSize: 12 }}
                  label={{ value: "Revenue", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  payload={[
                    { value: "Baseline Revenue", type: "line", color: COLORS.muted },
                    { value: "Actual Revenue", type: "line", color: COLORS.chart1 }
                  ]}
                />
                <ReferenceLine x="Nov 1" stroke={COLORS.muted} strokeDasharray="5 5" label="Start" />
                <ReferenceLine x="Nov 30" stroke={COLORS.muted} strokeDasharray="5 5" label="End" />
                <Area type="monotone" dataKey="actual" fill="url(#revenueGradient)" stroke="none" />
                <Line type="monotone" dataKey="baseline" stroke={COLORS.muted} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="actual" stroke={COLORS.chart1} strokeWidth={3} dot={{ fill: COLORS.chart1, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Screen reader table */}
            <table className="sr-only" summary="Revenue data for screen readers">
              <caption>Revenue Impact Timeline Data</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Baseline Revenue</th>
                  <th>Actual Revenue</th>
                  <th>Lift</th>
                </tr>
              </thead>
              <tbody>
                {revenueTimelineData.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>€{row.baseline}</td>
                    <td>€{row.actual}</td>
                    <td>€{row.lift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Revenue Lift</p>
                <p className="text-2xl font-bold text-success">+€8,450</p>
                <p className="text-xs text-muted-foreground">+12.5% increase</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Orders Affected</p>
                <p className="text-2xl font-bold">1,847</p>
                <p className="text-xs text-muted-foreground">23% of total orders</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">€32.50</p>
                <p className="text-xs text-success">+€2.30 vs baseline</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Redemption Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption Rate Trend</CardTitle>
            <CardDescription>Weekly redemption rates with moving average</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={redemptionRateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridline} opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                <Tooltip content={<RedemptionTooltip />} />
                <Legend iconType="line" />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Rate"
                  stroke={COLORS.chart2}
                  strokeWidth={2}
                  dot={{ fill: COLORS.chart2, strokeWidth: 2, stroke: "#fff", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  name="Moving Average"
                  stroke={COLORS.muted}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Heatmap</CardTitle>
            <CardDescription>Redemptions by day and hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Days labels */}
              <div className="grid grid-cols-[60px_1fr] gap-2">
                <div className="text-xs font-medium text-muted-foreground"></div>
                <div className="grid grid-cols-13 gap-1">
                  {["11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map((hour, i) => (
                    <div key={i} className="text-xs text-center text-muted-foreground">
                      {hour}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap grid */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const dayData = usageHeatmapData.filter((d) => d.day === day)
                return (
                  <div key={day} className="grid grid-cols-[60px_1fr] gap-2">
                    <div className="text-xs font-medium text-muted-foreground flex items-center">{day}</div>
                    <div className="grid grid-cols-13 gap-1">
                      {dayData.map((cell, i) => (
                        <HeatmapCell key={i} day={cell.day} hour={cell.hour} value={cell.value} />
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/50" />
                  <span className="text-muted-foreground">Low (0-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-3/40" />
                  <span className="text-muted-foreground">Medium (11-30)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-3/70" />
                  <span className="text-muted-foreground">High (31-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-3" />
                  <span className="text-muted-foreground">Very High (51+)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Promotion Types Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion Types</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={promotionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="percentage"
                  label={({ percentage }) => `${percentage.toFixed(0)}%`}
                >
                  {promotionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <Card className="p-3 shadow-lg">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{data.type}</p>
                            <p className="text-xs text-muted-foreground">Count: {data.count}</p>
                            <p className="text-xs text-muted-foreground">Revenue: €{data.revenue.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Avg Rate: {data.avgRedemptionRate.toFixed(1)}%</p>
                          </div>
                        </Card>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {promotionTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: Object.values(COLORS)[index] }} />
                    <span>{item.type}</span>
                  </div>
                  <span className="font-medium">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
            <CardDescription>By revenue lift</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPerformingItems.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridline} opacity={0.3} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <Card className="p-3 shadow-lg">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{data.name}</p>
                            <p className="text-xs text-muted-foreground">Lift: €{data.revenueLift}</p>
                            <p className="text-xs text-muted-foreground">Redemptions: {data.redemptions}</p>
                            <p className="text-xs text-muted-foreground">Category: {data.category}</p>
                          </div>
                        </Card>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="revenueLift" fill={COLORS.chart2} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <CardDescription>Top promotions ranked</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {performanceScores.map((promo) => (
                  <Card key={promo.promotionId} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm">{promo.promotionName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold">{promo.score}</span>
                          <span className="text-sm text-muted-foreground">/100</span>
                          {promo.trend === "up" && <ArrowUp className="h-4 w-4 text-success" />}
                          {promo.trend === "down" && <ArrowDown className="h-4 w-4 text-destructive" />}
                          {promo.trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">{promo.trendPercent}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < promo.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{promo.ratingLabel}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Redemption Rate</span>
                            <span>{promo.metrics.redemptionRate.value}%</span>
                          </div>
                          <Progress value={(promo.metrics.redemptionRate.score / promo.metrics.redemptionRate.max) * 100} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">ROI</span>
                            <span>{promo.metrics.roi.value}x</span>
                          </div>
                          <Progress value={(promo.metrics.roi.score / promo.metrics.roi.max) * 100} className="h-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-1" />
            <CardTitle>AI Insights & Predictions</CardTitle>
          </div>
          <CardDescription>Data-driven recommendations and forecasts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleInsights.map((insight) => {
            const Icon =
              insight.icon === "Sparkles"
                ? Sparkles
                : insight.icon === "AlertTriangle"
                  ? AlertTriangle
                  : insight.icon === "TrendingUp"
                    ? TrendingUp
                    : Lightbulb

            return (
              <Alert key={insight.id} variant={insight.variant as any} className="relative border-l-4">
                {insight.dismissable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleDismissInsight(insight.id)}
                    aria-label="Dismiss insight"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Icon className="h-5 w-5" />
                <AlertTitle className="mb-2">{insight.title}</AlertTitle>
                <AlertDescription className="text-sm mb-3">{insight.message}</AlertDescription>
                {insight.confidence && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} className="h-1" />
                  </div>
                )}
                <div className="flex gap-2">
                  {insight.actions.map((action, index) => (
                    <Button key={index} variant={action.variant as any} size="sm">
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Alert>
            )
          })}

          {visibleInsights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No insights available. Check back later for recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screen reader announcement for data updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Chart data updated. Showing promotions performance for {timePeriod.replace("_", " ")}. Total revenue lift: €8,450. Orders affected: 1,847.
      </div>
    </section>
  )
}
