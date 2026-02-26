"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, Armchair, Banknote, CheckCircle2, ChevronDown, ChevronUp, Clock3, CreditCard, Flame, HandPlatter, MapPinned, Search, ShoppingBag, Store, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { sectionConfig, storeTablesToFloorTables, type FloorTable } from "@/lib/floor-map-data"
import { useRestaurantStore } from "@/store/restaurantStore"
import { getTableDetailById, getTableDetailFallback, type Wave, type WaveStatus } from "@/lib/table-detail-data"
import {
  getAllTrackingSnapshots,
  upsertTrackingSnapshot,
  type TrackingServiceType,
  type TrackingSnapshot,
  type TrackingStatus,
} from "@/lib/order-tracking"

type OrderSource = "table" | TrackingServiceType
type UnifiedStatus = "sent" | "preparing" | "ready" | "served" | "closed" | "voided" | "refunded"
type LocalWaveStatus = WaveStatus | "fired"
type PaymentState = "paid" | "unpaid"
type PaymentMethod = "card" | "cash" | "other" | null

type UnifiedOrder = {
  id: string
  source: OrderSource
  label: string
  sectionLabel: string
  guestLabel: string
  status: UnifiedStatus
  createdAt: number
  updatedAt: number
  total: number
  itemCount: number
  items: Array<{ id: string; name: string; qty: number; status: string }>
  waves: Array<{ number: number; status: LocalWaveStatus }>
  trackToken?: string
  note?: string
  paymentState?: PaymentState
  paymentMethod?: PaymentMethod
}

type BoardMode = "live" | "history"

const sourceLabel: Record<OrderSource, string> = {
  table: "Table",
  pickup: "Pickup",
  dine_in_no_table: "Dine-In",
}

const sourceChipClass: Record<OrderSource, string> = {
  table: "border-cyan-300/45 bg-cyan-500/12 text-cyan-100",
  pickup: "border-violet-300/45 bg-violet-500/12 text-violet-100",
  dine_in_no_table: "border-amber-300/45 bg-amber-500/12 text-amber-100",
}

const liveStatusOrder: UnifiedStatus[] = ["ready", "preparing", "sent", "served"]
const liveStatusFilterOrder: UnifiedStatus[] = ["sent", "preparing", "ready", "served"]
const historyStatusOrder: UnifiedStatus[] = ["served", "closed", "voided", "refunded"]

const statusChipClass: Record<UnifiedStatus, string> = {
  sent: "border-sky-300/45 bg-sky-500/12 text-sky-100",
  preparing: "border-amber-300/45 bg-amber-500/12 text-amber-100",
  ready: "border-red-300/45 bg-red-500/12 text-red-100",
  served: "border-emerald-300/45 bg-emerald-500/12 text-emerald-100",
  closed: "border-white/20 bg-white/[0.06] text-muted-foreground",
  voided: "border-red-400/40 bg-red-500/10 text-red-200",
  refunded: "border-fuchsia-300/45 bg-fuchsia-500/12 text-fuchsia-100",
}

const statusChipLabel: Record<UnifiedStatus, string> = {
  sent: "New",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  closed: "Closed",
  voided: "Voided",
  refunded: "Refunded",
}

const statusFilterLabel: Record<UnifiedStatus, string> = {
  sent: "New",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  closed: "Closed",
  voided: "Voided",
  refunded: "Refunded",
}

const statusFilterToneClass: Record<
  UnifiedStatus,
  { active: string; idle: string }
> = {
  sent: {
    active: "border-sky-300/60 bg-sky-500/22 text-sky-100",
    idle: "border-sky-300/35 bg-sky-500/10 text-sky-200/85 hover:bg-sky-500/16",
  },
  preparing: {
    active: "border-amber-300/60 bg-amber-500/22 text-amber-100",
    idle: "border-amber-300/35 bg-amber-500/10 text-amber-200/85 hover:bg-amber-500/16",
  },
  ready: {
    active: "border-red-300/60 bg-red-500/22 text-red-100",
    idle: "border-red-300/35 bg-red-500/10 text-red-200/85 hover:bg-red-500/16",
  },
  served: {
    active: "border-emerald-300/60 bg-emerald-500/22 text-emerald-100",
    idle: "border-emerald-300/35 bg-emerald-500/10 text-emerald-200/85 hover:bg-emerald-500/16",
  },
  closed: {
    active: "border-slate-300/45 bg-slate-500/16 text-slate-100",
    idle: "border-slate-300/25 bg-slate-500/8 text-slate-300/80 hover:bg-slate-500/14",
  },
  voided: {
    active: "border-rose-300/55 bg-rose-500/20 text-rose-100",
    idle: "border-rose-300/35 bg-rose-500/10 text-rose-200/80 hover:bg-rose-500/16",
  },
  refunded: {
    active: "border-fuchsia-300/55 bg-fuchsia-500/20 text-fuchsia-100",
    idle: "border-fuchsia-300/35 bg-fuchsia-500/10 text-fuchsia-200/80 hover:bg-fuchsia-500/16",
  },
}

const waveChipClass: Record<LocalWaveStatus, string> = {
  served: "border-emerald-400/55 bg-emerald-500/14 text-emerald-300",
  ready: "border-red-400/55 bg-red-500/14 text-red-300",
  cooking: "border-amber-400/55 bg-amber-500/14 text-amber-300",
  fired: "border-sky-400/55 bg-sky-500/14 text-sky-300",
  held: "border-white/15 bg-white/[0.04] text-muted-foreground",
  not_started: "border-white/10 bg-white/[0.02] text-muted-foreground/60",
}

type OrderTone = "urgent" | "active" | "served" | "billing" | "closed" | "voided" | "refunded" | "completed_history"

const statusTone: Record<UnifiedStatus, OrderTone> = {
  ready: "urgent",
  preparing: "active",
  sent: "billing",
  served: "served",
  closed: "closed",
  voided: "voided",
  refunded: "refunded",
}

const toneBorderClass: Record<OrderTone, string> = {
  urgent: "border-l-red-400/80",
  active: "border-l-amber-400/60",
  served: "border-l-emerald-400/70",
  billing: "border-l-blue-400/60",
  closed: "border-l-slate-300/55",
  voided: "border-l-rose-400/70",
  refunded: "border-l-fuchsia-400/70",
  completed_history: "border-l-indigo-400/75",
}

