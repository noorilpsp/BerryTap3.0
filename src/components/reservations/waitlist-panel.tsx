"use client"

import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Plus,
  Wine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type WaitlistParty,
  useReservationsFromStore,
  getWaitTimerStatus,
} from "@/lib/reservations-data"

function WaitlistCard({
  party,
  position,
}: {
  party: WaitlistParty
  position: number
}) {
  const timerStatus = getWaitTimerStatus(party.elapsedWait, party.quotedWait)

  const timerColor =
    timerStatus === "overdue"
      ? "text-rose-400"
      : timerStatus === "warning"
      ? "text-amber-400"
      : "text-muted-foreground"

  const timerBg =
    timerStatus === "overdue"
      ? "bg-rose-500/10 border-rose-500/20"
      : timerStatus === "warning"
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-zinc-800/50 border-zinc-700/30"

  return (
    <div className="glass-surface rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-muted-foreground">
            {position}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {party.name}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-zinc-700 text-foreground"
              >
                {party.partySize}p
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-muted-foreground">
                Quoted: {party.quotedWait} min
              </span>
              <span
                className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono font-medium tabular-nums ${timerBg} ${timerColor}`}
              >
                <Clock className="h-3 w-3" />
                {party.elapsedWait} min
              </span>
            </div>

            {/* Smart match line */}
            {party.autoMatch && (
              <p className="text-[10px] text-emerald-400/80">
                Auto-match: {party.autoMatch} ready in ~{party.autoMatchTime} min
              </p>
            )}

            {/* Bar tab */}
            {party.barTab && (
              <p className="flex items-center gap-1 text-[10px] text-amber-400/80">
                <Wine className="h-3 w-3" />
                Ordered at bar (${party.barTab})
              </p>
            )}

            {/* Notes */}
            {party.notes && !party.autoMatch && (
              <p className="text-[10px] text-muted-foreground/70 italic">
                {party.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WaitlistPanel() {
  const { waitlistParties } = useReservationsFromStore()
  return (
    <div className="glass-surface flex flex-col rounded-xl">
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Waitlist ({waitlistParties.length} parties)
        </h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Link href="/reservations/waitlist">
            Manage
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2 p-4">
        {waitlistParties.map((party, i) => (
          <WaitlistCard key={party.id} party={party} position={i + 1} />
        ))}
      </div>

      <div className="border-t border-zinc-800/50 p-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 w-full border-dashed border-zinc-700 text-[11px] text-muted-foreground hover:border-zinc-600 hover:text-foreground"
        >
          <Link href="/reservations/waitlist">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add to Waitlist
          </Link>
        </Button>
      </div>
    </div>
  )
}
