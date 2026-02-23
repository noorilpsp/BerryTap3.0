"use client"

import { HeroStats } from "@/components/reservations/hero-stats"
import { TimelineCapacityStrip } from "@/components/reservations/timeline-capacity-strip"
import { UpcomingReservations } from "@/components/reservations/upcoming-reservations"
import { WaitlistPanel } from "@/components/reservations/waitlist-panel"
import { WaitlistSignals } from "@/components/reservations/waitlist-signals"
import { TurnTracker } from "@/components/reservations/turn-tracker"
import { PaceStrip } from "@/components/reservations/pace-strip"
import {
  reservations,
  getHeroStats,
} from "@/lib/reservations-data"
import { Toaster } from "sonner"

export default function ReservationsOverviewPage() {
  const stats = getHeroStats(reservations)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Toaster
        theme="dark"
        toastOptions={{
          className: "border-zinc-700 bg-zinc-900 text-foreground",
        }}
      />

      <main className="flex flex-1 flex-col gap-5 py-5">
        <HeroStats stats={stats} />
        <WaitlistSignals />
        <section aria-label="Capacity forecast" className="px-4 lg:px-6">
          <TimelineCapacityStrip zoom="30min" sticky={false} synced={false} />
        </section>
        <section
          aria-label="Reservations and floor status"
          className="grid gap-5 px-4 lg:grid-cols-[1fr_400px] lg:px-6"
        >
          <div className="min-h-[400px]">
            <UpcomingReservations />
          </div>
          <div className="flex flex-col gap-5">
            <WaitlistPanel />
            <TurnTracker />
          </div>
        </section>
        <PaceStrip />
      </main>
    </div>
  )
}