const toneDotClass: Record<OrderTone, string> = {
  urgent: "bg-red-400",
  active: "bg-amber-400",
  served: "bg-emerald-400",
  billing: "bg-blue-400",
  closed: "bg-slate-300",
  voided: "bg-rose-400",
  refunded: "bg-fuchsia-400",
  completed_history: "bg-indigo-400",
}

const toneTextClass: Record<OrderTone, string> = {
  urgent: "text-red-400",
  active: "text-amber-400",
  served: "text-emerald-400",
  billing: "text-blue-400",
  closed: "text-slate-300",
  voided: "text-rose-400",
  refunded: "text-fuchsia-400",
  completed_history: "text-indigo-300",
}

const toneGlowClass: Record<OrderTone, string> = {
  urgent: "shadow-[inset_0_0_0_1px_hsl(var(--glow-urgent)/0.15)]",
  active: "",
  served: "",
  billing: "",
  closed: "",
  voided: "",
  refunded: "",
  completed_history: "",
}

const toneAccentColor: Record<OrderTone, string> = {
  urgent: "#f87171",
  active: "#fbbf24",
  served: "#34d399",
  billing: "#60a5fa",
  closed: "#cbd5e1",
  voided: "#fb7185",
  refunded: "#e879f9",
  completed_history: "#818cf8",
}

const toneAccentBg: Record<OrderTone, string> = {
  urgent: "#f8717120",
  active: "#fbbf2420",
  served: "#34d39920",
  billing: "#60a5fa20",
  closed: "#cbd5e120",
  voided: "#fb718520",
  refunded: "#e879f920",
  completed_history: "#818cf820",
}

const groupLabel: Record<UnifiedStatus, string> = {
  ready: "URGENT",
  preparing: "PREPARING",
  sent: "NEW",
  served: "SERVED",
  closed: "CLOSED",
  voided: "VOIDED",
  refunded: "REFUNDED",
}

const historyCompletedTone = {
  chipClass: "border-indigo-300/45 bg-indigo-500/12 text-indigo-100",
  filterActive: "border-indigo-300/60 bg-indigo-500/22 text-indigo-100",
  filterIdle: "border-indigo-300/35 bg-indigo-500/10 text-indigo-200/85 hover:bg-indigo-500/16",
  accent: "#818cf8",
  accentBg: "#818cf820",
}

const paymentStateClass: Record<PaymentState, string> = {
  paid: "border-emerald-300/55 bg-emerald-500/14 text-emerald-200",
  unpaid: "border-amber-300/55 bg-amber-500/14 text-amber-200",
}

const paymentMethodClass: Record<Exclude<PaymentMethod, null>, string> = {
  card: "border-sky-300/55 bg-sky-500/14 text-sky-200",
  cash: "border-emerald-300/55 bg-emerald-500/14 text-emerald-200",
  other: "border-violet-300/55 bg-violet-500/14 text-violet-200",
}

function minutesAgo(ts: number): number {
  return Math.max(0, Math.round((Date.now() - ts) / 60000))
}

function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts)
}

function formatMinutesCompact(totalMinutes: number): string {
  const safe = Math.max(0, totalMinutes)
  if (safe < 60) return `${safe}m`
  const h = Math.floor(safe / 60)
  const m = safe % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const counterStatusFlow: UnifiedStatus[] = ["sent", "preparing", "ready", "served"]

function getCounterFlowIndex(status: UnifiedStatus): number {
  const index = counterStatusFlow.indexOf(status)
  if (index >= 0) return index
  if (status === "closed" || status === "refunded" || status === "voided") return counterStatusFlow.length - 1
  return 0
}

function mapTrackingStatus(status: TrackingStatus): UnifiedStatus {
  if (status === "picked_up") return "served"
  return status
}

function isOrderVisibleInBoardMode(order: UnifiedOrder, mode: BoardMode): boolean {
  if (mode === "live") {
    if (order.status === "served") return order.source === "table"
    return order.status === "ready" || order.status === "preparing" || order.status === "sent"
  }
  if (order.status === "served") return order.source !== "table"
  return order.status === "closed" || order.status === "voided" || order.status === "refunded"
}

function deriveTableStatus(waves: Wave[], tableStatus: string): UnifiedStatus {
  if (waves.some((w) => w.status === "ready")) return "ready"
  if (waves.some((w) => w.status === "cooking")) return "preparing"

  const hasHeld = waves.some((w) => w.status === "held" || w.status === "not_started")
  const hasServed = waves.some((w) => w.status === "served")

  // Keep table card in "Served" when completed wave(s) are green and next wave is still held.
  if (hasServed) {
    if (!hasHeld && waves.every((w) => w.status === "served")) {
      return tableStatus === "billing" ? "closed" : "served"
    }
    return "served"
  }

  if (hasHeld) return "sent"
  return tableStatus === "billing" ? "closed" : "sent"
}

function deriveStatusFromOrderWaves(waves: Array<{ status: LocalWaveStatus }>): UnifiedStatus {
  if (waves.some((wave) => wave.status === "ready")) return "ready"
  if (waves.some((wave) => wave.status === "cooking")) return "preparing"
  if (waves.some((wave) => wave.status === "fired")) return "sent"
  if (waves.some((wave) => wave.status === "served")) return "served"
  if (waves.some((wave) => wave.status === "held" || wave.status === "not_started")) return "sent"
  if (waves.length > 0 && waves.every((wave) => wave.status === "served")) return "served"
  return "sent"
}

function getNextFireableWaveNumber(order: UnifiedOrder): number | null {
  if (order.source !== "table") return null
  const next = order.waves.find((wave) => wave.status === "held" || wave.status === "not_started")
  return next ? next.number : null
}

function normalizeNewTableWaves(waves: Array<{ number: number; status: LocalWaveStatus }>, status: UnifiedStatus) {
  if (status !== "sent") return waves
  if (waves.some((wave) => wave.status === "fired")) return waves
  const firstHeld = waves.find((wave) => wave.status === "held" || wave.status === "not_started")
  if (!firstHeld) return waves
  return waves.map((wave) =>
    wave.number === firstHeld.number ? { ...wave, status: "fired" as LocalWaveStatus } : wave
  )
}

function buildTableOrders(floorTables: FloorTable[]): UnifiedOrder[] {
  return floorTables
    .filter((table) => table.status !== "free")
    .map((table): UnifiedOrder => {
      const detail =
        getTableDetailById(table.id) ??
        getTableDetailFallback(
          table.id,
          table.number,
          table.section,
          sectionConfig[table.section].name,
          table.guests,
          table.status,
          table.seatedAt
        )

      const items = detail.seats.flatMap((seat, seatIdx) =>
        (seat.items ?? []).map((item, itemIdx) => ({
          id: `${table.id}-s${seat.number}-${itemIdx}`,
          name: item.name,
          qty: 1,
          status: item.status,
        }))
      )
      const createdAt = new Date(detail.seatedAt).getTime()
      const total = detail.seats.reduce((sum, seat) => sum + seat.orderTotal, 0)

      return {
        id: `table-${table.id}`,
        source: "table",
        label: `T${table.number}`,
        sectionLabel: detail.sectionLabel,
        guestLabel: `${detail.guests} guest${detail.guests === 1 ? "" : "s"}`,
        status: deriveTableStatus(detail.waves, table.status),
        createdAt,
        updatedAt: createdAt,
        total,
        itemCount: items.length,
        items,
        waves: detail.waves.map((wave, index) => ({
          number: index + 1,
          status: wave.status,
        })),
        note: detail.notes[0]?.text ?? "",
      }
    })
}

function buildCounterOrders(snapshots: TrackingSnapshot[]): UnifiedOrder[] {
  return snapshots.map((entry) => {
    const activeItemCount = entry.items.filter((item) => item.status !== "voided").reduce((sum, item) => sum + item.qty, 0)
    const paymentState: PaymentState =
      entry.status === "picked_up" || entry.status === "closed" || entry.status === "refunded" ? "paid" : "unpaid"

    return {
      id: `counter-${entry.token}`,
      source: entry.serviceType,
      label: entry.code,
      sectionLabel: entry.serviceType === "pickup" ? "Pickup" : "Dine-In",
      guestLabel: entry.customerName || "Guest",
      status: mapTrackingStatus(entry.status),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      total: 0,
      itemCount: activeItemCount,
      items: entry.items.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        status: item.status,
      })),
      waves: [],
      trackToken: entry.token,
      note: entry.orderNote || "",
      paymentState,
      paymentMethod: null,
    }
  })
}

