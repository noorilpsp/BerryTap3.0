"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, ArrowDown, Minus, Clock, RefreshCw, Package, UserX, Zap, Star } from 'lucide-react'
import { Kpi } from "../types"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

const iconMap = {
  Clock,
  RefreshCw,
  Package,
  UserX,
  Zap,
  Star
}

interface KpiCardProps {
  kpi: Kpi
  onClick?: () => void
}

export function KpiCard({ kpi, onClick }: KpiCardProps) {
  const Icon = iconMap[kpi.icon as keyof typeof iconMap]
  
  const getDeltaIcon = () => {
    if (kpi.delta > 0) return <ArrowUp className="h-3 w-3" />
    if (kpi.delta < 0) return <ArrowDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getDeltaColor = () => {
    if (kpi.status === "improved") return "text-green-600 dark:text-green-400"
    if (kpi.status === "declined") return "text-red-600 dark:text-red-400"
    return "text-muted-foreground"
  }

  const getStatusBorderColor = () => {
    if (kpi.status === "improved") return "border-l-green-500"
    if (kpi.status === "declined") return "border-l-red-500"
    return "border-l-yellow-500"
  }

  const sparklineData = kpi.sparkline.map((value, index) => ({
    index,
    value
  }))

  return (
    <Card 
      className={`group cursor-pointer border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${getStatusBorderColor()}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`${kpi.title}: ${kpi.value}, ${Math.abs(kpi.delta * 100).toFixed(1)}% ${kpi.delta >= 0 ? 'above' : 'below'} target. Click for details.`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
          <span className="font-medium">{kpi.title}</span>
        </div>

        {/* Value and Delta */}
        <div className="space-y-1">
          <div className="text-3xl font-bold">{kpi.value}</div>
          <Badge variant="outline" className={`${getDeltaColor()} border-current`}>
            <span className="flex items-center gap-1">
              {getDeltaIcon()}
              <span className="text-xs">{kpi.deltaLabel} vs previous</span>
            </span>
          </Badge>
        </div>

        {/* Sparkline */}
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={kpi.color} 
                strokeWidth={2}
                fill={`url(#gradient-${kpi.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Target and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target: {kpi.targetLabel}</span>
            <span className="font-medium">{kpi.progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={kpi.progressPercent} className="h-1.5" />
        </div>

        {/* Hidden insight for screen readers */}
        <span className="sr-only">{kpi.insight}</span>
      </CardContent>
    </Card>
  )
}
