"use client"

import { useState } from "react"
import { Bell, CheckCircle, MessageSquare, Receipt } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { type WaitlistEntry, getElapsedMinutes } from "@/lib/waitlist-data"

interface SeatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WaitlistEntry | null
  tableId: string
  onConfirm: () => void
}

export function WaitlistSeatDialog({
  open,
  onOpenChange,
  entry,
  tableId,
  onConfirm,
}: SeatDialogProps) {
  const [sendSms, setSendSms] = useState(true)
  const [transferTab, setTransferTab] = useState(!!entry?.barTab)
  const [alertServer, setAlertServer] = useState(true)

  if (!entry) return null

  const elapsed = getElapsedMinutes(entry)
  const diff = entry.quotedWait - elapsed
  const isEarly = diff > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-zinc-800 bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Seating Confirmation</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Confirm seating details
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/30 px-4 py-3">
            <div className="text-sm text-zinc-200">
              <span className="font-bold">{entry.name}</span>{" "}
              <span className="text-zinc-500">({entry.partySize} guests)</span>
              <span className="mx-2 text-zinc-600">&rarr;</span>
              <span className="font-bold text-emerald-400">Table {tableId.replace("T", "")}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500">
                Waited: {elapsed} min (quoted {entry.quotedWait})
              </span>
              <span>&mdash;</span>
              {isEarly ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  {diff} min early
                </span>
              ) : (
                <span className="text-amber-400">{Math.abs(diff)} min over quote</span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <Checkbox checked={sendSms} onCheckedChange={(v) => setSendSms(v as boolean)} />
              <MessageSquare className="h-3 w-3" />
              {"Send \"table ready\" SMS first"}
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <Checkbox
                checked={transferTab}
                onCheckedChange={(v) => setTransferTab(v as boolean)}
              />
              <Receipt className="h-3 w-3" />
              Transfer bar tab (${entry.barTab?.toFixed(2) || "0.00"}) to table
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <Checkbox checked={alertServer} onCheckedChange={(v) => setAlertServer(v as boolean)} />
              <Bell className="h-3 w-3" />
              Alert server ({tableId})
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">
              Go Back
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Confirm Seating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
