"use client"

import { useState, useCallback, use, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Trash2, Users } from "lucide-react"
import { TopBar } from "@/components/table-detail/top-bar"
import { TableVisual } from "@/components/table-detail/table-visual"
import { WaveTimeline } from "@/components/table-detail/wave-timeline"
import { OrderList } from "@/components/table-detail/order-list"
import { InfoPanel } from "@/components/table-detail/info-panel"
import { ActionBar } from "@/components/table-detail/action-bar"
import { PaymentModal } from "@/components/table-detail/payment-modal"
import { FoodReadyAlert } from "@/components/table-detail/food-ready-alert"
import { KitchenDelayAlert } from "@/components/table-detail/kitchen-delay-alert"
import { SeatPartyModal } from "@/components/floor-map/seat-party-modal"
import { Button } from "@/components/ui/button"
import { CategoryNav } from "@/components/take-order/category-nav"
import { MenuSearch } from "@/components/take-order/menu-search"
import { MenuItemCard } from "@/components/take-order/menu-item-card"
import { CustomizeItemModal } from "@/components/take-order/customize-item-modal"
import type { ItemCustomization } from "@/components/take-order/customize-item-modal"
import { OrderSummary } from "@/components/take-order/order-summary"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTableById, getReadyItems, buildTableDetailFromStore } from "@/lib/table-data"
import type {
  TableDetail,
  ItemStatus,
  WaveStatus,
  WaveType,
  OrderItem as TableOrderItem,
} from "@/lib/table-data"
import {
  calculateOrderTotals,
  hasAllergyConflict,
  takeOrderData,
} from "@/lib/take-order-data"
import type { MenuItem, OrderItem as TakeOrderItem } from "@/lib/take-order-data"
import { useLocationMenu } from "@/lib/hooks/useLocationMenu"
import { useRestaurantStore } from "@/store/restaurantStore"
import { useLocation } from "@/lib/contexts/LocationContext"
import {
  getOrderForTable,
  getOrderIdForSessionAndWave,
  getOpenSessionIdForTable,
  getSeatsForSession,
  type OrderForTableItem,
  type OrderForTableResult,
} from "@/app/actions/orders"
import {
  checkKitchenDelays,
  recordEventWithSource,
  removeSeatByNumber,
  renameSeat,
  updateTableLayout,
} from "@/domain"
import { getSessionOutstandingItems } from "@/app/actions/session-close-validation"
import type {
  StoreAlertType,
  StoreMealStage,
  StoreTable,
  StoreTableSessionState,
  StoreTableStatus,
} from "@/store/types"
import { storeTablesToFloorTables } from "@/lib/floor-map-data"
import { fetchPos, makeIdempotencyKey } from "@/lib/pos/fetchPos"

function getAutoSelectedOptions(item: MenuItem): Record<string, string> {
  const options: Record<string, string> = {}
  for (const option of item.options || []) {
    if (!option.required) continue
    const firstChoice = option.choices[0]
    if (!firstChoice) continue
    options[option.name] =
      typeof firstChoice === "string" ? firstChoice : firstChoice.name
  }
  return options
}

