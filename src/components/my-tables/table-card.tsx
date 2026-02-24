"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Clock,
  Flame,
  AlertTriangle,
  UtensilsCrossed,
  Nut,
  FileText,
  Zap,
  Wine,
  Crown,
  Cake,
  Check,
  CircleDot,
  Circle,
  CircleAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MyTable, WaveProgress, BadgeType } from "@/lib/my-tables-data"
import {
  myTableStatusConfig,
  minutesAgo,
  formatCurrency,
} from "@/lib/my-tables-data"

interface TableCardProps {
  table: MyTable
}

// ── Wave Dot ─────────────────────────────────────────────────────────────────

function WaveDot({ wave }: { wave: WaveProgress }) {
  const labels: Record<string, string> = {
    drinks: "Drinks",
    food: "Food",
    dessert: "Dessert",
  }

  const StatusIcon = () => {
    switch (wave.status) {
      case "served":
        return <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      case "ready":
        return <CircleAlert className="h-3 w-3 text-red-500" />
      case "preparing":
        return <CircleDot className="h-3 w-3 text-amber-500" />
      case "held":
        return <Circle className="h-3 w-3 text-muted-foreground/50" />
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full",
          wave.status === "served" && "bg-emerald-100 dark:bg-emerald-900/40",
          wave.status === "ready" && "bg-red-100 dark:bg-red-900/40",
          wave.status === "preparing" && "bg-amber-100 dark:bg-amber-900/40",
          wave.status === "held" && "bg-muted"
        )}
      >
        <StatusIcon />
      </span>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {labels[wave.type]}
      </span>
    </div>
  )
}

// ── Badge Icon ───────────────────────────────────────────────────────────────

function BadgeIcon({ type }: { type: BadgeType }) {
  const iconMap: Record<BadgeType, React.ReactNode> = {
    allergy: <Nut className="h-3 w-3 text-red-500" />,
    notes: <FileText className="h-3 w-3 text-muted-foreground" />,
    quick: <Zap className="h-3 w-3 text-amber-500" />,
    relaxed: <Wine className="h-3 w-3 text-blue-500" />,
    vip: <Crown className="h-3 w-3 text-amber-500" />,
    birthday: <Cake className="h-3 w-3 text-pink-500" />,
  }

  const labelMap: Record<BadgeType, string> = {
    allergy: "Allergy",
    notes: "Notes",
    quick: "Quick",
    relaxed: "Relaxed",
    vip: "VIP",
    birthday: "Birthday",
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
      title={labelMap[type]}
    >
      {iconMap[type]}
      <span className="hidden md:inline">{labelMap[type]}</span>
    </span>
  )
}

// ── Table Card ───────────────────────────────────────────────────────────────

export function TableCard({ table }: TableCardProps) {
  const [mounted, setMounted] = useState(false)
  const statusCfg = myTableStatusConfig[table.status]

  useEffect(() => {
    setMounted(true)
  }, [])

  const elapsedMin = mounted ? minutesAgo(table.seatedAt) : 0

  return (
    <Link
      href={`/table/${table.id}`}
      className={cn(
        "group block rounded-xl border-l-4 border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        statusCfg.borderClass,
        statusCfg.bgClass
      )}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-foreground">
            T{table.number}
          </span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{table.guestCount}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{elapsedMin}m</span>
          </div>
          <div className="flex-1" />
          {table.bill > 0 && (
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatCurrency(table.bill)}
            </span>
          )}
        </div>

        {/* Wave progress */}
        <div className="mt-3 flex items-center gap-3">
          {table.waves.map((wave, i) => (
            <WaveDot key={`${wave.type}-${i}`} wave={wave} />
          ))}
        </div>

        {/* Alert row */}
        {table.alerts.length > 0 && (
          <div className="mt-3 space-y-1">
            {table.alerts.map((alert, i) => (
              <div
                key={`alert-${i}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  alert.type === "food_ready" &&
                    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
                  alert.type === "no_checkin" &&
                    "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
                  alert.type === "waiting" &&
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                )}
              >
                {alert.type === "food_ready" && (
                  <Flame className="h-3.5 w-3.5 shrink-0" />
                )}
                {alert.type === "no_checkin" && (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                )}
                {alert.type === "waiting" && (
                  <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{alert.message}</span>
                <span className="ml-auto tabular-nums opacity-70">
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {table.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {table.badges.map((badge) => (
              <BadgeIcon key={badge} type={badge} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
