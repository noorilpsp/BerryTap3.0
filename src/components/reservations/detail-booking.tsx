"use client"

import { Edit, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  type DetailReservation,
  formatDateFull,
  formatTime12h,
  formatDateTime,
} from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

interface DetailBookingProps {
  reservation: DetailReservation
}

function RiskBreakdown({ reservation }: { reservation: DetailReservation }) {
  const { guest, riskLevel, riskScore } = reservation
  const factors: { label: string; positive: boolean }[] = []

  if (guest.totalVisits > 5) factors.push({ label: `Guest history: ${guest.totalVisits} visits, ${guest.noShows} no-shows`, positive: true })
  else if (guest.totalVisits <= 1) factors.push({ label: "First-time guest", positive: false })
  else factors.push({ label: `${guest.totalVisits} visits, ${guest.noShows} no-shows`, positive: guest.noShows === 0 })

  if (reservation.confirmedVia) factors.push({ label: `Confirmed via ${reservation.confirmedVia.toUpperCase()}`, positive: true })
  else factors.push({ label: "Not yet confirmed", positive: false })

  factors.push({ label: `Party size: ${reservation.partySize <= 4 ? "standard" : "large"} (${reservation.partySize})`, positive: reservation.partySize <= 4 })

  const riskColor = riskLevel === "low" ? "text-emerald-400" : riskLevel === "medium" ? "text-amber-400" : "text-rose-400"
  const riskBg = riskLevel === "low" ? "bg-emerald-400" : riskLevel === "medium" ? "bg-amber-400" : "bg-rose-400"

  return (
    <div className="mt-4 rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-zinc-400">Risk Score</span>
        <span className={cn("flex items-center gap-1.5 text-xs font-bold", riskColor)}>
          <span className={cn("h-2 w-2 rounded-full", riskBg)} />
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} ({riskScore}%)
        </span>
      </div>
      <div className="space-y-1">
        {factors.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            {f.positive ? (
              <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-rose-500" />
            )}
            <span className="text-zinc-400">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DetailBooking({ reservation }: DetailBookingProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Date", value: formatDateFull(reservation.date) },
    { label: "Time", value: formatTime12h(reservation.time) },
    { label: "Duration", value: `${reservation.duration} min (estimated)` },
    { label: "Party Size", value: `${reservation.partySize} guests` },
  ]

  if (reservation.table) {
    const parts = [reservation.table]
    if (reservation.tableCapacity) parts.push(`${reservation.tableCapacity}-top`)
    if (reservation.tableFeature) parts.push(reservation.tableFeature)
    parts.push(reservation.zone)
    rows.push({ label: "Table", value: parts.join(" \u00b7 ") })
  } else {
    rows.push({ label: "Table", value: "Unassigned" })
  }

  if (reservation.server) rows.push({ label: "Server", value: reservation.server })
  rows.push({ label: "Zone", value: reservation.zone })
  rows.push({ label: "Booked", value: formatDateTime(reservation.createdAt) })
  rows.push({ label: "Channel", value: reservation.channel })

  if (reservation.confirmedAt) {
    rows.push({ label: "Confirmed", value: `SMS confirmed ${formatDateTime(reservation.confirmedAt)}` })
  } else {
    rows.push({ label: "Confirmed", value: "Unconfirmed" })
  }

  const depositLabel =
    reservation.depositStatus === "none" ? "None required" :
    reservation.depositStatus === "paid" ? `Paid ($${reservation.deposit})` :
    reservation.depositStatus === "required" ? `Required ($${reservation.deposit})` :
    `Refunded ($${reservation.deposit})`
  rows.push({ label: "Deposit", value: depositLabel })

  if (reservation.finalCheck) rows.push({ label: "Final Check", value: `$${reservation.finalCheck.toFixed(2)}` })
  if (reservation.actualDuration) rows.push({ label: "Actual Duration", value: `${reservation.actualDuration} min` })
  if (reservation.cancelNote) rows.push({ label: "Cancel Reason", value: reservation.cancelNote })

  // No-show history
  const hasNoShowHistory = reservation.noShowHistory && reservation.noShowHistory.length > 0

  return (
    <section className="detail-section-stagger rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Booking Details</h3>
        <Link href={`?action=edit&id=${reservation.id}`} className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300">
          <Edit className="h-3 w-3" /> Edit
        </Link>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <span className="flex-shrink-0 text-xs text-zinc-500">{row.label}</span>
            <span className={cn(
              "text-right text-xs font-medium",
              row.label === "Confirmed" && !reservation.confirmedAt ? "text-amber-400" : "text-zinc-200"
            )}>
              {row.label === "Confirmed" && reservation.confirmedAt && (
                <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-400" />
              )}
              {row.label === "Confirmed" && !reservation.confirmedAt && (
                <AlertTriangle className="mr-1 inline h-3 w-3 text-amber-400" />
              )}
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {hasNoShowHistory && (
        <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase text-rose-400">Previous No-Shows</p>
          {reservation.noShowHistory!.map((ns, i) => (
            <p key={i} className="text-[11px] text-rose-300/80">{ns.date} (party of {ns.partySize})</p>
          ))}
        </div>
      )}

      <RiskBreakdown reservation={reservation} />
    </section>
  )
}
