"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, PackageCheck, UtensilsCrossed } from "lucide-react"
import { getTrackingSnapshot, type TrackingStatus } from "@/lib/order-tracking"
import { cn } from "@/lib/utils"

type TrackingStep = {
  key: TrackingStatus
  label: string
  description: string
}

const STEPS: TrackingStep[] = [
  { key: "sent", label: "Received", description: "Your order is confirmed." },
  { key: "preparing", label: "Preparing", description: "Kitchen or bar is preparing your items." },
  { key: "ready", label: "Ready", description: "Order is ready for pickup." },
  { key: "picked_up", label: "Picked Up", description: "Enjoy your meal." },
]

const STATUS_ORDER: TrackingStatus[] = ["sent", "preparing", "ready", "picked_up"]

function statusIndex(status: TrackingStatus): number {
  const idx = STATUS_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx
}

function deriveMockStatus(createdAt: number): TrackingStatus {
  const minutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000))
  if (minutes < 2) return "sent"
  if (minutes < 10) return "preparing"
  if (minutes < 18) return "ready"
  return "picked_up"
}

function estimateReadyMinutes(createdAt: number, status: TrackingStatus): number {
  if (status === "ready" || status === "picked_up") return 0
  const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 60000))
  const target = 12
  return Math.max(1, target - elapsed)
}

export default function TrackOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    params.then((v) => setToken(v.token))
  }, [params])

  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 5000)
    return () => clearInterval(timer)
  }, [])

  const snapshot = useMemo(() => {
    if (!token) return null
    return getTrackingSnapshot(token)
  }, [token, tick])

  const fallbackCreatedAt = useMemo(() => Date.now() - 60_000, [token])
  const createdAt = snapshot?.createdAt ?? fallbackCreatedAt
  const effectiveStatus: TrackingStatus = snapshot?.status ?? deriveMockStatus(createdAt)
  const currentStepIndex = statusIndex(effectiveStatus)
  const eta = estimateReadyMinutes(createdAt, effectiveStatus)

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.22),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.16),transparent_38%),hsl(222,24%,8%)] px-4 py-6 text-foreground">
      <div className="mx-auto max-w-xl space-y-4">
        <section className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/85">
                Live Order Tracking
              </div>
              <h1 className="mt-1 text-xl font-semibold text-sky-100">
                {snapshot?.code ?? "Order"}
              </h1>
            </div>
            <div className="inline-flex h-10 items-center rounded-md border border-sky-300/35 bg-sky-500/15 px-3 text-sm font-semibold text-sky-100">
              {snapshot?.serviceType === "dine_in_no_table" ? "Dine-In Pickup" : "Pickup"}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-sky-100/85">
            <Clock3 className="h-4 w-4" />
            {effectiveStatus === "ready" || effectiveStatus === "picked_up"
              ? "Ready now"
              : `Estimated ready in ~${eta} min`}
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const done = index < currentStepIndex
              const active = index === currentStepIndex
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                      done && "border-emerald-300/60 bg-emerald-500/25 text-emerald-100",
                      active && "border-sky-300/70 bg-sky-500/30 text-sky-100 animate-pulse",
                      !done && !active && "border-white/25 bg-white/5 text-white/70"
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : `W${index + 1}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-semibold", active ? "text-sky-100" : "text-foreground")}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UtensilsCrossed className="h-4 w-4 text-sky-200" />
            Items
          </div>
          <div className="space-y-1.5">
            {snapshot?.items?.length ? (
              snapshot.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm">
                  <span className={cn(item.status === "voided" && "line-through text-muted-foreground")}>
                    {item.qty}x {item.name}
                  </span>
                  {item.status === "voided" ? (
                    <span className="text-[11px] font-semibold text-red-300">Voided</span>
                  ) : (
                    <PackageCheck className="h-4 w-4 text-sky-200/85" />
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-white/15 px-3 py-4 text-sm text-muted-foreground">
                We could not load item details yet. Keep this page open, status still updates live.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

