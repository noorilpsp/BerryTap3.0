"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  type FloorTableState,
  type HeatMapMode,
  type ZoneId,
  getServerForTable,
  getRevenueForTable,
  getCourseLabel,
  formatTime12h,
} from "@/lib/floorplan-data"
import {
  Star,
  Clock,
  ChevronRight,
  Utensils,
  AlertTriangle,
  MessageSquare,
  CreditCard,
  Users,
  Phone,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface FloorplanMobileProps {
  tableStates: FloorTableState[]
  heatMap: HeatMapMode
  zone: ZoneId
  onSelectTable: (id: string) => void
}

const ZONE_ORDER = ["main", "patio", "private"] as const
const ZONE_LABELS: Record<string, string> = {
  main: "Main Dining",
  patio: "Patio",
  private: "Private Room",
}

function getStatusBg(status: FloorTableState["status"]): string {
  switch (status) {
    case "seated":
      return "bg-emerald-500/15"
    case "reserved":
      return "bg-blue-500/10"
    case "arriving-soon":
      return "bg-amber-500/10"
    case "high-risk":
      return "bg-rose-500/10"
    case "completed":
      return "bg-zinc-700/20"
    case "empty":
      return "bg-zinc-800/20"
    case "merged":
      return "bg-zinc-800/10"
    default:
      return "bg-zinc-800/20"
  }
}

function getStatusText(status: FloorTableState["status"]): string {
  switch (status) {
    case "seated":
      return "text-emerald-400"
    case "reserved":
      return "text-blue-400"
    case "arriving-soon":
      return "text-amber-400"
    case "high-risk":
      return "text-rose-400"
    case "completed":
      return "text-zinc-400"
    case "empty":
      return "text-zinc-500"
    case "merged":
      return "text-zinc-600"
    default:
      return "text-zinc-500"
  }
}

function getStatusLabel(status: FloorTableState["status"]): string {
  switch (status) {
    case "empty":
      return "Available"
    case "completed":
      return "Turning"
    case "merged":
      return "Merged"
    case "reserved":
      return "Reserved"
    case "arriving-soon":
      return "Arriving Soon"
    case "high-risk":
      return "At Risk"
    case "seated":
      return "Seated"
    default:
      return ""
  }
}

export function FloorplanMobile({
  tableStates,
  heatMap,
  zone,
  onSelectTable,
}: FloorplanMobileProps) {
  const [detailState, setDetailState] = useState<FloorTableState | null>(null)

  const filtered = useMemo(
    () =>
      zone === "all"
        ? tableStates
        : tableStates.filter((s) => s.table.zone === zone),
    [tableStates, zone]
  )

  const zoneGroups = useMemo(() => {
    const groups: Record<string, FloorTableState[]> = {}
    for (const s of filtered) {
      const z = s.table.zone
      if (!groups[z]) groups[z] = []
      groups[z].push(s)
    }
    return ZONE_ORDER.filter((z) => groups[z]).map((z) => ({
      zone: z,
      label: ZONE_LABELS[z],
      tables: groups[z].sort((a, b) =>
        a.table.label.localeCompare(b.table.label)
      ),
    }))
  }, [filtered])

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {zoneGroups.map(({ zone: z, label, tables }) => (
        <div key={z}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </h3>
          <div className="flex flex-col gap-2">
            {tables.map((state) => {
              const { table } = state
              const server = getServerForTable(table.id)
              const revenue = getRevenueForTable(table.id)
              const hasCurrent =
                state.currentGuest &&
                (state.status === "seated" ||
                  state.status === "arriving-soon")

              return (
                <button
                  key={table.id}
                  onClick={() => setDetailState(state)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
                    "border-border/50 bg-card/60 backdrop-blur-sm"
                  )}
                >
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg",
                      getStatusBg(state.status)
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-bold",
                        getStatusText(state.status)
                      )}
                    >
                      {table.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {table.shape === "round" ? "R" : "S"}
                      {table.seats}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {hasCurrent ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {state.currentGuest}
                          </span>
                          {state.currentPartySize && (
                            <span className="text-xs text-muted-foreground">
                              ({state.currentPartySize})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {state.currentCourse && (
                            <span className="text-emerald-400">
                              {getCourseLabel(state.currentCourse)}
                            </span>
                          )}
                          {state.estClearTime && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              ~{formatTime12h(state.estClearTime)}
                            </span>
                          )}
                        </div>
                        {revenue && revenue.currentCheck > 0 && (
                          <span className="mt-0.5 flex items-center gap-0.5 text-[10px] text-emerald-400">
                            <CreditCard className="h-2.5 w-2.5" />${revenue.currentCheck}
                          </span>
                        )}
                      </>
                    ) : state.nextReservation ? (
                      <>
                        <span className="truncate text-sm font-medium text-foreground">
                          {state.nextReservation.guestName} (
                          {state.nextReservation.partySize})
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {formatTime12h(state.nextReservation.time)}
                          </span>
                          {state.nextReservation.tags.length > 0 && (
                            <span className="text-amber-400">
                              {state.nextReservation.tags[0].label}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {getStatusLabel(state.status)}
                      </span>
                    )}
                    {server && (
                      <span className="text-[10px] text-muted-foreground">
                        Server: {server.name}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Mobile detail sheet */}
      <Sheet
        open={!!detailState}
        onOpenChange={(open) => !open && setDetailState(null)}
      >
        <SheetContent
          side="bottom"
          className="max-h-[80vh] border-border/50 bg-background/95 backdrop-blur-xl"
        >
          {detailState && (
            <MobileDetail state={detailState} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MobileDetail({ state }: { state: FloorTableState }) {
  const { table } = state
  const server = getServerForTable(table.id)
  const revenue = getRevenueForTable(table.id)
  const hasCurrent =
    state.currentGuest &&
    (state.status === "seated" || state.status === "arriving-soon")

  return (
    <div className="flex flex-col gap-4">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-3 text-foreground">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              getStatusBg(state.status)
            )}
          >
            <span className={cn("text-sm font-bold", getStatusText(state.status))}>
              {table.label}
            </span>
          </div>
          <div>
            <div className="text-base font-semibold">{table.label}</div>
            <div className="text-xs font-normal text-muted-foreground">
              {ZONE_LABELS[table.zone]} &middot; {table.seats} seats &middot;{" "}
              {table.shape}
              {table.areaLabel ? ` \u00B7 ${table.areaLabel}` : ""}
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      {server && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: `var(--${server.color})` }}
          />
          <span className="text-xs text-muted-foreground">
            Server: {server.name}
          </span>
        </div>
      )}

      {hasCurrent && (
        <div className="rounded-xl border border-border/50 bg-card/60 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Current Seating
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {state.currentGuest}{" "}
              {state.currentPartySize && `(${state.currentPartySize})`}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {state.currentCourse && (
              <span className="text-emerald-400">
                {getCourseLabel(state.currentCourse)}
              </span>
            )}
            {state.seatedAt && state.estClearTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime12h(state.seatedAt)} - ~
                {formatTime12h(state.estClearTime)}
              </span>
            )}
          </div>
          {revenue && revenue.currentCheck > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <CreditCard className="h-3 w-3 text-emerald-400" />
              <span className="font-medium text-foreground">
                ${revenue.currentCheck.toFixed(2)}
              </span>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30">
              <Utensils className="h-3.5 w-3.5" />
              Clear Table
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30">
              <Phone className="h-3.5 w-3.5" />
              Contact
            </button>
          </div>
        </div>
      )}

      {state.nextReservation && (
        <div className="rounded-xl border border-border/50 bg-card/60 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
            Next Reservation
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {state.nextReservation.guestName} (
              {state.nextReservation.partySize})
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime12h(state.nextReservation.time)}
            </span>
            {state.nextReservation.tags.map((tag, i) => (
              <span key={i} className="text-amber-400">
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.todayHistory.length > 0 && (
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {"Today's History"}
          </div>
          <div className="flex flex-col gap-1.5">
            {state.todayHistory.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">
                    {h.time}
                  </span>
                  <span className="text-foreground">
                    {h.guest} ({h.partySize})
                  </span>
                </div>
                {h.check > 0 && (
                  <span className="text-emerald-400">${h.check}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-4 text-[10px] text-muted-foreground">
            <span>Turns: {state.turnsToday}</span>
            {state.avgTurnTime > 0 && (
              <span>Avg: {state.avgTurnTime}min</span>
            )}
          </div>
        </div>
      )}

      {!hasCurrent && !state.nextReservation && state.todayHistory.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Utensils className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No activity for this table yet
          </p>
        </div>
      )}
    </div>
  )
}
