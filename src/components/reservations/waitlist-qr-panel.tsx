"use client"

import { Copy, Download, ExternalLink, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActiveStats } from "@/lib/waitlist-data"

export function WaitlistQrPanel() {
  const stats = getActiveStats()

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
        Self-Service Waitlist
      </h3>
      <p className="mb-3 text-xs text-zinc-500">
        Guests can scan this QR to join the waitlist:
      </p>

      <div className="flex items-start gap-4">
        {/* QR placeholder */}
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.12)]">
          <QrCode className="h-16 w-16 text-zinc-500" />
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ExternalLink className="h-3 w-3" />
            <span className="font-mono text-zinc-300">wait.bellavista.com</span>
          </div>
          <div className="text-zinc-500">Currently: {stats.parties} parties waiting</div>
          <div className="text-zinc-500">Est. wait: {stats.avgWait > 0 ? `${stats.avgWait - 5}-${stats.avgWait + 10}` : "10-25"} min</div>
          <div className="inline-flex w-fit rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
            Conversion-ready flow
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-zinc-600">
        Guests see: queue position, live wait time, menu to browse, SMS notification
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 border-zinc-700 bg-zinc-800/60 px-2.5 text-[10px] text-zinc-400 hover:bg-zinc-700">
          <Copy className="mr-1 h-3 w-3" /> Copy Link
        </Button>
        <Button size="sm" variant="outline" className="h-7 border-zinc-700 bg-zinc-800/60 px-2.5 text-[10px] text-zinc-400 hover:bg-zinc-700">
          <Download className="mr-1 h-3 w-3" /> Download QR
        </Button>
      </div>
    </div>
  )
}
