"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
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
} from "recharts"
import { GRIDLINE, CHART_COLORS } from "@/lib/constants"
import type { ReportsData } from "../types/reports.types"

interface ChartsGridProps {
  data?: ReportsData
  compareMode: "off" | "previous" | "yoy"
  loading: boolean
  onDrill: (type: string, data: any) => void
}

const COMPARISON_LINE_COLOR = "#94a3b8"

export function ChartsGrid({ data, compareMode, loading, onDrill }: ChartsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 max-w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className={i === 0 ? "col-span-full" : ""}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 max-w-full">
      {/* Revenue Trend - Full Width */}
      <Card className="col-span-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over selected period</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTimeseries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRIDLINE} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                  tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_COLORS[0] }}
                  name="Current Period"
                />
                {compareMode !== "off" && data.comparisonSeries && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    data={data.comparisonSeries}
                    stroke={COMPARISON_LINE_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Previous Period"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Orders by Channel */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Orders by Channel</CardTitle>
          <CardDescription>Distribution across channels</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ordersByChannel}
                  dataKey="orders"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.percentage}%`}
                >
                  {data.ordersByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Orders"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Items */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Top 5 Items</CardTitle>
          <CardDescription>Best sellers by revenue</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topItems.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                  {data.topItems.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
