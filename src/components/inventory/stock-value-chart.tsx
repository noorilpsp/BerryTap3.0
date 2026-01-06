"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

const stockValueData = [
  { date: "Oct 15", current: 42340, previous: 40120 },
  { date: "Oct 18", current: 43120, previous: 41230 },
  { date: "Oct 21", current: 44890, previous: 42450 },
  { date: "Oct 24", current: 46230, previous: 43120 },
  { date: "Oct 27", current: 45670, previous: 42890 },
  { date: "Oct 30", current: 47120, previous: 44230 },
  { date: "Nov 02", current: 48340, previous: 45120 },
  { date: "Nov 05", current: 47890, previous: 44670 },
  { date: "Nov 08", current: 46540, previous: 43890 },
  { date: "Nov 11", current: 47230, previous: 44560 },
  { date: "Nov 14", current: 47832, previous: 46756 },
]

export function StockValueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> Stock Value Trend (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stockValueData}>
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Current:</span>
                          <span className="text-xs font-bold">€{payload[0].value?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Previous:</span>
                          <span className="text-xs font-bold">€{payload[1].value?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="hsl(var(--primary))"
              fill="url(#currentGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="previous"
              name="Previous Period"
              stroke="hsl(var(--muted-foreground))"
              fill="url(#previousGradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
