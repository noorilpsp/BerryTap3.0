"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Settings, ChevronDown, Pause } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts"
import { kitchenMetrics, kitchenStations, liveKitchenOrders } from "../../lib/mockData"

export function KitchenTab() {
  return (
    <div className="space-y-6">
      {/* Kitchen Overview Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>🍳</span> Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kitchenMetrics.activeOrders.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge
                variant={
                  kitchenMetrics.activeOrders.status === "normal"
                    ? "default"
                    : kitchenMetrics.activeOrders.status === "warning"
                    ? "secondary"
                    : "destructive"
                }
              >
                {kitchenMetrics.activeOrders.status === "normal" ? "🟢" : "🟡"} {kitchenMetrics.activeOrders.status === "normal" ? "Normal Load" : "High Load"}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Capacity: {kitchenMetrics.activeOrders.capacity} ({kitchenMetrics.activeOrders.percent}%)
            </p>
            <Progress value={kitchenMetrics.activeOrders.percent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Avg Prep Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>⏱️</span> Avg Prep Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kitchenMetrics.avgPrepTime.label}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ▲ +{kitchenMetrics.avgPrepTime.delta}s vs target
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Target: {kitchenMetrics.avgPrepTime.targetLabel}
            </p>
            <Progress value={kitchenMetrics.avgPrepTime.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Order Accuracy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>🎯</span> Order Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kitchenMetrics.accuracyRate.label}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ▼ {(kitchenMetrics.accuracyRate.delta * 100).toFixed(1)}% vs yesterday
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Target: {kitchenMetrics.accuracyRate.targetLabel}
            </p>
            <Progress value={kitchenMetrics.accuracyRate.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Delayed Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>🚨</span> Delayed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kitchenMetrics.delayedOrders.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant="secondary">🟡 Monitor Closely</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Alert Threshold: {kitchenMetrics.delayedOrders.threshold}
            </p>
            <Progress value={kitchenMetrics.delayedOrders.percent} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Station Efficiency */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Station Performance - Real-Time Efficiency</CardTitle>
              <CardDescription>Monitor kitchen station workload and bottlenecks</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Badge variant="destructive" className="animate-pulse">🔴 Live</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kitchenStations} layout="vertical" margin={{ left: 100, right: 100 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="font-semibold">{data.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Efficiency: {data.efficiency}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active: {data.activeOrders}/{data.capacity} ({data.capacityPercent}%)
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Time: {data.avgPrepTimeLabel}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            On-Time: {data.onTimePercent}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Staff: {data.staff.join(", ")}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="efficiency" radius={[0, 8, 8, 0]}>
                  {kitchenStations.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === "excellent" || entry.status === "good"
                          ? "#10b981"
                          : entry.status === "bottleneck"
                          ? "#eab308"
                          : "#ef4444"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="efficiency"
                    position="right"
                    formatter={(value: number, entry: any, index: number) => {
                      const station = kitchenStations[index]
                      if (!station) return `${value}%`
                      return `${value}% ${station.status === "bottleneck" ? "⚠️ BOTTLENECK" : "✅"}`
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Station Details */}
          <div className="mt-6 space-y-2">
            {kitchenStations.map((station) => (
              <div
                key={station.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div className="flex-1">
                  <div className="font-semibold">{station.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {station.avgPrepTimeLabel} | On-Time: {station.onTimePercent}% |{" "}
                    {station.staff.join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {station.activeOrders}/{station.capacity} active
                  </Badge>
                  {station.alert && (
                    <Button variant="outline" size="sm">
                      Alert Chef
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {kitchenStations.find((s) => s.status === "bottleneck") && (
            <div className="mt-4 rounded-lg border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 border p-3 text-sm">
              <span className="mr-1">⚠️</span>
              <span className="font-semibold">Bottleneck Alert:</span>{" "}
              {kitchenStations.find((s) => s.status === "bottleneck")?.alert}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Kitchen Order Board */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">🔴 LIVE</Badge>
                Kitchen Order Status
              </CardTitle>
              <CardDescription>Real-time order tracking and alerts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Auto-refresh: 5s <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Pause className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Station</TableHead>
                <TableHead className="text-right">Elapsed</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveKitchenOrders.map((order) => (
                <TableRow
                  key={order.orderId}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    order.alert ? "border-l-4 border-l-red-500" : ""
                  }`}
                >
                  <TableCell className="font-mono font-semibold">
                    {order.orderId.replace("ORD-", "#")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{order.station}</div>
                      <div className="text-xs text-muted-foreground">{order.assignedStaff}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-mono font-semibold">{order.elapsedTimeLabel}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: {order.targetTimeLabel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          order.status === "on_time" || order.status === "ready"
                            ? "default"
                            : order.status === "warning"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {order.status === "on_time" && "🟢"}
                        {order.status === "ready" && "🔵"}
                        {order.status === "warning" && "🟡"}
                        {order.status === "delayed" && "🔴"}
                        {" "}{order.statusLabel}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {order.status === "ready"
                          ? "[Notify Server]"
                          : order.status === "delayed"
                          ? "Overdue: " + order.estimatedReadyLabel
                          : "Est Ready: " + order.estimatedReadyLabel}
                      </div>
                      {order.alert && (
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="destructive" className="h-6 text-xs">
                            Escalate
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Alert
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Auto-refreshing every 5 seconds</span>
            <span>•</span>
            <span>Last update: Just now</span>
            <span>•</span>
            <span>{liveKitchenOrders.length} active orders</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
