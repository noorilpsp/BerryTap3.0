import type { StoreOrder, StoreOrderItem, StoreTable } from "@/store/types"

export interface TableLiveMetrics {
  durationMinutes: number | null
  ticketTotal: number
  waveCount: number
  firstFiredAt?: string
  firstReadyAt?: string
}

export interface DashboardOrderMetrics {
  openOrders: number
  closedOrders: number
  totalRevenue: number
  avgTicketTotal: number
  avgOpenSessionMinutes: number
  avgTurnMinutes: number
  avgWavesPerOrder: number
  avgMinutesToFirstFire: number | null
  avgMinutesToReady: number | null
}

export interface HourlyOrderTrendPoint {
  label: string
  orders: number
}

function parseIsoMillis(value?: string | null): number | null {
  if (!value) return null
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

function roundMinutes(ms: number): number {
  return Math.max(0, Math.round(ms / 60000))
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function averageOrNull(values: number[]): number | null {
  if (values.length === 0) return null
  return average(values)
}

function getOrderItemsTotal(items: StoreOrderItem[]): number {
  return items
    .filter((item) => item.status !== "void")
    .reduce((sum, item) => sum + item.price, 0)
}

function getOrderTotal(order: StoreOrder): number {
  if (order.bill.total > 0) return order.bill.total
  return getOrderItemsTotal([
    ...order.session.seats.flatMap((seat) => seat.items),
    ...order.session.tableItems,
  ])
}

function getFirstWaveEventAt(
  order: StoreOrder,
  toStatus: NonNullable<StoreOrder["timeline"][number]["toStatus"]>
): string | undefined {
  for (const event of order.timeline) {
    if (event.type !== "wave_status_changed" || event.toStatus !== toStatus) continue
    return event.at
  }
  return undefined
}

function getOpenOrderByTable(tables: StoreTable[], orders: StoreOrder[]): Map<string, StoreOrder> {
  const orderById = new Map(orders.map((order) => [order.id, order]))
  const openByTableId = new Map<string, StoreOrder>()

  for (const order of orders) {
    if (order.status !== "open" || openByTableId.has(order.tableId)) continue
    openByTableId.set(order.tableId, order)
  }

  for (const table of tables) {
    if (!table.orderId) continue
    const linked = orderById.get(table.orderId)
    if (!linked || linked.status !== "open") continue
    openByTableId.set(table.id, linked)
  }

  return openByTableId
}

export function buildTableLiveMetricsMap(
  tables: StoreTable[],
  orders: StoreOrder[],
  nowMs = Date.now()
): Map<string, TableLiveMetrics> {
  const metrics = new Map<string, TableLiveMetrics>()
  const openOrderByTableId = getOpenOrderByTable(tables, orders)

  for (const table of tables) {
    const order = openOrderByTableId.get(table.id) ?? openOrderByTableId.get(table.id.toLowerCase())
    const openedAtMs = parseIsoMillis(order?.openedAt ?? table.seatedAt ?? null)
    const durationMinutes = openedAtMs !== null ? roundMinutes(nowMs - openedAtMs) : null
    const waveCount = Math.max(1, order?.waveCount ?? order?.waves.length ?? table.session?.waveCount ?? 1)
    const ticketTotal = order ? getOrderTotal(order) : 0

    metrics.set(table.id, {
      durationMinutes,
      ticketTotal,
      waveCount,
      firstFiredAt: order ? getFirstWaveEventAt(order, "sent") : undefined,
      firstReadyAt: order ? getFirstWaveEventAt(order, "ready") : undefined,
    })
  }

  return metrics
}

export function calculateDashboardOrderMetrics(
  orders: StoreOrder[],
  nowMs = Date.now()
): DashboardOrderMetrics {
  const openOrders = orders.filter((order) => order.status === "open")
  const closedOrders = orders.filter((order) => order.status === "closed")

  const openDurations = openOrders
    .map((order) => {
      const opened = parseIsoMillis(order.openedAt)
      return opened !== null ? roundMinutes(nowMs - opened) : null
    })
    .filter((value): value is number => value !== null)

  const closedDurations = closedOrders
    .map((order) => {
      const opened = parseIsoMillis(order.openedAt)
      const closed = parseIsoMillis(order.closedAt ?? order.updatedAt)
      if (opened === null || closed === null) return null
      return roundMinutes(closed - opened)
    })
    .filter((value): value is number => value !== null)

  const closedTicketTotals = closedOrders.map(getOrderTotal)
  const fireLeadMinutes = orders
    .map((order) => {
      const opened = parseIsoMillis(order.openedAt)
      const firstFire = parseIsoMillis(getFirstWaveEventAt(order, "sent") ?? null)
      if (opened === null || firstFire === null) return null
      return roundMinutes(firstFire - opened)
    })
    .filter((value): value is number => value !== null)
  const readyLeadMinutes = orders
    .map((order) => {
      const opened = parseIsoMillis(order.openedAt)
      const firstReady = parseIsoMillis(getFirstWaveEventAt(order, "ready") ?? null)
      if (opened === null || firstReady === null) return null
      return roundMinutes(firstReady - opened)
    })
    .filter((value): value is number => value !== null)

  const avgWavesPerOrder = average(
    orders.map((order) => Math.max(1, order.waveCount || order.waves.length || 1))
  )

  return {
    openOrders: openOrders.length,
    closedOrders: closedOrders.length,
    totalRevenue: closedTicketTotals.reduce((sum, total) => sum + total, 0),
    avgTicketTotal: average(closedTicketTotals),
    avgOpenSessionMinutes: average(openDurations),
    avgTurnMinutes: average(closedDurations),
    avgWavesPerOrder,
    avgMinutesToFirstFire: averageOrNull(fireLeadMinutes),
    avgMinutesToReady: averageOrNull(readyLeadMinutes),
  }
}

export function buildHourlyOrderTrend(
  orders: StoreOrder[],
  hours = 8,
  nowMs = Date.now()
): HourlyOrderTrendPoint[] {
  const safeHours = Math.max(1, Math.min(48, Math.floor(hours)))
  const end = new Date(nowMs)
  end.setMinutes(0, 0, 0)

  const buckets: HourlyOrderTrendPoint[] = []
  const bucketStarts: number[] = []
  for (let i = safeHours - 1; i >= 0; i -= 1) {
    const slot = new Date(end)
    slot.setHours(slot.getHours() - i)
    bucketStarts.push(slot.getTime())
    buckets.push({
      label: slot.toLocaleTimeString([], { hour: "numeric" }),
      orders: 0,
    })
  }

  for (const order of orders) {
    const ts = parseIsoMillis(order.openedAt)
    if (ts === null) continue
    for (let i = 0; i < bucketStarts.length; i += 1) {
      const start = bucketStarts[i]
      const next = i === bucketStarts.length - 1 ? start + 3600000 : bucketStarts[i + 1]
      if (ts >= start && ts < next) {
        buckets[i].orders += 1
        break
      }
    }
  }

  return buckets
}
