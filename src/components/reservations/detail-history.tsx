"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { type HistoryEvent, formatDateTime } from "@/lib/detail-modal-data"

interface DetailHistoryProps {
  history: HistoryEvent[]
}

export function DetailHistory({ history }: DetailHistoryProps) {
  const [expanded, setExpanded] = useState(false)
  const DEFAULT_SHOW = 5
  const visible = expanded ? history : history.slice(0, DEFAULT_SHOW)
  const hasMore = history.length > DEFAULT_SHOW

  return (
    <section className="detail-section-stagger rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">History</h3>

      <div className="relative" role="list" aria-label="Reservation history">
        {/* Timeline line */}
        <div className="absolute left-[5px] top-2 h-[calc(100%-16px)] w-px bg-zinc-800" />

        <div className="space-y-3">
          {visible.map((event, i) => (
            <div key={i} className="detail-history-stagger flex items-start gap-3 pl-0" role="listitem" style={{ "--hist-index": i } as React.CSSProperties}>
              {/* Dot */}
              <div className="relative z-[1] mt-1.5 h-[10px] w-[10px] flex-shrink-0 rounded-full border border-zinc-700 bg-zinc-800" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-zinc-200">{event.detail}</p>
                  <span className="flex-shrink-0 text-[10px] text-zinc-600">({event.actor})</span>
                </div>
                <p className="text-[10px] text-zinc-500">{formatDateTime(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          {expanded ? "Show less" : `Show all (${history.length})`}
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </section>
  )
}
