"use client"

import { ArrowUpRight, ArrowDownRight, Minus, DollarSign, ShoppingCart, Users, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { CHART_COLORS } from "@/lib/constants"
import type { KpiData } from "../types/reports.types"

interface KpiStripProps {
  kpis?: KpiData
  compareMode: "off" | "previous" | "yoy"
  loading: boolean
  onClick: (metric: string) => void
}

const KPI_CONFIG = [
  { key: "revenue", label: "Total Revenue", icon: DollarSign, format: "currency" },
  { key: "orders", label: "Total Orders", icon: ShoppingCart, format: "count" },
  { key: "avgCheck", label: "Avg Check Size", icon: DollarSign, format: "currency" },
  { key: "covers", label: "Total Covers", icon: Users, format: "count" },
  { key: "tableTurnover", label: "Table Turnover", icon: TrendingUp, format: "ratio" },
  { key: "avgTicketTime", label: "Avg Ticket Time", icon: Clock, format: "minutes" },
]

function formatValue(value: number, format: string): string {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString()}`
    case "percentage":
      return `${(value * 100).toFixed(1)}%`
    case "ratio":
      return value.toFixed(1) + "x"
    case "minutes":
      return `${value} min`
    default:
      return value.toLocaleString()
  }
}

export function KpiStrip({ kpis, compareMode, loading, onClick }: KpiStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!kpis) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {KPI_CONFIG.map(({ key, label, icon: Icon, format }) => {
        const kpi = kpis[key as keyof KpiData]
        if (!kpi) return null

        const deltaIcon =
          kpi.deltaType === "increase" ? ArrowUpRight : kpi.deltaType === "decrease" ? ArrowDownRight : Minus

        const deltaColor =
          kpi.deltaType === "increase"
            ? "text-green-600 dark:text-green-400"
            : kpi.deltaType === "decrease"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-600 dark:text-gray-400"

        const DeltaIcon = deltaIcon

        return (
          <Card
            key={key}
            className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col"
            onClick={() => onClick(key)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-w-0">
              <div className="space-y-2 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                  <div className="text-2xl font-bold break-all">{formatValue(kpi.current, format)}</div>
                  {compareMode !== "off" && (
                    <Badge variant="secondary" className={cn("gap-1 flex-shrink-0", deltaColor)}>
                      <DeltaIcon className="h-3 w-3" />
                      {Math.abs(kpi.delta * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                {compareMode !== "off" && (
                  <p className="text-xs text-muted-foreground break-words">
                    vs {compareMode === "previous" ? "previous period" : "last year"}
                  </p>
                )}
                {/* Sparkline */}
                <div className="h-12 mt-2 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.sparkline.map((value, idx) => ({ value, idx }))}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: CHART_COLORS[0] }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
