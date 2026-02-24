"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Armchair,
  Users,
  Euro,
  Timer,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuickStats as QuickStatsType } from "@/lib/my-tables-data"

interface QuickStatsProps {
  stats: QuickStatsType
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string
  urgent?: boolean
}

function StatItem({ icon, label, value, urgent }: StatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
        urgent
          ? "bg-red-50 dark:bg-red-950/40"
          : "bg-secondary/50"
      )}
    >
      <span
        className={cn(
          "shrink-0",
          urgent ? "text-red-500" : "text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            urgent ? "text-red-600 dark:text-red-400" : "text-foreground"
          )}
        >
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function QuickStats({ stats }: QuickStatsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="border-b border-border bg-card px-4 py-3 md:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <StatItem
          icon={<Armchair className="h-4 w-4" />}
          label="Tables"
          value={`${stats.tablesOccupied}/${stats.tablesTotal}`}
        />
        <StatItem
          icon={<Users className="h-4 w-4" />}
          label="Guests"
          value={`${stats.totalGuests}`}
        />
        <StatItem
          icon={<Euro className="h-4 w-4" />}
          label="Sales"
          value={mounted ? `${stats.sales.toFixed(0)}` : "--"}
        />
        <StatItem
          icon={<Timer className="h-4 w-4" />}
          label="Avg Turn"
          value={`${stats.avgTurnTime}m`}
        />
        {stats.foodReady > 0 && (
          <StatItem
            icon={<Flame className="h-4 w-4" />}
            label="Ready"
            value={`${stats.foodReady}`}
            urgent
          />
        )}
      </div>
    </div>
  )
}
