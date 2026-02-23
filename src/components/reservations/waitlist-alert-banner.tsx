"use client"

import { useEffect, useState } from "react"
import { X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertBannerProps {
  tableId: string
  partyName: string
  partySize: number
  waitedMin: number
  quotedMin: number
  onSeatNow: () => void
  onDismiss: () => void
}

export function WaitlistAlertBanner({
  tableId,
  partyName,
  partySize,
  waitedMin,
  quotedMin,
  onSeatNow,
  onDismiss,
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true)
  const earlyBy = quotedMin - waitedMin

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, 30_000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!visible) return null

  return (
    <div
      className="wl-alert-banner relative mx-4 mt-3 flex flex-col gap-2 rounded-xl border border-emerald-500/35 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(16,185,129,0.06))] px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between lg:mx-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2.5 sm:items-center">
        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 sm:mt-0">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-emerald-300">MATCH READY</span>
          <span className="text-zinc-300">
            {" "}&mdash; {tableId} just cleared. {partyName} ({partySize}p, waiting {waitedMin} min)
            is a perfect fit. Quoted wait was {quotedMin} min &mdash;{" "}
            {earlyBy > 0 ? (
              <span className="text-emerald-400">{"you're"} {earlyBy} min early!</span>
            ) : (
              <span className="text-amber-400">{Math.abs(earlyBy)} min over quote</span>
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-8 sm:flex-shrink-0 sm:pl-0">
        <Button
          size="sm"
          onClick={onSeatNow}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={`Seat ${partyName} at ${tableId}`}
        >
          Seat Now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setVisible(false); onDismiss() }}
          className="text-zinc-400 hover:text-zinc-200"
        >
          Dismiss
        </Button>
      </div>
      <button
        onClick={() => { setVisible(false); onDismiss() }}
        className="absolute right-2 top-2 rounded-sm p-1 text-zinc-500 hover:text-zinc-300 sm:hidden"
        aria-label="Dismiss alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
