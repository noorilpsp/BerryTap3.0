"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { X, Loader2, Check, Trash2, Clock, ExternalLink, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { FormGuestSearch } from "./form-guest-search"
import { FormBookingDetails } from "./form-booking-details"
import { FormTableAssignment } from "./form-table-assignment"
import { FormTagsNotes } from "./form-tags-notes"
import { FormConfirmation } from "./form-confirmation"
import { FormSidePanels } from "./form-side-panels"
import { FormMobileWizard } from "./form-mobile-wizard"
import {
  getBlocksForTable,
  getMergedForTable,
  getTableLanesFromStore,
  restaurantConfig as timelineRestaurantConfig,
  tableLanes as fallbackTableLanes,
  zones as timelineZones,
} from "@/lib/timeline-data"
import { useRestaurantStore } from "@/store/restaurantStore"
import {
  type GuestProfile,
  type FormTag,
  type ReservationFormData,
  type EditModeData,
  type TableAssignMode,
  type BookingChannel,
  defaultFormData,
  editFormData,
  sampleEditData,
  guestDatabase,
  getDurationForParty,
  getConflictsForSelection,
} from "@/lib/reservation-form-data"

type ReservationFormPrefill = Partial<
  Pick<
    ReservationFormData,
    | "guestName"
    | "guestId"
    | "phone"
    | "email"
    | "date"
    | "time"
    | "partySize"
    | "duration"
    | "tableAssignMode"
    | "assignedTable"
    | "zonePreference"
    | "tags"
    | "allergyDetail"
    | "notes"
    | "channel"
    | "sendSms"
    | "sendEmail"
    | "requireDeposit"
    | "depositAmount"
    | "addToCalendar"
  >
> & {
  durationMax?: number
  servicePeriodId?: string
}

interface ReservationFormViewProps {
  mode?: "create" | "edit"
  prefill?: ReservationFormPrefill
  onRequestClose?: () => void
}

const PAST_SLOT_GRACE_MINUTES = 8
const ZONE_LABELS: Record<string, string> = {
  any: "All zones",
  main: "Main Dining",
  patio: "Patio",
  private: "Private Room",
}

