"use client"

import { Star, ShieldAlert, Check, X, AlertTriangle, Trophy, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  type GuestProfile,
  type AvailableTable,
  type ConflictWarning,
  type ReservationFormData,
  getRiskLevel,
  formatDuration,
  getCapacityAtTime,
  availableTables,
  busyTables,
  miniTimeline,
  MINI_TL_RANGE,
  MINI_TL_NOW_OFFSET,
  formTagDefs,
} from "@/lib/reservation-form-data"

interface SidePanelsProps {
  formData: ReservationFormData
  guest: GuestProfile | null
  bestTable: AvailableTable | undefined
  conflicts: ConflictWarning[]
}

export function FormSidePanels({ formData, guest, bestTable, conflicts }: SidePanelsProps) {
  const risk = getRiskLevel(guest)
  const capacity = getCapacityAtTime(formData.time)
  const timeLabel = (() => {
    const [h, m] = formData.time.split(":").map(Number)
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
    const ampm = h >= 12 ? "PM" : "AM"
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
  })()

  const dateLabel = (() => {
    const d = new Date(formData.date + "T12:00:00")
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  })()

  const selectedTags = formTagDefs.filter((t) => formData.tags.includes(t.id))

  // New capacity after booking
  const newOccupancy = capacity
    ? Math.min(100, Math.round(((capacity.seatsOccupied + formData.partySize) / capacity.totalSeats) * 100))
    : null

  return (
    <div className="space-y-4">
      {/* Booking Summary */}
      <div className="glass-surface rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Summary</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {formData.guestName || "Guest name"}
            </span>
            <span className="text-sm text-muted-foreground">{formData.partySize} guests</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {dateLabel} &middot; {timeLabel}
          </div>
          {formData.assignedTable && (
            <div className="text-sm text-muted-foreground">
              Table {formData.assignedTable.replace("T", "")} &middot;{" "}
              {availableTables.find((t) => t.id === formData.assignedTable)?.zoneLabel ?? ""}
            </div>
          )}
          {bestTable && formData.tableAssignMode === "auto" && (
            <div className="text-sm text-muted-foreground">
              Server: {bestTable.server}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Est. duration: {formatDuration(formData.duration)}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Risk:</span>
            <span className={risk.color}>{risk.label}</span>
          </div>

          {/* Guest info badges */}
          {(guest?.allergies.length || selectedTags.length > 0 || (guest && guest.visitCount >= 10)) && (
            <div className="pt-2 border-t border-border/30 space-y-1.5">
              {guest?.allergies.map((a) => (
                <div key={a} className="flex items-center gap-1.5 text-xs text-amber-400">
                  <ShieldAlert className="h-3 w-3" />
                  {a} allergy noted
                </div>
              ))}
              {guest && guest.visitCount >= 10 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Star className="h-3 w-3" />
                  VIP ({guest.visitCount}th visit)
                </div>
              )}
              {guest?.preferences.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="h-3 w-3" />
                  {p}: matched
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg p-3 text-xs leading-relaxed form-warning-enter ${
                c.severity === "warning"
                  ? "bg-amber-500/8 border border-amber-500/20 text-amber-300"
                  : "bg-cyan-500/8 border border-cyan-500/20 text-cyan-300"
              }`}
            >
              <div className="flex items-start gap-2">
                {c.severity === "warning" ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{c.message}</p>
                  {c.suggestion && (
                    <p className="mt-1 text-muted-foreground">{c.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Table Suggestion */}
      {bestTable && (
        <div className="glass-surface rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Table Suggestion</h3>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-foreground">
              Best: {bestTable.label} ({bestTable.seats}-top{bestTable.features.length > 0 ? `, ${bestTable.features.join(", ")}` : ""})
            </span>
          </div>
          <div className="space-y-1">
            {bestTable.matchReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                {reason}
              </div>
            ))}
          </div>

          {/* Also good */}
          {availableTables.filter((t) => t.id !== bestTable.id).length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-1.5">Also good:</p>
              {availableTables
                .filter((t) => t.id !== bestTable.id)
                .slice(0, 2)
                .map((t) => (
                  <div key={t.id} className="text-xs text-muted-foreground/80 py-0.5">
                    &bull; {t.label} ({t.seats}-top) &mdash; {t.availableFrom}-{t.availableUntil}
                  </div>
                ))}
            </div>
          )}

          {/* Avoid */}
          {busyTables.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-amber-400/80 mb-1.5">Avoid:</p>
              {busyTables.slice(0, 2).map((t) => (
                <div key={t.id} className="flex items-center gap-1.5 text-xs text-muted-foreground/60 py-0.5">
                  <X className="h-3 w-3 text-red-400/60 shrink-0" />
                  {t.label} &mdash; {t.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Capacity */}
      {capacity && (
        <div className="glass-surface rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Capacity at {timeLabel}
          </h3>
          <div className="space-y-2">
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  capacity.occupancyPct >= 90
                    ? "bg-red-500"
                    : capacity.occupancyPct >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${capacity.occupancyPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{capacity.seatsOccupied}/{capacity.totalSeats} seats occupied</span>
              <span>{capacity.occupancyPct}%</span>
            </div>
            {newOccupancy !== null && (
              <p className="text-xs text-muted-foreground">
                This booking brings it to{" "}
                <span className={newOccupancy >= 90 ? "text-amber-400 font-medium" : "text-foreground"}>
                  {newOccupancy}%
                </span>{" "}
                ({capacity.seatsOccupied + formData.partySize}/{capacity.totalSeats} seats)
              </p>
            )}
            {newOccupancy !== null && newOccupancy >= 85 && (
              <div className="flex items-start gap-1.5 text-xs text-amber-400 mt-1">
                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                Peak approaching -- consider slightly longer turn buffer
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mini Timeline */}
      <div className="glass-surface rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mini Timeline (7:00-9:30)
        </h3>
        <div className="space-y-2">
          {miniTimeline.map((row) => (
            <div key={row.tableLabel} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-7 shrink-0">{row.tableLabel}</span>
              <div className="flex-1 h-5 bg-secondary/40 rounded relative overflow-hidden">
                {row.blocks.map((block, bi) => {
                  const leftPct = (block.startMin / MINI_TL_RANGE) * 100
                  const widthPct = ((block.endMin - block.startMin) / MINI_TL_RANGE) * 100
                  return (
                    <div
                      key={bi}
                      className={`absolute top-0.5 bottom-0.5 rounded text-[9px] leading-4 px-1 truncate flex items-center ${
                        block.isNew
                          ? "bg-primary/30 border border-primary/40 text-primary"
                          : "bg-secondary/80 text-muted-foreground"
                      }`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      {block.guest}
                    </div>
                  )
                })}
                {/* NOW line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-cyan-400/60"
                  style={{ left: `${(MINI_TL_NOW_OFFSET / MINI_TL_RANGE) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
            <span className="inline-block w-3 h-px bg-cyan-400/60" />
            = your reservation time
          </div>
        </div>
      </div>
    </div>
  )
}
