"use client"

export type TrackingServiceType = "pickup" | "dine_in_no_table"
export type TrackingStatus =
  | "sent"
  | "preparing"
  | "ready"
  | "picked_up"
  | "closed"
  | "voided"
  | "refunded"

export type TrackingLine = {
  id: string
  name: string
  qty: number
  status: "active" | "voided"
}

export type TrackingSnapshot = {
  token: string
  code: string
  serviceType: TrackingServiceType
  status: TrackingStatus
  createdAt: number
  updatedAt: number
  customerName: string
  orderNote: string
  items: TrackingLine[]
}

const STORAGE_KEY = "counter_order_tracking_v1"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage
}

function readRaw(): Record<string, TrackingSnapshot> {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, TrackingSnapshot>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeRaw(value: Record<string, TrackingSnapshot>) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage write failures in mock mode.
  }
}

export function createTrackingToken(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `trk_${Date.now().toString(36)}_${rand}`
}

export function upsertTrackingSnapshot(snapshot: TrackingSnapshot) {
  const all = readRaw()
  all[snapshot.token] = snapshot
  writeRaw(all)
}

export function getTrackingSnapshot(token: string): TrackingSnapshot | null {
  const all = readRaw()
  return all[token] ?? null
}

export function getAllTrackingSnapshots(): TrackingSnapshot[] {
  const all = readRaw()
  return Object.values(all).sort((a, b) => b.updatedAt - a.updatedAt)
}