function getAutoOptionUpcharge(item: MenuItem, selectedOptions: Record<string, string>): number {
  let upcharge = 0
  for (const option of item.options || []) {
    const selected = selectedOptions[option.name]
    if (!selected) continue
    const match = option.choices.find((choice) =>
      typeof choice === "string" ? choice === selected : choice.name === selected
    )
    if (match && typeof match !== "string") {
      upcharge += match.price
    }
  }
  return upcharge
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isDbOrderItemId(id: string): boolean {
  return UUID_REGEX.test(id)
}

function getItemWaveNumber(item: TableOrderItem): number | null {
  if (typeof item.waveNumber === "number" && Number.isFinite(item.waveNumber)) {
    return item.waveNumber
  }
  const waveTag = item.mods?.find((mod) => /^Wave\s+\d+$/i.test(mod))
  if (waveTag) {
    const match = waveTag.match(/(\d+)/)
    if (match) {
      const taggedWave = Number(match[1])
      if (Number.isFinite(taggedWave)) return taggedWave
    }
  }

  if (item.wave === "drinks") return 1
  if (item.wave === "food") return 2
  if (item.wave === "dessert") return 3
  return null
}

function getDraftItemWaveNumber(item: TakeOrderItem): number {
  const match = item.notes?.match(/\bWave\s+(\d+)\b/i)
  if (match) {
    const parsed = Number(match[1])
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  if (item.wave === "drinks") return 1
  if (item.wave === "food") return 2
  if (item.wave === "dessert") return 3
  return 1
}

function getMealWaveStatus(items: TableOrderItem[]): WaveStatus {
  const activeItems = items.filter((item) => item.status !== "void")
  if (activeItems.length === 0) return "held"
  if (activeItems.every((item) => item.status === "served")) return "served"
  if (activeItems.some((item) => item.status === "ready")) return "ready"
  if (activeItems.some((item) => item.status === "cooking")) return "preparing"
  if (activeItems.some((item) => item.status === "sent")) return "fired"
  return "held"
}

function getNextHeldWaveNumberFromItems(items: TableOrderItem[]): number | null {
  const heldWaveNumbers = items
    .filter((item) => item.status === "held")
    .map((item) => getItemWaveNumber(item))
    .filter((waveNumber): waveNumber is number => typeof waveNumber === "number" && Number.isFinite(waveNumber))

  if (heldWaveNumbers.length === 0) return null
  return Math.min(...heldWaveNumbers)
}

function buildMealProgressState(
  table: TableDetail,
  tableItems: TableOrderItem[],
  waveCount: number
): {
  waves: TableDetail["waves"]
  waveItemsById: Record<string, { seatNumber: number; item: TableOrderItem }[]>
  waveLabelsById: Record<string, string>
  nextFireableWaveNumber: number | null
} {
  const allItemsWithSeat = [
    ...table.seats.flatMap((seat) =>
      seat.items.map((item) => ({ seatNumber: seat.number, item }))
    ),
    ...tableItems.map((item) => ({ seatNumber: 0, item })),
  ].filter(({ item }) => item.status !== "void")

  const hasMealStarted = allItemsWithSeat.some(({ item }) => item.status !== "held")
  if (!hasMealStarted) {
    return {
      waves: [],
      waveItemsById: {},
      waveLabelsById: {},
      nextFireableWaveNumber: null,
    }
  }

  const groupedByNumber = new Map<number, { seatNumber: number; item: TableOrderItem }[]>()
  for (const entry of allItemsWithSeat) {
    const waveNumber = getItemWaveNumber(entry.item)
    if (!waveNumber) continue
    const existing = groupedByNumber.get(waveNumber) ?? []
    existing.push(entry)
    groupedByNumber.set(waveNumber, existing)
  }

  const maxWaveWithItems = Math.max(0, ...Array.from(groupedByNumber.keys()))
  const totalWaves = maxWaveWithItems > 0 ? Math.max(1, waveCount, maxWaveWithItems) : 0
  const waveTypeOrder: WaveType[] = ["drinks", "food", "dessert"]

  const waves: TableDetail["waves"] = []
  const waveItemsById: Record<string, { seatNumber: number; item: TableOrderItem }[]> = {}
  const waveLabelsById: Record<string, string> = {}
  let nextFireableWaveNumber: number | null = null

  for (let waveNumber = 1; waveNumber <= totalWaves; waveNumber += 1) {
    const waveId = `mw-${waveNumber}`
    const itemsForWave = groupedByNumber.get(waveNumber) ?? []
    const onlyItems = itemsForWave.map(({ item }) => item)
    const status = getMealWaveStatus(onlyItems)
    if (nextFireableWaveNumber === null && onlyItems.some((item) => item.status === "held")) {
      nextFireableWaveNumber = waveNumber
    }

    waveItemsById[waveId] = itemsForWave
    waveLabelsById[waveId] = `W${waveNumber}`
    waves.push({
      id: waveId,
      type: waveTypeOrder[(waveNumber - 1) % waveTypeOrder.length],
      status,
      eta:
        status === "preparing"
          ? Math.max(
              0,
              ...onlyItems
                .map((item) => item.eta ?? 0)
                .filter((eta) => eta > 0)
            ) || undefined
          : undefined,
      items: onlyItems.length,
    })
  }

  return { waves, waveItemsById, waveLabelsById, nextFireableWaveNumber }
}

function cloneTableItems(items: StoreTableSessionState["tableItems"] | undefined): TableOrderItem[] {
  if (!items) return []
  return items.map((item) => ({
    ...item,
    mods: item.mods ? [...item.mods] : undefined,
  }))
}

function mapTableStatusToStoreStatus(
  status: TableDetail["status"],
  currentStatus?: StoreTableStatus
): StoreTableStatus {
  switch (status) {
    case "available":
      return "free"
    case "bill_requested":
      return "billing"
    case "served":
      return "closed"
    case "food_ready":
    case "needs_attention":
      return "urgent"
    case "seated":
    case "ordering":
    case "in_kitchen":
      if (currentStatus === "urgent") return "urgent"
      return "active"
    default:
      return currentStatus ?? "active"
  }
}

function getAllActiveItems(table: TableDetail, tableItems: TableOrderItem[]): TableOrderItem[] {
  return [
    ...table.seats.flatMap((seat) => seat.items),
    ...tableItems,
  ].filter((item) => item.status !== "void")
}

function deriveStoreStage(
  table: TableDetail,
  tableItems: TableOrderItem[],
  fallbackStage: StoreMealStage | null = null
): StoreMealStage | null {
  if (table.status === "available" || table.guestCount <= 0) return null
  if (table.status === "bill_requested") return "bill"

  const activeItems = getAllActiveItems(table, tableItems)
  if (activeItems.length === 0) return fallbackStage ?? "drinks"
  if (activeItems.some((item) => item.wave === "dessert" && item.status !== "held")) return "dessert"
  return "food"
}

function deriveStoreAlerts(table: TableDetail, tableItems: TableOrderItem[]): StoreAlertType[] | undefined {
  const alerts = new Set<StoreAlertType>()
  if (getAllActiveItems(table, tableItems).some((item) => item.status === "ready")) {
    alerts.add("food_ready")
  }
  if (table.status === "needs_attention") {
    alerts.add("no_checkin")
  }
  return alerts.size > 0 ? Array.from(alerts) : undefined
}

function buildStoreSession(
  table: TableDetail,
  tableItems: TableOrderItem[],
  waveCount: number
): StoreTableSessionState {
  return {
    status: table.status,
    guestCount: table.guestCount,
    lastCheckIn: table.lastCheckIn,
    pacing: table.pacing,
    notes: table.notes.map((note) => ({ ...note })),
    seats: table.seats.map((seat) => ({
      number: seat.number,
      dietary: [...seat.dietary],
      notes: [...seat.notes],
      items: cloneTableItems(seat.items),
      ...(seat.guestName != null && { guestName: seat.guestName }),
    })),
    tableItems: cloneTableItems(tableItems),
    waveCount: Math.max(1, waveCount),
    bill: { ...table.bill },
  }
}

/** Map DB item status to store item status */
function dbItemStatusToStore(
  status: OrderForTableItem["status"]
): TableOrderItem["status"] {
  switch (status) {
    case "pending":
      return "sent"
    case "preparing":
      return "cooking"
    case "ready":
      return "ready"
    case "served":
      return "served"
    default:
      return "sent"
  }
}

/** Parse "Seat 2 · Wave 1" or "Shared · Wave 2" from notes */
function parseSeatAndWave(notes: string | null): { seatNumber: number; waveNumber: number } {
  let seatNumber = 0
  let waveNumber = 1
  if (notes) {
    const parts = notes.split("·").map((p) => p.trim())
    for (const part of parts) {
      const seatMatch = part.match(/^Seat\s+(\d+)$/i)
      if (seatMatch) seatNumber = parseInt(seatMatch[1], 10) || 0
      const waveMatch = part.match(/^Wave\s+(\d+)$/i)
      if (waveMatch) waveNumber = parseInt(waveMatch[1], 10) || 1
    }
  }
  return { seatNumber, waveNumber }
}

/** Wave number to type: 1->drinks, 2->food, 3->dessert, then cycle */
function waveNumberToType(n: number): "drinks" | "food" | "dessert" {
  const i = ((n - 1) % 3) + 1
  return i === 1 ? "drinks" : i === 2 ? "food" : "dessert"
}

/** Seat from DB (getSeatsForSession) for building table state from database */
type SeatFromDb = { seatNumber: number; guestName: string | null }

/**
 * Convert getOrderForTable result into session + per-seat items and shared items for local state.
 * Uses DB seat number per item when present; optionally uses seatsFromDb for seat list and guest names.
 */
function orderForTableToSession(
  data: NonNullable<OrderForTableResult>,
  tableId: string,
  capacity: number,
  seatsFromDb?: SeatFromDb[]
): {
  session: StoreTableSessionState
  tableItems: TableOrderItem[]
  seatsByNumber: Map<number, TableOrderItem[]>
  itemOrderIds: Map<string, string>
  waveCount: number
  seats: Array<{ number: number; dietary: string[]; notes: string[]; items: TableOrderItem[]; guestName?: string | null }>
} {
  const seatsByNumber = new Map<number, TableOrderItem[]>()
  const itemOrderIds = new Map<string, string>()
  const sharedItems: TableOrderItem[] = []
  let maxWave = 1

  data.items.forEach((row, index) => {
    const seatNumber =
      typeof row.seatNumber === "number" && Number.isFinite(row.seatNumber)
        ? row.seatNumber
        : parseSeatAndWave(row.notes).seatNumber
    const waveNumber = parseSeatAndWave(row.notes).waveNumber
    maxWave = Math.max(maxWave, waveNumber)
    const item: TableOrderItem = {
      id: row.id ?? `db-${tableId}-${index}`,
      ...(row.itemId && { menuItemId: row.itemId }),
      name: row.name,
      price: row.price,
      status: dbItemStatusToStore(row.status),
      wave: waveNumberToType(waveNumber),
      waveNumber,
      mods: row.notes ? [`Wave ${waveNumber}`] : undefined,
    }
    if (row.id && row.orderId) {
      itemOrderIds.set(row.id, row.orderId)
    }
    if (seatNumber > 0) {
      const list = seatsByNumber.get(seatNumber) ?? []
      list.push(item)
      seatsByNumber.set(seatNumber, list)
    } else {
      sharedItems.push(item)
    }
  })

  const waveCount = Math.max(1, maxWave)
  const seatNumbersFromItems = Array.from(seatsByNumber.keys())
  const allSeatNumbers = new Set(seatNumbersFromItems)
  seatsFromDb?.forEach((s) => allSeatNumbers.add(s.seatNumber))
  const maxSeat = Math.max(capacity, ...Array.from(allSeatNumbers), 1)
  const seatNumbersSorted =
    (seatsFromDb?.length ?? 0) > 0
      ? Array.from(allSeatNumbers).sort((a, b) => a - b)
      : Array.from({ length: maxSeat }, (_, i) => i + 1)

  const seats = seatNumbersSorted.map((seatNum) => {
    const fromDb = seatsFromDb?.find((s) => s.seatNumber === seatNum)
    return {
      number: seatNum,
      dietary: [] as string[],
      notes: [] as string[],
      items: cloneTableItems(seatsByNumber.get(seatNum) ?? []),
      ...(fromDb && { guestName: fromDb.guestName }),
    }
  })

  const session: StoreTableSessionState = {
    status: "ordering",
    guestCount: data.guestCount,
    notes: [],
    seats,
    tableItems: cloneTableItems(sharedItems),
    waveCount,
    bill: { subtotal: 0, tax: 0, total: 0 },
  }

  return {
    session,
    tableItems: sharedItems,
    seatsByNumber,
    itemOrderIds,
    waveCount,
    seats,
  }
}

export default function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { currentLocationId } = useLocation()
  const { menuItems: locationMenuItems, categories: locationCategories, loading: menuLoading } = useLocationMenu(currentLocationId)
  const storeTables = useRestaurantStore((s) => s.tables)
  const updateStoreTable = useRestaurantStore((s) => s.updateTable)
  const openOrderForTable = useRestaurantStore((s) => s.openOrderForTable)
  const syncOrderSession = useRestaurantStore((s) => s.syncOrderSession)
  const closeOrder = useRestaurantStore((s) => s.closeOrder)
  const activeStoreTable = useMemo<StoreTable | undefined>(
    () => storeTables.find((t) => t.id === id || t.id === id.toLowerCase()),
    [id, storeTables]
  )
  const persistedSession = activeStoreTable?.session ?? null
  const [sessionId, setSessionId] = useState<string | null>(null)
  /** Prefer sessionId from store (persisted when loading/syncing); fallback to component state. */
  const effectiveSessionId = activeStoreTable?.sessionId ?? sessionId
  const floorTablesForModal = useMemo(
    () => storeTablesToFloorTables(storeTables),
    [storeTables]
  )
  const tableFromStore = useMemo(() => {
    if (activeStoreTable) return buildTableDetailFromStore(activeStoreTable)
    return getTableById(id)
  }, [activeStoreTable, id])
  const [table, setTable] = useState<TableDetail>(tableFromStore)
  const prevTableIdRef = useRef<string | null>(null)
  const itemOrderIdsRef = useRef<Map<string, string>>(new Map())
  useEffect(() => {
    if (prevTableIdRef.current !== id) {
      prevTableIdRef.current = id
      setTable(tableFromStore)
      setKitchenDelayDismissed(false)
      setSessionId(null)
      itemOrderIdsRef.current = new Map()
    }
  }, [id, tableFromStore])
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [seatPartyOpen, setSeatPartyOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [isOrderingInline, setIsOrderingInline] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("drinks")
  const [searchQuery, setSearchQuery] = useState("")
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)
  const [customizeDefaults, setCustomizeDefaults] = useState<{ seat: number; wave: number } | null>(null)
  const [editingOrderItemId, setEditingOrderItemId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<TakeOrderItem[]>([])
  const [tableItems, setTableItems] = useState<TableOrderItem[]>(() =>
    cloneTableItems(persistedSession?.tableItems)
  )
  const [selectedWaveNumber, setSelectedWaveNumber] = useState(1)
  const [waveCount, setWaveCount] = useState(() =>
    Math.max(1, persistedSession?.waveCount ?? tableFromStore.waves.length)
  )
  const [summaryScope, setSummaryScope] = useState<"seat" | "all">("all")
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean
    title: string
    description: string
  }>({
    open: false,
    title: "",
    description: "",
  })
  const [discardDraftDialogOpen, setDiscardDraftDialogOpen] = useState(false)
  const [armedWaveDelete, setArmedWaveDelete] = useState<number | null>(null)
  const [armedSeatDelete, setArmedSeatDelete] = useState<number | null>(null)
  const [seatRenameState, setSeatRenameState] = useState<{ seatNumber: number; input: string } | null>(null)
  const [outstandingItems, setOutstandingItems] = useState<
    Awaited<ReturnType<typeof getSessionOutstandingItems>> | null
  >(null)
  const [kitchenDelays, setKitchenDelays] = useState<
    Awaited<ReturnType<typeof checkKitchenDelays>> | null
  >(null)
  const [kitchenDelayDismissed, setKitchenDelayDismissed] = useState(false)
  const waveHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seatHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waveHoldTriggeredRef = useRef<number | null>(null)
  const addContextPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [addContextPulse, setAddContextPulse] = useState<{
    id: number
    targetLabel: string
    waveLabel: string
  } | null>(null)

  const readyItems = getReadyItems(table.seats)
  const showAlert = readyItems.length > 0 && !alertDismissed
  const selectedSeatNumber = selectedSeat
  const mealProgress = useMemo(
    () => buildMealProgressState(table, tableItems, waveCount),
    [table, tableItems, waveCount]
  )
  const hasMealProgress = mealProgress.waves.length > 0

  useEffect(() => {
    if (persistedSession) {
      setTableItems(cloneTableItems(persistedSession.tableItems))
      const persistedWaveCount = Math.max(1, persistedSession.waveCount || 1)
      setWaveCount(persistedWaveCount)
      setSelectedWaveNumber((prev) => Math.min(Math.max(1, prev), persistedWaveCount))
      return
    }

    setTableItems([])
    const defaultWaveCount = Math.max(1, tableFromStore.waves.length)
    setWaveCount(defaultWaveCount)
    setSelectedWaveNumber((prev) => Math.min(Math.max(1, prev), defaultWaveCount))
  }, [id, persistedSession, tableFromStore.waves.length])

  // Hydrate from DB when opening table (e.g. after refresh) if store has no session data
  const hasSessionData =
    persistedSession &&
    (persistedSession.tableItems.length > 0 ||
      persistedSession.seats.some((s) => s.items.length > 0))
  useEffect(() => {
    if (!currentLocationId || !id || !activeStoreTable) return
    if (hasSessionData) return

    let cancelled = false
    getOrderForTable(currentLocationId, id).then(async (data) => {
      if (cancelled || !data) return
      if (data.guestCount <= 0 && data.items.length === 0) return

      const capacity = Math.max(1, activeStoreTable.capacity ?? tableFromStore.seats.length)
      const seatsFromDb =
        data.sessionId != null
          ? await getSeatsForSession(data.sessionId, true).catch(() => undefined)
          : undefined
      const seatsPayload =
        seatsFromDb != null
          ? seatsFromDb.map((s) => ({ seatNumber: s.seatNumber, guestName: s.guestName }))
          : undefined
      const { session, tableItems: sharedItems, waveCount: wc, seats, itemOrderIds } = orderForTableToSession(
        data,
        id,
        capacity,
        seatsPayload
      )

      if (cancelled) return
      if (data.sessionId) setSessionId(data.sessionId)
      openOrderForTable(activeStoreTable.id, data.guestCount)
      syncOrderSession(activeStoreTable.id, session)
      updateStoreTable(activeStoreTable.id, {
        guests: data.guestCount,
        seatedAt: data.seatedAt ?? undefined,
        sessionId: data.sessionId ?? undefined,
      })

      setTable((prev) => ({
        ...prev,
        guestCount: data.guestCount,
        seatedAt: data.seatedAt ?? prev.seatedAt ?? "",
        status: prev.status === "available" ? "seated" : prev.status,
        seats,
      }))
      setTableItems(sharedItems)
      setWaveCount(wc)
      setSelectedWaveNumber((prev) => Math.min(Math.max(1, prev), wc))
      itemOrderIdsRef.current = new Map(itemOrderIds)
    })
    return () => {
      cancelled = true
    }
  }, [currentLocationId, id, activeStoreTable?.id, activeStoreTable?.capacity, hasSessionData, openOrderForTable, syncOrderSession, updateStoreTable, tableFromStore.seats.length])

  // Backfill sessionId when we have store data but didn't load from DB (e.g. navigated from floor map with existing table state)
  useEffect(() => {
    if (!hasSessionData || !currentLocationId || !id || effectiveSessionId) return
    let cancelled = false
    getOpenSessionIdForTable(currentLocationId, id).then((sid) => {
      if (!cancelled && sid) setSessionId(sid)
    })
    return () => {
      cancelled = true
    }
  }, [hasSessionData, currentLocationId, id, effectiveSessionId])

  // Fetch outstanding items when payment modal opens so we can show blocking reasons
  useEffect(() => {
    if (!paymentOpen || !currentLocationId || !id) {
      setOutstandingItems(null)
      return
    }
    let cancelled = false
    const load = async () => {
      const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(currentLocationId, id))
      if (cancelled || !sid) {
        if (!cancelled) setOutstandingItems(null)
        return
      }
      const result = await getSessionOutstandingItems(sid)
      if (!cancelled) setOutstandingItems(result)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [paymentOpen, currentLocationId, id, effectiveSessionId])

  const shouldPersistSession = useMemo(
    () =>
      table.guestCount > 0 ||
      tableItems.length > 0 ||
      table.seats.some((seat) => seat.items.some((item) => item.status !== "void")),
    [table.guestCount, table.seats, tableItems]
  )
  const nextStoreAlerts = useMemo(() => {
    const base = deriveStoreAlerts(table, tableItems) ?? []
    const withKitchen =
      kitchenDelays && kitchenDelays.length > 0 && !kitchenDelayDismissed
        ? [...new Set([...base, "kitchen_delay"])]
        : base
    return withKitchen.length > 0 ? withKitchen : undefined
  }, [table, tableItems, kitchenDelays, kitchenDelayDismissed])
  const nextStoreStatus = useMemo(() => {
    const mapped = mapTableStatusToStoreStatus(table.status, activeStoreTable?.status)
    if (mapped === "active" && (nextStoreAlerts?.includes("food_ready") || nextStoreAlerts?.includes("kitchen_delay")))
      return "urgent"
    return mapped
  }, [activeStoreTable?.status, nextStoreAlerts, table.status])
  const nextStoreStage = useMemo(
    () => deriveStoreStage(table, tableItems, activeStoreTable?.stage ?? null),
    [activeStoreTable?.stage, table, tableItems]
  )
  const nextStoreSession = useMemo(
    () => (shouldPersistSession ? buildStoreSession(table, tableItems, waveCount) : null),
    [shouldPersistSession, table, tableItems, waveCount]
  )

  // Poll kitchen delays when table has active session (display only, no event recording)
  useEffect(() => {
    if (!shouldPersistSession || !currentLocationId || !id) {
      setKitchenDelays(null)
      return
    }
    let cancelled = false
    const poll = async () => {
      const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(currentLocationId, id))
      if (cancelled || !sid) {
        if (!cancelled) setKitchenDelays(null)
        return
      }
      const result = await checkKitchenDelays(sid, { recordEvents: false })
      if (!cancelled) setKitchenDelays(result)
    }
    poll()
    const interval = setInterval(poll, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [shouldPersistSession, currentLocationId, id, effectiveSessionId])

  useEffect(() => {
    if (!activeStoreTable) return

    if (nextStoreSession) {
      syncOrderSession(activeStoreTable.id, nextStoreSession)
    }

    const nextSeatedAt =
      table.guestCount > 0
        ? table.seatedAt || activeStoreTable.seatedAt || new Date().toISOString()
        : null

    const currentSnapshot = JSON.stringify({
      status: activeStoreTable.status,
      guests: activeStoreTable.guests ?? 0,
      seatedAt: activeStoreTable.seatedAt ?? null,
      stage: activeStoreTable.stage ?? null,
      alerts: activeStoreTable.alerts ?? [],
      session: activeStoreTable.session ?? null,
    })
    const nextSnapshot = JSON.stringify({
      status: nextStoreStatus,
      guests: table.guestCount,
      seatedAt: nextSeatedAt,
      stage: nextStoreStage ?? null,
      alerts: nextStoreAlerts ?? [],
      session: nextStoreSession,
    })
    if (currentSnapshot === nextSnapshot) return

    updateStoreTable(activeStoreTable.id, {
      status: nextStoreStatus,
      guests: table.guestCount,
      seatedAt: nextSeatedAt,
      stage: nextStoreStage,
      alerts: nextStoreAlerts,
      session: nextStoreSession,
    })

    if (currentLocationId) {
      updateTableLayout(currentLocationId, activeStoreTable.id, {
        status: nextStoreStatus,
        guests: table.guestCount,
        seatedAt: nextSeatedAt,
        stage: nextStoreStage,
        alerts: nextStoreAlerts,
      }).catch((err) => console.error("[TableDetail] Failed to persist table:", err))
    }
  }, [
    activeStoreTable,
    currentLocationId,
    nextStoreAlerts,
    nextStoreSession,
    nextStoreStage,
    nextStoreStatus,
    syncOrderSession,
    table.guestCount,
    table.seatedAt,
    updateStoreTable,
  ])

  // Use real menu from location when available; otherwise placeholder for demo/no-location
  const menuSource = useMemo(() => {
    if (currentLocationId && !menuLoading) {
      return { menuItems: locationMenuItems, categories: locationCategories }
    }
    return { menuItems: takeOrderData.menuItems, categories: takeOrderData.categories }
  }, [currentLocationId, menuLoading, locationMenuItems, locationCategories])

  const orderSeats = useMemo(() => {
    const seats = table.seats.map((seat) => {
      const seatItems = orderItems.filter((item) => item.seat === seat.number)
      const total = seatItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = seatItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        number: seat.number,
        dietary: seat.dietary,
        notes: seat.notes,
        items: itemCount,
        total,
      }
    })
    const tableItems = orderItems.filter((item) => item.seat === 0)
    if (tableItems.length > 0) {
      const tableTotal = tableItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const tableCount = tableItems.reduce((sum, item) => sum + item.quantity, 0)
      return [
        {
          number: 0,
          dietary: [],
          notes: [],
          items: tableCount,
          total: tableTotal,
        },
        ...seats,
      ]
    }
    return seats
  }, [orderItems, table.seats])

  const filteredMenuItems = useMemo(() => {
    let items = menuSource.menuItems

    if (selectedCategory && !searchQuery.trim()) {
      items = items.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description ?? "").toLowerCase().includes(query)
      )
    }

    return items
  }, [menuSource.menuItems, selectedCategory, searchQuery])
  const matchedCategoryIds = useMemo(
    () => Array.from(new Set(filteredMenuItems.map((item) => item.category))),
    [filteredMenuItems]
  )

  const summaryItems = useMemo(() => {
    if (summaryScope === "seat" && selectedSeat !== null) {
      return orderItems.filter((item) => item.seat === selectedSeat)
    }
    return orderItems
  }, [orderItems, selectedSeat, summaryScope])
  const summarySeats = useMemo(() => {
    if (summaryScope === "seat" && selectedSeat !== null) {
      return orderSeats.filter((seat) => seat.number === selectedSeat)
    }
    return orderSeats
  }, [orderSeats, selectedSeat, summaryScope])
  const summaryTotals = useMemo(() => calculateOrderTotals(summaryItems), [summaryItems])
  const waveNumbers = useMemo(
    () => Array.from({ length: Math.max(1, waveCount) }, (_, index) => index + 1),
    [waveCount]
  )
  const nextSendableWaveNumber = useMemo(() => {
    const allItems = [
      ...table.seats.flatMap((seat) => seat.items),
      ...tableItems,
      ...orderItems.map((draft): TableOrderItem => ({
        id: draft.id,
        name: draft.name,
        price: draft.price,
        status: "held" as ItemStatus,
        wave: draft.wave === "drinks" ? "drinks" : "food",
        waveNumber: getDraftItemWaveNumber(draft),
      })),
    ]
    return getNextHeldWaveNumberFromItems(allItems)
  }, [orderItems, table.seats, tableItems])
  const hasPendingSend = nextSendableWaveNumber !== null
  const canBill = useMemo(() => {
    const seatedItemsTotal = table.seats.reduce(
      (sum, seat) =>
        sum +
        seat.items.reduce(
          (seatSum, item) => (item.status !== "void" ? seatSum + item.price : seatSum),
          0
        ),
      0
    )
    const sharedItemsTotal = tableItems.reduce(
      (sum, item) => (item.status !== "void" ? sum + item.price : sum),
      0
    )
    return seatedItemsTotal + sharedItemsTotal > 0
  }, [table.seats, tableItems])
  const hasItemsInWave = useCallback(
    (waveNumber: number) =>
      table.seats.some((seat) =>
        seat.items.some(
          (item) =>
            getItemWaveNumber(item) === waveNumber && item.status !== "void"
        )
      ) ||
      tableItems.some(
        (item) =>
          getItemWaveNumber(item) === waveNumber && item.status !== "void"
      ) ||
      orderItems.some((item) =>
        new RegExp(`\\bWave\\s+${waveNumber}\\b`, "i").test(item.notes ?? "")
      ),
    [orderItems, table.seats, tableItems]
  )

  const clearWaveHoldTimer = useCallback(() => {
    if (waveHoldTimerRef.current) {
      clearTimeout(waveHoldTimerRef.current)
      waveHoldTimerRef.current = null
    }
  }, [])

  const clearSeatHoldTimer = useCallback(() => {
    if (seatHoldTimerRef.current) {
      clearTimeout(seatHoldTimerRef.current)
      seatHoldTimerRef.current = null
    }
  }, [])

  const triggerAddContextPulse = useCallback(
    (seatNumber: number, waveNumber: number) => {
      if (addContextPulseTimerRef.current) {
        clearTimeout(addContextPulseTimerRef.current)
      }
      setAddContextPulse({
        id: Date.now(),
        targetLabel: seatNumber === 0 ? `T${table.number}` : `S${seatNumber}`,
        waveLabel: `W${waveNumber}`,
      })
      addContextPulseTimerRef.current = setTimeout(() => {
        setAddContextPulse(null)
      }, 680)
    },
    [table.number]
  )

  const armWaveDeleteByHold = useCallback(
    (waveNumber: number) => {
      clearWaveHoldTimer()
      waveHoldTimerRef.current = setTimeout(() => {
        waveHoldTriggeredRef.current = waveNumber
        setArmedWaveDelete(waveNumber)
      }, 450)
    },
    [clearWaveHoldTimer]
  )

  const armSeatDeleteByHold = useCallback(
    (seatNumber: number) => {
      clearSeatHoldTimer()
      seatHoldTimerRef.current = setTimeout(() => {
        setArmedSeatDelete(seatNumber)
      }, 450)
    },
    [clearSeatHoldTimer]
  )

  const handleDeleteWave = useCallback(
    (waveNumber: number) => {
      if (waveCount <= 1) return
      if (hasItemsInWave(waveNumber)) {
        setWarningDialog({
          open: true,
          title: "Cannot delete wave",
          description: `Wave ${waveNumber} has items. Move or remove them first.`,
        })
        return
      }

      setWaveCount((prev) => Math.max(1, prev - 1))
      setArmedWaveDelete(null)
      setSelectedWaveNumber((prev) => {
        if (prev === waveNumber) return Math.max(1, waveNumber - 1)
        if (prev > waveNumber) return prev - 1
        return prev
      })
    },
    [hasItemsInWave, waveCount]
  )

  const handleAddSeat = useCallback(() => {
    let nextSeatNumber = 1
    setTable((prev) => {
      nextSeatNumber =
        prev.seats.length > 0
          ? Math.max(...prev.seats.map((seat) => seat.number)) + 1
          : 1
      return {
        ...prev,
        guestCount: prev.guestCount + 1,
        seats: [
          ...prev.seats,
          {
            number: nextSeatNumber,
            dietary: [],
            notes: [],
            items: [],
          },
        ],
      }
    })
    setSelectedSeat(nextSeatNumber)
    setArmedSeatDelete(null)
  }, [])

  const handleDeleteSeat = useCallback(
    async (seatNumber: number) => {
      if (table.seats.length <= 1) return
      if (orderItems.some((item) => item.seat === seatNumber)) {
        setWarningDialog({
          open: true,
          title: "Cannot delete seat",
          description: `Seat ${seatNumber} has items. Move or remove them first.`,
        })
        return
      }

      if (currentLocationId && activeStoreTable?.id) {
        const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(
          currentLocationId,
          activeStoreTable.id
        ))
        if (sid) {
          const result = await removeSeatByNumber(sid, seatNumber)
          if (!result.ok) {
            setWarningDialog({
              open: true,
              title: "Cannot delete seat",
              description: result.error ?? "Seat has order items referencing it.",
            })
            return
          }
        }
      }

      setTable((prev) => ({
        ...prev,
        guestCount: Math.max(0, prev.guestCount - 1),
        seats: prev.seats.filter((seat) => seat.number !== seatNumber),
      }))
      setArmedSeatDelete(null)
      setSelectedSeat((prev) => (prev === seatNumber ? null : prev))
    },
    [orderItems, table.seats.length, currentLocationId, activeStoreTable?.id, effectiveSessionId, removeSeatByNumber]
  )

  const handleRenameSeat = useCallback(
    async (seatNumber: number, newSeatNumber: number) => {
      if (!currentLocationId || !activeStoreTable?.id) return
      const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(
        currentLocationId,
        activeStoreTable.id
      ))
      if (!sid) return
      const result = await renameSeat(sid, seatNumber, newSeatNumber)
      if (!result.ok) {
        setWarningDialog({
          open: true,
          title: "Cannot rename seat",
          description: result.error ?? "Seat number already exists.",
        })
        return
      }
      setTable((prev) => ({
        ...prev,
        seats: prev.seats.map((s) =>
          s.number === seatNumber ? { ...s, number: newSeatNumber } : s
        ),
      }))
      setSeatRenameState(null)
      setArmedSeatDelete(null)
    },
    [currentLocationId, activeStoreTable?.id, effectiveSessionId, renameSeat]
  )

  useEffect(() => {
    setSummaryScope(selectedSeat === null ? "all" : "seat")
  }, [selectedSeat])

  useEffect(() => {
    return () => clearWaveHoldTimer()
  }, [clearWaveHoldTimer])

  useEffect(() => {
    return () => clearSeatHoldTimer()
  }, [clearSeatHoldTimer])

  useEffect(() => {
    return () => {
      if (addContextPulseTimerRef.current) {
        clearTimeout(addContextPulseTimerRef.current)
      }
    }
  }, [])

  const fireWaveNumber = useCallback((waveNumber: number) => {
    if (currentLocationId && activeStoreTable?.id) {
      const run = async () => {
        const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(currentLocationId, activeStoreTable!.id))
        if (!sid) return
        await fetchPos(`/api/sessions/${sid}/waves/${waveNumber}/fire`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSource: "table_page" }),
        }).catch(() => {})
      }
      run().catch(() => {})
    }

    const fireItem = (item: TableOrderItem): TableOrderItem => {
      if (item.status !== "held") return item
      if (getItemWaveNumber(item) !== waveNumber) return item
      return { ...item, status: "sent" as ItemStatus }
    }

    setTable((prev) => ({
      ...prev,
      seats: prev.seats.map((seat) => ({
        ...seat,
        items: seat.items.map(fireItem),
      })),
    }))
    setTableItems((prev) => prev.map(fireItem))
  }, [currentLocationId, activeStoreTable?.id, effectiveSessionId])

  const handleFireWave = useCallback((waveId: string) => {
    const match = waveId.match(/^mw-(\d+)$/)
    if (!match) return
    const waveNumber = Number(match[1])
    if (!Number.isFinite(waveNumber)) return
    fireWaveNumber(waveNumber)
  }, [fireWaveNumber])

  const handleFireNextWave = useCallback(() => {
    if (!mealProgress.nextFireableWaveNumber) return
    fireWaveNumber(mealProgress.nextFireableWaveNumber)
  }, [fireWaveNumber, mealProgress.nextFireableWaveNumber])

  const resolveOrderIdForItem = useCallback(
    async (itemId: string): Promise<string | null> => {
      const knownOrderId = itemOrderIdsRef.current.get(itemId)
      if (knownOrderId) return knownOrderId
      if (!currentLocationId || !activeStoreTable?.id) return null

      const foundItem = [
        ...table.seats.flatMap((seat) => seat.items),
        ...tableItems,
      ].find((item) => item.id === itemId)
      const waveNumber = foundItem ? getItemWaveNumber(foundItem) : null
      if (!waveNumber) return null

      const sid =
        effectiveSessionId ??
        (await getOpenSessionIdForTable(currentLocationId, activeStoreTable.id))
      if (!sid) return null

      const resolvedOrderId = await getOrderIdForSessionAndWave(sid, waveNumber)
      if (resolvedOrderId) {
        itemOrderIdsRef.current.set(itemId, resolvedOrderId)
      }
      return resolvedOrderId
    },
    [currentLocationId, activeStoreTable?.id, effectiveSessionId, table.seats, tableItems]
  )

  const handleMarkServed = useCallback((itemId: string) => {
    if (isDbOrderItemId(itemId)) {
      const run = async () => {
        const orderId = await resolveOrderIdForItem(itemId)
        if (!orderId) return
        await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "served", eventSource: "table_page" }),
        }).catch(() => {})
      }
      run().catch(() => {})
    }
    setTable((prev) => ({
      ...prev,
      seats: prev.seats.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === itemId ? { ...i, status: "served" as ItemStatus } : i
        ),
      })),
    }))
    setTableItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "served" as ItemStatus } : i))
    )
  }, [resolveOrderIdForItem])

  const handleAdvanceWaveStatus = useCallback(
    (waveNumber: number, nextStatus: "cooking" | "ready" | "served") => {
      const getNextItemStatus = (item: TableOrderItem): ItemStatus => {
        if (item.status === "void") return item.status
        if (getItemWaveNumber(item) !== waveNumber) return item.status
        if (nextStatus === "cooking" && item.status === "sent") return "cooking"
        if (nextStatus === "ready" && item.status === "cooking") return "ready"
        if (
          nextStatus === "served" &&
          (item.status === "ready" || item.status === "cooking" || item.status === "sent")
        ) {
          return "served"
        }
        return item.status
      }

      const dbItemsToUpdate = [
        ...table.seats.flatMap((seat) => seat.items),
        ...tableItems,
      ]
        .filter((item) => isDbOrderItemId(item.id))
        .filter((item) => getItemWaveNumber(item) === waveNumber)
        .filter((item) => item.status !== "void")
        .filter((item) => getNextItemStatus(item) !== item.status)
      const previousStatusByItemId = new Map<string, ItemStatus>(
        dbItemsToUpdate.map((item) => [item.id, item.status])
      )

      const advanceItem = (item: TableOrderItem): TableOrderItem => {
        const nextItemStatus = getNextItemStatus(item)
        return nextItemStatus === item.status ? item : { ...item, status: nextItemStatus }
      }

      setTable((prev) => ({
        ...prev,
        seats: prev.seats.map((seat) => ({
          ...seat,
          items: seat.items.map(advanceItem),
        })),
      }))
      setTableItems((prev) => prev.map(advanceItem))

      const restoreStatuses = (idsToRestore: Set<string>) => {
        if (idsToRestore.size === 0) return
        const restoreItem = (item: TableOrderItem): TableOrderItem => {
          if (!idsToRestore.has(item.id)) return item
          const previousStatus = previousStatusByItemId.get(item.id)
          return previousStatus ? { ...item, status: previousStatus } : item
        }
        setTable((prev) => ({
          ...prev,
          seats: prev.seats.map((seat) => ({
            ...seat,
            items: seat.items.map(restoreItem),
          })),
        }))
        setTableItems((prev) => prev.map(restoreItem))
      }

      const dbStatus: "preparing" | "ready" | "served" =
        nextStatus === "cooking" ? "preparing" : nextStatus === "ready" ? "ready" : "served"
      if (currentLocationId && activeStoreTable?.id) {
        const run = async () => {
          const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(currentLocationId, activeStoreTable.id))
          if (sid) {
            const response = await fetchPos(`/api/sessions/${sid}/waves/${waveNumber}/advance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                toStatus: dbStatus,
                eventSource: "table_page",
              }),
            }).catch(() => null)
            const payload = response ? await response.json().catch(() => null) : null

            const failedIds = Array.isArray(payload?.failed)
              ? payload.failed
                  .map((entry: { itemId?: unknown }) =>
                    typeof entry?.itemId === "string" ? entry.itemId : null
                  )
                  .filter((itemId: string | null): itemId is string => itemId != null)
              : []

            if (!response?.ok) {
              if (failedIds.length > 0) {
                restoreStatuses(new Set(failedIds))
              } else {
                restoreStatuses(new Set(previousStatusByItemId.keys()))
              }
              return
            }
            if (failedIds.length > 0) {
              restoreStatuses(new Set(failedIds))
            }
            if (nextStatus === "ready" || nextStatus === "served") {
              recordEventWithSource(
                currentLocationId!,
                sid,
                nextStatus === "ready" ? "item_ready" : "served",
                "table_page",
                { waveNumber }
              ).catch(() => {})
            }
          }
        }
        run()
      }
    },
    [currentLocationId, activeStoreTable?.id, effectiveSessionId, table.seats, tableItems]
  )

  const handleMarkWaveServed = useCallback((waveId: string) => {
    const match = waveId.match(/^mw-(\d+)$/)
    if (!match) return
    const waveNumber = Number(match[1])
    if (!Number.isFinite(waveNumber)) return
    handleAdvanceWaveStatus(waveNumber, "served")
  }, [handleAdvanceWaveStatus])

  const handleVoidItem = useCallback((itemId: string) => {
    if (isDbOrderItemId(itemId)) {
      const run = async () => {
        const orderId = await resolveOrderIdForItem(itemId)
        if (!orderId) return
        await fetchPos(`/api/orders/${orderId}/items/${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Voided from table view",
            eventSource: "table_page",
          }),
        }).catch(() => {})
      }
      run().catch(() => {})
    }
    setTable((prev) => ({
      ...prev,
      seats: prev.seats.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === itemId ? { ...i, status: "void" as ItemStatus } : i
        ),
      })),
    }))
    setTableItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "void" as ItemStatus } : i))
    )
  }, [resolveOrderIdForItem])

  const handleEnterOrdering = useCallback((seatNumber: number | null = null) => {
    if (table.seats.length === 0) return
    setSelectedSeat(seatNumber)
    setIsOrderingInline(true)
  }, [table.seats.length])

  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }, [])

  const handleRemoveItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const handleExitOrderingView = useCallback(() => {
    clearWaveHoldTimer()
    clearSeatHoldTimer()
    setArmedWaveDelete(null)
    setArmedSeatDelete(null)
    setIsOrderingInline(false)
    setSelectedSeat(null)
    setDiscardDraftDialogOpen(false)
  }, [clearSeatHoldTimer, clearWaveHoldTimer])

  const handleSendCurrentOrder = useCallback(async () => {
    if (orderItems.length === 0 && !nextSendableWaveNumber) return

    const idempotencyKey = makeIdempotencyKey()
    const existingHeldWaveNumbers = [
      ...table.seats.flatMap((seat) =>
        seat.items
          .filter((item) => item.status === "held")
          .map((item) => getItemWaveNumber(item))
      ),
      ...tableItems
        .filter((item) => item.status === "held")
        .map((item) => getItemWaveNumber(item)),
    ].filter((wave): wave is number => typeof wave === "number" && Number.isFinite(wave))

    const draftHeldWaveNumbers = orderItems
      .flatMap((draft) => Array.from({ length: Math.max(1, draft.quantity) }, () => getDraftItemWaveNumber(draft)))
      .filter((wave): wave is number => Number.isFinite(wave) && wave > 0)

    const allHeldWaveNumbers = [...existingHeldWaveNumbers, ...draftHeldWaveNumbers]
    const lowestHeld = allHeldWaveNumbers.length > 0 ? Math.min(...allHeldWaveNumbers) : null
    const waveToSend = lowestHeld === 1 ? 1 : null

    const draftSeatItems: Array<{ seat: number; item: TableOrderItem }> = []
    const draftSharedItems: TableOrderItem[] = []

    if (orderItems.length > 0 && currentLocationId && activeStoreTable?.id) {
      const newDrafts = orderItems.filter((d) => !d.id || !isDbOrderItemId(d.id))
      if (newDrafts.length === 0) {
        setOrderItems([])
        handleExitOrderingView()
        if (waveToSend !== null) fireWaveNumber(waveToSend)
        return
      }

      let sid = effectiveSessionId
      if (!sid) {
        try {
          const res = await fetchPos("/api/sessions/ensure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tableUuid: activeStoreTable.id,
              locationId: currentLocationId,
              guestCount: Math.max(1, table.guestCount ?? 0),
            }),
          }, { idempotencyKey })
          const payload = await res.json()
          if (!payload.ok) throw new Error(payload.error?.message ?? "Failed to ensure session")
          const data = payload.data
          sid = data.sessionId ?? null
        } catch (e) {
          console.error("[TableDetail] No session for add items", e)
          return
        }
      }
      if (!sid) {
        console.error("[TableDetail] No session for add items")
        return
      }

      const seatRows = await getSeatsForSession(sid)
      const seatNumberToId = new Map(seatRows.map((s) => [s.seatNumber, s.id]))

      const addInputs: Array<{
        itemId: string
        quantity: number
        seatId?: string
        notes?: string
      }> = []
      const draftExpanded: Array<{
        draft: TakeOrderItem
        seat: number
        waveNumber: number
        mods: string[]
      }> = []

      for (const draft of newDrafts) {
        const waveNumber = getDraftItemWaveNumber(draft)
        const visibleNotes = (draft.notes ?? "")
          .replace(/\bWave\s+\d+\b/gi, "")
          .replace(/[·|,-]\s*$/g, "")
          .replace(/^\s*[·|,-]\s*/g, "")
          .trim()
        const mods = [
          `Wave ${waveNumber}`,
          ...Object.values(draft.options ?? {}),
          ...(draft.extras ?? []).map((e) => `+ ${e}`),
          ...(visibleNotes ? [visibleNotes] : []),
        ]
        const notesStr = mods.filter(Boolean).join(" · ")

        const seatId = draft.seat > 0 ? seatNumberToId.get(draft.seat) : undefined
        const qty = Math.max(1, draft.quantity)

        for (let i = 0; i < qty; i++) {
          addInputs.push({
            itemId: draft.menuItemId,
            quantity: 1,
            seatId,
            notes: notesStr || undefined,
          })
          draftExpanded.push({ draft, seat: draft.seat, waveNumber, mods })
        }
      }

      const response = await fetchPos("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: currentLocationId,
          sessionId: sid,
          orderType: "dine_in",
          paymentTiming: "pay_later",
          guestCount: Math.max(1, table.guestCount ?? 0),
          eventSource: "table_page",
          items: addInputs.map((input) => ({
            itemId: input.itemId,
            quantity: input.quantity,
            seatId: input.seatId,
            notes: input.notes ?? null,
          })),
        }),
      }, { idempotencyKey }).catch(() => null)
      const payload = response ? await response.json().catch(() => null) : null
      if (!response?.ok) {
        const errMsg =
          (payload?.error && typeof payload.error === "object" && payload.error.message) ||
          (typeof payload?.error === "string" ? payload.error : null) ||
          response?.statusText ||
          "unknown_error"
        console.error("[TableDetail] add items API failed:", errMsg)
        return
      }

      const data = payload?.ok === true && payload?.data ? payload.data : payload
      const resultSessionId =
        typeof data?.sessionId === "string" ? data.sessionId : sid
      if (resultSessionId && !effectiveSessionId) {
        setSessionId(resultSessionId)
        updateStoreTable(activeStoreTable.id, { sessionId: resultSessionId })
      }

      const resultOrderId = typeof data?.orderId === "string" ? data.orderId : null
      const addedIds = Array.isArray(data?.addedItemIds)
        ? data.addedItemIds.filter((id): id is string => typeof id === "string")
        : []
      let idIdx = 0
      const itemStatus = waveToSend === 1 ? ("sent" as ItemStatus) : ("held" as ItemStatus)
      for (const { draft, seat, waveNumber, mods } of draftExpanded) {
        const realId = addedIds[idIdx++] ?? `db-${idIdx}`
        if (resultOrderId && isDbOrderItemId(realId)) {
          itemOrderIdsRef.current.set(realId, resultOrderId)
        }
        const item: TableOrderItem = {
          id: realId,
          menuItemId: draft.menuItemId,
          name: draft.name,
          mods: mods.length > 0 ? mods : undefined,
          price: draft.price,
          status: itemStatus,
          wave: draft.wave === "drinks" ? "drinks" : "food",
          waveNumber,
        }
        if (seat === 0) draftSharedItems.push(item)
        else draftSeatItems.push({ seat, item })
      }
    }

    if (draftSeatItems.length > 0 || draftSharedItems.length > 0) {
      setTable((prev) => ({
        ...prev,
        status: prev.status === "seated" ? "ordering" : prev.status,
        seats: prev.seats.map((seat) => ({
          ...seat,
          items: [
            ...seat.items,
            ...draftSeatItems
              .filter((entry) => entry.seat === seat.number)
              .map((entry) => entry.item),
          ],
        })),
      }))
      setTableItems((prev) => [...prev, ...draftSharedItems])
    }

    if (waveToSend !== null) {
      fireWaveNumber(waveToSend)
    }

    setOrderItems([])
    handleExitOrderingView()
  }, [
    currentLocationId,
    activeStoreTable,
    effectiveSessionId,
    table.guestCount,
    table.seats,
    table.status,
    handleExitOrderingView,
    nextSendableWaveNumber,
    orderItems,
    tableItems,
    fireWaveNumber,
    updateStoreTable,
  ])

  const handleCloseTable = useCallback(
    async (
      arg?: { force?: boolean } | { mode: string; method: string; subtotal: number; tip: number; total: number; charges: Array<{ label: string; amount: number }> }
    ) => {
      const idempotencyKey = makeIdempotencyKey()
      const isPaymentSummary = arg != null && "total" in arg
      const options = isPaymentSummary ? undefined : (arg as { force?: boolean } | undefined)
      const payment = isPaymentSummary
        ? {
            amount: (arg as { total: number }).total,
            tipAmount: (arg as { tip: number }).tip ?? 0,
            method: ((arg as { method: string }).method ?? "other") as "card" | "cash" | "mobile" | "other",
          }
        : {
            amount: table.bill?.total ?? 0,
            tipAmount: 0,
            method: "other" as const,
          }
      if (currentLocationId && activeStoreTable?.id) {
        const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(
          currentLocationId,
          activeStoreTable.id
        ))
        const result = sid
          ? await fetchPos(`/api/sessions/${sid}/close`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payment,
                options,
                eventSource: "table_page",
              }),
            }, { idempotencyKey })
              .then(async (response) => {
                const payload = await response.json().catch(() => null)
                if (payload && typeof payload === "object") {
                  return payload as {
                    ok: boolean
                    reason?: string
                    error?: string
                    items?: Array<{ id: string; itemName: string; status: string; quantity: number }>
                    remaining?: number
                    sessionTotal?: number
                    paymentsTotal?: number
                    correlationId?: string
                  }
                }
                return {
                  ok: false,
                  reason: response.ok ? "unknown_error" : "request_failed",
                  error: response.ok ? "Unknown response" : response.statusText,
                }
              })
              .catch(() => ({ ok: false, reason: "network_error", error: "Network request failed" }))
          : { ok: false as const, reason: "session_not_open" as const }
        if (!result.ok) {
        const msg =
          result.reason === "unfinished_items"
            ? `Cannot close: ${result.items?.length ?? 0} item(s) still pending, preparing, or ready. Finish or void them first.`
            : result.reason === "unpaid_balance"
              ? `Cannot close: $${(result.remaining ?? 0).toFixed(2)} unpaid. Session total: $${(result.sessionTotal ?? 0).toFixed(2)}, payments: $${(result.paymentsTotal ?? 0).toFixed(2)}.`
              : result.reason === "invalid_tip"
                ? "Tip amount must be >= 0."
                : result.reason === "payment_in_progress"
                  ? "Cannot close: a payment is in progress."
                  : result.reason === "kitchen_mid_fire"
                    ? "Cannot close: items sent to kitchen but not yet started."
                    : result.reason === "session_not_open"
                      ? "Session is not open."
                      : result.error ?? "Cannot close table."
        setWarningDialog({ open: true, title: "Cannot close table", description: msg })
        return
      }
      if (sid && result.ok) {
        recordEventWithSource(
          currentLocationId!,
          sid,
          "payment_completed",
          "table_page",
          undefined,
          undefined,
          result.correlationId
        ).catch(() => {})
      }
      setSessionId(null)
    }
    if (activeStoreTable?.orderId) {
      closeOrder(activeStoreTable.orderId, table.bill)
    }
    if (activeStoreTable) {
      updateStoreTable(activeStoreTable.id, {
        status: "free",
        guests: 0,
        seatedAt: null,
        stage: null,
        session: null,
        sessionId: null,
      })
      if (currentLocationId) {
        updateTableLayout(currentLocationId, activeStoreTable.id, {
          status: "free",
          guests: 0,
          seatedAt: null,
          stage: null,
        }).catch((err) => console.error("[TableDetail] Failed to persist close table:", err))
      }
      // Sync local state from store so meal progress / waves / orders clear immediately
      const closedTable = useRestaurantStore.getState().tables.find(
        (t) => t.id === activeStoreTable.id || t.id === activeStoreTable.id.toLowerCase()
      )
      if (closedTable) {
        setTable(buildTableDetailFromStore(closedTable))
      }
    }

    setTable((prev) => ({
      ...prev,
      status: "available",
      guestCount: 0,
      seats: [],
      waves: [],
      notes: [],
      bill: {
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    }))
    setOrderItems([])
    setTableItems([])
    setSelectedSeat(null)
    setWaveCount(1)
    setSelectedWaveNumber(1)
    setIsOrderingInline(false)
    setPaymentOpen(false)
    setInfoOpen(false)
    setAlertDismissed(false)
    router.push("/floor-map")
  },
    [activeStoreTable, closeOrder, currentLocationId, table.bill, updateStoreTable, router, effectiveSessionId]
  )

  const handlePaymentComplete = handleCloseTable

  const handleAddToOrder = useCallback((customization: ItemCustomization) => {
    const menuItem = menuSource.menuItems.find((m) => m.id === customization.menuItemId)
    const draftId = editingOrderItemId ?? `to-${Date.now()}`
    const newOrderItem: TakeOrderItem = {
      id: draftId,
      menuItemId: customization.menuItemId,
      name: customization.name,
      seat: customization.seat,
      quantity: customization.quantity,
      options: customization.options,
      extras: customization.extras,
      notes: [customization.notes, `Wave ${customization.waveNumber}`].filter(Boolean).join(" · "),
      price: customization.totalPrice,
      wave: menuItem?.category === "drinks" ? "drinks" : "food",
    }
    if (editingOrderItemId) {
      setOrderItems((prev) =>
        prev.map((item) => (item.id === editingOrderItemId ? newOrderItem : item))
      )
    } else {
      setOrderItems((prev) => [...prev, newOrderItem])
    }
    triggerAddContextPulse(customization.seat, customization.waveNumber)
    setCustomizingItem(null)
    setCustomizeDefaults(null)
    setEditingOrderItemId(null)
  }, [editingOrderItemId, triggerAddContextPulse])

  const handleQuickAddMenuItem = useCallback((item: MenuItem) => {
    const seatNumber = selectedSeatNumber ?? 0
    const selectedOptions = getAutoSelectedOptions(item)
    const optionUpcharge = getAutoOptionUpcharge(item, selectedOptions)
    const unitPrice = item.price + optionUpcharge

    const newOrderItem: TakeOrderItem = {
      id: `to-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      seat: seatNumber,
      quantity: 1,
      options: selectedOptions,
      extras: [],
      notes: `Wave ${selectedWaveNumber}`,
      price: unitPrice,
      wave: item.category === "drinks" ? "drinks" : "food",
    }

    setOrderItems((prev) => [...prev, newOrderItem])
    triggerAddContextPulse(seatNumber, selectedWaveNumber)
  }, [selectedSeatNumber, selectedWaveNumber, triggerAddContextPulse])

  const handleSeated = useCallback((formData: import("@/lib/floor-map-data").SeatPartyForm) => {
    // Update the table state to reflect the newly seated party with all details
    setTable((prev) => {
      // Create seats array from form data
      const seats = Array.from({ length: formData.partySize }, (_, i) => {
        const seatNumber = i + 1
        const dietary: string[] = []
        
        // Add dietary restrictions for this seat
        formData.dietary.forEach((d) => {
          if (d.seats.includes(seatNumber)) {
            dietary.push(d.restriction)
          }
        })
        
        const notes: string[] = []
        
        // Add occasion note if this is the occasion seat
        if (formData.occasion && formData.occasion.seat === seatNumber) {
          notes.push(`${formData.occasion.type}: ${formData.occasion.notes}`)
        }
        
        return {
          number: seatNumber,
          dietary,
          notes,
          items: [],
        }
      })
      
      // Add general notes to the table
      const tableNotes = formData.notes ? [{ text: formData.notes, icon: "📝" }] : []
      if (formData.occasion && !formData.occasion.seat) {
        tableNotes.push({ text: `${formData.occasion.type}: ${formData.occasion.notes}`, icon: "🎉" })
      }
      
      return {
        ...prev,
        status: "seated",
        guestCount: formData.partySize,
        seatedAt: new Date().toISOString(),
        lastCheckIn: new Date().toISOString(),
        seats,
        notes: [...prev.notes, ...tableNotes],
      }
    })
    setOrderItems([])
    setTableItems([])
    setWaveCount(1)
    setSelectedWaveNumber(1)
    setArmedWaveDelete(null)
    setArmedSeatDelete(null)
    setIsOrderingInline(false)
    setSeatPartyOpen(false)
    openOrderForTable(activeStoreTable?.id ?? id, formData.partySize)
    fetch("/api/sessions/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableUuid: id,
        locationId: currentLocationId ?? "",
        guestCount: formData.partySize,
      }),
    })
      .then(async (res) => {
        const payload = await res.json()
        if (!payload.ok) throw new Error(payload.error?.message ?? "Failed to ensure session")
        return payload.data
      })
      .then((data) => {
        if (data?.sessionId && activeStoreTable) {
          const sid = data.sessionId
          setSessionId(sid)
          updateStoreTable(activeStoreTable.id, { sessionId: sid })
          recordEventWithSource(currentLocationId!, sid, "guest_seated", "table_page", {
            guestCount: formData.partySize,
          }).catch(() => {})
        }
      })
      .catch(() => {})
  }, [currentLocationId, activeStoreTable?.id, activeStoreTable, id, openOrderForTable, updateStoreTable])

  return (
    <div className="flex h-full min-h-0 flex-col bg-background pb-14">
      {/* Top Bar */}
      <TopBar
        table={table}
        onToggleInfo={() => setInfoOpen((v) => !v)}
        onCloseTable={handleCloseTable}
      />

      {/* Food Ready Alert */}
      {showAlert && (
        <FoodReadyAlert
          seats={table.seats}
          onDismiss={() => setAlertDismissed(true)}
          onAcknowledge={() => setAlertDismissed(true)}
        />
      )}

      {/* Kitchen Delay Alert */}
      {kitchenDelays && kitchenDelays.length > 0 && !kitchenDelayDismissed && (
        <KitchenDelayAlert
          items={kitchenDelays}
          onDismiss={() => setKitchenDelayDismissed(true)}
        />
      )}

      {/* Main content area - responsive grid */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* CENTER: Main content */}
          <main className="flex flex-1 flex-col overflow-y-auto">
            {/* Mobile: Table Visual */}
            <div className="shrink-0 border-b border-border bg-card md:hidden">
              <div className="p-3">
                <TableVisual
                  tableNumber={table.number}
                  seats={table.seats}
                  selectedSeat={selectedSeat}
                  onSelectSeat={setSelectedSeat}
                  status={table.status}
                  onAddItemsForSeat={handleEnterOrdering}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {table.status === "available" ? (
                /* Available Table CTA */
                <div className="flex h-full flex-col items-center justify-center gap-4 p-3 md:p-4 lg:p-5">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground">Table is Available</h3>
                      <p className="text-sm text-muted-foreground mt-1">Ready to seat a new party</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => setSeatPartyOpen(true)}
                    className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground mt-2"
                  >
                    <Users className="h-4 w-4" />
                    Seat Party Here
                  </Button>
                </div>
              ) : isOrderingInline ? (
                <div className="relative flex h-full flex-col overflow-hidden">
                  <div className="relative z-20 border-b border-border bg-card px-3 py-2 md:px-4 overflow-visible">
                    <div className="flex min-w-0 items-center gap-3 overflow-visible">
                      <div className="min-w-0 flex-1">
                        <MenuSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          inputClassName="h-7 text-xs"
                        />
                      </div>

                      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-2">
                        <span className="pointer-events-none relative -z-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Wave
                        </span>
                        <div className="relative z-30 -mx-2 my-[-8px] flex min-w-0 max-w-[min(36vw,22rem)] items-center gap-1 overflow-x-auto scrollbar-none px-2 py-2">
                          {waveNumbers.map((waveNumber) => (
                            <div key={waveNumber} className="relative flex shrink-0 items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (waveHoldTriggeredRef.current === waveNumber) {
                                    waveHoldTriggeredRef.current = null
                                    return
                                  }
                                  if (selectedWaveNumber === waveNumber) {
                                    setArmedWaveDelete((prev) =>
                                      prev === waveNumber ? null : waveNumber
                                    )
                                  } else {
                                    setSelectedWaveNumber(waveNumber)
                                    setArmedWaveDelete(null)
                                  }
                                }}
                                onPointerDown={() => armWaveDeleteByHold(waveNumber)}
                                onPointerUp={() => {
                                  clearWaveHoldTimer()
                                  setTimeout(() => {
                                    if (waveHoldTriggeredRef.current === waveNumber) {
                                      waveHoldTriggeredRef.current = null
                                    }
                                  }, 0)
                                }}
                                onPointerLeave={clearWaveHoldTimer}
                                onPointerCancel={clearWaveHoldTimer}
                                onContextMenu={(e) => {
                                  e.preventDefault()
                                  setArmedWaveDelete(waveNumber)
                                }}
                                className={`h-7 shrink-0 rounded-md border px-2 text-[11px] font-semibold transition-colors ${
                                  selectedWaveNumber === waveNumber
                                    ? "relative z-40 border-amber-400 bg-amber-500/15 text-amber-200 animate-selected-chip [--chip-glow:rgba(251,191,36,0.5)]"
                                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                                }`}
                                aria-label={`Wave ${waveNumber}`}
                                title="Hold to reveal delete"
                              >
                                W{waveNumber}
                              </button>
                              {armedWaveDelete === waveNumber && waveCount > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteWave(waveNumber)
                                  }}
                                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                  aria-label={`Delete wave ${waveNumber}`}
                                  title={`Delete Wave ${waveNumber}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const nextWave = waveCount + 1
                              setWaveCount(nextWave)
                              setSelectedWaveNumber(nextWave)
                              if (currentLocationId && activeStoreTable?.id) {
                                const run = async () => {
                                  const sid = effectiveSessionId ?? (await getOpenSessionIdForTable(currentLocationId, activeStoreTable.id))
                                  if (sid) {
                                    fetch(`/api/sessions/${sid}/waves/next`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ eventSource: "table_page" }),
                                    })
                                      .then(async (res) => {
                                        const payload = await res.json()
                                        if (!payload.ok) throw new Error(payload.error?.message ?? "Failed to create next wave")
                                        return payload.data
                                      })
                                      .catch(() => {})
                                  }
                                }
                                run()
                              }
                            }}
                            className="h-7 shrink-0 rounded-md border border-border bg-background px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent"
                            aria-label="Add wave"
                            title="Add wave"
                          >
                            +
                          </button>
                        </div>
                        </div>

                        <div className="h-5 w-px shrink-0 bg-border/60" />

                        <div className="flex min-w-0 items-center gap-2">
                          <span className="pointer-events-none relative -z-10 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Seats
                          </span>
                          <div className="relative z-30 -mx-2 my-[-8px] flex min-w-0 max-w-[min(42vw,26rem)] items-center gap-1 overflow-x-auto scrollbar-none px-2 py-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSeat(null)}
                              className={`h-7 shrink-0 rounded-md border px-2 text-[11px] font-semibold transition-colors ${
                                selectedSeat === null
                                  ? "relative z-40 border-primary bg-primary text-primary-foreground animate-selected-chip [--chip-glow:rgba(56,189,248,0.5)]"
                                  : "border-border bg-background text-muted-foreground hover:bg-accent"
                              }`}
                              aria-label={`Table ${table.number}`}
                            >
                              T-{table.number}
                            </button>
                            {table.seats.map((seat) => (
                              <div key={seat.number} className="relative flex shrink-0 items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSeat(seat.number)
                                    if (armedSeatDelete !== seat.number) setArmedSeatDelete(null)
                                  }}
                                  onPointerDown={() => armSeatDeleteByHold(seat.number)}
                                  onPointerUp={clearSeatHoldTimer}
                                  onPointerLeave={clearSeatHoldTimer}
                                  onPointerCancel={clearSeatHoldTimer}
                                  onContextMenu={(e) => {
                                    e.preventDefault()
                                    setArmedSeatDelete(seat.number)
                                  }}
                                  className={`h-7 shrink-0 rounded-md border px-2 text-[11px] font-semibold transition-colors ${
                                    selectedSeatNumber === seat.number
                                      ? "relative z-40 border-primary bg-primary text-primary-foreground animate-selected-chip [--chip-glow:rgba(56,189,248,0.5)]"
                                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                                  }`}
                                  aria-label={`Seat ${seat.number}`}
                                  title="Hold to reveal delete"
                                >
                                  S{seat.number}
                                </button>
                                {armedSeatDelete === seat.number && table.seats.length > 1 && (
                                  <div className="ml-1 flex items-center gap-0.5">
                                    {seatRenameState?.seatNumber === seat.number ? (
                                      <>
                                        <input
                                          type="number"
                                          min={1}
                                          max={99}
                                          value={seatRenameState.input}
                                          onChange={(e) =>
                                            setSeatRenameState((s) =>
                                              s ? { ...s, input: e.target.value } : s
                                            )
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              const n = parseInt(
                                                seatRenameState.input,
                                                10
                                              )
                                              if (
                                                Number.isFinite(n) &&
                                                n >= 1 &&
                                                n !== seat.number
                                              ) {
                                                handleRenameSeat(seat.number, n)
                                              }
                                            }
                                            if (e.key === "Escape") {
                                              setSeatRenameState(null)
                                              setArmedSeatDelete(null)
                                            }
                                          }}
                                          className="h-7 w-12 rounded-md border border-border bg-background px-1.5 text-center text-[11px] font-semibold tabular-nums"
                                          autoFocus
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const n = parseInt(
                                              seatRenameState.input,
                                              10
                                            )
                                            if (
                                              Number.isFinite(n) &&
                                              n >= 1 &&
                                              n !== seat.number
                                            ) {
                                              handleRenameSeat(seat.number, n)
                                            }
                                          }}
                                          className="h-7 px-1.5 text-[10px] font-semibold text-emerald-400"
                                        >
                                          OK
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSeatRenameState(null)
                                            setArmedSeatDelete(null)
                                          }}
                                          className="h-7 px-1 text-[10px] font-semibold text-muted-foreground"
                                        >
                                          ×
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSeatRenameState({
                                              seatNumber: seat.number,
                                              input: String(seat.number),
                                            })
                                          }
                                          className="h-7 px-1.5 text-[10px] font-semibold text-sky-400 hover:text-sky-300"
                                          title={`Rename seat ${seat.number}`}
                                        >
                                          Rename
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteSeat(seat.number)
                                          }
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                          aria-label={`Delete seat ${seat.number}`}
                                          title={`Delete Seat ${seat.number}`}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={handleAddSeat}
                              className="h-7 shrink-0 rounded-md border border-border bg-background px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent"
                              aria-label="Add seat"
                              title="Add seat"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-1">
                    <aside className="hidden w-48 shrink-0 border-r border-border bg-card lg:block">
                      <CategoryNav
                        categories={menuSource.categories}
                        selectedCategory={selectedCategory}
                        selectedCategories={searchQuery.trim() ? matchedCategoryIds : undefined}
                        onSelectCategory={setSelectedCategory}
                        variant="vertical"
                      />
                    </aside>

                    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                      {addContextPulse && (
                        <div
                          key={addContextPulse.id}
                          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                        >
                          <div className="animate-add-context-burst rounded-2xl border border-sky-300/40 bg-slate-950/45 px-7 py-5 shadow-[0_24px_64px_rgba(2,6,23,0.68)] backdrop-blur-[2px]">
                            <div className="flex items-center gap-4">
                              <span className="inline-flex h-20 min-w-[8.5rem] items-center justify-center rounded-2xl border border-amber-300/60 bg-gradient-to-b from-amber-300/30 to-amber-700/24 px-5 text-4xl font-black tracking-[0.08em] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_28px_rgba(245,158,11,0.32)]">
                                {addContextPulse.waveLabel}
                              </span>
                              <span className="inline-flex h-20 min-w-[8.5rem] items-center justify-center rounded-2xl border border-sky-300/60 bg-gradient-to-b from-sky-300/32 to-sky-700/24 px-5 text-4xl font-black tracking-[0.08em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.46),0_14px_28px_rgba(14,165,233,0.34)]">
                                {addContextPulse.targetLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="lg:hidden">
                        <CategoryNav
                          categories={menuSource.categories}
                          selectedCategory={selectedCategory}
                          selectedCategories={searchQuery.trim() ? matchedCategoryIds : undefined}
                          onSelectCategory={setSelectedCategory}
                          variant="horizontal"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5">
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                          {filteredMenuItems.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              categoryLabel={
                                searchQuery.trim()
                                  ? menuSource.categories.find((c) => c.id === item.category)?.name ??
                                    item.category
                                  : undefined
                              }
                              hasAllergyConflict={!!selectedSeat && hasAllergyConflict(item, table.seats.find((seat) => seat.number === selectedSeat)?.dietary ?? [])}
                              onClick={handleQuickAddMenuItem}
                            />
                          ))}
                        </div>

                        {filteredMenuItems.length === 0 && (
                          <div className="flex h-64 items-center justify-center">
                            <p className="text-muted-foreground">No items found</p>
                          </div>
                        )}
                      </div>
                    </main>
                  </div>
                </div>
              ) : (
                <>
                  {/* Wave Timeline */}
                  {hasMealProgress && (
                    <div className="mb-4 px-3 pb-1 pt-3 md:px-4 md:pb-1 md:pt-4 lg:px-5 lg:pb-1 lg:pt-5">
                      <WaveTimeline
                        waves={mealProgress.waves}
                        seats={table.seats}
                        onFireWave={handleFireWave}
                        onMarkWaveServed={handleMarkWaveServed}
                        tableNumber={table.number}
                        waveItemsById={mealProgress.waveItemsById}
                        waveLabelsById={mealProgress.waveLabelsById}
                      />
                    </div>
                  )}

                  {/* Orders */}
                  <div
                    className={
                      hasMealProgress
                        ? "px-3 pb-3 pt-0 md:px-4 md:pb-4 md:pt-0 lg:px-5 lg:pb-5 lg:pt-0"
                        : "px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4 lg:px-5 lg:pb-5 lg:pt-5"
                    }
                  >
                    <OrderList
                      tableNumber={table.number}
                      seats={table.seats}
                      tableItems={tableItems}
                      selectedSeat={selectedSeat}
                      onAddItemsTarget={handleEnterOrdering}
                      onAdvanceWaveStatus={handleAdvanceWaveStatus}
                      onMarkServed={handleMarkServed}
                      onVoidItem={handleVoidItem}
                    />
                  </div>
                </>
              )}
            </div>
          </main>

          {/* RIGHT COLUMN: Table visual + Server + Table Info (hidden on mobile) */}
          {isOrderingInline ? (
            <aside className="hidden w-72 shrink-0 border-l border-border bg-card md:block lg:w-80">
              <OrderSummary
                items={summaryItems}
                seats={summarySeats}
                total={summaryTotals.total}
                enableWaveView
                summaryScope={summaryScope}
                canSeatScope={selectedSeat !== null}
                onSummaryScopeChange={setSummaryScope}
                onQuantityChange={handleQuantityChange}
                onEditItem={(itemId) => {
                  const item = orderItems.find((i) => i.id === itemId)
                  if (!item) return
                  const menuItem = menuSource.menuItems.find((m) => m.id === item.menuItemId)
                  if (menuItem) {
                    setCustomizeDefaults({
                      seat: item.seat,
                      wave: getDraftItemWaveNumber(item),
                    })
                    setEditingOrderItemId(item.id)
                    setCustomizingItem(menuItem)
                  }
                }}
                onRemoveItem={handleRemoveItem}
              />
            </aside>
          ) : (
            <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-card md:block lg:w-80">
              <div className="px-4 pt-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Table Info
                </h2>
              </div>
              <div className="px-4 pt-7 pb-1">
                <TableVisual
                  tableNumber={table.number}
                  seats={table.seats}
                  selectedSeat={selectedSeat}
                  onSelectSeat={setSelectedSeat}
                  status={table.status}
                  onAddItemsForSeat={handleEnterOrdering}
                />
              </div>
              <div className="px-4 pb-4">
                <InfoPanel table={table} showTitle={false} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        table={table}
        onFireWave={handleFireWave}
        canFireWave={mealProgress.nextFireableWaveNumber !== null}
        nextFireWaveLabel={
          mealProgress.nextFireableWaveNumber
            ? `Fire W${mealProgress.nextFireableWaveNumber}`
            : "Fire Wave"
        }
        onFireNextWave={handleFireNextWave}
        onSend={handleSendCurrentOrder}
        onBill={() => {
          if (currentLocationId && id) {
            const record = (sid: string) =>
              recordEventWithSource(currentLocationId!, sid, "bill_requested", "table_page").catch(() => {})
            if (effectiveSessionId) record(effectiveSessionId)
            else getOpenSessionIdForTable(currentLocationId, id).then((sid) => { if (sid) record(sid) })
          }
          setPaymentOpen(true)
        }}
        onAddItems={() => {
          if (isOrderingInline) {
            if (orderItems.length > 0) {
              setDiscardDraftDialogOpen(true)
              return
            }
            handleExitOrderingView()
            return
          }
          handleEnterOrdering()
        }}
        isOrdering={isOrderingInline}
        hasPendingSend={hasPendingSend}
        canBill={canBill}
      />

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        tableNumber={table.number}
        guestCount={table.guestCount}
        seats={table.seats}
        tableItems={tableItems}
        onComplete={handlePaymentComplete}
        outstandingItems={outstandingItems}
      />

      {/* Mobile/Tablet: Info panel as sheet */}
      <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Table Info</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {isOrderingInline ? (
              <OrderSummary
                items={summaryItems}
                seats={summarySeats}
                total={summaryTotals.total}
                enableWaveView
                summaryScope={summaryScope}
                canSeatScope={selectedSeat !== null}
                onSummaryScopeChange={setSummaryScope}
                onQuantityChange={handleQuantityChange}
                onEditItem={(itemId) => {
                  const item = orderItems.find((i) => i.id === itemId)
                  if (!item) return
                  const menuItem = menuSource.menuItems.find((m) => m.id === item.menuItemId)
                  if (menuItem) {
                    setCustomizeDefaults({
                      seat: item.seat,
                      wave: getDraftItemWaveNumber(item),
                    })
                    setEditingOrderItemId(item.id)
                    setCustomizingItem(menuItem)
                  }
                  setInfoOpen(false)
                }}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <InfoPanel table={table} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CustomizeItemModal
        item={customizingItem}
        seats={orderSeats}
        defaultSeat={customizeDefaults?.seat ?? selectedSeat ?? table.seats[0]?.number ?? 1}
        defaultWave={customizeDefaults?.wave ?? selectedWaveNumber}
        waveOptions={waveNumbers}
        submitLabel={editingOrderItemId ? "Save Changes" : "Add to Order"}
        open={!!customizingItem}
        onClose={() => {
          setCustomizingItem(null)
          setCustomizeDefaults(null)
          setEditingOrderItemId(null)
        }}
        onAddToOrder={handleAddToOrder}
      />

      <Dialog
        open={warningDialog.open}
        onOpenChange={(open) =>
          setWarningDialog((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent className="max-w-md border-red-500/30 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              {warningDialog.title}
            </DialogTitle>
            <DialogDescription>{warningDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() =>
                setWarningDialog((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discardDraftDialogOpen} onOpenChange={setDiscardDraftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard unsent items?</DialogTitle>
            <DialogDescription>
              You have items in Current Order that are not sent yet. Leaving now will discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardDraftDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                setOrderItems([])
                setCustomizingItem(null)
                setCustomizeDefaults(null)
                setEditingOrderItemId(null)
                handleExitOrderingView()
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seat Party Modal */}
      <SeatPartyModal
        open={seatPartyOpen}
        tables={floorTablesForModal}
        preSelectedTableId={table.id}
        onClose={() => setSeatPartyOpen(false)}
        onSeated={handleSeated}
      />
    </div>
  )
}
