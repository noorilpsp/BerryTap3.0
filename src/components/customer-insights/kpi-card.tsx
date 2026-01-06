"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, TrendingUp, TrendingDown, Type as type, LucideIcon } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface KPICardProps {
  title: string
  value: string
  delta?: string
  trend: "up" | "down" | "neutral"
  sparklineData: number[]
  comparison: string
  subtitle?: string
  icon?: LucideIcon
}

export function KPICard({ title, value, delta, trend, sparklineData, comparison, subtitle, icon: Icon }: KPICardProps) {
  const chartData = sparklineData.map((value, index) => ({ index, value }))

  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-orange-500"
  const trendBg = trend === "up" ? "bg-green-50 dark:bg-green-950" : trend === "down" ? "bg-red-50 dark:bg-red-950" : "bg-orange-50 dark:bg-orange-950"
  const sparklineColor = trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#f59e0b"

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 flex-1">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{title} metrics over the selected period</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {delta && (
            <Badge variant="secondary" className={`${trendBg} ${trendColor} border-0 gap-1`}>
              {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
              {delta}
            </Badge>
          )}
        </div>

        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}

        {/* Sparkline */}
        <div className="h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sparklineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground">{comparison}</p>
      </CardContent>
    </Card>
  )
}
