"use client"

import { useState } from "react"
import { Check, Clock, XCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GuestProfile, VisitRecord } from "@/lib/guests-data"
import { sarahVisitHistory, formatCurrency } from "@/lib/guests-data"

interface VisitsTabProps {
  guest: GuestProfile
}

function StatusIcon({ status }: { status: VisitRecord["status"] }) {
  switch (status) {
    case "completed": return <Check className="h-3.5 w-3.5 text-emerald-400" />
    case "in_progress": return <Clock className="h-3.5 w-3.5 text-amber-400" />
    case "no_show": return <XCircle className="h-3.5 w-3.5 text-rose-400" />
    case "cancelled": return <XCircle className="h-3.5 w-3.5 text-zinc-400" />
  }
}

function statusLabel(status: VisitRecord["status"]): string {
  switch (status) {
    case "completed": return "Completed"
    case "in_progress": return "In Progress"
    case "no_show": return "No Show"
    case "cancelled": return "Cancelled"
  }
}

function VisitCard({ visit, index }: { visit: VisitRecord; index: number }) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <div
      className="guest-visit-stagger rounded-xl border border-border/30 bg-card/40 overflow-hidden"
      style={{ "--visit-i": index } as React.CSSProperties}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-secondary/20"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/40 text-xs font-bold text-muted-foreground">
          #{visit.id}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-medium text-foreground">
              {visit.dayOfWeek}, {new Date(visit.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-muted-foreground">{visit.service}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>Party of {visit.partySize}</span>
            <span className="text-border">|</span>
            <span>{visit.table} ({visit.zone})</span>
            <span className="text-border">|</span>
            <span>Server: {visit.server}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <StatusIcon status={visit.status} />
            <span className={cn(
              "text-xs font-medium",
              visit.status === "completed" ? "text-emerald-400" : visit.status === "in_progress" ? "text-amber-400" : "text-rose-400"
            )}>
              {statusLabel(visit.status)}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground">{formatCurrency(visit.total)}</span>
          {visit.duration && (
            <span className="text-[10px] text-muted-foreground">{visit.duration}</span>
          )}
        </div>

        <ChevronDown className={cn("ml-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-border/20 bg-secondary/10 px-4 py-3 guest-note-expand">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Items: </span>
            {visit.items.join(", ")}
          </div>
          {visit.note && (
            <div className="mt-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs italic text-muted-foreground">
              &ldquo;{visit.note}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function GuestVisitsTab({ guest }: VisitsTabProps) {
  const [showAll, setShowAll] = useState(false)
  const allVisits = guest.id === "guest_001" ? sarahVisitHistory : Array.from({ length: Math.min(guest.totalVisits, 4) }, (_, i) => ({
    id: guest.totalVisits - i,
    date: new Date(new Date(guest.lastVisit).getTime() - i * 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(new Date(guest.lastVisit).getTime() - i * 14 * 24 * 60 * 60 * 1000).getDay()],
    service: "Dinner" as const,
    partySize: Math.round(guest.avgPartySize || 2),
    table: `T${Math.floor(Math.random() * 15) + 1}`,
    zone: "Main",
    server: ["Mike", "Anna", "Carlos"][i % 3],
    status: (i === 0 && guest.lastVisit === "2025-01-17" ? "in_progress" : guest.segment === "flagged" && i === 0 ? "no_show" : "completed") as VisitRecord["status"],
    total: Math.round(guest.avgSpend * (0.8 + Math.random() * 0.4)),
    duration: i === 0 ? null : `${Math.floor(90 + Math.random() * 45)}min`,
    items: ["House Salad", "Main Course", "Dessert"],
    note: null,
  }))

  const displayed = showAll ? allVisits : allVisits.slice(0, 4)

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Visit History ({allVisits.length} visits)
        </h3>
      </div>

      {displayed.map((visit, i) => (
        <VisitCard key={visit.id} visit={visit} index={i} />
      ))}

      {allVisits.length > 4 && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Show All {allVisits.length} Visits
        </Button>
      )}
    </div>
  )
}
