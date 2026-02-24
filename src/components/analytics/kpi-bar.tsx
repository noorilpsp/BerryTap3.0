"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { kpis, formatKpiValue, trendIsPositive } from "@/lib/analytics-data"

interface KpiBarProps {
  onKpiClick: (tabLink: string) => void
}

export function KpiBar({ onKpiClick }: KpiBarProps) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3 md:gap-3 md:px-6">
      {kpis.map((kpi) => {
        const positive = trendIsPositive(kpi.trend)
        const changeStr =
          kpi.format === "minutes"
            ? `${kpi.change > 0 ? "+" : ""}${kpi.change} min`
            : `${kpi.change > 0 ? "+" : ""}${kpi.change}%`

        return (
          <button
            key={kpi.label}
            onClick={() => kpi.tabLink && onKpiClick(kpi.tabLink)}
            className="group flex min-w-[130px] shrink-0 flex-col gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-3 text-left backdrop-blur-sm transition-all hover:border-zinc-700/60 hover:bg-zinc-800/60 md:min-w-[140px]"
            aria-label={`${kpi.label}: ${formatKpiValue(kpi)}, ${positive ? "up" : "down"} ${changeStr} from previous period`}
          >
            <span className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              {kpi.label}
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              {formatKpiValue(kpi)}
            </span>
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                positive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" aria-label="Trend: increasing" />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-label="Trend: decreasing" />
              )}
              {changeStr}
              <span className="ml-1 text-zinc-500">vs prev</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
