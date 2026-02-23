"use client"

import {
  ArrowRight,
  Clock,
  Lightbulb,
  Merge,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  availableTables,
  mergeOptions,
  quoteAccuracy,
  activeWaitlist,
} from "@/lib/waitlist-data"

export function WaitlistMatchingPanel() {
  const nowTables = availableTables.filter((t) => t.status === "available-now")
  const turningTables = availableTables.filter((t) => t.status === "turning-soon")

  // Find best match for available tables
  function bestMatchFor(tableId: string, seats: number): string | null {
    const match = activeWaitlist.find(
      (e) => e.bestMatch?.tableId === tableId || e.altMatches.some((m) => m.tableId === tableId)
    )
    if (match) return `${match.name} (${match.partySize}p)`
    // fallback: find smallest party that fits
    const fits = activeWaitlist
      .filter((e) => e.partySize <= seats)
      .sort((a, b) => a.partySize - b.partySize)
    return fits[0] ? `${fits[0].name} (${fits[0].partySize}p)` : null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table Availability Forecast */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/80 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Table Availability Forecast
          </h3>
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-[10px] text-cyan-300">
            AI Routing
          </Badge>
        </div>

        {/* Available Now */}
        {nowTables.length > 0 && (
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 wl-match-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                  Available Now ({nowTables.length})
                </span>
              </div>
            <div className="flex flex-col gap-2">
              {nowTables.map((t) => {
                const match = bestMatchFor(t.id, t.seats)
                return (
                  <div
                    key={t.id}
                    className="rounded-lg border border-emerald-500/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04))] px-3 py-2 shadow-[0_0_14px_rgba(16,185,129,0.1)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-wide text-emerald-200">{t.id}</span>
                        <Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-400">
                          {t.seats}-top
                        </Badge>
                        <span className="text-[10px] text-zinc-500">{t.zone}</span>
                        <span className="text-[10px] text-zinc-600">{t.detail}</span>
                      </div>
                    </div>
                    {match && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                        <ArrowRight className="h-2.5 w-2.5" />
                        Best fit: <span className="text-emerald-300">{match}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Turning Soon */}
        {turningTables.length > 0 && (
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                Turning Soon ({turningTables.length})
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {turningTables.map((t) => (
                <div key={t.id} className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2 py-1.5 text-xs">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{t.id}</span>
                    <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-500">
                      {t.seats}-top
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="h-3 w-3" />
                    ~{t.estMinutes} min
                    {t.currentParty && (
                      <span className="text-zinc-600">({t.currentParty} &mdash; {t.courseStage?.toLowerCase()})</span>
                    )}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge Options */}
        {mergeOptions.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Merge className="h-3 w-3 text-zinc-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Merge Options
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {mergeOptions.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-800/25 px-2 py-1.5 text-xs text-zinc-500">
                  <span>{m.tables.join("+")} ({m.combinedSeats}-top)</span>
                  <span>available {m.estTime}{m.reason ? ` (${m.reason})` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Accuracy Tracker */}
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/80 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Quote Accuracy Tonight
        </h3>

        {/* Accuracy bar */}
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              quoteAccuracy.accuracyPct > 85
                ? "bg-emerald-500"
                : quoteAccuracy.accuracyPct >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
            style={{ width: `${quoteAccuracy.accuracyPct}%` }}
          />
        </div>
        <div className="mb-3 text-right text-xs font-bold text-emerald-300">
          {quoteAccuracy.accuracyPct}%
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Seated within quote:</span>
            <span className="text-zinc-200">
              {quoteAccuracy.withinQuote}/{quoteAccuracy.totalSeated} parties
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Average overquote:</span>
            <span className="text-emerald-400">+{quoteAccuracy.avgOverquoteMin} min (good!)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Average underquote:</span>
            <span className="text-rose-400">-{quoteAccuracy.avgUnderquoteMin} min ({quoteAccuracy.underquoteCount} parties)</span>
          </div>
        </div>

        {/* AI Tip */}
        <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-3 py-2">
          <div className="flex items-start gap-2 text-xs">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
            <div>
              <span className="font-semibold text-amber-300">TIP:</span>{" "}
              <span className="text-zinc-400">
                {quoteAccuracy.tip}
              </span>
              {quoteAccuracy.suggestedQuote && (
                <div className="mt-1 flex items-center gap-1 text-zinc-500">
                  <TrendingUp className="h-3 w-3" />
                  Suggested: {quoteAccuracy.suggestedQuote}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
