"use client"

import { useMemo } from "react"
import { Trophy, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type TableAssignMode,
  type AvailableTable,
} from "@/lib/reservation-form-data"
import {
  tableLanes as timelineTableLanes,
  zones as timelineZones,
  getBlocksForTable,
  getMergedForTable,
} from "@/lib/timeline-data"

interface FormTableAssignmentProps {
  mode: TableAssignMode
  assignedTable: string | null
  zonePreference: string
  partySize: number
  selectedTime: string
  duration: number
  bestTable: AvailableTable | undefined
  onModeChange: (mode: TableAssignMode) => void
  onTableChange: (tableId: string | null) => void
}

interface ManualTableOption {
  id: string
  label: string
  seats: number
  zone: string
  zoneLabel: string
  available: boolean
  nextAvailable?: string
  openingInMin: number
  capacityDelta: number
  score: number
}

type BlockingWindow = {
  startTime: string
  endTime: string
}

function toMinutes(timeValue: string): number {
  const raw = timeValue.trim()
  if (!raw) return Number.NaN

  const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/)
  if (match12) {
    let h = Number.parseInt(match12[1], 10)
    const m = Number.parseInt(match12[2], 10)
    if (h < 1 || h > 12 || m < 0 || m > 59) return Number.NaN
    const meridiem = match12[3].toUpperCase()
    if (meridiem === "AM") h = h % 12
    else h = (h % 12) + 12
    return h * 60 + m
  }

  const match24 = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (!match24) return Number.NaN

  const h = Number.parseInt(match24[1], 10)
  const m = Number.parseInt(match24[2], 10)
  if (h === 24 && m === 0) return 24 * 60
  if (h < 0 || h > 23 || m < 0 || m > 59) return Number.NaN
  return h * 60 + m
}

function toTime24(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
  const h = Math.floor(normalized / 60).toString().padStart(2, "0")
  const m = (normalized % 60).toString().padStart(2, "0")
  return `${h}:${m}`
}

function normalizeBlockWindow(blockStart: number, blockEnd: number, anchor: number): { start: number; end: number } {
  let start = blockStart
  let end = blockEnd
  if (end <= start) end += 24 * 60
  while (end <= anchor) {
    start += 24 * 60
    end += 24 * 60
  }
  return { start, end }
}

function getBlockingWindowsForTable(tableId: string): BlockingWindow[] {
  const reservationWindows = getBlocksForTable(tableId)
    .filter((block) => block.status !== "unconfirmed")
    .map((block) => ({
      startTime: block.startTime,
      endTime: block.endTime,
    }))
  const mergedWindow = getMergedForTable(tableId)
  if (mergedWindow) {
    reservationWindows.push({
      startTime: mergedWindow.startTime,
      endTime: mergedWindow.endTime,
    })
  }
  return reservationWindows
}

