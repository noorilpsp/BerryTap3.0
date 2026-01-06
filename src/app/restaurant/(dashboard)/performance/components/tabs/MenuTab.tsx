"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, ChevronDown } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, ReferenceLine, Legend } from "recharts"
import { categoryRevenue, profitabilityMatrix, trendingItems } from "../../lib/mockData"

export function MenuTab() {
  const totalRevenue = categoryRevenue.reduce((sum, cat) => sum + cat.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Category - Donut Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue by Category</CardTitle>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="revenue"
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-semibold">{data.category}</div>
                            <div className="text-sm text-muted-foreground">
                              Revenue: ${data.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {data.percent}% of total
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {data.items} items • Avg ${data.avgPrice}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <text
                    x="50%"
                    y="40%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-2xl font-bold"
                  >
                    ${(totalRevenue / 1000).toFixed(1)}k
                  </text>
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-sm"
                  >
                    Total Revenue
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {categoryRevenue.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${cat.revenue.toLocaleString()}</span>
                    <span className="text-muted-foreground">{cat.percent}%</span>
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
              <span className="mr-1">💡</span>
              Main courses dominate (42%). Consider upselling desserts.
            </div>
          </CardContent>
        </Card>

        {/* Profitability Matrix - Scatter Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Profitability Matrix - BCG Analysis</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              Analyze <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="margin"
                    name="Margin"
                    domain={[0, 100]}
                    label={{ value: "Margin %", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="volumePercent"
                    name="Volume"
                    domain={[0, 120]}
                    label={{ value: "Volume", angle: -90, position: "left" }}
                  />
                  <ZAxis type="number" dataKey="revenue" range={[100, 1000]} />
                  <ReferenceLine x={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <ReferenceLine y={80} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-semibold">{data.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Volume: {data.volume} orders
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Margin: {data.margin}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Revenue: ${data.revenue}
                            </div>
                            <Badge className="mt-1">{data.quadrant.replace('_', ' ')}</Badge>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter data={profitabilityMatrix} fill="hsl(var(--primary))">
                    {profitabilityMatrix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Quadrant Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border p-2">
                <div className="font-semibold">⭐ Stars (4)</div>
                <div className="text-muted-foreground">High vol + high margin - FOCUS</div>
              </div>
              <div className="rounded-lg border p-2">
                <div className="font-semibold">💰 Cash Cows (2)</div>
                <div className="text-muted-foreground">High vol + low margin - maintain</div>
              </div>
              <div className="rounded-lg border p-2">
                <div className="font-semibold">❓ Question Marks (2)</div>
                <div className="text-muted-foreground">Low vol + high margin - promote</div>
              </div>
              <div className="rounded-lg border p-2">
                <div className="font-semibold">🐶 Dogs (1)</div>
                <div className="text-muted-foreground">Low vol + low margin - review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Item Trends - 7-Day Performance</CardTitle>
              <CardDescription>Track item performance and identify opportunities</CardDescription>
            </div>
            <Button variant="outline">View Full Menu →</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Prep Time</TableHead>
                <TableHead className="text-right">7-Day Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendingItems.map((item) => (
                <TableRow key={item.itemId} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {item.trend === "up" ? "🔥" : item.trend === "down" ? "💧" : "➡️"}
                      </span>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{item.sold}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${item.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-semibold">{item.margin}% {item.marginLabel}</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${item.margin}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm">{item.prepTimeLabel}</span>
                      <Badge
                        variant={
                          item.prepTimeStatus === "fast"
                            ? "default"
                            : item.prepTimeStatus === "slow"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.prepTimeStatus === "fast" ? "✅ Fast" : item.prepTimeStatus === "slow" ? "⚠️ Slow" : "✅ Normal"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div
                        className={`font-semibold ${
                          item.trend === "up"
                            ? "text-green-600 dark:text-green-400"
                            : item.trend === "down"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.trend === "up" ? "📈" : item.trend === "down" ? "📉" : "➡️"}{" "}
                        {item.trendLabel}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.trend === "up"
                          ? "Strong Growth"
                          : item.trend === "down"
                          ? "Declining"
                          : "Stable"}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>🔥 Trending Up</span>
            <span>➡️ Stable</span>
            <span>💧 Trending Down</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
