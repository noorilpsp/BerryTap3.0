"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type OccupiedTable,
  occupiedTables,
  getCourseLabel,
} from "@/lib/reservations-data"

function getProgressColor(pct: number): string {
  if (pct >= 85) return "bg-emerald-500"
  if (pct >= 50) return "bg-amber-500"
  return "bg-zinc-600"
}

function TableTurnRow({ table }: { table: OccupiedTable }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-zinc-800/30">
      <span className="w-8 text-xs font-semibold tabular-nums text-foreground">
        {table.tableNumber}
      </span>
      <span className="w-8 text-[10px] text-muted-foreground">
        ({table.partySize}p)
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-foreground">
            {getCourseLabel(table.courseStage)}
          </span>
          {table.noDessertOrdered && (
            <span className="text-[9px] text-muted-foreground/60">
              No dessert ord.
            </span>
          )}
        </div>
      </div>
      <span className="w-16 text-right text-[11px] tabular-nums text-muted-foreground">
        ~{table.predictedTurnMin} min
      </span>
      <div className="w-16">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={table.mealProgressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${table.tableNumber} meal progress`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
              table.mealProgressPct
            )}`}
            style={{ width: `${table.mealProgressPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function TurnTracker() {
  const turningSoon = occupiedTables
    .filter((t) => t.predictedTurnMin <= 15)
    .sort((a, b) => a.predictedTurnMin - b.predictedTurnMin)

  const recentlySat = occupiedTables
    .filter((t) => t.predictedTurnMin > 15)
    .sort((a, b) => a.predictedTurnMin - b.predictedTurnMin)

  return (
    <div className="glass-surface flex flex-col rounded-xl">
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Turning Soon
        </h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Link href="/reservations/floorplan">
            Floor Map
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="p-2">
        {turningSoon.length > 0 ? (
          turningSoon.map((t) => <TableTurnRow key={t.id} table={t} />)
        ) : (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No tables turning soon
          </p>
        )}
      </div>

      {recentlySat.length > 0 && (
        <>
          <div className="border-t border-zinc-800/50 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {"Recently Sat (don't expect soon)"}
            </span>
          </div>
          <div className="p-2 pb-3">
            {recentlySat.map((t) => (
              <TableTurnRow key={t.id} table={t} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