function buildDemoOrders(now: number, counterDemoStatusOverrides: Record<string, UnifiedStatus>): UnifiedOrder[] {
  const m = 60_000
  const orders: UnifiedOrder[] = [
    {
      id: "demo-table-21",
      source: "table",
      label: "T21",
      sectionLabel: "Patio",
      guestLabel: "4 guests",
      status: "ready",
      createdAt: now - 72 * m,
      updatedAt: now - 10 * m,
      total: 84,
      itemCount: 5,
      items: [
        { id: "d-1", name: "Mojito", qty: 2, status: "ready" },
        { id: "d-2", name: "Bruschetta", qty: 1, status: "ready" },
      ],
      waves: [{ number: 1, status: "ready" }],
      note: "Allergy: no nuts",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-table-22",
      source: "table",
      label: "T22",
      sectionLabel: "Main Hall",
      guestLabel: "2 guests",
      status: "preparing",
      createdAt: now - 63 * m,
      updatedAt: now - 8 * m,
      total: 52,
      itemCount: 3,
      items: [{ id: "d-3", name: "Pasta Alfredo", qty: 2, status: "preparing" }],
      waves: [{ number: 1, status: "cooking" }],
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-table-23",
      source: "table",
      label: "T23",
      sectionLabel: "Lounge",
      guestLabel: "3 guests",
      status: "sent",
      createdAt: now - 58 * m,
      updatedAt: now - 7 * m,
      total: 66,
      itemCount: 4,
      items: [{ id: "d-4", name: "Club Sandwich", qty: 3, status: "sent" }],
      waves: [{ number: 1, status: "fired" }, { number: 2, status: "held" }],
      note: "No onions",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-table-24",
      source: "table",
      label: "T24",
      sectionLabel: "Window",
      guestLabel: "2 guests",
      status: "served",
      createdAt: now - 41 * m,
      updatedAt: now - 3 * m,
      total: 47,
      itemCount: 2,
      items: [{ id: "d-5", name: "Soup of the day", qty: 2, status: "served" }],
      waves: [{ number: 1, status: "served" }],
      note: "",
      paymentState: "paid",
      paymentMethod: "card",
    },
    {
      id: "demo-table-fire-30",
      source: "table",
      label: "T30",
      sectionLabel: "Chef Counter",
      guestLabel: "4 guests",
      status: "sent",
      createdAt: now - 34 * m,
      updatedAt: now - 2 * m,
      total: 112,
      itemCount: 6,
      items: [
        { id: "d-fire-1", name: "Sparkling Water", qty: 2, status: "served" },
        { id: "d-fire-2", name: "Burrata", qty: 2, status: "held" },
        { id: "d-fire-3", name: "Ribeye", qty: 2, status: "held" },
      ],
      waves: [
        { number: 1, status: "served" },
        { number: 2, status: "fired" },
        { number: 3, status: "held" },
      ],
      note: "Wave 1 served, Wave 2 fired (New), Wave 3 held.",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-table-fire-31",
      source: "table",
      label: "T31",
      sectionLabel: "Main Hall",
      guestLabel: "3 guests",
      status: "served",
      createdAt: now - 28 * m,
      updatedAt: now - 1 * m,
      total: 78,
      itemCount: 5,
      items: [
        { id: "d-fire-31-1", name: "Mineral Water", qty: 2, status: "served" },
        { id: "d-fire-31-2", name: "Risotto", qty: 2, status: "held" },
        { id: "d-fire-31-3", name: "Tiramisu", qty: 1, status: "held" },
      ],
      waves: [
        { number: 1, status: "served" },
        { number: 2, status: "held" },
        { number: 3, status: "held" },
      ],
      note: "Ready for next course. Tap Fire W2.",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-pickup-240",
      source: "pickup",
      label: "PU-240",
      sectionLabel: "Pickup",
      guestLabel: "Alex",
      status: "ready",
      createdAt: now - 55 * m,
      updatedAt: now - 2 * m,
      total: 0,
      itemCount: 3,
      items: [{ id: "d-6", name: "Caesar Salad", qty: 1, status: "ready" }],
      waves: [],
      trackToken: "demo-pu-240",
      note: "",
      paymentState: "paid",
      paymentMethod: "card",
    },
    {
      id: "demo-pickup-241",
      source: "pickup",
      label: "PU-241",
      sectionLabel: "Pickup",
      guestLabel: "Mia",
      status: "preparing",
      createdAt: now - 46 * m,
      updatedAt: now - 6 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-7", name: "Chicken Bowl", qty: 2, status: "preparing" }],
      waves: [],
      trackToken: "demo-pu-241",
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-pickup-242",
      source: "pickup",
      label: "PU-242",
      sectionLabel: "Pickup",
      guestLabel: "Noah",
      status: "sent",
      createdAt: now - 30 * m,
      updatedAt: now - 5 * m,
      total: 0,
      itemCount: 1,
      items: [{ id: "d-8", name: "Sparkling Water", qty: 1, status: "sent" }],
      waves: [],
      trackToken: "demo-pu-242",
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-pickup-243",
      source: "pickup",
      label: "PU-243",
      sectionLabel: "Pickup",
      guestLabel: "Liam",
      status: "served",
      createdAt: now - 24 * m,
      updatedAt: now - 2 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-9", name: "Matcha Latte", qty: 2, status: "served" }],
      waves: [],
      trackToken: "demo-pu-243",
      note: "",
      paymentState: "paid",
      paymentMethod: "cash",
    },
    {
      id: "demo-dine-410",
      source: "dine_in_no_table",
      label: "DI-410",
      sectionLabel: "Dine-In",
      guestLabel: "Walk-in 2",
      status: "ready",
      createdAt: now - 36 * m,
      updatedAt: now - 1 * m,
      total: 0,
      itemCount: 3,
      items: [{ id: "d-10", name: "Burger Combo", qty: 2, status: "ready" }],
      waves: [],
      trackToken: "demo-di-410",
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-dine-411",
      source: "dine_in_no_table",
      label: "DI-411",
      sectionLabel: "Dine-In",
      guestLabel: "Walk-in 1",
      status: "preparing",
      createdAt: now - 22 * m,
      updatedAt: now - 5 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-11", name: "Avocado Toast", qty: 1, status: "preparing" }],
      waves: [],
      trackToken: "demo-di-411",
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-dine-412",
      source: "dine_in_no_table",
      label: "DI-412",
      sectionLabel: "Dine-In",
      guestLabel: "Walk-in 3",
      status: "sent",
      createdAt: now - 15 * m,
      updatedAt: now - 4 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-12", name: "Cappuccino", qty: 2, status: "sent" }],
      waves: [],
      trackToken: "demo-di-412",
      note: "",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-dine-413",
      source: "dine_in_no_table",
      label: "DI-413",
      sectionLabel: "Dine-In",
      guestLabel: "Walk-in 2",
      status: "served",
      createdAt: now - 12 * m,
      updatedAt: now - 1 * m,
      total: 0,
      itemCount: 1,
      items: [{ id: "d-13", name: "Cheesecake", qty: 1, status: "served" }],
      waves: [],
      trackToken: "demo-di-413",
      note: "",
      paymentState: "paid",
      paymentMethod: "card",
    },
    {
      id: "demo-history-1",
      source: "pickup",
      label: "PU-190",
      sectionLabel: "Pickup",
      guestLabel: "Ethan",
      status: "closed",
      createdAt: now - 120 * m,
      updatedAt: now - 40 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-14", name: "Flat White", qty: 2, status: "served" }],
      waves: [],
      trackToken: "demo-pu-190",
      note: "",
      paymentState: "paid",
      paymentMethod: "other",
    },
    {
      id: "demo-history-2",
      source: "table",
      label: "T19",
      sectionLabel: "Main Hall",
      guestLabel: "2 guests",
      status: "voided",
      createdAt: now - 140 * m,
      updatedAt: now - 60 * m,
      total: 0,
      itemCount: 1,
      items: [{ id: "d-15", name: "Steak Frites", qty: 1, status: "voided" }],
      waves: [{ number: 1, status: "held" }],
      note: "Voided by manager",
      paymentState: "unpaid",
      paymentMethod: null,
    },
    {
      id: "demo-history-3",
      source: "dine_in_no_table",
      label: "DI-389",
      sectionLabel: "Dine-In",
      guestLabel: "Walk-in",
      status: "refunded",
      createdAt: now - 160 * m,
      updatedAt: now - 80 * m,
      total: 0,
      itemCount: 2,
      items: [{ id: "d-16", name: "Iced Tea", qty: 2, status: "served" }],
      waves: [],
      trackToken: "demo-di-389",
      note: "Customer complaint",
      paymentState: "paid",
      paymentMethod: "other",
    },
  ]

  return orders.map((order) => {
    const override = counterDemoStatusOverrides[order.id]
    if (!override) return order
    return {
      ...order,
      status: override,
      updatedAt: now,
    }
  })
}

