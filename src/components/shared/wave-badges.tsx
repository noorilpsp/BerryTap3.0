"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { WaveStatus as FloorWaveStatus } from "@/lib/table-detail-data"
import type { WaveStatus as TableWaveStatus } from "@/lib/table-data"

export type CanonicalWaveStatus =
  | TableWaveStatus
  | FloorWaveStatus

export type WaveBadgeVariant = "default" | "floorplan"

function normalizeWaveStatus(status: CanonicalWaveStatus): "served" | "ready" | "preparing" | "fired" | "held" | "not_started" {
  if (status === "cooking") return "preparing"
  return status
}

export const waveStatusColors: Record<CanonicalWaveStatus, string> = {
  served: "text-emerald-400",
  ready: "text-red-400",
  preparing: "text-amber-400",
  cooking: "text-amber-400",
  fired: "text-cyan-200/90",
  held: "text-muted-foreground/50",
  not_started: "text-muted-foreground/30",
}

export const waveStatusDot: Record<CanonicalWaveStatus, string> = {
  served: "bg-emerald-400",
  ready: "bg-red-400 animate-pulse",
  preparing: "bg-amber-400",
  cooking: "bg-amber-400",
  fired: "bg-cyan-300",
  held: "bg-muted-foreground/40",
  not_started: "bg-muted-foreground/20",
}

export const waveStatusLabel: Record<CanonicalWaveStatus, string> = {
  served: "Served",
  ready: "Ready",
  preparing: "Preparing",
  cooking: "Cooking",
  fired: "New",
  held: "Held",
  not_started: "--",
}

export function getWaveStatusChipClass(
  status: CanonicalWaveStatus,
  variant: WaveBadgeVariant = "default"
): string {
  const normalized = normalizeWaveStatus(status)
  const floorplan = variant === "floorplan"
  if (normalized === "served") {
    return floorplan
      ? "border-green-50/10 bg-green-500/56 text-green-50 shadow-[0_0_0_1px_rgba(34,197,94,0.12)] backdrop-blur-[2px]"
      : "border-emerald-500/45 bg-emerald-500/15 text-emerald-200"
  }
  if (normalized === "ready") {
    return floorplan
      ? "border-red-300/70 bg-red-600/70 text-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.22)] backdrop-blur-[2px]"
      : "border-red-400/45 bg-red-500/15 text-red-200"
  }
  if (normalized === "preparing") {
    return floorplan
      ? "border-amber-50/10 bg-amber-400/56 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] backdrop-blur-[2px]"
      : "border-amber-400/45 bg-amber-500/15 text-amber-200"
  }
  if (normalized === "fired") {
    return floorplan
      ? "border-sky-50/10 bg-sky-400/62 text-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.12)] backdrop-blur-[2px]"
      : "border-cyan-300/45 bg-cyan-400/15 text-cyan-100"
  }
  if (normalized === "not_started") {
    return floorplan
      ? "border-white/8 bg-slate-950/82 text-slate-100 backdrop-blur-[2px]"
      : "border-white/10 bg-white/[0.02] text-muted-foreground/60"
  }
  return floorplan
    ? "border-slate-50/8 bg-slate-900/82 text-slate-100 backdrop-blur-[2px]"
    : "border-muted-foreground/35 bg-muted/40 text-muted-foreground"
}

export function getWaveStatusPulseRgb(status: CanonicalWaveStatus): string | null {
  const normalized = normalizeWaveStatus(status)
  if (normalized === "ready") return "248 113 113"
  if (normalized === "preparing") return "251 191 36"
  if (normalized === "fired") return "103 232 249"
  return null
}

type WaveBadgeProps = {
  label: string
  status: CanonicalWaveStatus
  size?: "sm" | "xs"
  variant?: WaveBadgeVariant
  className?: string
}

export function WaveBadge({
  label,
  status,
  size = "sm",
  variant = "default",
  className,
}: WaveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-black tracking-wide",
        size === "sm" && "h-6 min-w-[2.3rem] px-2 text-[11px]",
        size === "xs" && "h-5 min-w-[1.85rem] px-1.5 text-[10px]",
        getWaveStatusChipClass(status, variant),
        className
      )}
      aria-label={`${label} ${waveStatusLabel[status]}`}
      title={`${label} ${waveStatusLabel[status]}`}
    >
      {label}
    </span>
  )
}
