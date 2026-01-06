"use client"

import { linkToSession, getSessionBy } from "@/lib/sessions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  reservation?: { id: string; time?: string; name?: string }
  table?: { id: string; label?: string; zone?: string }
  order?: { id: string; total?: number }
  sessionId?: string
  className?: string
}

export default function ConnectedRecords({ reservation, table, order, sessionId, className }: Props) {
  const session = sessionId
    ? getSessionBy({ id: sessionId })
    : reservation?.id
      ? getSessionBy({ reservationId: reservation.id })
      : order?.id
        ? getSessionBy({ orderId: order.id })
        : table?.id
          ? getSessionBy({ tableId: table.id })
          : undefined

  const resolvedSessionId = sessionId ?? session?.id

  return (
    <Card className={`p-3 space-y-2 ${className ?? ""}`}>
      <div className="text-sm font-medium">Connected Records / Visit Context</div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        {reservation && (
          <div className="flex items-center justify-between">
            <div>
              📅 Reservation: {reservation.time ?? ""} – {reservation.name ?? reservation.id}
            </div>
            <Button variant="link" className="px-0 h-auto" asChild>
              <Link href={linkToSession("/reservations?view=list", resolvedSessionId)}>View →</Link>
            </Button>
          </div>
        )}
        {table && (
          <div className="flex items-center justify-between">
            <div>
              🪑 Table: {table.label ?? table.id}
              {table.zone ? ` – ${table.zone}` : ""}
            </div>
            <Button variant="link" className="px-0 h-auto" asChild>
              <Link href={linkToSession("/tables?view=grid", resolvedSessionId)}>View →</Link>
            </Button>
          </div>
        )}
        {order && (
          <div className="flex items-center justify-between">
            <div>
              🧾 Order: #{order.id}
              {order.total ? ` – €${order.total.toFixed?.(2) ?? order.total}` : ""}
            </div>
            <Button variant="link" className="px-0 h-auto" asChild>
              <Link href={linkToSession("/orders?status=active", resolvedSessionId)}>View →</Link>
            </Button>
          </div>
        )}
        {resolvedSessionId && <div className="text-xs opacity-70">⏱️ Session: {resolvedSessionId}</div>}
      </div>
    </Card>
  )
}