type TimeFitSnapshot = {
  tone: "open" | "busy" | "tight" | "short" | "full" | "closed"
  label: string
  available: number
  total: number
  ratio: number
  maxDurationMinutes?: number
  shortCount?: number
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
  // Support service-period boundaries like "24:00" (end of day).
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

function getBlockingWindowsForTable(tableId: string, selectedDate?: string): BlockingWindow[] {
  const reservationWindows = getBlocksForTable(tableId)
    .filter((block) => !selectedDate || !block.date || block.date === selectedDate)
    .filter((block) => !["unconfirmed", "completed", "no-show", "cancelled"].includes(block.status))
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

function normalizeTime24(timeValue: string): string {
  const minutes = toMinutes(timeValue)
  if (!Number.isFinite(minutes)) return timeValue
  return toTime24(minutes)
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h >= 12 ? "PM" : "AM"
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`
}

function getServiceBoundsForTime(time: string, servicePeriodId?: string): { start: number; end: number } {
  if (servicePeriodId) {
    const forcedPeriod = timelineRestaurantConfig.servicePeriods.find((period) => period.id === servicePeriodId)
    if (forcedPeriod) {
      const start = toMinutes(forcedPeriod.start)
      let end = toMinutes(forcedPeriod.end)
      if (end <= start) end += 24 * 60
      return { start, end }
    }
  }

  const selectedMin = toMinutes(time)
  const matching = timelineRestaurantConfig.servicePeriods
    .map((period) => {
      const start = toMinutes(period.start)
      let end = toMinutes(period.end)
      if (end <= start) end += 24 * 60
      let selected = selectedMin
      if (selected < start) selected += 24 * 60
      if (selected >= start && selected < end) return { start, end }
      return undefined
    })
    .find((value): value is { start: number; end: number } => typeof value !== "undefined")

  if (matching) return matching

  const fallback = timelineRestaurantConfig.servicePeriods.find((period) => period.id === "dinner")
    ?? timelineRestaurantConfig.servicePeriods[0]
  const fallbackStart = toMinutes(fallback.start)
  let fallbackEnd = toMinutes(fallback.end)
  if (fallbackEnd <= fallbackStart) fallbackEnd += 24 * 60
  return { start: fallbackStart, end: fallbackEnd }
}

function isIsoToday(isoDate?: string): boolean {
  if (!isoDate) return false
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return false
  const now = new Date()
  return (
    parsed.getFullYear() === now.getFullYear()
    && parsed.getMonth() === now.getMonth()
    && parsed.getDate() === now.getDate()
  )
}

function isIsoInPast(isoDate?: string): boolean {
  if (!isoDate) return false
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return false
  parsed.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsed < today
}

function getTodayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getOpenTimes(baseTime: string, servicePeriodId?: string, selectedDate?: string): string[] {
  const { start, end } = getServiceBoundsForTime(baseTime, servicePeriodId)
  let effectiveStart = start
  let graceSlotStart: number | null = null
  if (isIsoToday(selectedDate)) {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const roundedNow = Math.ceil(nowMinutes / 15) * 15
    const flooredNow = Math.floor(nowMinutes / 15) * 15
    effectiveStart = Math.max(start, roundedNow)
    const startedAgo = nowMinutes - flooredNow
    const canIncludeGraceSlot = (
      startedAgo > 0
      && startedAgo <= PAST_SLOT_GRACE_MINUTES
      && flooredNow >= start
      && flooredNow < end
      && flooredNow < effectiveStart
    )
    if (canIncludeGraceSlot) {
      graceSlotStart = flooredNow
    }
  }
  // If the selected service period for today is already over, keep showing the
  // full service window instead of collapsing the picker to a single fallback time.
  if (effectiveStart >= end) {
    effectiveStart = start
    graceSlotStart = null
  }
  const times: string[] = []
  if (graceSlotStart !== null) {
    times.push(toTime24(graceSlotStart))
  }
  for (let minute = effectiveStart; minute < end; minute += 15) {
    times.push(toTime24(minute))
  }
  return times
}

function getContinuousWindowMetaForTable(
  tableId: string,
  startTime: string,
  servicePeriodId?: string,
  selectedDate?: string,
  tableLanes?: { id: string; label: string }[]
): {
  availableMinutes: number
  boundaryKind: "none" | "service-end" | "next-reservation"
  boundaryTime?: string
  tableLabel: string
} {
  const selectedStart = toMinutes(startTime)
  const lanes = tableLanes ?? fallbackTableLanes
  const tableLabel = lanes.find((lane) => lane.id === tableId)?.label ?? tableId
  if (!Number.isFinite(selectedStart)) {
    return {
      availableMinutes: 0,
      boundaryKind: "none",
      tableLabel,
    }
  }

  const normalize = (value: number): number => {
    let normalized = value
    while (normalized <= selectedStart) normalized += 24 * 60
    return normalized
  }

  const blockingWindows = getBlockingWindowsForTable(tableId, selectedDate)

  const hasOverlapAtStart = blockingWindows.some((window) => {
    const rawStart = toMinutes(window.startTime)
    const rawEnd = toMinutes(window.endTime)
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return false
    const { start, end } = normalizeBlockWindow(rawStart, rawEnd, selectedStart)
    return selectedStart >= start && selectedStart < end
  })
  if (hasOverlapAtStart) {
    return {
      availableMinutes: 0,
      boundaryKind: "next-reservation",
      tableLabel,
    }
  }

  let serviceEnd = getServiceBoundsForTime(startTime, servicePeriodId).end
  while (serviceEnd <= selectedStart) serviceEnd += 24 * 60

  const nextReservationStart = blockingWindows
    .map((window) => {
      const rawStart = toMinutes(window.startTime)
      if (!Number.isFinite(rawStart)) return undefined
      return normalize(rawStart)
    })
    .filter((start): start is number => typeof start === "number")
    .filter((start) => start > selectedStart)
    .sort((a, b) => a - b)[0]

  const boundaryCandidates: Array<{ minute: number; kind: "service-end" | "next-reservation" }> = [
    { minute: serviceEnd, kind: "service-end" },
  ]
  if (typeof nextReservationStart === "number") {
    boundaryCandidates.push({ minute: nextReservationStart, kind: "next-reservation" })
  }

  const earliestBoundary = boundaryCandidates.sort((a, b) => a.minute - b.minute)[0]
  const availableMinutes = Math.max(0, earliestBoundary.minute - selectedStart)

  return {
    availableMinutes,
    boundaryKind: earliestBoundary.kind,
    boundaryTime: toTime24(earliestBoundary.minute),
    tableLabel,
  }
}

function getAvailableTimesForTable(
  tableId: string | null,
  baseTime: string,
  duration: number,
  servicePeriodId?: string,
  selectedDate?: string,
  tableLanes?: { id: string; label: string }[]
): string[] {
  const openTimes = getOpenTimes(baseTime, servicePeriodId, selectedDate)
  if (!tableId) return openTimes

  return openTimes.filter((time) => {
    const window = getContinuousWindowMetaForTable(tableId, time, servicePeriodId, selectedDate, tableLanes)
    return window.availableMinutes >= duration
  })
}

function pickNearestAvailableTime(currentTime: string, options: string[]): string {
  if (options.length === 0) return currentTime
  const sorted = [...options].sort((a, b) => toMinutes(a) - toMinutes(b))
  const currentMin = toMinutes(currentTime)
  return sorted.find((time) => toMinutes(time) >= currentMin) ?? sorted[0]
}

function resolveDurationConstraints(time: string, tableId: string | null, partySize: number, servicePeriodId?: string, selectedDate?: string) {
  const recommended = getDurationForParty(partySize)
  if (!tableId) {
    return { durationDefault: recommended, durationMax: undefined as number | undefined }
  }

  const selectedMin = toMinutes(time)
  if (!Number.isFinite(selectedMin)) {
    return { durationDefault: recommended, durationMax: undefined as number | undefined }
  }
  const normalize = (min: number) => (min < selectedMin ? min + 24 * 60 : min)
  const selectedNormalized = normalize(selectedMin)

  const nextReservationStart = getBlockingWindowsForTable(tableId, selectedDate)
    .map((window) => {
      const start = toMinutes(window.startTime)
      return Number.isFinite(start) ? normalize(start) : undefined
    })
    .filter((start): start is number => typeof start === "number")
    .filter((start) => start > selectedNormalized)
    .sort((a, b) => a - b)[0]

  const serviceEnd = getServiceBoundsForTime(time, servicePeriodId).end

  const boundary = [nextReservationStart, serviceEnd]
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => a - b)[0]

  if (boundary === undefined) {
    return { durationDefault: recommended, durationMax: undefined as number | undefined }
  }

  const availableRaw = Math.max(0, boundary - selectedNormalized)
  const availableRounded = Math.floor(availableRaw / 15) * 15
  if (availableRounded < 15) {
    return { durationDefault: recommended, durationMax: 0 }
  }
  const durationDefault = Math.min(recommended, availableRounded)

  return { durationDefault, durationMax: availableRounded }
}

function isTableAvailableForWindow(tableId: string, startTime: string, duration: number): boolean {
  const selectedStart = toMinutes(startTime)
  if (!Number.isFinite(selectedStart)) return false
  const selectedEnd = selectedStart + duration

  return !getBlockingWindowsForTable(tableId, undefined).some((window) => {
    const rawStart = toMinutes(window.startTime)
    const rawEnd = toMinutes(window.endTime)
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return false
    const { start, end } = normalizeBlockWindow(rawStart, rawEnd, selectedStart)
    return selectedStart < end && selectedEnd > start
  })
}

function buildTimeFitMap(
  times: string[],
  partySize: number,
  zonePreference: string,
  duration: number,
  assignedTable: string | null,
  servicePeriodId?: string,
  selectedDate?: string,
  tableLanes: { id: string; label: string; seats: number; zone: string }[] = fallbackTableLanes
): Record<string, TimeFitSnapshot> {
  const eligibleTables = assignedTable
    ? tableLanes.filter((lane) => lane.id === assignedTable && lane.seats >= partySize)
    : tableLanes.filter((lane) => (
        lane.seats >= partySize
        && (zonePreference === "any" || lane.zone === zonePreference)
      ))
  const total = eligibleTables.length

  return times.reduce<Record<string, TimeFitSnapshot>>((acc, time) => {
    if (total === 0) {
      acc[time] = {
        tone: "closed",
        label: "no fit",
        available: 0,
        total: 0,
        ratio: 0,
      }
      return acc
    }

    const windows = eligibleTables.map((lane) => getContinuousWindowMetaForTable(lane.id, time, servicePeriodId, selectedDate, tableLanes))
    const available = windows.filter((window) => window.availableMinutes >= duration).length
    const shortWindows = windows.filter((window) => window.availableMinutes >= 15 && window.availableMinutes < duration)
    const shortCount = shortWindows.length
    const maxShortWindow = shortWindows.sort((a, b) => b.availableMinutes - a.availableMinutes)[0]
    const maxDurationMinutes = maxShortWindow?.availableMinutes ?? 0
    const ratio = available / total
    const tone: TimeFitSnapshot["tone"] = (
      available > 0
        ? ratio <= 0.33 ? "tight"
          : ratio <= 0.66 ? "busy"
          : "open"
        : shortCount > 0
          ? "short"
          : "full"
    )

    acc[time] = {
      tone,
      label:
        available > 0
          ? `${available}/${total} fit`
          : shortCount > 0
            ? `${shortCount}/${total} fit`
            : "unavailable",
      available,
      total,
      ratio,
      maxDurationMinutes,
      shortCount,
    }
    return acc
  }, {})
}

export function ReservationFormView({ mode = "create", prefill, onRequestClose }: ReservationFormViewProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const storeTables = useRestaurantStore((s) => s.tables)
  const tableLanes = useMemo(
    () => (storeTables.length > 0 ? getTableLanesFromStore(storeTables) : fallbackTableLanes),
    [storeTables]
  )

  const isEdit = mode === "edit"
  const editData: EditModeData | null = isEdit ? sampleEditData : null
  const prefillDurationMax = prefill?.durationMax && Number.isFinite(prefill.durationMax)
    ? Math.max(15, prefill.durationMax)
    : undefined
  const servicePeriodId = prefill?.servicePeriodId
  const prefillTimeNormalized = prefill?.time ? normalizeTime24(prefill.time) : undefined
  const prefillAssignedTable = prefill?.assignedTable ?? null

  const clampDuration = useCallback((candidate: number, max?: number): number => {
    if (!max) return candidate
    return Math.min(candidate, max)
  }, [])

  const [form, setForm] = useState<ReservationFormData>(() => {
    const base: ReservationFormData = isEdit ? { ...editFormData } : { ...defaultFormData }

    if (typeof prefill?.guestName !== "undefined") base.guestName = prefill.guestName
    if (typeof prefill?.guestId !== "undefined") base.guestId = prefill.guestId
    if (typeof prefill?.phone !== "undefined") base.phone = prefill.phone
    if (typeof prefill?.email !== "undefined") base.email = prefill.email
    if (typeof prefill?.date !== "undefined") base.date = prefill.date
    if (typeof prefill?.time !== "undefined" && prefill.time) base.time = normalizeTime24(prefill.time)
    if (typeof prefill?.zonePreference !== "undefined" && prefill.zonePreference) base.zonePreference = prefill.zonePreference
    if (typeof prefill?.tags !== "undefined") base.tags = [...prefill.tags]
    if (typeof prefill?.allergyDetail !== "undefined") base.allergyDetail = prefill.allergyDetail
    if (typeof prefill?.notes !== "undefined") base.notes = prefill.notes
    if (typeof prefill?.channel !== "undefined") base.channel = prefill.channel
    if (typeof prefill?.sendSms !== "undefined") base.sendSms = prefill.sendSms
    if (typeof prefill?.sendEmail !== "undefined") base.sendEmail = prefill.sendEmail
    if (typeof prefill?.requireDeposit !== "undefined") base.requireDeposit = prefill.requireDeposit
    if (typeof prefill?.depositAmount !== "undefined") base.depositAmount = prefill.depositAmount
    if (typeof prefill?.addToCalendar !== "undefined") base.addToCalendar = prefill.addToCalendar

    if (typeof prefill?.partySize === "number" && Number.isFinite(prefill.partySize)) {
      base.partySize = Math.max(1, Math.min(12, prefill.partySize))
      base.duration = getDurationForParty(base.partySize)
    }

    if (typeof prefill?.assignedTable !== "undefined") {
      base.assignedTable = prefill.assignedTable ?? null
      if (!prefill?.tableAssignMode && prefill.assignedTable) {
        base.tableAssignMode = "manual"
      }
      if (!prefill?.zonePreference && prefill.assignedTable) {
        const prefilledLane = tableLanes.find((table) => table.id === prefill.assignedTable)
        if (prefilledLane) {
          base.zonePreference = prefilledLane.zone
        }
      }
    }

    if (typeof prefill?.tableAssignMode !== "undefined") {
      base.tableAssignMode = prefill.tableAssignMode
    }

    if (typeof prefill?.duration === "number" && Number.isFinite(prefill.duration)) {
      base.duration = clampDuration(prefill.duration, prefillDurationMax)
    } else {
      base.duration = clampDuration(base.duration, prefillDurationMax)
    }

    return base
  })
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(() => {
    const prefilledGuestId = prefill?.guestId ?? (isEdit ? editFormData.guestId : null)
    if (prefilledGuestId) {
      const guestById = guestDatabase.find((guest) => guest.id === prefilledGuestId)
      if (guestById) return guestById
    }

    const prefilledPhone = prefill?.phone ?? (isEdit ? editFormData.phone : "")
    if (prefilledPhone) {
      const guestByPhone = guestDatabase.find((guest) => guest.phone === prefilledPhone)
      if (guestByPhone) return guestByPhone
    }

    const prefilledName = prefill?.guestName ?? (isEdit ? editFormData.guestName : "")
    if (prefilledName) {
      const lowered = prefilledName.toLowerCase().trim()
      const guestByName = guestDatabase.find((guest) => guest.name.toLowerCase() === lowered)
      if (guestByName) return guestByName
    }

    return null
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showSidePanel, setShowSidePanel] = useState(true)

  const dynamicConstraints = useMemo(
    () => resolveDurationConstraints(form.time, form.assignedTable, form.partySize, servicePeriodId, form.date),
    [form.time, form.assignedTable, form.partySize, servicePeriodId, form.date]
  )
  const availableTimes = useMemo(
    () => getAvailableTimesForTable(form.assignedTable, form.time, form.duration, servicePeriodId, form.date, tableLanes),
    [form.assignedTable, form.date, form.duration, form.time, servicePeriodId, tableLanes]
  )
  const openTimes = useMemo(
    () => getOpenTimes(form.time, servicePeriodId, form.date),
    [form.date, form.time, servicePeriodId]
  )
  const timeFitByTime = useMemo(
    () => buildTimeFitMap(openTimes, form.partySize, form.zonePreference, form.duration, form.assignedTable, servicePeriodId, form.date, tableLanes),
    [form.assignedTable, form.date, form.duration, form.partySize, form.zonePreference, openTimes, servicePeriodId, tableLanes]
  )
  const fitContextLabel = useMemo(
    () => `${ZONE_LABELS[form.zonePreference] ?? "All zones"} · ${form.partySize}p`,
    [form.partySize, form.zonePreference]
  )
  const useSlotPrefillDurationMax = (
    mode === "create"
    && typeof prefillDurationMax === "number"
    && Number.isFinite(prefillDurationMax)
    && form.time === prefillTimeNormalized
    && form.assignedTable === prefillAssignedTable
  )
  const effectiveDurationMax = useSlotPrefillDurationMax
    ? Math.max(prefillDurationMax, dynamicConstraints.durationMax ?? 0)
    : dynamicConstraints.durationMax
  const selectedTableMeta = useMemo(
    () => (form.assignedTable ? tableLanes.find((table) => table.id === form.assignedTable) : undefined),
    [form.assignedTable, tableLanes]
  )
  const tableSeatLimit = selectedTableMeta?.seats
  const tableSeatLabel = selectedTableMeta?.label

  const updateForm = useCallback((partial: Partial<ReservationFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }, [])

  useEffect(() => {
    if (mode !== "create") return
    if (!isIsoInPast(form.date)) return

    const todayIso = getTodayIsoDate()
    const todayTimes = getOpenTimes(form.time, servicePeriodId, todayIso)
    const fallbackTime = todayTimes[0] ?? form.time
    const nextConstraints = resolveDurationConstraints(fallbackTime, form.assignedTable, form.partySize, servicePeriodId)

    updateForm({
      date: todayIso,
      time: fallbackTime,
      duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax),
    })
  }, [clampDuration, form.assignedTable, form.date, form.partySize, form.time, mode, servicePeriodId, updateForm])

  useEffect(() => {
    if (availableTimes.length === 0) return
    if (availableTimes.includes(form.time)) return

    const nextTime = pickNearestAvailableTime(form.time, availableTimes)
    const nextConstraints = resolveDurationConstraints(nextTime, form.assignedTable, form.partySize, servicePeriodId)
    updateForm({
      time: nextTime,
      duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax),
    })
  }, [availableTimes, clampDuration, form.assignedTable, form.partySize, form.time, servicePeriodId, updateForm])

  useEffect(() => {
    if (!form.assignedTable) return
    const lane = tableLanes.find((table) => table.id === form.assignedTable)
    if (!lane) return
    if (lane.seats >= form.partySize) return
    updateForm({ assignedTable: null })
  }, [form.assignedTable, form.partySize, updateForm])

  const handleSelectGuest = useCallback(
    (guest: GuestProfile) => {
      setSelectedGuest(guest)
      const tags: FormTag[] = [...form.tags]
      if (guest.tags.includes("vip") && !tags.includes("vip")) tags.push("vip")
      if (guest.tags.includes("high-value") && !tags.includes("high-value")) tags.push("high-value")
      if (guest.tags.includes("first-timer") && !tags.includes("first-timer")) tags.push("first-timer")
      if (guest.allergies.length > 0 && !tags.includes("allergy")) tags.push("allergy")

      updateForm({
        guestName: guest.name,
        guestId: guest.id,
        phone: guest.phone,
        email: guest.email,
        allergyDetail: guest.allergies.join(", "),
        notes: guest.preferences.length > 0
          ? `${guest.preferences.join(". ")}. ${form.notes || ""}`.trim()
          : form.notes,
        tags,
      })
    },
    [form.tags, form.notes, updateForm]
  )

  const handleClearGuest = useCallback(() => {
    setSelectedGuest(null)
    updateForm({
      guestName: "",
      guestId: null,
      phone: "",
      email: "",
      allergyDetail: "",
      tags: [],
    })
  }, [updateForm])

  const handleToggleTag = useCallback(
    (tag: FormTag) => {
      const next = form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag]
      updateForm({ tags: next })
    },
    [form.tags, updateForm]
  )

  const handleSave = useCallback(() => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }, 1200)
  }, [])

  const bestTable = useMemo(() => {
    const selectedStart = toMinutes(form.time)
    if (!Number.isFinite(selectedStart)) return undefined
    const selectedEnd = selectedStart + form.duration
    const { end: serviceEnd } = getServiceBoundsForTime(form.time, servicePeriodId)

    const candidates = tableLanes
      .filter((lane) => lane.seats >= form.partySize)
      .filter((lane) => form.zonePreference === "any" || lane.zone === form.zonePreference)
      .map((lane) => {
        const overlaps = getBlockingWindowsForTable(lane.id).filter((window) => {
          const rawStart = toMinutes(window.startTime)
          const rawEnd = toMinutes(window.endTime)
          if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return false
          const { start, end } = normalizeBlockWindow(rawStart, rawEnd, selectedStart)
          return selectedStart < end && selectedEnd > start
        })

        const available = overlaps.length === 0
        const overlapEnds = overlaps
          .map((window) => {
            const rawStart = toMinutes(window.startTime)
            const rawEnd = toMinutes(window.endTime)
            if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) return undefined
            return normalizeBlockWindow(rawStart, rawEnd, selectedStart).end
          })
          .filter((value): value is number => typeof value === "number")
        const nextAvailableMin = available
          ? selectedStart
          : Math.max(...overlapEnds)

        const openingInMin = Math.max(0, nextAvailableMin - selectedStart)
        const capacityDelta = lane.seats - form.partySize
        const score = (available ? 1000 : Math.max(0, 700 - openingInMin)) - capacityDelta * 4

        return { lane, available, nextAvailableMin, openingInMin, capacityDelta, score }
      })
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score
        if (a.openingInMin !== b.openingInMin) return a.openingInMin - b.openingInMin
        if (a.capacityDelta !== b.capacityDelta) return a.capacityDelta - b.capacityDelta
        return a.lane.label.localeCompare(b.lane.label)
      })

    const winner = candidates.find((candidate) => candidate.available) ?? candidates[0]
    if (!winner) return undefined

    const zoneLabel = timelineZones.find((zone) => zone.id === winner.lane.zone)?.name ?? winner.lane.zone
    const serviceUntil = formatTime12(toTime24(serviceEnd))
    const availableFrom24 = toTime24(winner.nextAvailableMin)
    const availableFrom = formatTime12(availableFrom24)
    const scoreNormalized = Math.max(55, Math.min(99, 85 - winner.capacityDelta * 4 + (winner.available ? 10 : -10)))

    return {
      id: winner.lane.id,
      label: winner.lane.label,
      seats: winner.lane.seats,
      zone: winner.lane.zone,
      zoneLabel,
      server: "Auto",
      features: winner.capacityDelta === 0 ? ["Exact fit"] : [],
      availableFrom,
      availableUntil: serviceUntil,
      matchScore: scoreNormalized,
      matchReasons: [
        winner.available
          ? `Open for ${formatTime12(form.time)}-${formatTime12(toTime24(selectedEnd))}`
          : `Busy until ${availableFrom}, then open`,
        winner.capacityDelta === 0
          ? `Exact fit (${winner.lane.seats}-top for ${form.partySize})`
          : `${winner.lane.seats}-top for party of ${form.partySize}`,
        `Zone: ${zoneLabel}`,
      ],
      avoidReasons: winner.available ? undefined : [`Unavailable at requested start (${formatTime12(form.time)})`],
    }
  }, [form.duration, form.partySize, form.time, form.zonePreference, servicePeriodId])

  const conflicts = useMemo(
    () => getConflictsForSelection(form.time, form.assignedTable, form.partySize, selectedGuest),
    [form.time, form.assignedTable, form.partySize, selectedGuest]
  )

  // ── Mobile Wizard ────────────────────────────────────────────────────────
  if (isMobile) {
    const steps = [
      {
        label: "Intent",
        content: (
          <FormBookingDetails
            date={form.date}
            time={form.time}
            partySize={form.partySize}
            duration={form.duration}
            durationMax={effectiveDurationMax}
            availableTimes={availableTimes}
            allTimes={openTimes}
            tableSeatLimit={tableSeatLimit}
            tableSeatLabel={tableSeatLabel}
            zonePreference={form.zonePreference}
            fitContextLabel={fitContextLabel}
            timeFitByTime={timeFitByTime}
            onDateChange={(date) => updateForm({ date })}
            onTimeChange={(time) => {
              const nextConstraints = resolveDurationConstraints(time, form.assignedTable, form.partySize, servicePeriodId)
              updateForm({ time, duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax) })
            }}
            onPartySizeChange={(partySize) =>
              updateForm({
                partySize,
                duration: clampDuration(
                  resolveDurationConstraints(form.time, form.assignedTable, partySize, servicePeriodId).durationDefault,
                  effectiveDurationMax
                ),
              })
            }
            onDurationChange={(duration) => updateForm({ duration: clampDuration(duration, effectiveDurationMax) })}
            onZonePreferenceChange={(zonePreference) => updateForm({ zonePreference })}
          />
        ),
      },
      {
        label: "Guest",
        content: (
          <div className="space-y-4">
            <FormGuestSearch
              value={form.guestName}
              selectedGuest={selectedGuest}
              onNameChange={(name) => updateForm({ guestName: name })}
              onSelectGuest={handleSelectGuest}
              onClearGuest={handleClearGuest}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Phone <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="bg-secondary/50 border-border/60"
                type="tel"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <Input
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="guest@email.com"
                className="bg-secondary/50 border-border/60"
                type="email"
              />
            </div>
          </div>
        ),
      },
      {
        label: "Placement",
        content: (
          <div className="space-y-5">
            <FormTableAssignment
              tableLanes={tableLanes}
              mode={form.tableAssignMode}
              assignedTable={form.assignedTable}
              zonePreference={form.zonePreference}
              partySize={form.partySize}
              selectedTime={form.time}
              duration={form.duration}
              bestTable={bestTable}
              onModeChange={(mode) => updateForm({ tableAssignMode: mode })}
              onTableChange={(assignedTable) => {
                const nextConstraints = resolveDurationConstraints(form.time, assignedTable, form.partySize, servicePeriodId)
                updateForm({
                  assignedTable,
                  duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax),
                })
              }}
            />
            <div className="border-t border-border/30 pt-4">
              <FormTagsNotes
                tags={form.tags}
                allergyDetail={form.allergyDetail}
                notes={form.notes}
                onToggleTag={handleToggleTag}
                onAllergyDetailChange={(allergyDetail) => updateForm({ allergyDetail })}
                onNotesChange={(notes) => updateForm({ notes })}
              />
            </div>
          </div>
        ),
      },
      {
        label: "Confirm",
        content: (
          <div className="space-y-5">
            <FormSidePanels
              formData={form}
              guest={selectedGuest}
              bestTable={bestTable}
              conflicts={conflicts}
            />
            <div className="border-t border-border/30 pt-4">
              <FormConfirmation
                sendSms={form.sendSms}
                sendEmail={form.sendEmail}
                requireDeposit={form.requireDeposit}
                depositAmount={form.depositAmount}
                addToCalendar={form.addToCalendar}
                channel={form.channel}
                onSmsChange={(sendSms) => updateForm({ sendSms })}
                onEmailChange={(sendEmail) => updateForm({ sendEmail })}
                onDepositChange={(requireDeposit) => updateForm({ requireDeposit })}
                onDepositAmountChange={(depositAmount) => updateForm({ depositAmount })}
                onCalendarChange={(addToCalendar) => updateForm({ addToCalendar })}
                onChannelChange={(channel) => updateForm({ channel })}
              />
            </div>
          </div>
        ),
      },
    ]

    return (
      <div className="h-full bg-background">
        <FormMobileWizard
          steps={steps}
          onSave={handleSave}
          isSaving={isSaving}
          isSaved={isSaved}
          isEdit={isEdit}
        />
      </div>
    )
  }

  // ── Desktop / Tablet Layout ──────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {isEdit
              ? `Edit Reservation -- ${form.guestName}, ${form.partySize} guests`
              : "New Reservation"
            }
          </h1>
          {editData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {editData.createdAt} via {editData.createdVia}
              {editData.lastModified && (
                <> &middot; Last modified {editData.lastModified}{editData.lastModifiedNote && ` (${editData.lastModifiedNote})`}</>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isDesktop && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="text-xs"
            >
              {showSidePanel ? "Hide suggestions" : "Show suggestions"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
            onClick={onRequestClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Form */}
        <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto p-6">
          {/* Booking Details */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Intent & Timing
            </h2>
            <FormBookingDetails
              date={form.date}
              time={form.time}
              partySize={form.partySize}
              duration={form.duration}
              durationMax={effectiveDurationMax}
              availableTimes={availableTimes}
              allTimes={openTimes}
              tableSeatLimit={tableSeatLimit}
              tableSeatLabel={tableSeatLabel}
              zonePreference={form.zonePreference}
              fitContextLabel={fitContextLabel}
              timeFitByTime={timeFitByTime}
              onDateChange={(date) => updateForm({ date })}
              onTimeChange={(time) => {
                const nextConstraints = resolveDurationConstraints(time, form.assignedTable, form.partySize, servicePeriodId)
                updateForm({ time, duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax) })
              }}
              onPartySizeChange={(partySize) => {
                updateForm({
                  partySize,
                  duration: clampDuration(
                    resolveDurationConstraints(form.time, form.assignedTable, partySize, servicePeriodId).durationDefault,
                    effectiveDurationMax
                  ),
                })
              }}
              onDurationChange={(duration) => updateForm({ duration: clampDuration(duration, effectiveDurationMax) })}
              onZonePreferenceChange={(zonePreference) => updateForm({ zonePreference })}
            />
          </section>

          {/* Table Assignment */}
          <section className="!mt-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Placement Engine
            </h2>
            <FormTableAssignment
              tableLanes={tableLanes}
              mode={form.tableAssignMode}
              assignedTable={form.assignedTable}
              zonePreference={form.zonePreference}
              partySize={form.partySize}
              selectedTime={form.time}
              duration={form.duration}
              bestTable={bestTable}
              onModeChange={(mode: TableAssignMode) => {
                updateForm({ tableAssignMode: mode })
                if (mode === "auto" && bestTable) {
                  const nextConstraints = resolveDurationConstraints(form.time, bestTable.id, form.partySize, servicePeriodId)
                  updateForm({
                    assignedTable: bestTable.id,
                    duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax),
                  })
                } else if (mode === "unassigned") {
                  updateForm({ assignedTable: null })
                }
              }}
              onTableChange={(assignedTable) => {
                const nextConstraints = resolveDurationConstraints(form.time, assignedTable, form.partySize, servicePeriodId)
                updateForm({
                  assignedTable,
                  duration: clampDuration(nextConstraints.durationDefault, nextConstraints.durationMax),
                })
              }}
            />
          </section>

          {/* Guest Info */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Guest & Contact
            </h2>
            <div className="space-y-4">
              <FormGuestSearch
                value={form.guestName}
                selectedGuest={selectedGuest}
                onNameChange={(name) => updateForm({ guestName: name })}
                onSelectGuest={handleSelectGuest}
                onClearGuest={handleClearGuest}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-secondary/50 border-border/60"
                    type="tel"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Email <span className="text-muted-foreground/40">(optional)</span>
                  </label>
                  <Input
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="guest@email.com"
                    className="bg-secondary/50 border-border/60"
                    type="email"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tags & Notes */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Special Requests & Tags
            </h2>
            <FormTagsNotes
              tags={form.tags}
              allergyDetail={form.allergyDetail}
              notes={form.notes}
              onToggleTag={handleToggleTag}
              onAllergyDetailChange={(allergyDetail) => updateForm({ allergyDetail })}
              onNotesChange={(notes) => updateForm({ notes })}
            />
          </section>

          {/* Confirmation */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Confirmation
            </h2>
            <FormConfirmation
              sendSms={form.sendSms}
              sendEmail={form.sendEmail}
              requireDeposit={form.requireDeposit}
              depositAmount={form.depositAmount}
              addToCalendar={form.addToCalendar}
              channel={form.channel}
              onSmsChange={(sendSms) => updateForm({ sendSms })}
              onEmailChange={(sendEmail) => updateForm({ sendEmail })}
              onDepositChange={(requireDeposit) => updateForm({ requireDeposit })}
              onDepositAmountChange={(depositAmount) => updateForm({ depositAmount })}
              onCalendarChange={(addToCalendar) => updateForm({ addToCalendar })}
              onChannelChange={(channel: BookingChannel) => updateForm({ channel })}
            />
          </section>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 pb-6 border-t border-border/30">
            <Button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="h-10 gap-1.5 bg-emerald-600 text-foreground hover:bg-emerald-700 min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                isEdit ? "Update Reservation" : "Save Reservation"
              )}
            </Button>
            <Button variant="outline" className="h-10">Cancel</Button>

            {isEdit && (
              <>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    Send Update
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    Move to Waitlist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:border-red-500/40">
                    <Trash2 className="h-3.5 w-3.5" />
                    Cancel Reservation
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Suggestions (desktop always, tablet toggle) */}
        {(isDesktop || showSidePanel) && (
          <div className="w-[340px] shrink-0 overflow-y-auto border-l border-border/40 bg-background/50 p-4 2xl:w-[380px]">
            <FormSidePanels
              formData={form}
              guest={selectedGuest}
              bestTable={bestTable}
              conflicts={conflicts}
            />
          </div>
        )}
      </div>
    </div>
  )
}
