"use client"

import { Clock3, TrendingUp, Timer } from "lucide-react"
import { getActiveStats } from "@/lib/waitlist-data"

export function WaitlistSignals() {
  const stats = getActiveStats()

  const accuracyColor =
    stats.accuracyPct > 85
      ? "text-emerald-400"
      : stats.accuracyPct >= 70
        ? "text-amber-400"
        : "text-rose-400"

  return (
    <section aria-label="Waitlist signals" className="px-4 lg:px-6">
      <div className="glass-surface rounded-xl border border-zinc-800/60 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
            Waitlist
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Signals</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-zinc-500">Avg Wait:</span>
            <span className="font-semibold text-zinc-200">{stats.avgWait} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`h-3.5 w-3.5 ${accuracyColor}`} />
            <span className="text-zinc-500">Quote Accuracy:</span>
            <span className={`font-semibold ${accuracyColor}`}>{stats.accuracyPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-zinc-500">Longest Wait:</span>
            <span className="font-semibold text-amber-400">{stats.longestWait} min</span>
          </div>
        </div>
      </div>
    </section>
  )
}