function WaveStrip({ waves }: { waves: UnifiedOrder["waves"] }) {
  if (waves.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {waves.map((wave) => (
        <span
          key={`w-${wave.number}`}
          className={cn(
            "inline-flex h-6 min-w-[2.2rem] items-center justify-center rounded-md border px-2 text-[10px] font-black tracking-wide",
            waveChipClass[wave.status]
          )}
        >
          W{wave.number}
        </span>
      ))}
    </div>
  )
}

function getIdentifier(order: UnifiedOrder): {
  Icon: typeof Armchair
  text: string
} {
  if (order.source === "table") {
    const number = order.label.match(/\d+/)?.[0] ?? order.label
    return { Icon: HandPlatter, text: `T${number}` }
  }
  if (order.source === "pickup") {
    const code = order.label.toUpperCase().startsWith("PU-") ? order.label : `PU-${order.label}`
    return { Icon: ShoppingBag, text: code }
  }
  const code = order.label.toUpperCase().startsWith("DI-") ? order.label : `DI-${order.label}`
  return { Icon: Store, text: code }
}

function OrderCard({
  order,
  boardMode,
  onMarkServed,
  onOpenDetail,
  onFireTableWave,
}: {
  order: UnifiedOrder
  boardMode: BoardMode
  onMarkServed: (order: UnifiedOrder) => void
  onOpenDetail: (order: UnifiedOrder) => void
  onFireTableWave: (order: UnifiedOrder) => void
}) {
  const elapsed = minutesAgo(order.createdAt)
  const isHistoryCompleted = boardMode === "history" && order.status === "served"
  const tone: OrderTone = isHistoryCompleted ? "completed_history" : statusTone[order.status]
  const isUrgent = order.status === "ready"
  const hasAllergyHint = /allergy|no nuts|no nut|allergic/i.test(order.note ?? "")
  const identifier = getIdentifier(order)
  const canMarkServed = order.status === "ready" && order.source !== "table"
  const nextFireableWaveNumber = getNextFireableWaveNumber(order)
  const canFireNextWave = order.source === "table" && order.status === "served" && nextFireableWaveNumber !== null

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(order)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpenDetail(order)
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col rounded-xl border-l-[3px] border border-white/[0.06] bg-card/60 text-left backdrop-blur-sm transition-all duration-200",
        toneBorderClass[tone],
        toneGlowClass[tone],
        isUrgent && "bg-red-500/[0.04]",
        "hover:-translate-y-0.5 hover:bg-card/80 hover:shadow-lg hover:shadow-black/20"
      )}
      style={isUrgent ? ({ "--glow-urgent": "0 72% 51%" } as React.CSSProperties) : undefined}
    >
      <header className="flex items-center gap-1.5 px-4 pt-3.5 pb-2.5">
        <span
          className={cn(
            "relative inline-flex h-6 w-6 items-center justify-center rounded-full shrink-0",
            toneDotClass[tone]
          )}
        >
          {isUrgent ? <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" /> : null}
          <identifier.Icon className="relative z-10 h-3.5 w-3.5 text-slate-950/90" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("font-mono text-sm font-bold tracking-wide", toneTextClass[tone])}>
              {identifier.text}
            </span>
            <span className={cn("inline-flex h-5 items-center rounded border px-1 text-[10px] font-semibold", sourceChipClass[order.source])}>
              {sourceLabel[order.source]}
            </span>
            <span
              className={cn(
                "inline-flex h-5 items-center rounded border px-1 text-[10px] font-semibold",
                isHistoryCompleted ? historyCompletedTone.chipClass : statusChipClass[order.status]
              )}
            >
              {isHistoryCompleted ? "Completed" : statusChipLabel[order.status]}
            </span>
            {order.paymentState ? (
              <span
                className={cn(
                  "inline-flex h-5 items-center gap-1 rounded border px-1 text-[10px] font-semibold",
                  paymentStateClass[order.paymentState]
                )}
              >
                {order.paymentState === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                <span>{order.paymentState === "paid" ? "Paid" : "Unpaid"}</span>
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1">
              <MapPinned className="h-3 w-3" />
              <span>{order.sectionLabel}</span>
            </span>
            <span className="ml-1.5 inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{order.guestLabel}</span>
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className={cn("mt-0.5 flex items-center justify-end gap-0.5 font-mono text-[11px]", isUrgent ? "text-red-400/80" : "text-muted-foreground/60")}>
            <Clock3 className="h-3 w-3" />
            {elapsed}m
          </div>
          <div className="mt-0.5 text-xs font-semibold text-foreground/90">{order.itemCount} items</div>
        </div>
      </header>

      {isUrgent ? (
        <div className="px-3.5 pb-2">
          <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold leading-tight text-red-400">Items are ready for pickup</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
                Move this order to handoff / served.
              </p>
            </div>
            {canMarkServed ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onMarkServed(order)
                }}
                className="ml-2 inline-flex h-7 shrink-0 items-center gap-1 self-center rounded-md border border-emerald-300/50 bg-emerald-500/20 px-2.5 text-[11px] font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/30"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Served
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {order.waves.length > 0 ? (
        <div className="px-4 pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <WaveStrip waves={order.waves} />
            {canFireNextWave ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onFireTableWave(order)
                }}
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-orange-300/45 bg-orange-500/14 px-2.5 text-[11px] font-semibold text-orange-100 transition-colors hover:bg-orange-500/24"
              >
                <Flame className="h-3.5 w-3.5" />
                Fire W{nextFireableWaveNumber}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {order.note ? (
        <div className={cn("mx-4 mb-2 rounded-md border px-2 py-1.5 text-[11px] italic", hasAllergyHint ? "border-amber-400/30 bg-amber-500/10 text-amber-200/90" : "border-white/10 bg-black/20 text-muted-foreground")}>
          {order.note}
        </div>
      ) : null}

    </article>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [boardMode, setBoardMode] = useState<BoardMode>("live")
  const [sourceFilter, setSourceFilter] = useState<"all" | OrderSource>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | UnifiedStatus>("all")
  const [trackedOrders, setTrackedOrders] = useState<TrackingSnapshot[]>([])
  const [counterDemoStatusOverrides, setCounterDemoStatusOverrides] = useState<Record<string, UnifiedStatus>>({})
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [tableWaveOverrides, setTableWaveOverrides] = useState<Record<string, Record<number, LocalWaveStatus>>>({})
  const [collapsedGroups, setCollapsedGroups] = useState<Set<UnifiedStatus>>(new Set())

  const floorTables = useRestaurantStore((s) => storeTablesToFloorTables(s.tables ?? []))

  useEffect(() => {
    const load = () => setTrackedOrders(getAllTrackingSnapshots())
    load()
    const timer = setInterval(load, 2500)
    return () => clearInterval(timer)
  }, [])

  const handleAdvanceCounterStatus = useCallback(
    (order: UnifiedOrder, nextStatus: "sent" | "preparing" | "ready" | "served") => {
      if (order.source === "table") return

      const mapToTracking = (status: "sent" | "preparing" | "ready" | "served"): TrackingStatus => {
        if (status === "served") return "picked_up"
        return status
      }

      if (order.trackToken) {
        const current = trackedOrders.find((entry) => entry.token === order.trackToken)
        if (current) {
          const next: TrackingSnapshot = {
            ...current,
            status: mapToTracking(nextStatus),
            updatedAt: Date.now(),
          }
          upsertTrackingSnapshot(next)
          setTrackedOrders((prev) => prev.map((entry) => (entry.token === next.token ? next : entry)))
          return
        }
      }

      setCounterDemoStatusOverrides((prev) => ({
        ...prev,
        [order.id]: nextStatus,
      }))
    },
    [trackedOrders]
  )

  const handleMarkServed = useCallback(
    (order: UnifiedOrder) => {
      if (order.status !== "ready" || order.source === "table") return
      handleAdvanceCounterStatus(order, "served")
    },
    [handleAdvanceCounterStatus]
  )

  const allOrders = useMemo(() => {
    const tableOrders = buildTableOrders(floorTables)
    const counterOrders = buildCounterOrders(trackedOrders)
    const demoOrders = buildDemoOrders(Date.now(), counterDemoStatusOverrides)
    const merged = [...tableOrders, ...counterOrders, ...demoOrders].map((order) => {
      const overrides = tableWaveOverrides[order.id] ?? {}
      const wavesWithOverrides = order.waves.map((wave) => ({
        ...wave,
        status: overrides[wave.number] ?? wave.status,
      }))

      if (order.source !== "table") {
        return Object.keys(overrides).length > 0 ? { ...order, waves: wavesWithOverrides } : order
      }

      const derivedStatus = deriveStatusFromOrderWaves(wavesWithOverrides)
      const normalizedWaves = normalizeNewTableWaves(wavesWithOverrides, derivedStatus)
      return {
        ...order,
        waves: normalizedWaves,
        status: deriveStatusFromOrderWaves(normalizedWaves),
      }
    })

    return merged.sort((a, b) => a.createdAt - b.createdAt)
  }, [counterDemoStatusOverrides, floorTables, tableWaveOverrides, trackedOrders])

  const selectedOrder = useMemo(
    () => allOrders.find((order) => order.id === selectedOrderId) ?? null,
    [allOrders, selectedOrderId]
  )

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) {
      setSelectedOrderId(null)
    }
  }, [selectedOrder, selectedOrderId])

  const visibleStatuses = boardMode === "live" ? liveStatusOrder : historyStatusOrder
  const visibleStatusFilters = boardMode === "live" ? liveStatusFilterOrder : historyStatusOrder

  const sourceCounts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = allOrders.filter((order) => {
      if (!isOrderVisibleInBoardMode(order, boardMode)) return false
      if (!q) return true
      return (
        order.label.toLowerCase().includes(q) ||
        order.sectionLabel.toLowerCase().includes(q) ||
        order.guestLabel.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
      )
    })

    return {
      all: base.length,
      table: base.filter((o) => o.source === "table").length,
      pickup: base.filter((o) => o.source === "pickup").length,
      dineIn: base.filter((o) => o.source === "dine_in_no_table").length,
    }
  }, [allOrders, boardMode, query])

  useEffect(() => {
    if (statusFilter !== "all" && !visibleStatuses.includes(statusFilter)) {
      setStatusFilter("all")
    }
  }, [boardMode, statusFilter, visibleStatuses])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allOrders.filter((order) => {
      if (!isOrderVisibleInBoardMode(order, boardMode)) return false
      if (sourceFilter !== "all" && order.source !== sourceFilter) return false
      if (statusFilter !== "all" && order.status !== statusFilter) return false
      if (!q) return true
      return (
        order.label.toLowerCase().includes(q) ||
        order.sectionLabel.toLowerCase().includes(q) ||
        order.guestLabel.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
      )
    })
  }, [allOrders, boardMode, query, sourceFilter, statusFilter])

  const statusCounts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = allOrders.filter((order) => {
      if (!isOrderVisibleInBoardMode(order, boardMode)) return false
      if (sourceFilter !== "all" && order.source !== sourceFilter) return false
      if (!q) return true
      return (
        order.label.toLowerCase().includes(q) ||
        order.sectionLabel.toLowerCase().includes(q) ||
        order.guestLabel.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
      )
    })

    return base.reduce<Record<UnifiedStatus, number>>(
      (acc, order) => {
        acc[order.status] += 1
        return acc
      },
      {
        sent: 0,
        preparing: 0,
        ready: 0,
        served: 0,
        closed: 0,
        voided: 0,
        refunded: 0,
      }
    )
  }, [allOrders, boardMode, query, sourceFilter])

  const groupedOrders = useMemo(
    () => visibleStatuses.map((status) => ({ status, orders: filtered.filter((order) => order.status === status) })),
    [filtered, visibleStatuses]
  )

  const toggleGroup = useCallback((status: UnifiedStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }, [])

  const handleOpenOrder = useCallback(
    (order: UnifiedOrder) => {
      if (order.source === "table" && order.id.startsWith("table-")) {
        const tableId = order.id.slice("table-".length)
        router.push(`/table/${tableId}`)
        return
      }
      setSelectedOrderId(order.id)
    },
    [router]
  )

