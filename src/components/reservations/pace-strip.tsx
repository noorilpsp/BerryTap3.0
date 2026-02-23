"use client"

import { useState } from "react"
import {
  DollarSign,
  Users,
  Clock,
  ChefHat,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { type PaceMetrics, paceMetrics } from "@/lib/reservations-data"

function PaceRow({
  icon,
  label,
  current,
  target,
  suffix,
  warning,
  warningText,
}: {
  icon: React.ReactNode
  label: string
  current: number
  target: number
  suffix?: string
  warning?: boolean
  warningText?: string
}) {
  const pct = Math.min((current / target) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-20 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1">
        <div
          className="h-2 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemax={target}
          aria-label={`${label}: ${current} of ${target}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              warning ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="w-40 text-right text-xs tabular-nums text-muted-foreground">
        {suffix === "$" && "$"}
        {current.toLocaleString()}
        {suffix !== "$" && suffix ? ` ${suffix}` : ""} / {suffix === "$" && "$"}
        {target.toLocaleString()}
        {suffix !== "$" && suffix ? ` ${suffix}` : ""}
        <span className="ml-1.5 font-medium text-foreground">{pct.toFixed(1)}%</span>
      </span>
      {warning && warningText && (
        <span className="flex items-center gap-1 text-[10px] text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          {warningText}
        </span>
      )}
    </div>
  )
}

function KitchenLoad({ load, tickets }: { load: PaceMetrics["kitchenLoad"]; tickets: number }) {
  const loadColorMap: Record<PaceMetrics["kitchenLoad"], string> = {
    low: "text-emerald-400",
    moderate: "text-amber-400",
    high: "text-rose-400",
    critical: "text-rose-500 font-semibold",
  }
  const barSegments = load === "low" ? 1 : load === "moderate" ? 2 : load === "high" ? 3 : 4

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">
        <ChefHat className="h-4 w-4" />
      </span>
      <span className="w-20 text-xs text-muted-foreground">Kitchen</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-2 w-5 rounded-sm ${
              seg <= barSegments
                ? load === "critical"
                  ? "bg-rose-500"
                  : load === "high"
                  ? "bg-rose-400"
                  : load === "moderate"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
                : "bg-zinc-800"
            }`}
          />
        ))}
        <span className={`ml-2 text-xs capitalize ${loadColorMap[load]}`}>
          {load}
        </span>
        <span className="text-[10px] text-muted-foreground">
          - {tickets} tickets active
        </span>
      </div>
    </div>
  )
}

export function PaceStrip() {
  const [expanded, setExpanded] = useState(true)
  const isBehindTurn = paceMetrics.avgTurnMin > paceMetrics.avgTurnTarget

  return (
    <section aria-label="Tonight's pace" className="px-4 lg:px-6">
      <div className="glass-surface rounded-xl">
        {/* Header (clickable on mobile for collapse) */}
        <button
          className="flex w-full items-center justify-between px-4 py-3 md:cursor-default"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pace
          </h2>
          <span className="md:hidden">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </button>

        {/* Content */}
        <div
          className={`space-y-3 overflow-hidden px-4 transition-all duration-300 ${
            expanded ? "max-h-96 pb-4" : "max-h-0 pb-0 md:max-h-96 md:pb-4"
          }`}
        >
          <PaceRow
            icon={<DollarSign className="h-4 w-4" />}
            label="Revenue"
            current={paceMetrics.revenue}
            target={paceMetrics.revenueTarget}
            suffix="$"
          />
          <PaceRow
            icon={<Users className="h-4 w-4" />}
            label="Covers"
            current={paceMetrics.covers}
            target={paceMetrics.coversExpected}
          />
          <PaceRow
            icon={<Clock className="h-4 w-4" />}
            label="Avg Turn"
            current={paceMetrics.avgTurnMin}
            target={paceMetrics.avgTurnTarget}
            suffix="min"
            warning={isBehindTurn}
            warningText={`Running ${paceMetrics.avgTurnMin - paceMetrics.avgTurnTarget} min slow`}
          />
          <KitchenLoad
            load={paceMetrics.kitchenLoad}
            tickets={paceMetrics.kitchenTickets}
          />
        </div>
      </div>
    </section>
  )
}
