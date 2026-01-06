export type SessionState = "booked" | "seated" | "served" | "completed"

export type Session = {
  id: string
  reservationId?: string
  tableId?: string
  orderId?: string
  startISO: string
  endISO?: string
  durationMin?: number
  spendTotal?: number
  state: SessionState
}

export const mockSessions: Session[] = [
  {
    id: "S-4567",
    reservationId: "RSV-2847",
    tableId: "12",
    orderId: "234",
    startISO: "2025-10-08T16:30:00Z",
    durationMin: 32,
    spendTotal: 54.2,
    state: "served",
  },
  {
    id: "S-4568",
    reservationId: "RSV-2860",
    tableId: "5",
    orderId: "235",
    startISO: "2025-10-08T17:00:00Z",
    durationMin: 18,
    spendTotal: 42.5,
    state: "seated",
  },
  {
    id: "S-4569",
    reservationId: "RSV-2901",
    tableId: "8",
    orderId: "236",
    startISO: "2025-10-08T17:30:00Z",
    durationMin: 45,
    spendTotal: 78.9,
    state: "served",
  },
]

// Helper to add sessionId to URLs
export const linkToSession = (url: string, sessionId?: string) =>
  sessionId ? `${url}${url.includes("?") ? "&" : "?"}sessionId=${encodeURIComponent(sessionId)}` : url

// Helper to find session by various IDs
export const getSessionBy = (q: Partial<Pick<Session, "id" | "reservationId" | "tableId" | "orderId">>) =>
  mockSessions.find(
    (s) =>
      (q.id && s.id === q.id) ||
      (q.reservationId && s.reservationId === q.reservationId) ||
      (q.tableId && s.tableId === q.tableId) ||
      (q.orderId && s.orderId === q.orderId),
  )
