"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import type { PromotionKPI } from "@/lib/promotion-data"

export function KPICard({
  id,
  title,
  icon: IconName,
  value,
  unit,
  currencySymbol,
  delta,
  deltaPercent,
  deltaType,
  comparisonPeriod,
  sparkline,
  sparklineLabels,
  target,
  progress,
  warning,
  color,
  statusColor,
  ctaLabel,
  ctaHref,
}: PromotionKPI) {
  // Format value based on unit type
  const formattedValue = () => {
    if (unit === "currency") {
      return `${currencySymbol}${value.toLocaleString()}`
    } else if (unit === "percentage") {
      return `${value}%`
    } else {
      return value.toLocaleString()
    }
  }

  // Format delta based on unit type
  const formattedDelta = () => {
    if (unit === "currency") {
      return `${currencySymbol}${Math.abs(delta).toLocaleString()}`
    } else if (unit === "percentage") {
      return `${Math.abs(delta)}%`
    } else {
      return Math.abs(delta).toLocaleString()
    }
  }

  // Format target based on unit type
  const formattedTarget = () => {
    if (unit === "currency") {
      return `${currencySymbol}${target.toLocaleString()}`
    } else if (unit === "percentage") {
      return `${target}%`
    } else {
      return target.toLocaleString()
    }
  }

  // Transform sparkline data for Recharts
  const chartData = sparkline.map((value, index) => ({
    name: sparklineLabels?.[index] || `${index + 1}`,
    value,
  }))

  const DeltaIcon = deltaType === "increase" ? TrendingUp : TrendingDown

  return (
    <Card
      role="listitem"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      className="min-h-[200px] transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle id={`${id}-title`} className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {IconName}
            </span>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value and Delta */}
        <div id={`${id}-desc`} className="sr-only">
          {formattedValue()} {title}, {deltaType === "increase" ? "increased" : "decreased"} by {formattedDelta()} compared to {comparisonPeriod},
          representing a {Math.abs(deltaPercent)}% {deltaType === "increase" ? "increase" : "decrease"}. Current progress is {progress}% towards the target of{" "}
          {formattedTarget()}.
        </div>

        <div aria-live="polite" aria-atomic="true">
          <div className="text-4xl font-bold mb-1">{formattedValue()}</div>
          <div className={cn("flex items-center gap-1 text-sm", deltaType === "increase" ? "text-success" : "text-destructive")}>
            <DeltaIcon className="h-4 w-4" aria-label={deltaType === "increase" ? "Increased" : "Decreased"} />
            <span>
              {delta > 0 ? "+" : ""}
              {formattedDelta()}
            </span>
            <span className="text-muted-foreground">vs {comparisonPeriod}</span>
            <span>
              ({deltaPercent > 0 ? "+" : ""}
              {deltaPercent}%)
            </span>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="h-[60px]" role="img" aria-label={`Sparkline chart showing ${title} trend over ${comparisonPeriod}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={statusColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={statusColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="value"
                stroke={statusColor}
                strokeWidth={2}
                dot={{ r: 3, fill: statusColor }}
                fill={`url(#gradient-${id})`}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
          <title>Trend: {chartData.map((d, i) => `${d.name} ${d.value}`).join(", ")}</title>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target: {formattedTarget()}</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress towards target: ${value} of ${target}, ${progress.toFixed(1)} percent complete`}
            style={
              {
                "--progress-background": statusColor,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Warning Badge */}
        {warning && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {warning}
          </Badge>
        )}

        {/* CTA Link */}
        <Button variant="ghost" size="sm" className="w-full justify-between group hover:bg-muted/50" asChild>
          <a href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
