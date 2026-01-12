import type { Payout, PayoutsResponse } from "./types"

// Generate mock payouts
export const mockPayouts: Payout[] = Array.from({ length: 45 }, (_, i) => {
  const statuses: ("paid" | "pending" | "failed")[] = ["paid", "paid", "paid", "paid", "pending", "failed"]
  const status = statuses[i % statuses.length]
  const locations = [
    { id: "loc_01", name: "Valletta Main" },
    { id: "loc_02", name: "Sliema Branch" },
    { id: "loc_03", name: "Mdina Location" },
  ]
  const location = locations[i % locations.length]

  const now = new Date()
  const daysAgo = i
  const settledAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  settledAt.setHours(2, 0, 0, 0)

  const bankArrivalAt = status === "paid" ? new Date(settledAt.getTime() + 29 * 60 * 60 * 1000) : null
  if (bankArrivalAt) {
    bankArrivalAt.setHours(7, Math.floor(Math.random() * 60), 0, 0)
  }

  const estimatedArrivalAt =
    status === "pending" ? new Date(settledAt.getTime() + 48 * 60 * 60 * 1000).toISOString() : undefined

  const grossAmount = Math.random() * 3000 + 2000
  const feesAmount = grossAmount * 0.0275
  const netAmount = grossAmount - feesAmount

  const transactionCount = Math.floor(Math.random() * 200) + 150

  const dateFrom = new Date(settledAt.getTime() - 24 * 60 * 60 * 1000)
  const dateTo = new Date(settledAt.getTime())

  const reconciled = status === "paid" && Math.random() > 0.3

  return {
    payoutId: `po_${settledAt.getFullYear()}${String(settledAt.getMonth() + 1).padStart(2, "0")}${String(settledAt.getDate()).padStart(2, "0")}${String(i + 1).padStart(3, "0")}`,
    status,
    settledAt: settledAt.toISOString(),
    bankArrivalAt: bankArrivalAt?.toISOString() || null,
    estimatedArrivalAt,
    grossAmount: Number(grossAmount.toFixed(2)),
    feesAmount: Number(feesAmount.toFixed(2)),
    netAmount: Number(netAmount.toFixed(2)),
    currency: "EUR",
    locationId: location.id,
    locationName: location.name,
    transactionCount,
    transactionDateRange: {
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
    },
    reconciled,
    reconciledAt: reconciled ? new Date(bankArrivalAt!.getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
    reconciledBy: reconciled ? "user_01" : undefined,
    reconciledByName: reconciled ? "Sarah Johnson" : undefined,
    note: reconciled ? "Reconciled with bank statement." : undefined,
    bankAccount: {
      last4: "1234",
      bankName: "Bank of Valletta",
      method: "ACH Transfer",
    },
    processor: {
      name: "Stripe",
      processorId: `py_${Math.random().toString(36).substr(2, 16)}`,
      reference: `STRIPE-${`po_${settledAt.getFullYear()}${String(settledAt.getMonth() + 1).padStart(2, "0")}${String(settledAt.getDate()).padStart(2, "0")}${String(i + 1).padStart(3, "0")}`.toUpperCase()}`,
    },
    error:
      status === "failed"
        ? {
            code: "account_closed",
            message: "The bank rejected this payout because the destination account is no longer active.",
            time: new Date(settledAt.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          }
        : undefined,
    createdAt: settledAt.toISOString(),
    updatedAt: bankArrivalAt?.toISOString() || settledAt.toISOString(),
  }
}).sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime())

export function getPayoutsData(
  page = 1,
  pageSize = 25,
  filters?: {
    search?: string
    locationId?: string[]
    status?: string[]
  },
): PayoutsResponse {
  let filtered = [...mockPayouts]

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter((p) => p.payoutId.toLowerCase().includes(search))
  }

  if (filters?.locationId && filters.locationId.length > 0) {
    filtered = filtered.filter((p) => filters.locationId!.includes(p.locationId))
  }

  if (filters?.status && filters.status.length > 0) {
    filtered = filtered.filter((p) => filters.status!.includes(p.status))
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filtered.slice(start, end)

  const paidCount = mockPayouts.filter((p) => p.status === "paid").length
  const pendingCount = mockPayouts.filter((p) => p.status === "pending").length
  const failedCount = mockPayouts.filter((p) => p.status === "failed").length
  const reconciledCount = mockPayouts.filter((p) => p.reconciled).length

  const totalDeposited = mockPayouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.netAmount, 0)

  const pendingAmount = mockPayouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.netAmount, 0)

  const averagePayout = totalDeposited / paidCount

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      hasMore: end < total,
    },
    summary: {
      totalPayouts: mockPayouts.length,
      totalDeposited: Number(totalDeposited.toFixed(2)),
      pendingAmount: Number(pendingAmount.toFixed(2)),
      averagePayout: Number(averagePayout.toFixed(2)),
      paidCount,
      pendingCount,
      failedCount,
      reconciledCount,
    },
  }
}
