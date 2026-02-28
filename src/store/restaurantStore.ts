import { create } from "zustand"
import type {
  StoreOrder,
  StoreOrderTimelineEvent,
  StoreOrderItem,
  StoreTable,
  StoreTableBillState,
  StoreTableSessionState,
  StoreReservation,
  WaitlistEntry,
  StoreTableStatus,
} from "./types"

/**
 * Default state: empty. Data is hydrated from Neon when location is set.
 * No mock seeding - DB is source of truth.
 */
function createDefaultTables(): StoreTable[] {
  return []
}

function createDefaultReservations(): StoreReservation[] {
  return []
}

function createDefaultWaitlist(): WaitlistEntry[] {
  return []
}

function normalizeTableId(id: string): string {
  return id.toLowerCase()
}

function getOrderItemWaveNumber(item: StoreOrderItem): number {
  if (typeof item.waveNumber === "number" && Number.isFinite(item.waveNumber) && item.waveNumber > 0) {
    return item.waveNumber
  }
  const waveTag = item.mods?.find((mod) => /^Wave\s+\d+$/i.test(mod))
  if (waveTag) {
    const match = waveTag.match(/(\d+)/)
    if (match) {
      const parsed = Number(match[1])
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  }

  if (item.wave === "drinks") return 1
  if (item.wave === "food") return 2
  if (item.wave === "dessert") return 3
  return 1
}

function getWaveStatus(items: StoreOrderItem[]): StoreOrder["waves"][number]["status"] {
  const activeItems = items.filter((item) => item.status !== "void")
  if (activeItems.length === 0) return "held"
  if (activeItems.every((item) => item.status === "served")) return "served"
  if (activeItems.some((item) => item.status === "ready")) return "ready"
  if (activeItems.some((item) => item.status === "cooking")) return "cooking"
  if (activeItems.some((item) => item.status === "sent")) return "sent"
  return "held"
}

function hasSessionData(session: StoreTableSessionState): boolean {
  return (
    session.guestCount > 0 ||
    session.tableItems.some((item) => item.status !== "void") ||
    session.seats.some((seat) => seat.items.some((item) => item.status !== "void"))
  )
}

function buildOrderWaves(session: StoreTableSessionState): StoreOrder["waves"] {
  const allItems = [
    ...session.seats.flatMap((seat) => seat.items),
    ...session.tableItems,
  ].filter((item) => item.status !== "void")
  if (allItems.length === 0) return []

  const grouped = new Map<number, StoreOrderItem[]>()
  for (const item of allItems) {
    const waveNumber = getOrderItemWaveNumber(item)
    const existing = grouped.get(waveNumber) ?? []
    existing.push(item)
    grouped.set(waveNumber, existing)
  }

  const maxWave = Math.max(1, session.waveCount || 1, ...Array.from(grouped.keys()))
  const waves: StoreOrder["waves"] = []
  for (let waveNumber = 1; waveNumber <= maxWave; waveNumber += 1) {
    const items = grouped.get(waveNumber) ?? []
    waves.push({
      number: waveNumber,
      status: getWaveStatus(items),
      itemCount: items.length,
    })
  }
  return waves
}

function calculateSessionBill(session: StoreTableSessionState): StoreTableBillState {
  if (session.bill.total > 0 || session.bill.subtotal > 0) {
    return {
      subtotal: session.bill.subtotal,
      tax: session.bill.tax,
      total: session.bill.total,
    }
  }

  const subtotal = [
    ...session.seats.flatMap((seat) => seat.items),
    ...session.tableItems,
  ]
    .filter((item) => item.status !== "void")
    .reduce((sum, item) => sum + item.price, 0)

  return {
    subtotal,
    tax: 0,
    total: subtotal,
  }
}

function createEmptySession(guestCount: number): StoreTableSessionState {
  const safeGuestCount = Math.max(0, Math.floor(guestCount))
  return {
    status: safeGuestCount > 0 ? "seated" : "available",
    guestCount: safeGuestCount,
    notes: [],
    seats: Array.from({ length: safeGuestCount }, (_, index) => ({
      number: index + 1,
      dietary: [],
      notes: [],
      items: [],
    })),
    tableItems: [],
    waveCount: 1,
    bill: {
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  }
}

function createOrderId(): string {
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeOrderTimeline(order: Partial<StoreOrder>): StoreOrderTimelineEvent[] {
  const validEventTypes = new Set<StoreOrderTimelineEvent["type"]>([
    "opened",
    "wave_status_changed",
    "closed",
  ])
  const validWaveStatuses = new Set<StoreOrder["waves"][number]["status"]>([
    "held",
    "sent",
    "cooking",
    "ready",
    "served",
  ])
  if (!Array.isArray(order.timeline)) return []
  return order.timeline
    .filter(
      (event): event is StoreOrderTimelineEvent =>
        !!event &&
        typeof event === "object" &&
        typeof event.at === "string" &&
        typeof event.type === "string" &&
        validEventTypes.has(event.type as StoreOrderTimelineEvent["type"])
    )
    .map((event) => ({
      type: event.type as StoreOrderTimelineEvent["type"],
      at: event.at,
      waveNumber: typeof event.waveNumber === "number" ? event.waveNumber : undefined,
      fromStatus:
        typeof event.fromStatus === "string" &&
        validWaveStatuses.has(event.fromStatus as StoreOrder["waves"][number]["status"])
          ? (event.fromStatus as StoreOrder["waves"][number]["status"])
          : undefined,
      toStatus:
        typeof event.toStatus === "string" &&
        validWaveStatuses.has(event.toStatus as StoreOrder["waves"][number]["status"])
          ? (event.toStatus as StoreOrder["waves"][number]["status"])
          : undefined,
    }))
}

function normalizePersistedOrder(order: Partial<StoreOrder>): StoreOrder | null {
  if (!order || typeof order !== "object") return null
  if (typeof order.id !== "string" || typeof order.tableId !== "string") return null
  if (!order.session || typeof order.session !== "object") return null
  if (!Array.isArray(order.waves)) return null

  const openedAt = typeof order.openedAt === "string" ? order.openedAt : new Date().toISOString()
  const updatedAt = typeof order.updatedAt === "string" ? order.updatedAt : openedAt
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: typeof order.tableNumber === "number" ? order.tableNumber : 0,
    status: order.status === "closed" ? "closed" : "open",
    openedAt,
    updatedAt,
    closedAt: typeof order.closedAt === "string" ? order.closedAt : undefined,
    guestCount: typeof order.guestCount === "number" ? order.guestCount : order.session.guestCount ?? 0,
    waveCount: typeof order.waveCount === "number" ? order.waveCount : Math.max(1, order.waves.length),
    waves: order.waves,
    bill: order.bill ?? calculateSessionBill(order.session),
    session: order.session,
    timeline: normalizeOrderTimeline(order),
  }
}

export interface RestaurantState {
  tables: StoreTable[]
  orders: StoreOrder[]
  reservations: StoreReservation[]
  waitlist: WaitlistEntry[]
}

export interface RestaurantActions {
  getTables: () => StoreTable[]
  getTable: (id: string) => StoreTable | undefined
  updateTable: (id: string, patch: Partial<StoreTable>) => void
  setTables: (tables: StoreTable[]) => void
  getOrders: () => StoreOrder[]
  getOrderById: (id: string) => StoreOrder | undefined
  getOpenOrderForTable: (tableId: string) => StoreOrder | undefined
  openOrderForTable: (tableId: string, guestCount?: number) => string | null
  syncOrderSession: (tableId: string, session: StoreTableSessionState) => string | null
  closeOrder: (orderId: string, bill?: Partial<StoreTableBillState>) => void
  getReservations: () => StoreReservation[]
  getReservation: (id: string) => StoreReservation | undefined
  createReservation: (r: StoreReservation) => void
  updateReservation: (id: string, patch: Partial<StoreReservation>) => void
  setReservations: (r: StoreReservation[]) => void
  assignReservationToTable: (reservationId: string, tableId: string) => void
  getWaitlist: () => WaitlistEntry[]
  setWaitlist: (entries: WaitlistEntry[]) => void
  addToWaitlist: (entry: WaitlistEntry) => void
  removeFromWaitlist: (id: string) => void
  updateWaitlistEntry: (id: string, patch: Partial<WaitlistEntry>) => void
}

export type RestaurantStore = RestaurantState & RestaurantActions
const RESTAURANT_STORE_STORAGE_KEY = "restaurant_store_v1"
const RESTAURANT_STORE_STORAGE_VERSION = 2

interface PersistedRestaurantSnapshotV2 {
  version: number
  data?: Partial<RestaurantState>
}

function createDefaultState(): RestaurantState {
  return {
    tables: createDefaultTables(),
    orders: [],
    reservations: createDefaultReservations(),
    waitlist: createDefaultWaitlist(),
  }
}

function readPersistedState(): RestaurantState | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(RESTAURANT_STORE_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as
      | Partial<RestaurantState>
      | { state?: Partial<RestaurantState> }
      | PersistedRestaurantSnapshotV2
    const snapshot = (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      typeof parsed.version === "number" &&
      parsed.version >= RESTAURANT_STORE_STORAGE_VERSION &&
      parsed.data &&
      typeof parsed.data === "object"
        ? parsed.data
        : parsed &&
            typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state &&
      typeof parsed.state === "object"
        ? parsed.state
        : parsed
    ) as Partial<RestaurantState>

    if (!Array.isArray(snapshot.tables) || !Array.isArray(snapshot.reservations) || !Array.isArray(snapshot.waitlist)) {
      return null
    }
    return {
      tables: snapshot.tables as StoreTable[],
      orders: Array.isArray(snapshot.orders)
        ? (snapshot.orders as Partial<StoreOrder>[])
            .map(normalizePersistedOrder)
            .filter((order): order is StoreOrder => order !== null)
        : [],
      reservations: snapshot.reservations as StoreReservation[],
      waitlist: snapshot.waitlist as WaitlistEntry[],
    }
  } catch {
    return null
  }
}

function createInitialState(): RestaurantState {
  return readPersistedState() ?? createDefaultState()
}

const initialState = createInitialState()

export const useRestaurantStore = create<RestaurantStore>()((set, get) => ({
  tables: initialState.tables,
  orders: initialState.orders,
  reservations: initialState.reservations,
  waitlist: initialState.waitlist,

  getTables: () => get().tables,
  getTable: (id: string) => get().tables.find((t) => t.id === id.toLowerCase() || t.id === id),
  updateTable: (id: string, patch: Partial<StoreTable>) => {
    const normalizedId = id.toLowerCase()
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === normalizedId ? { ...t, ...patch, id: t.id } : t
      ),
    }))
  },
  setTables: (tables) =>
    set((state) => ({
      tables: tables.map((incoming) => {
        const existing = state.tables.find((t) => t.id === incoming.id)
        if (!existing) return incoming
        return {
          ...incoming,
          status: existing.status,
          guests: existing.guests,
          serverId: existing.serverId,
          serverName: existing.serverName,
          orderId: existing.orderId,
          reservationId: existing.reservationId,
          seatedAt: existing.seatedAt,
          stage: existing.stage,
          alerts: existing.alerts,
          combinedWith: existing.combinedWith ?? incoming.combinedWith,
          session: existing.session,
          sessionId: existing.sessionId ?? incoming.sessionId,
        }
      }),
    })),

  getOrders: () => get().orders,
  getOrderById: (id: string) => get().orders.find((order) => order.id === id),
  getOpenOrderForTable: (tableId: string) => {
    const normalizedTableId = normalizeTableId(tableId)
    const state = get()
    const linkedOrder = state.tables
      .find((table) => table.id === normalizedTableId)
      ?.orderId
    if (linkedOrder) {
      const direct = state.orders.find(
        (order) => order.id === linkedOrder && order.status === "open"
      )
      if (direct) return direct
    }
    return state.orders.find(
      (order) => order.tableId === normalizedTableId && order.status === "open"
    )
  },
  openOrderForTable: (tableId: string, guestCount?: number) => {
    const normalizedTableId = normalizeTableId(tableId)
    const state = get()
    const table = state.tables.find((t) => t.id === normalizedTableId)
    if (!table) return null

    const existingOrder =
      get().getOpenOrderForTable(normalizedTableId) ?? null
    const now = new Date().toISOString()

    if (existingOrder) {
      const nextGuestCount =
        guestCount ??
        table.session?.guestCount ??
        table.guests ??
        existingOrder.guestCount
      const session = table.session ?? existingOrder.session ?? createEmptySession(nextGuestCount)
      const nextOrder = {
        ...existingOrder,
        status: "open" as const,
        guestCount: nextGuestCount,
        waveCount: Math.max(1, session.waveCount || 1),
        waves: buildOrderWaves(session),
        bill: calculateSessionBill(session),
        session,
        timeline: existingOrder.timeline ?? [],
      }
      const currentSnapshot = JSON.stringify({
        order: existingOrder,
        tableOrderId: table.orderId ?? null,
      })
      const nextSnapshot = JSON.stringify({
        order: nextOrder,
        tableOrderId: existingOrder.id,
      })
      if (currentSnapshot !== nextSnapshot) {
        set((current) => ({
          orders: current.orders.map((order) =>
            order.id === existingOrder.id
              ? { ...nextOrder, updatedAt: now }
              : order
          ),
          tables: current.tables.map((currentTable) =>
            currentTable.id === normalizedTableId
              ? { ...currentTable, orderId: existingOrder.id }
              : currentTable
          ),
        }))
      }
      return existingOrder.id
    }

    const seededGuestCount = guestCount ?? table.session?.guestCount ?? table.guests ?? 0
    const session = table.session ?? createEmptySession(seededGuestCount)
    const orderId = createOrderId()
    const order: StoreOrder = {
      id: orderId,
      tableId: normalizedTableId,
      tableNumber: table.number,
      status: "open",
      openedAt: now,
      updatedAt: now,
      guestCount: seededGuestCount,
      waveCount: Math.max(1, session.waveCount || 1),
      waves: buildOrderWaves(session),
      bill: calculateSessionBill(session),
      session,
      timeline: [{ type: "opened", at: now }],
    }

    set((current) => ({
      orders: [...current.orders, order],
      tables: current.tables.map((currentTable) =>
        currentTable.id === normalizedTableId
          ? { ...currentTable, orderId }
          : currentTable
      ),
    }))

    return orderId
  },
  syncOrderSession: (tableId: string, session: StoreTableSessionState) => {
    if (!hasSessionData(session)) return null

    const normalizedTableId = normalizeTableId(tableId)
    const ensuredOrderId = get().openOrderForTable(normalizedTableId, session.guestCount)
    if (!ensuredOrderId) return null

    const state = get()
    const currentOrder = state.orders.find((order) => order.id === ensuredOrderId)
    if (!currentOrder) return ensuredOrderId

    const now = new Date().toISOString()
    const currentWavesByNumber = new Map<number, StoreOrder["waves"][number]["status"]>(
      currentOrder.waves.map((wave) => [wave.number, wave.status])
    )
    const nextWaves = buildOrderWaves(session)
    const waveEvents: StoreOrderTimelineEvent[] = []
    for (const wave of nextWaves) {
      const previousStatus = currentWavesByNumber.get(wave.number)
      if (!previousStatus) {
        if (wave.status === "held") continue
        waveEvents.push({
          type: "wave_status_changed",
          at: now,
          waveNumber: wave.number,
          fromStatus: "held",
          toStatus: wave.status,
        })
        continue
      }
      if (previousStatus === wave.status) continue
      waveEvents.push({
        type: "wave_status_changed",
        at: now,
        waveNumber: wave.number,
        fromStatus: previousStatus,
        toStatus: wave.status,
      })
    }
    const nextOrder = {
      ...currentOrder,
      status: "open" as const,
      guestCount: session.guestCount,
      waveCount: Math.max(1, session.waveCount || 1),
      waves: nextWaves,
      bill: calculateSessionBill(session),
      session,
      timeline: [...(currentOrder.timeline ?? []), ...waveEvents],
    }

    const table = state.tables.find((t) => t.id === normalizedTableId)
    const currentSnapshot = JSON.stringify({
      order: currentOrder,
      tableOrderId: table?.orderId ?? null,
    })
    const nextSnapshot = JSON.stringify({
      order: nextOrder,
      tableOrderId: ensuredOrderId,
    })
    if (currentSnapshot !== nextSnapshot) {
      set((current) => ({
        orders: current.orders.map((order) =>
          order.id === ensuredOrderId
            ? { ...nextOrder, updatedAt: now }
            : order
        ),
        tables: current.tables.map((currentTable) =>
          currentTable.id === normalizedTableId
            ? { ...currentTable, orderId: ensuredOrderId }
            : currentTable
        ),
      }))
    }
    return ensuredOrderId
  },
  closeOrder: (orderId: string, bill?: Partial<StoreTableBillState>) => {
    set((state) => {
      const existing = state.orders.find((order) => order.id === orderId)
      if (!existing) return state

      const now = new Date().toISOString()
      const nextBill: StoreTableBillState = {
        subtotal: bill?.subtotal ?? existing.bill.subtotal,
        tax: bill?.tax ?? existing.bill.tax,
        total: bill?.total ?? existing.bill.total,
      }
      const needsOrderUpdate =
        existing.status !== "closed" ||
        existing.closedAt == null ||
        JSON.stringify(existing.bill) !== JSON.stringify(nextBill)
      const tableNeedsUnlink = state.tables.some((table) => table.orderId === orderId)
      if (!needsOrderUpdate && !tableNeedsUnlink) return state

      const hasClosedEvent = existing.timeline.some((event) => event.type === "closed")
      return {
        orders: state.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "closed",
                closedAt: order.closedAt ?? now,
                updatedAt: now,
                bill: nextBill,
                timeline: hasClosedEvent
                  ? order.timeline
                  : [...order.timeline, { type: "closed", at: now }],
              }
            : order
        ),
        tables: state.tables.map((table) =>
          table.orderId === orderId ? { ...table, orderId: null, sessionId: null } : table
        ),
      }
    })
  },

  getReservations: () => get().reservations,
  getReservation: (id: string) => get().reservations.find((r) => r.id === id),
  createReservation: (r) => set((state) => ({ reservations: [...state.reservations, r] })),
  updateReservation: (id: string, patch: Partial<StoreReservation>) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }))
  },
  setReservations: (reservations) => set({ reservations }),
  assignReservationToTable: (reservationId: string, tableId: string) => {
    const normalizedTableId = tableId.toLowerCase()
    const table = get().getTable(normalizedTableId)
    const tableNumber = table?.number?.toString() ?? tableId
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === reservationId
          ? { ...r, tableId: normalizedTableId, table: tableNumber, status: "confirmed" as const }
          : r
      ),
      tables: state.tables.map((t) =>
        t.id === normalizedTableId ? { ...t, status: "reserved" as StoreTableStatus, reservationId } : t
      ),
    }))
  },

  getWaitlist: () => get().waitlist,
  setWaitlist: (entries) => set({ waitlist: entries }),
  addToWaitlist: (entry) => set((state) => ({ waitlist: [...state.waitlist, entry] })),
  removeFromWaitlist: (id) =>
    set((state) => ({ waitlist: state.waitlist.filter((w) => w.id !== id) })),
  updateWaitlistEntry: (id: string, patch: Partial<WaitlistEntry>) => {
    set((state) => ({
      waitlist: state.waitlist.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }))
  },
}))

if (typeof window !== "undefined") {
  useRestaurantStore.subscribe((state) => {
    const snapshot: RestaurantState = {
      tables: state.tables,
      orders: state.orders,
      reservations: state.reservations,
      waitlist: state.waitlist,
    }
    try {
      window.localStorage.setItem(
        RESTAURANT_STORE_STORAGE_KEY,
        JSON.stringify({
          version: RESTAURANT_STORE_STORAGE_VERSION,
          data: snapshot,
        })
      )
    } catch {
      // Ignore storage write errors (quota/private mode), app state still works in-memory.
    }
  })
}

/** Use for getState()/subscribe() outside React (e.g. getFloorTables, handlePartySeated). In React use useRestaurantStore(selector). */
export const restaurantStore = useRestaurantStore
