"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { revenueTimeseries, topItems } from "../../lib/mockData"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Maximize2, Settings, Lightbulb } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const orderDistribution = [
  { hour: "11am", orders: 18, dineIn: 15, takeout: 2, delivery: 1, status: "low" },
  { hour: "12pm", orders: 35, dineIn: 30, takeout: 3, delivery: 2, status: "medium" },
  { hour: "1pm", orders: 38, dineIn: 32, takeout: 4, delivery: 2, status: "medium" },
  { hour: "2pm", orders: 28, dineIn: 22, takeout: 4, delivery: 2, status: "low" },
  { hour: "3pm", orders: 22, dineIn: 18, takeout: 3, delivery: 1, status: "low" },
  { hour: "4pm", orders: 19, dineIn: 15, takeout: 3, delivery: 1, status: "low" },
  { hour: "5pm", orders: 32, dineIn: 26, takeout: 4, delivery: 2, status: "medium" },
  { hour: "6pm", orders: 43, dineIn: 35, takeout: 5, delivery: 3, status: "medium" },
  { hour: "7pm", orders: 51, dineIn: 42, takeout: 6, delivery: 3, status: "high" },
  { hour: "8pm", orders: 45, dineIn: 37, takeout: 5, delivery: 3, status: "medium" },
  { hour: "9pm", orders: 16, dineIn: 13, takeout: 2, delivery: 1, status: "low", partial: true }
]

const avgCheckTrend = [
  { time: "11am", avgCheck: 23.33, orders: 18, total: 420 },
  { time: "12pm", avgCheck: 24.29, orders: 35, total: 850 },
  { time: "1pm", avgCheck: 24.21, orders: 38, total: 920 },
  { time: "2pm", avgCheck: 24.29, orders: 28, total: 680 },
  { time: "3pm", avgCheck: 23.64, orders: 22, total: 520 },
  { time: "4pm", avgCheck: 23.68, orders: 19, total: 450 },
  { time: "5pm", avgCheck: 24.38, orders: 32, total: 780 },
  { time: "6pm", avgCheck: 24.42, orders: 43, total: 1050 },
  { time: "7pm", avgCheck: 24.31, orders: 51, total: 1240 },
  { time: "7:30pm", avgCheck: 34.20, orders: 8, total: 273.6, isPeak: true },
  { time: "8pm", avgCheck: 24.44, orders: 45, total: 1100 },
  { time: "9pm", avgCheck: 24.00, orders: 16, total: 384, partial: true }
]

const getBarColor = (status: string) => {
  switch (status) {
    case "high": return "hsl(142.1 76.2% 36.3%)" // Green
    case "medium": return "hsl(38 92% 50%)" // Yellow
    case "low": return "hsl(0 84.2% 60.2%)" // Red
    default: return "hsl(142.1 76.2% 36.3%)"
  }
}

