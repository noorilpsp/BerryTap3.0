"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Download, Filter, ArrowUp, ArrowDown, TrendingUp, Clock, Zap, CheckCircle, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import { serviceMetrics, orderFunnel, serviceTimeDistribution, kitchenStaff } from "../../lib/mockData"

export function ServiceTab() {
  const funnelData = [
    { stage: "Placed", count: orderFunnel.placed.count, percent: orderFunnel.placed.percent, dropOff: 0, reasons: [] },
    { stage: "Confirmed", count: orderFunnel.confirmed.count, percent: orderFunnel.confirmed.percent, dropOff: orderFunnel.confirmed.dropOff, reasons: orderFunnel.confirmed.reasons },
    { stage: "Preparing", count: orderFunnel.preparing.count, percent: orderFunnel.preparing.percent, dropOff: orderFunnel.preparing.dropOff, reasons: orderFunnel.preparing.reasons },
    { stage: "Ready", count: orderFunnel.ready.count, percent: orderFunnel.ready.percent, dropOff: orderFunnel.ready.dropOff, reasons: orderFunnel.ready.reasons },
    { stage: "Delivered", count: orderFunnel.delivered.count, percent: orderFunnel.delivered.percent, dropOff: orderFunnel.delivered.dropOff, reasons: orderFunnel.delivered.reasons },
    { stage: "Completed", count: orderFunnel.completed.count, percent: orderFunnel.completed.percent, dropOff: orderFunnel.completed.dropOff, reasons: orderFunnel.completed.reasons }
  ]

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-green-500"
    switch (status) {
      case "normal": return "bg-green-500"
      case "warning": return "bg-yellow-500"
      case "critical": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getBucketColor = (color: string) => {
    const colorMap = {
      green: "hsl(var(--chart-2))",
      yellow: "hsl(var(--chart-3))",
      orange: "hsl(var(--chart-4))",
      red: "hsl(var(--chart-1))"
    }
    return colorMap[color as keyof typeof colorMap] || "hsl(var(--chart-2))"
  }

  const getFunnelColor = (index: number) => {
    const colors = ["hsl(var(--chart-2))", "hsl(142 76% 36%)", "hsl(142 71% 45%)", "hsl(173 58% 39%)", "hsl(197 37% 53%)", "hsl(213 94% 60%)"]
    return colors[index] || "hsl(var(--chart-1))"
  }

  return (
    <div className="space-y-6">
      {/* Service Metrics Cards - 2x2 Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Avg Prep Time */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceMetrics.avgPrepTime.label}</div>
            <div className="flex items-center text-xs mt-1">
              <Badge variant={serviceMetrics.avgPrepTime.delta > 0 ? "destructive" : "secondary"} className="mr-2">
                {serviceMetrics.avgPrepTime.delta > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {serviceMetrics.avgPrepTime.delta > 0 ? "+" : ""}{serviceMetrics.avgPrepTime.delta}s vs target
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Target: {serviceMetrics.avgPrepTime.targetLabel}</p>
            <Progress value={serviceMetrics.avgPrepTime.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Avg Serve Time */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Serve Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceMetrics.avgServeTime.label}</div>
            <div className="flex items-center text-xs mt-1">
              <Badge variant={serviceMetrics.avgServeTime.delta < 0 ? "secondary" : "destructive"} className="mr-2">
                {serviceMetrics.avgServeTime.delta < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                {serviceMetrics.avgServeTime.delta}s vs target
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Target: {serviceMetrics.avgServeTime.targetLabel}</p>
            <Progress value={serviceMetrics.avgServeTime.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceMetrics.completionRate.label}</div>
            <div className="flex items-center text-xs mt-1">
              <Badge variant="secondary" className="mr-2">
                <ArrowUp className="h-3 w-3 mr-1" />
                +{(serviceMetrics.completionRate.delta * 100).toFixed(1)}% today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Target: {serviceMetrics.completionRate.targetLabel}</p>
            <Progress value={serviceMetrics.completionRate.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceMetrics.activeOrders.value}</div>
            <div className="flex items-center text-xs mt-1">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(serviceMetrics.activeOrders.status)} mr-2`} />
              <span className="capitalize">{serviceMetrics.activeOrders.status} Load</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Capacity: {serviceMetrics.activeOrders.capacity}</p>
            <Progress value={serviceMetrics.activeOrders.percent} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Order Completion Funnel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order Flow Analysis</CardTitle>
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="stage" type="category" className="text-xs" width={80} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="font-semibold">{data.stage}</div>
                          <div className="text-sm mt-1">
                            <div>Count: <span className="font-medium">{data.count}</span></div>
                            <div>Percent: <span className="font-medium">{data.percent.toFixed(1)}%</span></div>
                            {data.dropOff > 0 && (
                              <>
                                <div className="text-red-500 mt-1">Drop-off: {data.dropOff} orders</div>
                                {data.reasons && data.reasons.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {data.reasons.map((reason: string, i: number) => (
                                      <div key={i}>{reason}</div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFunnelColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Drop-off Analysis:</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground ml-4">
                <li>2 orders cancelled (0.6%) - customer request</li>
                <li>24 orders in kitchen queue (6.9%) - peak hour backlog</li>
                <li>23 orders awaiting pickup (6.7%) - takeout orders</li>
                <li>13 orders pending payment (3.7%) - processing</li>
              </ul>
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                <span>Bottleneck: Kitchen → Ready stage (7% drop-off)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Time Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Service Time Distribution</CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={serviceTimeDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="bucket" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <div className="font-semibold">{data.bucket}</div>
                          <div className="text-sm mt-1">
                            <div>Orders: <span className="font-medium">{data.count}</span></div>
                            <div>Percent: <span className="font-medium">{data.percent}%</span></div>
                            {data.isMode && <div className="text-green-600 dark:text-green-500 mt-1">Mode (Most common)</div>}
                            {data.isOutlier && <div className="text-red-600 dark:text-red-500 mt-1">Outlier - needs review</div>}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {serviceTimeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBucketColor(entry.color)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="font-medium">Mode: 5-10 minutes (156 orders, 45% of total)</div>
              <div className="text-xs text-muted-foreground">
                Median: 9m 23s | Mean: 10m 15s | Std Dev: 4m 12s
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-500">
                Outliers: 8 orders greater than 25min (2.3%) - needs investigation
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Staff Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Kitchen Staff Performance Today
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter by Role
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Avg Prep</TableHead>
                <TableHead className="text-right">On-Time</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kitchenStaff.map((staff, index) => (
                <TableRow key={staff.staffId} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        {staff.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {staff.badges.map((badge, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium">{staff.ordersCompleted}</span>
                      {index === 0 && <span>🥇</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{staff.avgPrepTimeLabel}</div>
                      <div className={`flex items-center justify-end text-xs ${staff.prepTimeDelta < 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {staff.prepTimeDelta < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                        {staff.prepTimeDelta > 0 ? '+' : ''}{staff.prepTimeDelta}s
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">{staff.onTimePercent.toFixed(1)}%</div>
                      <Progress value={staff.onTimePercent} className="h-1 w-16 ml-auto" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-500">{'⭐'.repeat(Math.floor(staff.rating))}</span>
                        <span className="font-medium text-sm">{staff.rating}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-xs text-muted-foreground mt-4 text-center">
            Click any row for detailed staff performance metrics
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
