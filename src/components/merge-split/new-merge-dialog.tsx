"use client"

import { useState } from "react"
import {
  Check,
  AlertTriangle,
  X,
  Clock,
  Users,
  Combine,
  ChevronRight,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { floorTables, pendingLargeParties } from "@/lib/merge-split-data"
import type { MergeType } from "@/lib/merge-split-data"

interface NewMergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTables: string[]
  onConfirm: () => void
  onAddTable: () => void
  onChangeSelection: () => void
}

const TIME_OPTIONS = [
  "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM",
]

export function NewMergeDialog({
  open,
  onOpenChange,
  selectedTables,
  onConfirm,
  onAddTable,
  onChangeSelection,
}: NewMergeDialogProps) {
  const [mergeType, setMergeType] = useState<MergeType>("time_limited")
  const [startTime, setStartTime] = useState("8:30 PM")
  const [endTime, setEndTime] = useState("10:30 PM")
  const [assignedReservation, setAssignedReservation] = useState<string>("")
  const [autoSplit, setAutoSplit] = useState(true)
  const [notifySplit, setNotifySplit] = useState(false)
  const [alertExtend, setAlertExtend] = useState(true)

  const selTables = selectedTables.map((id) => floorTables.find((t) => t.id === id)).filter(Boolean)
  const totalSeats = selTables.reduce((sum, t) => sum + (t?.seats || 0), 0)
  const zone = selTables[0]?.zone || "Unknown"

  if (selectedTables.length < 2) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-surface-strong max-h-[90vh] max-w-lg overflow-y-auto border-border/30 p-0">
        <DialogHeader className="border-b border-border/20 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Combine className="h-4 w-4 text-cyan-400" />
            Create New Merge
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 py-4">
          {/* Step 1: Selected Tables */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 1: Select Tables
            </h3>
            <div className="merge-dialog-section-box rounded-lg p-3">
              <div className="mb-2 text-sm text-foreground">
                Selected:{" "}
                {selTables.map((t) => (
                  <span key={t?.id}>
                    T{t?.number} ({t?.seats}p)
                  </span>
                )).reduce<React.ReactNode[]>((acc, el, i) => {
                  if (i > 0) acc.push(<span key={`sep-${i}`} className="text-muted-foreground"> + </span>)
                  acc.push(el)
                  return acc
                }, [])}{" "}
                = <span className="font-semibold text-cyan-400">{totalSeats} seats combined</span>
              </div>

              {/* Visual preview */}
              <div className="flex items-center justify-center gap-2 py-3">
                {selTables.map((t, i) => (
                  <div key={t?.id} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className="flex h-5 items-center">
                        <div className="h-0.5 w-6 bg-cyan-400/50" />
                      </div>
                    )}
                    <div className="flex h-14 w-16 flex-col items-center justify-center rounded-lg border-2 border-cyan-400/40 bg-cyan-400/10">
                      <span className="text-xs font-bold text-cyan-400">T{t?.number}</span>
                      <span className="text-[10px] text-muted-foreground">{t?.seats}p</span>
                    </div>
                  </div>
                ))}
                <div className="ml-2 flex h-14 items-center rounded-lg border border-dashed border-cyan-400/30 px-3">
                  <span className="text-xs font-semibold text-cyan-400">= {totalSeats}p</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs border-border/40" onClick={onAddTable}>
                  + Add Another Table
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onChangeSelection}>
                  Change Selection
                </Button>
              </div>
            </div>
          </section>

          <Separator className="bg-border/20" />

          {/* Step 2: Configuration */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 2: Merge Configuration
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">Merge type</Label>
                <RadioGroup value={mergeType} onValueChange={(v) => setMergeType(v as MergeType)} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="time_limited" id="time_limited" />
                    <Label htmlFor="time_limited" className="text-xs text-foreground">
                      Time-limited (for a specific reservation / time window)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="until_split" id="until_split" />
                    <Label htmlFor="until_split" className="text-xs text-foreground">
                      Until manually split
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="permanent" id="permanent" />
                    <Label htmlFor="permanent" className="text-xs text-foreground">
                      Permanent (reconfigure layout)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {mergeType === "time_limited" && (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="mb-1.5 block text-xs text-muted-foreground">Start</Label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="h-8 border-border/40 bg-secondary/30 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="mb-1.5 block text-xs text-muted-foreground">End</Label>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger className="h-8 border-border/40 bg-secondary/30 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1.5 block text-xs text-muted-foreground">Assigned to reservation</Label>
                    <Select value={assignedReservation} onValueChange={setAssignedReservation}>
                      <SelectTrigger className="h-8 border-border/40 bg-secondary/30 text-xs">
                        <SelectValue placeholder="Select reservation..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingLargeParties.map((p) => (
                          <SelectItem key={p.guest} value={p.guest}>
                            {p.guest} ({p.partySize}p)
                            {p.time
                              ? ` at ${new Date(p.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
                              : " -- Waitlist"}
                          </SelectItem>
                        ))}
                        <SelectItem value="none">No reservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator className="bg-border/20" />

          {/* Step 3: Impact Analysis */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 3: Impact Analysis
            </h3>

            <div className="merge-dialog-section-box rounded-lg p-3">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-emerald-400">AVAILABLE</span>
                    <p className="text-muted-foreground">
                      {selTables.map((t) => `T${t?.number}`).join(" and ")} are free from {startTime} onward
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15">
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-amber-400">CAPACITY IMPACT</span>
                    <p className="text-muted-foreground">
                      Merging removes {selTables.length} x {selTables[0]?.seats}-tops from availability
                    </p>
                    <p className="text-muted-foreground">
                      During {startTime}--{endTime}: Currently 6 four-tops available, after merge: {6 - selTables.length} four-tops + 1 {totalSeats}-top
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-emerald-400">RECOMMENDATION: Safe to merge</span>
                    <p className="text-muted-foreground">No conflicts detected for this time window</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-border/20" />

          {/* Auto-split options */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auto-split Options
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-split"
                  checked={autoSplit}
                  onCheckedChange={(c) => setAutoSplit(!!c)}
                />
                <Label htmlFor="auto-split" className="text-xs text-foreground">
                  Automatically split after reservation ends
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-split"
                  checked={notifySplit}
                  onCheckedChange={(c) => setNotifySplit(!!c)}
                />
                <Label htmlFor="notify-split" className="text-xs text-foreground">
                  Send notification when split happens
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="alert-extend"
                  checked={alertExtend}
                  onCheckedChange={(c) => setAlertExtend(!!c)}
                />
                <Label htmlFor="alert-extend" className="text-xs text-foreground">
                  Alert if merge window needs extending
                </Label>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/20 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onConfirm}>
            <Combine className="h-3.5 w-3.5" />
            Confirm Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