export function SalesTab() {
  const totalRevenue = revenueTimeseries.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = revenueTimeseries.reduce((sum, item) => sum + item.orders, 0)

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart - Full Width */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Revenue Trend Over Time</CardTitle>
            <CardDescription>Hourly revenue breakdown for today</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="hourly">
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTimeseries}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(1)}K` : value}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="font-semibold">{data.time}</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="font-medium text-blue-600 dark:text-blue-400">Revenue: ${data.revenue.toLocaleString()}</div>
                            <div>Orders: {data.orders} {data.channel && `(+${data.orders - (data.channel.takeout + data.channel.delivery)} vs prev)`}</div>
                            <div>Avg Check: ${data.avgCheck.toFixed(2)}</div>
                            <div>Covers: {data.covers}</div>
                            {data.channel && (
                              <div className="mt-1 pt-1 border-t text-xs text-muted-foreground">
                                <div>Dine-in: {data.channel.dineIn}</div>
                                <div>Takeout: {data.channel.takeout}</div>
                                <div>Delivery: {data.channel.delivery}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(221.2 83.2% 53.3%)" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={(props: any) => {
                    return <circle cx={props.cx} cy={props.cy} r={4} fill="hsl(221.2 83.2% 53.3%)" />
                  }}
                  activeDot={(props: any) => {
                    return <circle cx={props.cx} cy={props.cy} r={6} fill="hsl(221.2 83.2% 53.3%)" />
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary & Insights */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Today:</span>
              <span className="font-semibold">${totalRevenue.toLocaleString()} (+5.6%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground opacity-50">┄┄┄</span>
              <span className="text-muted-foreground">Yesterday:</span>
              <span>$6,850</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <span>📊</span>
              Peak: 7-8pm ($1,240)
            </Badge>
          </div>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <div className="font-semibold text-blue-900 dark:text-blue-100">Sales Insights</div>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Revenue up 8% vs yesterday (+$547)</li>
                  <li>• Peak hour: 7-8pm with $1,240 (51 orders)</li>
                  <li>• Shawarma Plate trending +15% above average</li>
                  <li>• Slow period: 2-4pm (consider happy hour promotion)</li>
                  <li>• Dine-in accounts for 82% of revenue</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts Grid - 2 columns responsive */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Orders Distribution by Hour</CardTitle>
              <CardDescription>Color-coded by volume</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis 
                    dataKey="hour" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} label={{ value: 'Target: 50', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-semibold">{data.hour}</div>
                            <div className="mt-2 space-y-1 text-sm">
                              <div className="font-medium">Orders: {data.orders}</div>
                              <div className="text-xs text-muted-foreground">
                                vs Target: {data.orders >= 50 ? '✓' : `${50 - data.orders} below`}
                              </div>
                              <div className="mt-1 pt-1 border-t text-xs">
                                <div className="text-muted-foreground">Dine-in: {data.dineIn}</div>
                                <div className="text-muted-foreground">Takeout: {data.takeout}</div>
                                <div className="text-muted-foreground">Delivery: {data.delivery}</div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {orderDistribution.map((entry, index) => (
                    <Bar 
                      key={`bar-${index}`}
                      dataKey="orders"
                      fill={getBarColor(entry.status)}
                      radius={[4, 4, 0, 0]}
                      data={[entry]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">─ ─ Target: 50/hour</span>
              </div>
              <div className="text-muted-foreground">
                Total: {totalOrders} orders | Avg: {Math.round(totalOrders / orderDistribution.length)}/hr | Rush: 6-9pm (68%)
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: getBarColor("low") }} />
                  <span className="text-xs">Low (&lt;30)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: getBarColor("medium") }} />
                  <span className="text-xs">Medium (30-45)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: getBarColor("high") }} />
                  <span className="text-xs">High (&gt;45)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Average Check Size Trend</CardTitle>
              <CardDescription>Per-hour average ticket value</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avgCheckTrend}>
                  <defs>
                    <linearGradient id="checkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${value}`}
                    domain={[20, 40]}
                  />
                  <ReferenceLine y={30} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} label={{ value: 'Target: $30', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-semibold">{data.time}</div>
                            <div className="mt-2 space-y-1 text-sm">
                              <div className="font-medium text-green-600 dark:text-green-400">Avg Check: ${data.avgCheck.toFixed(2)}</div>
                              <div>Orders: {data.orders}</div>
                              <div>Total: ${data.total.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                vs Target: {data.avgCheck >= 30 ? '✓ Above' : `$${(30 - data.avgCheck).toFixed(2)} below`}
                              </div>
                              {data.isPeak && <div className="mt-1 font-semibold text-amber-600">🏆 Peak Hour</div>}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgCheck" 
                    stroke="hsl(142.1 76.2% 36.3%)" 
                    strokeWidth={2}
                    fill="url(#checkGradient)"
                    dot={(props: any) => {
                      const data = avgCheckTrend[props.index]
                      if (data?.isPeak) {
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={6}
                            fill="hsl(38 92% 50%)"
                            stroke="white"
                            strokeWidth={2}
                          />
                        )
                      }
                      return <circle cx={props.cx} cy={props.cy} r={3} fill="hsl(142.1 76.2% 36.3%)" />
                    }}
                    activeDot={(props: any) => {
                      return <circle cx={props.cx} cy={props.cy} r={6} fill="hsl(142.1 76.2% 36.3%)" />
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">┄┄┄ Target: $30.00</span>
              </div>
              <div className="text-muted-foreground">
                Current: $24.45 | Peak: $34.20 (7:30pm) | Low: $22.10
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Top Performing Menu Items Today
            </CardTitle>
            <CardDescription>Best sellers ranked by revenue</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All 47 Items →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Prep Time</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.map((item) => (
                  <TableRow key={item.itemId} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.sold}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          item.avgPrepTime < 600 ? "border-green-500 text-green-700 dark:border-green-600 dark:text-green-400" :
                          item.avgPrepTime < 900 ? "border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400" :
                          "border-red-500 text-red-700 dark:border-red-600 dark:text-red-400"
                        }
                      >
                        {item.avgPrepTimeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-500">{'⭐'.repeat(Math.round(item.rating))}</span>
                        <span className="font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