const handleFireTableWave = useCallback((order: UnifiedOrder) => {
    if (order.source !== "table") return
    const nextWave = getNextFireableWaveNumber(order)
    if (!nextWave) return

    setTableWaveOverrides((prev) => ({
      ...prev,
      [order.id]: {
        ...(prev[order.id] ?? {}),
        [nextWave]: "fired",
      },
    }))
  }, [])

  const selectedIdentifier = selectedOrder ? getIdentifier(selectedOrder) : null
  const selectedElapsedMinutes = selectedOrder ? minutesAgo(selectedOrder.createdAt) : 0
  const selectedIsCounterOrder = selectedOrder?.source === "pickup" || selectedOrder?.source === "dine_in_no_table"
  const selectedIsCounterDineIn = selectedOrder?.source === "dine_in_no_table"
  const selectedSourceLabel =
    selectedOrder?.source === "dine_in_no_table"
      ? "Dine-In"
      : selectedOrder
        ? sourceLabel[selectedOrder.source]
        : ""
  const selectedFlowIndex = selectedOrder ? getCounterFlowIndex(selectedOrder.status) : 0
  const selectedTargetEtaMinutes = selectedOrder
    ? selectedOrder.source === "pickup"
      ? 18
      : selectedOrder.source === "dine_in_no_table"
        ? 14
        : 20
    : 20
  const selectedEtaRemaining = Math.max(0, selectedTargetEtaMinutes - selectedElapsedMinutes)
  const selectedEtaLate = selectedElapsedMinutes > selectedTargetEtaMinutes
  const selectedCurrentStageMinutes = selectedOrder
    ? Math.max(0, Math.round((Date.now() - selectedOrder.updatedAt) / 60000))
    : 0
  const selectedPriorStageMinutes = Math.max(0, selectedElapsedMinutes - selectedCurrentStageMinutes)
  const selectedPerCompletedStageMinutes =
    selectedFlowIndex > 0 ? Math.round(selectedPriorStageMinutes / selectedFlowIndex) : 0

  return (
    <main className="h-full bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_84%_0%,rgba(16,185,129,0.12),transparent_32%),hsl(222,24%,8%)] text-foreground">
      <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col p-3 md:p-4">
        <header className="sticky top-0 z-20 rounded-xl border border-white/10 bg-[hsl(224,18%,12%)]/88 p-3 backdrop-blur-md">
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
            <div className="flex items-center gap-1.5">
              <div className="inline-flex h-8 items-center rounded-md border border-white/15 bg-black/25 p-0.5">
                <button
                  type="button"
                  onClick={() => setBoardMode("live")}
                  className={cn(
                    "h-7 rounded px-2 text-[11px] font-semibold transition-colors",
                    boardMode === "live"
                      ? "bg-cyan-500/20 text-cyan-100"
                      : "text-muted-foreground hover:bg-white/[0.06]"
                  )}
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => setBoardMode("history")}
                  className={cn(
                    "h-7 rounded px-2 text-[11px] font-semibold transition-colors",
                    boardMode === "history"
                      ? "bg-fuchsia-500/20 text-fuchsia-100"
                      : "text-muted-foreground hover:bg-white/[0.06]"
                  )}
                >
                  History
                </button>
              </div>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search table, ticket, guest, item..."
                  className="h-9 border-white/15 bg-black/20 pl-8"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {[
                { id: "all" as const, label: `All (${sourceCounts.all})` },
                { id: "table" as const, label: `Table (${sourceCounts.table})`, Icon: HandPlatter },
                { id: "pickup" as const, label: `Pickup (${sourceCounts.pickup})`, Icon: ShoppingBag },
                { id: "dine_in_no_table" as const, label: `Dine-In (${sourceCounts.dineIn})`, Icon: Store },
              ].map((filter) => {
                const Icon = "Icon" in filter ? filter.Icon : undefined
                return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSourceFilter(filter.id)}
                  className={cn(
                    "h-8 rounded-md border px-2.5 text-xs font-semibold transition-colors",
                    sourceFilter === filter.id
                      ? "border-cyan-300/55 bg-cyan-500/18 text-cyan-100"
                      : "border-white/15 text-muted-foreground hover:bg-white/[0.06]"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    <span>{filter.label}</span>
                  </span>
                </button>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {(["all", ...visibleStatusFilters] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "h-8 rounded-md border px-2.5 text-xs font-semibold capitalize transition-all duration-150",
                    statusFilter === status && "shadow-[0_0_0_1px_rgba(255,255,255,0.28),0_0_16px_rgba(56,189,248,0.16)] -translate-y-[1px]",
                    status === "all"
                      ? statusFilter === "all"
                        ? "border-cyan-300/55 bg-cyan-500/18 text-cyan-100"
                        : "border-white/15 text-muted-foreground hover:bg-white/[0.06]"
                      : statusFilter === status
                        ? boardMode === "history" && status === "served"
                          ? historyCompletedTone.filterActive
                          : statusFilterToneClass[status].active
                        : boardMode === "history" && status === "served"
                          ? historyCompletedTone.filterIdle
                          : statusFilterToneClass[status].idle
                  )}
                >
                  {status === "all" ? (
                    `All (${visibleStatusFilters.reduce((sum, key) => sum + statusCounts[key], 0)})`
                  ) : (
                    `${boardMode === "history" && status === "served" ? "Completed" : statusFilterLabel[status]} (${statusCounts[status]})`
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="col-span-full flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
              <ShoppingBag className="h-6 w-6 text-muted-foreground/60" />
              <div className="text-sm font-semibold text-foreground">No matching orders</div>
              <div className="text-xs text-muted-foreground">
                {boardMode === "live"
                  ? "Try changing search or status filters. Live board only includes New, Preparing, Ready, and Served."
                  : "Try changing search or status filters. History includes Closed, Voided, and Refunded."}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {groupedOrders.map(({ status, orders }) => {
                if (orders.length === 0) return null
                const tone = statusTone[status]
                const isCollapsed = collapsedGroups.has(status)
                const isHistoryCompleted = boardMode === "history" && status === "served"
                return (
                  <div key={status}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(status)}
                      className={cn(
                        "sticky top-0 z-10 flex w-full items-center gap-2.5 border-b border-white/[0.04] bg-background/85 px-4 py-2.5 text-left backdrop-blur-md transition-colors hover:bg-white/[0.02]"
                      )}
                      aria-expanded={!isCollapsed}
                      aria-label={`${isHistoryCompleted ? "COMPLETED" : groupLabel[status]} group, ${orders.length} orders`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: isHistoryCompleted ? historyCompletedTone.accent : toneAccentColor[tone] }}
                      />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                        {isHistoryCompleted ? "COMPLETED" : groupLabel[status]}
                      </span>
                      <span
                        className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                        style={{
                          backgroundColor: isHistoryCompleted ? historyCompletedTone.accentBg : toneAccentBg[tone],
                          color: isHistoryCompleted ? historyCompletedTone.accent : toneAccentColor[tone],
                        }}
                      >
                        {orders.length}
                      </span>
                      <div className="ml-2 flex-1 border-t border-white/[0.04]" />
                      {isCollapsed ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </button>
                    {!isCollapsed ? (
                      <div className="px-3 pb-4 pt-2 md:px-5">
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {orders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            boardMode={boardMode}
                            onMarkServed={handleMarkServed}
                            onOpenDetail={handleOpenOrder}
                            onFireTableWave={handleFireTableWave}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
          <SheetContent
            side="right"
            className="w-full border-l border-white/15 bg-[linear-gradient(180deg,rgba(8,13,24,0.98),rgba(12,19,34,0.97))] p-0 sm:max-w-[520px]"
          >
            {selectedOrder && selectedIdentifier ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-4 pb-4 pt-5">
                  <SheetHeader className="space-y-1 text-left">
                    <SheetTitle className="flex items-center gap-2 text-cyan-100">
                      <selectedIdentifier.Icon className="h-4 w-4" />
                      <span>{selectedIdentifier.text}</span>
                      {selectedIsCounterOrder ? (
                        <>
                          <span
                            className={cn(
                              "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold",
                              paymentStateClass[selectedOrder.paymentState ?? "unpaid"]
                            )}
                          >
                            {selectedOrder.paymentState === "paid" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                            <span>{selectedOrder.paymentState === "paid" ? "Paid" : "Unpaid"}</span>
                          </span>
                          {selectedOrder.paymentState === "paid" && selectedOrder.paymentMethod ? (
                            <span
                              className={cn(
                                "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold",
                                paymentMethodClass[selectedOrder.paymentMethod]
                              )}
                            >
                              {selectedOrder.paymentMethod === "card" ? <CreditCard className="h-3.5 w-3.5" /> : null}
                              {selectedOrder.paymentMethod === "cash" ? <Banknote className="h-3.5 w-3.5" /> : null}
                              {selectedOrder.paymentMethod === "other" ? <ShoppingBag className="h-3.5 w-3.5" /> : null}
                              <span className="capitalize">{selectedOrder.paymentMethod}</span>
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Opened {formatDateTime(selectedOrder.createdAt)} · {selectedElapsedMinutes}m ago
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className={cn("inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold", sourceChipClass[selectedOrder.source])}>
                      {selectedOrder.source === "dine_in_no_table" ? <Store className="h-3.5 w-3.5" /> : null}
                      {selectedOrder.source === "pickup" ? <ShoppingBag className="h-3.5 w-3.5" /> : null}
                      <span>{selectedSourceLabel}</span>
                    </span>
                    {selectedIsCounterOrder ? (
                      <span className="inline-flex h-6 items-center gap-1 rounded-md border border-white/15 bg-white/[0.05] px-2 text-[11px] text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {selectedIsCounterDineIn
                            ? selectedOrder.guestLabel.match(/\d+/)?.[0] ?? selectedOrder.guestLabel
                            : selectedOrder.guestLabel}
                        </span>
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-semibold",
                        boardMode === "history" && selectedOrder.status === "served"
                          ? historyCompletedTone.chipClass
                          : statusChipClass[selectedOrder.status]
                      )}
                    >
                      {boardMode === "history" && selectedOrder.status === "served" ? "Completed" : statusChipLabel[selectedOrder.status]}
                    </span>
                    {!selectedIsCounterOrder ? (
                      <span className="inline-flex h-6 items-center rounded-md border border-white/15 bg-white/[0.05] px-2 text-[11px] text-muted-foreground">
                        {selectedOrder.sectionLabel}
                      </span>
                    ) : null}
                    {!selectedIsCounterOrder ? (
                      <span className="inline-flex h-6 items-center rounded-md border border-white/15 bg-white/[0.05] px-2 text-[11px] text-muted-foreground">
                        {selectedOrder.guestLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  {selectedIsCounterOrder ? (
                    <section className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Meal Progress
                      </h3>
                      <div className="grid grid-cols-4 gap-1.5">
                        {counterStatusFlow.map((stepStatus, index) => (
                          <div
                            key={stepStatus}
                            className={cn(
                              "rounded-md border px-2 py-1.5 text-center",
                              index <= selectedFlowIndex
                                ? statusFilterToneClass[stepStatus].idle
                                : "border-white/10 bg-black/20 text-muted-foreground"
                            )}
                          >
                            <p className="text-[10px] font-semibold">{statusChipLabel[stepStatus]}</p>
                            <p className="mt-0.5 text-[9px] font-medium opacity-85">
                              {index < selectedFlowIndex
                                ? formatMinutesCompact(selectedPerCompletedStageMinutes)
                                : index === selectedFlowIndex
                                  ? formatMinutesCompact(selectedCurrentStageMinutes)
                                  : "0m"}
                            </p>
                          </div>
                        ))}
                      </div>
                      {selectedOrder.status === "ready" ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdvanceCounterStatus(selectedOrder, "served")}
                            className="inline-flex h-8 items-center rounded-md border border-emerald-300/50 bg-emerald-500/20 px-3 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/30"
                          >
                            Mark Served
                          </button>
                        </div>
                      ) : null}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
                        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
                          <p className="text-[10px] text-muted-foreground">Target</p>
                          <p className="font-semibold text-foreground">{selectedTargetEtaMinutes}m</p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
                          <p className="text-[10px] text-muted-foreground">Elapsed</p>
                          <p className="font-semibold text-foreground">{selectedElapsedMinutes}m</p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
                          <p className="text-[10px] text-muted-foreground">ETA</p>
                          <p className={cn("font-semibold", selectedEtaLate ? "text-red-300" : "text-emerald-200")}>
                            {selectedEtaLate ? `+${selectedElapsedMinutes - selectedTargetEtaMinutes}m` : `${selectedEtaRemaining}m`}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {selectedEtaLate
                          ? "Order is beyond target time."
                          : "On track for pickup handoff."}
                      </p>
                    </section>
                  ) : null}

                  {selectedOrder.waves.length > 0 ? (
                    <section>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Waves
                      </h3>
                      <WaveStrip waves={selectedOrder.waves} />
                    </section>
                  ) : null}

                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Items
                      </h3>
                      <span className="text-xs text-muted-foreground">{selectedOrder.itemCount} items</span>
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {item.qty}x {item.name}
                            </p>
                          </div>
                          <span className="ml-3 inline-flex h-5 items-center rounded border border-white/15 px-1.5 text-[10px] font-semibold text-muted-foreground">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {selectedOrder.note ? (
                    <section className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs italic text-amber-200/90">
                      {selectedOrder.note}
                    </section>
                  ) : null}
                </div>

                <div className="border-t border-white/10 p-4" />
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </main>
  )
}
