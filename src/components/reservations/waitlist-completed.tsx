"use client"

import { useState } from "react"
import { CheckCircle, ChevronDown, ChevronRight, TriangleAlert, XCircle } from "lucide-react"
import { completedEntries, removedEntries } from "@/lib/waitlist-data"

export function WaitlistCompleted() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [showRemoved, setShowRemoved] = useState(false)

  return (
    <div className="mt-1 flex flex-col gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/55 p-2.5 backdrop-blur-sm">
      {/* Completed */}
      <button
        onClick={() => setShowCompleted(!showCompleted)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:bg-zinc-800/40 hover:text-zinc-400"
        aria-expanded={showCompleted}
      >
        {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Completed Today ({completedEntries.length} parties)
      </button>
      {showCompleted && (
        <div className="wl-expand-in flex flex-col gap-1 pl-2">
          {completedEntries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-800/30 px-3 py-1.5 text-xs text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">{e.joinedTime}</span>
                <span className="text-zinc-400">{e.name} ({e.partySize}p)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Waited {e.waitedMin} min / Quoted {e.quotedMin}</span>
                {e.withinQuote ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TriangleAlert className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Removed */}
      <button
        onClick={() => setShowRemoved(!showRemoved)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:bg-zinc-800/40 hover:text-zinc-400"
        aria-expanded={showRemoved}
      >
        {showRemoved ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Removed ({removedEntries.length} parties)
      </button>
      {showRemoved && (
        <div className="wl-expand-in flex flex-col gap-1 pl-2">
          {removedEntries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-800/30 px-3 py-1.5 text-xs text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-rose-500/60" />
                <span className="text-zinc-600">{e.time}</span>
                <span className="text-zinc-400">{e.name} ({e.partySize}p)</span>
              </div>
              <span className="text-zinc-600">{e.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
