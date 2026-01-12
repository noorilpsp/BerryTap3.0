"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { X, Download, Bell, Eye, TrendingUp, TrendingDown } from 'lucide-react'
import { DrillDownData } from "../types"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

interface DrillDownDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: DrillDownData | null
}

export function DrillDownDrawer({ open, onOpenChange, data }: DrillDownDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!data) return null

  // Mock drill-down data based on type
  const getDrillDownContent = () => {
    if (data.type === "kpi" && data.kpi) {
      return {
        overview: {
          current: data.kpi.value,
          delta: data.kpi.delta,
          deltaLabel: data.kpi.deltaLabel,
          target: data.kpi.targetLabel,
          progress: data.kpi.progressPercent,
          status: data.kpi.status,
          insight: data.kpi.insight
        },
        hourlyTrend: [
          { hour: "11am", value: 650, target: 600 },
          { hour: "12pm", value: 680, target: 600 },
          { hour: "1pm", value: 720, target: 600 },
          { hour: "2pm", value: 690, target: 600 },
          { hour: "3pm", value: 740, target: 600 },
          { hour: "4pm", value: 760, target: 600 },
          { hour: "5pm", value: 780, target: 600 },
          { hour: "6pm", value: 820, target: 600 },
          { hour: "7pm", value: 930, target: 600 },
          { hour: "8pm", value: 870, target: 600 }
        ],
        weeklyTrend: [
          { day: "Mon", value: 680, target: 600 },
          { day: "Tue", value: 762, target: 600 },
          { day: "Wed", value: 715, target: 600 },
          { day: "Thu", value: 670, target: 600 },
          { day: "Fri", value: 785, target: 600 },
          { day: "Sat", value: 870, target: 600 },
          { day: "Sun", value: 730, target: 600 }
        ],
        breakdown: {
          byChannel: [
            { label: "Dine-in", value: "11m 20s", orders: 347, achievement: 85 },
            { label: "Takeout", value: "13m 45s", orders: 89, achievement: 73 },
            { label: "Delivery", value: "15m 20s", orders: 45, achievement: 65 }
          ],
          byStaff: [
            { label: "Sarah", value: "10m 15s", orders: 145, status: "excellent" },
            { label: "Mike", value: "11m 30s", orders: 120, status: "excellent" },
            { label: "Emma", value: "12m 45s", orders: 98, status: "good" },
            { label: "David", value: "14m 20s", orders: 87, status: "needs-support" }
          ],
          byComplexity: [
            { label: "Simple items", value: "6m 30s", examples: "Salads, Drinks" },
            { label: "Medium complexity", value: "11m 45s", examples: "Wraps, Plates" },
            { label: "Complex items", value: "16m 20s", examples: "Grills, Combos" }
          ],
          byTimeOfDay: [
            { label: "Lunch (11am-2pm)", value: "9m 45s", status: "excellent" },
            { label: "Afternoon (2pm-5pm)", value: "8m 50s", status: "excellent" },
            { label: "Dinner (5pm-9pm)", value: "14m 30s", status: "needs-support" }
          ]
        },
        comparisons: {
          yesterday: { value: "11m 45s", achievement: 85, orders: 332 },
          today: { value: "12m 42s", achievement: 79, orders: 347 },
          bestDay: { date: "Nov 5, 2024", value: "9m 15s", factors: "Lower volume (280 orders), Optimal staffing (10 vs 8 today)" }
        },
        insights: {
          findings: [
            "Evening rush (7-9pm) adds +3m to avg fulfillment time",
            "Complex items (grills, combos) take 2.5x longer than simple items",
            "Kitchen staffing correlation: Each additional cook = -15s avg",
            "Weekend fulfillment 8% slower than weekdays",
            "Fryer station is current bottleneck (88% capacity)"
          ],
          rootCauses: [
            {
              title: "Insufficient staffing during peak hours (7-9pm)",
              details: "Current: 3 kitchen staff | Recommended: 4 staff",
              impact: "Expected improvement: -2m 30s avg time"
            },
            {
              title: "Fryer station bottleneck",
              details: "7/8 slots occupied during peak, 3 orders waiting in queue",
              impact: "Consider: Backup fryer or menu adjustment"
            }
          ],
          recommendations: [
            { priority: "high", action: "Add 1 kitchen staff for 7-9pm window" },
            { priority: "high", action: "Implement order throttling during peak" },
            { priority: "medium", action: "Review and optimize complex item recipes" },
            { priority: "medium", action: "Cross-train staff on multiple stations" }
          ]
        }
      }
    }

    return null
  }

  const content = getDrillDownContent()
  if (!content) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[80vw] md:w-[70vw] lg:w-[60vw] overflow-y-auto p-0"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 border-b bg-background p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{data.title}</SheetTitle>
              {data.subtitle && (
                <SheetDescription className="mt-1">{data.subtitle}</SheetDescription>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pt-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pb-6">
            {/* Current Performance Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Current Performance</h3>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold">{content.overview.current}</div>
                  <div className="flex items-center gap-2">
                    {content.overview.delta > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={content.overview.delta > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                      {content.overview.deltaLabel} vs previous period
                    </span>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={
                      content.overview.status === "improved" 
                        ? "border-green-500 text-green-600 dark:text-green-400" 
                        : "border-red-500 text-red-600 dark:text-red-400"
                    }
                  >
                    Status: {content.overview.status === "improved" ? "Meeting Target" : "Needs Attention"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target: {content.overview.target}</span>
                    <span className="font-medium">{content.overview.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={content.overview.progress} />
                </div>
              </CardContent>
            </Card>

            {/* 24-Hour Trend Chart */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">24-Hour Trend Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={content.hourlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-muted-foreground">
                  Peaks: 7-8pm (15m 30s avg) | Lows: 11am-12pm (8m 15s avg)
                </p>
              </CardContent>
            </Card>

            {/* Quick Statistics */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-lg">Quick Statistics</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Fastest order: 6m 23s (Order #1201 - Greek Salad)</li>
                  <li>• Slowest order: 28m 45s (Order #1187 - Mixed Grill for 8)</li>
                  <li>• Most common time: 10-12 minutes (45% of all orders)</li>
                  <li>• Peak delay period: 7-8pm (avg 15m 30s, +5m 30s vs target)</li>
                  <li>• Orders meeting target: 276 of 347 (79.5%)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6 pb-6">
            {/* By Order Channel */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">By Order Channel</h3>
                <div className="space-y-3">
                  {content.breakdown.byChannel.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>• {item.label}: {item.value} ({item.orders} orders)</span>
                        <span className="font-medium">{item.achievement}%</span>
                      </div>
                      <Progress value={item.achievement} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Staff Member */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">By Staff Member</h3>
                <div className="space-y-3">
                  {content.breakdown.byStaff.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">• {item.label}: {item.value} ({item.orders} orders)</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          item.status === "excellent" 
                            ? "border-green-500 text-green-600" 
                            : item.status === "good"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-red-500 text-red-600"
                        }
                      >
                        {item.status === "excellent" ? "✅ Meeting target" : item.status === "good" ? "🟡 Slightly over" : "🟡 Needs improvement"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Item Complexity */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">By Item Complexity</h3>
                <div className="space-y-2">
                  {content.breakdown.byComplexity.map((item) => (
                    <div key={item.label} className="text-sm">
                      <span className="font-medium">• {item.label}: {item.value} avg</span>
                      <span className="text-muted-foreground ml-2">({item.examples})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Time of Day */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">By Time of Day</h3>
                <div className="space-y-3">
                  {content.breakdown.byTimeOfDay.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm">• {item.label}: {item.value} avg</span>
                      <Badge 
                        variant="outline"
                        className={
                          item.status === "excellent" 
                            ? "border-green-500 text-green-600" 
                            : "border-red-500 text-red-600"
                        }
                      >
                        {item.status === "excellent" ? "✅ Under target" : "🔴 Over target"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6 pb-6">
            {/* 7-Day Performance Trend */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">7-Day Performance Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={content.weeklyTrend}>
                      <defs>
                        <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" />
                      <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#weeklyGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Day-of-Week Comparison */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Day-of-Week Comparison</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {content.weeklyTrend.map((item, index) => (
                    <div key={item.day} className="space-y-1">
                      <div className="text-sm font-medium">{item.day}</div>
                      <div className="text-lg font-bold">{Math.floor(item.value / 60)}m {item.value % 60}s</div>
                      {item.value > 750 && <span className="text-xs text-yellow-600">⚠️</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">💡 Weekends consistently slower (+15% avg fulfillment time)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparisons Tab */}
          <TabsContent value="comparisons" className="space-y-6 pb-6">
            {/* vs Previous Period */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">vs Previous Period (Yesterday)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Yesterday</div>
                    <div className="text-2xl font-bold">{content.comparisons.yesterday.value}</div>
                    <div className="text-sm">Target achievement: {content.comparisons.yesterday.achievement}%</div>
                    <div className="text-sm">Orders completed: {content.comparisons.yesterday.orders}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Today</div>
                    <div className="text-2xl font-bold">{content.comparisons.today.value}</div>
                    <div className="text-sm">Target achievement: {content.comparisons.today.achievement}%</div>
                    <div className="text-sm">Orders completed: {content.comparisons.today.orders}</div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Change: +57s (+8.2%) ⚠️ Declining performance
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* vs Target */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">vs Target (10m 00s)</h3>
                <div className="space-y-2 text-sm">
                  <p>• Currently: 2m 42s over target (27% deviation)</p>
                  <p>• Trend: Increasing deviation over last 3 days</p>
                  <p>• Impact: 71 orders missed target today</p>
                </div>
              </CardContent>
            </Card>

            {/* vs Best Day */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">vs Best Day (Last 30 Days)</h3>
                <div className="space-y-2 text-sm">
                  <p>• Best performance: {content.comparisons.bestDay.value} ({content.comparisons.bestDay.date})</p>
                  <p>• Current: {content.overview.current}</p>
                  <p>• Difference: +3m 27s (+37.3%)</p>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">💡 {content.comparisons.bestDay.factors}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6 pb-6">
            {/* Key Findings */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">🔍 AI-Powered Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Findings:</h4>
                    <ul className="space-y-1 text-sm">
                      {content.insights.findings.map((finding, i) => (
                        <li key={i}>• {finding}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Root Cause Analysis */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Root Cause Analysis</h3>
                <div className="space-y-4">
                  {content.insights.rootCauses.map((cause, i) => (
                    <div key={i} className="space-y-2">
                      <div className="font-medium">{i + 1}. {cause.title}</div>
                      <div className="text-sm text-muted-foreground pl-4">
                        → {cause.details}
                      </div>
                      <div className="text-sm text-muted-foreground pl-4">
                        → {cause.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Recommendations</h3>
                <div className="space-y-3">
                  {content.insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Badge 
                        variant="outline"
                        className={
                          rec.priority === "high" 
                            ? "border-red-500 text-red-600" 
                            : rec.priority === "medium"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-blue-500 text-blue-600"
                        }
                      >
                        {rec.priority === "high" ? "🎯" : rec.priority === "medium" ? "📊" : "💡"} {rec.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm">{rec.action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 border-t bg-background p-6">
          <div className="flex flex-wrap gap-2 w-full">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Full Report
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Related Orders
            </Button>
            <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="ml-auto">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