function formatOpeningDelta(minutes: number): string {
  if (minutes <= 0) return "now"
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function FormTableAssignment({
  mode,
  assignedTable,
  zonePreference,
  partySize,
  selectedTime,
  duration,
  bestTable,
  onModeChange,
  onTableChange,
}: FormTableAssignmentProps) {
  const slotStart = toMinutes(selectedTime)
  const slotEnd = slotStart + duration

  const manualData = useMemo(() => {
    const buildOption = (lane: (typeof timelineTableLanes)[number]): ManualTableOption => {
      const zoneLabel =
        timelineZones.find((zone) => zone.id === lane.zone)?.name
        ?? lane.zone

      const overlapping = getBlockingWindowsForTable(lane.id).filter((window) => {
        const rawStart = toMinutes(window.startTime)
        const rawEnd = toMinutes(window.endTime)
        if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return false
        const { start, end } = normalizeBlockWindow(rawStart, rawEnd, slotStart)
        return slotStart < end && slotEnd > start
      })

      const available = overlapping.length === 0
      const overlapEnds = overlapping
        .map((window) => {
          const rawStart = toMinutes(window.startTime)
          const rawEnd = toMinutes(window.endTime)
          if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return undefined
          return normalizeBlockWindow(rawStart, rawEnd, slotStart).end
        })
        .filter((value): value is number => typeof value === "number")
      const nextAvailableMin = available
        ? slotStart
        : Math.max(...overlapEnds)

      const openingInMin = Math.max(0, nextAvailableMin - slotStart)
      const capacityDelta = lane.seats - partySize
      const seatFitPenalty = Math.abs(capacityDelta) * 3
      const availabilityBonus = available ? 1000 : Math.max(0, 700 - openingInMin)
      const score = availabilityBonus - seatFitPenalty

      return {
        id: lane.id,
        label: lane.label,
        seats: lane.seats,
        zone: lane.zone,
        zoneLabel,
        available,
        nextAvailable: available ? undefined : toTime24(nextAvailableMin),
        openingInMin,
        capacityDelta,
        score,
      }
    }

    const zoneFiltered = timelineTableLanes.filter((table) => (
      (zonePreference === "any" || table.zone === zonePreference)
      && table.seats >= partySize
    ))
    const base = zoneFiltered.map((lane) => buildOption(lane))

    const withSelectedFallback = (() => {
      if (!assignedTable) return base
      if (base.some((table) => table.id === assignedTable)) return base

      const lane = timelineTableLanes.find((table) => table.id === assignedTable)
      if (!lane) return base
      if (lane.seats < partySize) return base
      return [buildOption(lane), ...base]
    })()

    const sorted = withSelectedFallback.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score
      if (a.available !== b.available) return a.available ? -1 : 1
      if (a.openingInMin !== b.openingInMin) return a.openingInMin - b.openingInMin
      if (a.capacityDelta !== b.capacityDelta) return a.capacityDelta - b.capacityDelta
      return a.label.localeCompare(b.label)
    })

    const bestNow = sorted.filter((table) => table.available).slice(0, 2)
    const bestNowIds = new Set(bestNow.map((table) => table.id))
    const availableNow = sorted.filter((table) => table.available && !bestNowIds.has(table.id))
    const opensSoon = sorted.filter((table) => !table.available && table.openingInMin <= 90)
    const later = sorted.filter((table) => !table.available && table.openingInMin > 90)

    return {
      options: sorted,
      bestNow,
      availableNow,
      opensSoon,
      later,
      availableCount: sorted.filter((table) => table.available).length,
      recommended: bestNow[0] ?? sorted[0],
    }
  }, [assignedTable, partySize, slotEnd, slotStart, zonePreference])

  const selectedTableOption = useMemo(
    () => (assignedTable ? manualData.options.find((table) => table.id === assignedTable) : undefined),
    [assignedTable, manualData.options]
  )

  return (
    <div className="space-y-4">
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          onModeChange(v as TableAssignMode)
          if (v === "auto" && bestTable) {
            onTableChange(bestTable.id)
          } else if (v === "unassigned") {
            onTableChange(null)
          }
        }}
        className="space-y-2"
      >
        {/* AI auto-assign */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "auto"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="auto" id="auto" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto" className="text-sm font-medium cursor-pointer">
                AI auto-assign
              </Label>
              {bestTable && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                  <Trophy className="h-2.5 w-2.5" />
                  Best: {bestTable.label}
                </span>
              )}
            </div>
            {bestTable && mode === "auto" && (
              <div className="mt-2 space-y-1">
                {bestTable.matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>

        {/* Manual */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "manual"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <Label htmlFor="manual" className="text-sm font-medium cursor-pointer">
              Choose manually
            </Label>
            {mode === "manual" && (
              <div className="mt-2 space-y-2">
                <div className="rounded-md border border-zinc-700/40 bg-zinc-900/40 px-2.5 py-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                      {manualData.availableCount} available now
                    </span>
                    {manualData.opensSoon.length > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300">
                        {manualData.opensSoon.length} opening soon
                      </span>
                    )}
                    {manualData.recommended && (
                      <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                        recommend {manualData.recommended.label}
                      </span>
                    )}
                  </div>
                </div>
                <Select
                  value={assignedTable ?? ""}
                  onValueChange={(v) => onTableChange(v || null)}
                >
                  <SelectTrigger className="h-10 w-full bg-secondary/50 border-border/60">
                    {selectedTableOption ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 font-semibold tabular-nums">{selectedTableOption.label}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {selectedTableOption.seats}-top &middot; {selectedTableOption.zoneLabel}
                        </span>
                        {selectedTableOption.available ? (
                          <span className="shrink-0 text-[10px] text-emerald-300">available</span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-amber-300">
                            opens {selectedTableOption.nextAvailable}
                          </span>
                        )}
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a table..." />
                    )}
                  </SelectTrigger>
                  <SelectContent className="max-h-96 min-w-[var(--radix-select-trigger-width)]">
                    {manualData.bestNow.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest text-cyan-300/80">
                          Best Now
                        </SelectLabel>
                        {manualData.bestNow.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex w-full min-w-0 items-center gap-2">
                              <span className="shrink-0 font-semibold tabular-nums">{t.label}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{t.seats}-top</span>
                              <span className="truncate text-xs text-muted-foreground">{t.zoneLabel}</span>
                              {t.capacityDelta === 0 && (
                                <span className="shrink-0 text-[10px] text-cyan-300">exact fit</span>
                              )}
                              <span className="ml-auto shrink-0 text-[10px] text-emerald-300">available</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}

                    {manualData.availableNow.length > 0 && (
                      <>
                        {manualData.bestNow.length > 0 && <SelectSeparator />}
                        <SelectGroup>
                          <SelectLabel className="text-[10px] uppercase tracking-widest text-emerald-300/80">
                            Available Now
                          </SelectLabel>
                          {manualData.availableNow.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              <div className="flex w-full min-w-0 items-center gap-2">
                                <span className="shrink-0 font-medium tabular-nums">{t.label}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{t.seats}-top</span>
                                <span className="truncate text-xs text-muted-foreground">{t.zoneLabel}</span>
                                <span className="ml-auto shrink-0 text-[10px] text-emerald-300">available</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}

                    {manualData.opensSoon.length > 0 && (
                      <>
                        {(manualData.bestNow.length > 0 || manualData.availableNow.length > 0) && <SelectSeparator />}
                        <SelectGroup>
                          <SelectLabel className="text-[10px] uppercase tracking-widest text-amber-300/80">
                            Opens Soon
                          </SelectLabel>
                          {manualData.opensSoon.map((t) => (
                            <SelectItem key={t.id} value={t.id} disabled>
                              <div className="flex w-full min-w-0 items-center gap-2">
                                <span className="shrink-0 font-medium tabular-nums">{t.label}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{t.seats}-top</span>
                                <span className="truncate text-xs text-muted-foreground">{t.zoneLabel}</span>
                                <span className="ml-auto shrink-0 text-[10px] text-amber-300">
                                  +{formatOpeningDelta(t.openingInMin)} ({t.nextAvailable})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}

                    {manualData.later.length > 0 && (
                      <>
                        {(manualData.bestNow.length > 0 || manualData.availableNow.length > 0 || manualData.opensSoon.length > 0) && <SelectSeparator />}
                        <SelectGroup>
                          <SelectLabel className="text-[10px] uppercase tracking-widest text-zinc-400">
                            Later
                          </SelectLabel>
                          {manualData.later.map((t) => (
                            <SelectItem key={t.id} value={t.id} disabled>
                              <div className="flex w-full min-w-0 items-center gap-2">
                                <span className="shrink-0 font-medium tabular-nums">{t.label}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{t.seats}-top</span>
                                <span className="truncate text-xs text-muted-foreground">{t.zoneLabel}</span>
                                <span className="ml-auto shrink-0 text-[10px] text-zinc-500">
                                  +{formatOpeningDelta(t.openingInMin)} ({t.nextAvailable})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {manualData.options.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No tables match current party size and zone filter.
                  </p>
                )}
              </div>
            )}
          </div>
        </label>

        {/* Unassigned */}
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            mode === "unassigned"
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/30 hover:border-border/60"
          }`}
        >
          <RadioGroupItem value="unassigned" id="unassigned" className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <Label htmlFor="unassigned" className="text-sm font-medium cursor-pointer">
              Leave unassigned
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">Table will be assigned closer to arrival</p>
          </div>
        </label>
      </RadioGroup>

    </div>
  )
}
