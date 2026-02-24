"use client"

import React, { useState, useCallback, useRef, useMemo } from "react"

import {
  Users,
  Clock,
  AlertTriangle,
  Flame,
  CreditCard,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  Eye,
  Plus,
  Check,
  NutOff,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { FloorTable, FloorTableStatus, SectionId } from "@/lib/floor-map-data"
import {
  floorStatusConfig,
  stageConfig,
  alertMessages,
  minutesAgo,
  sectionConfig,
  currentServer,
} from "@/lib/floor-map-data"
import {
  getTableDetailById,
  getTableDetailFallback,
} from "@/lib/table-detail-data"
import type { Wave, WaveStatus, DetailAlert } from "@/lib/table-detail-data"

interface GridViewProps {
  tables: FloorTable[]
  ownTableIds: string[]
  onTableTap: (tableId: string) => void
}

// ── Urgency ordering ───────────────────────────────────────────────────────
const statusOrder: FloorTableStatus[] = ["urgent", "active", "billing", "free", "closed"]

const statusBorderClasses: Record<FloorTableStatus, string> = {
  free: "border-l-emerald-400/60",
  active: "border-l-amber-400/60",
  urgent: "border-l-red-400/80",
  billing: "border-l-blue-400/60",
  closed: "border-l-muted-foreground/20",
}

const statusDotClasses: Record<FloorTableStatus, string> = {
  free: "bg-emerald-400",
  active: "bg-amber-400",
  urgent: "bg-red-400",
  billing: "bg-blue-400",
  closed: "bg-muted-foreground/40",
}

const statusTextClasses: Record<FloorTableStatus, string> = {
  free: "text-emerald-400",
  active: "text-amber-400",
  urgent: "text-red-400",
  billing: "text-blue-400",
  closed: "text-muted-foreground",
}

const statusGlowBorder: Record<FloorTableStatus, string> = {
  free: "",
  active: "",
  urgent: "shadow-[inset_0_0_0_1px_hsl(var(--glow-urgent)/0.15)]",
  billing: "",
  closed: "",
}

// ── Group config ───────────────────────────────────────────────────────────
const groupConfig: Record<FloorTableStatus, { label: string; defaultExpanded: boolean; emptyMsg: string }> = {
  urgent:  { label: "URGENT",  defaultExpanded: true,  emptyMsg: "No urgent tables -- great work!" },
  active:  { label: "ACTIVE",  defaultExpanded: true,  emptyMsg: "No active tables" },
  billing: { label: "BILLING", defaultExpanded: true,  emptyMsg: "No tables billing" },
  free:    { label: "FREE",    defaultExpanded: true,  emptyMsg: "All tables occupied -- full house!" },
  closed:  { label: "CLOSED",  defaultExpanded: false, emptyMsg: "No closed tables" },
}

const waveStatusColors: Record<WaveStatus, string> = {
  served: "text-emerald-400",
  ready: "text-red-400",
  cooking: "text-amber-400",
  held: "text-muted-foreground/50",
  not_started: "text-muted-foreground/30",
}

const waveStatusDot: Record<WaveStatus, string> = {
  served: "bg-emerald-400",
  ready: "bg-red-400 animate-pulse",
  cooking: "bg-amber-400",
  held: "bg-muted-foreground/40",
  not_started: "bg-muted-foreground/20",
}

const waveStatusLabel: Record<WaveStatus, string> = {
  served: "Served",
  ready: "Ready",
  cooking: "Cooking",
  held: "Held",
  not_started: "--",
}

const waveStatusChip: Record<WaveStatus, string> = {
  served: "border-emerald-400/55 bg-emerald-500/14 text-emerald-300",
  ready: "border-red-400/55 bg-red-500/14 text-red-300",
  cooking: "border-amber-400/55 bg-amber-500/14 text-amber-300",
  held: "border-white/15 bg-white/[0.04] text-muted-foreground",
  not_started: "border-white/10 bg-white/[0.02] text-muted-foreground/60",
}

// ── Get rich data for a table ──────────────────────────────────────────────
function getCardData(table: FloorTable) {
  const detail = getTableDetailById(table.id) ??
    (table.status !== "free"
      ? getTableDetailFallback(
          table.id,
          table.number,
          table.section,
          sectionConfig[table.section].name,
          table.guests,
          table.status,
          table.seatedAt,
        )
      : null)
  return detail
}

// ── Quick action buttons logic ─────────────────────────────────────────────
function getQuickActions(table: FloorTable, waves?: Wave[]): { icon: typeof Zap; label: string; accent?: boolean }[] {
  const actions: { icon: typeof Zap; label: string; accent?: boolean }[] = []
  const foodWave = waves?.find((w) => w.type === "food")
  const dessertWave = waves?.find((w) => w.type === "dessert")

  if (foodWave?.status === "ready") {
    actions.push({ icon: Check, label: "On My Way", accent: true })
  } else if (dessertWave?.status === "held") {
    actions.push({ icon: Zap, label: "Fire Dessert", accent: true })
  } else if (table.status !== "free" && table.status !== "billing") {
    actions.push({ icon: Plus, label: "Add Items" })
  }
  if (table.status !== "free") {
    actions.push({ icon: MessageSquare, label: "Kitchen" })
  }
  actions.push({ icon: Eye, label: "View" })
  return actions
}

// ── Alert banner ───────────────────────────────────────────────────────────
function AlertBanner({ alerts }: { alerts: DetailAlert[] }) {
  if (alerts.length === 0) return null
  const alert = alerts[0]
  const bgMap: Record<string, string> = {
    urgent: "bg-red-500/10 border-red-400/20",
    warning: "bg-amber-500/10 border-amber-400/20",
    info: "bg-blue-500/10 border-blue-400/20",
  }
  const textMap: Record<string, string> = {
    urgent: "text-red-400",
    warning: "text-amber-400",
    info: "text-blue-400",
  }
  const IconMap: Record<string, typeof Flame> = {
    food_ready: Flame,
    no_checkin: AlertTriangle,
    bill_requested: CreditCard,
  }
  const Icon = IconMap[alert.type] ?? AlertTriangle

  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-2.5 py-2", bgMap[alert.severity])}>
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", textMap[alert.severity])} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] font-semibold leading-tight", textMap[alert.severity])}>
          {alert.message}
        </p>
        {alert.items && alert.items.length > 0 && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/70 leading-tight truncate">
            {alert.items.join(" / ")}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Wave Progress Row ──────────────────────────────────────────────────────
function WaveProgress({ waves, compact = false }: { waves: Wave[]; compact?: boolean }) {
  if (waves.length === 0) return null

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {waves.map((w, index) => (
          <div key={`${w.type}-${index}`} className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex h-5 min-w-[2rem] items-center justify-center rounded-md border px-1.5 text-[10px] font-bold tracking-wide",
                waveStatusChip[w.status]
              )}
            >
              W{index + 1}
            </span>
            <span
              className={cn("h-1.5 w-1.5 rounded-full", waveStatusDot[w.status])}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {waves.map((w, index) => (
        <div key={`${w.type}-${index}`} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-6 min-w-[2.3rem] items-center justify-center rounded-md border px-2 text-[11px] font-black tracking-wide",
              waveStatusChip[w.status]
            )}
          >
            W{index + 1}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", waveStatusDot[w.status])} />
              <span className={cn("text-[10px] font-medium", waveStatusColors[w.status])}>
                {waveStatusLabel[w.status]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Table Card ─────────────────────────────────────────────────────────────
const TableCard = React.memo(function TableCard({
  table,
  isOwn,
  onTap,
  cardIndex,
}: {
  table: FloorTable
  isOwn: boolean
  onTap: () => void
  cardIndex: number
}) {
  const [hovered, setHovered] = useState(false)
  const detail = useMemo(() => getCardData(table), [table])
  const elapsed = table.seatedAt ? minutesAgo(table.seatedAt) : null
  const isUrgent = table.status === "urgent"
  const isFree = table.status === "free"

  const waves = detail?.waves ?? []
  const alerts = detail?.alerts ?? []
  const billTotal = detail
    ? detail.seats.reduce((sum, s) => sum + s.orderTotal, 0)
    : 0
  const serverName = detail?.server?.name ?? null
  const serverIsYou = detail?.server?.id === currentServer.id
  const hasDietary = detail?.seats.some((s) => s.dietary.length > 0)
  const hasSpecial = detail?.seats.some((s) => s.specialOccasion)
  const quickActions = getQuickActions(table, waves)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group flex flex-col rounded-xl border-l-[3px] border border-white/[0.06] text-left cursor-pointer",
        "bg-card/60 backdrop-blur-sm transition-all duration-200",
        statusBorderClasses[table.status],
        statusGlowBorder[table.status],
        isUrgent && "bg-red-500/[0.04]",
        isFree && "bg-emerald-500/[0.03] opacity-70",
        isOwn && "ring-1 ring-primary/15",
        "hover:bg-card/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      style={{
        "--node-index": cardIndex,
        animationDelay: `${cardIndex * 30}ms`,
      } as React.CSSProperties}
      aria-label={`Table ${table.number}, ${sectionConfig[table.section].name}, ${table.guests} guests, ${table.status} status${billTotal > 0 ? `, bill total ${billTotal.toFixed(2)} euros` : ""}`}
    >
      {/* ── Card Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <span
          className={cn(
            "relative flex h-2 w-2 rounded-full shrink-0",
            statusDotClasses[table.status],
          )}
        >
          {isUrgent && (
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
          )}
        </span>
        <span className={cn("font-mono text-sm font-bold tracking-wide", statusTextClasses[table.status])}>
          T{table.number}
        </span>
        {table.guests > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
            <Users className="h-3 w-3" />
            {table.guests}
          </span>
        )}
        {elapsed !== null && (
          <span className={cn(
            "flex items-center gap-1 font-mono text-[11px]",
            elapsed > 40 ? "text-red-400/80" : elapsed > 25 ? "text-amber-400/70" : "text-muted-foreground/60"
          )}>
            <Clock className="h-3 w-3" />
            {elapsed}m
          </span>
        )}

        {/* Badges */}
        <div className="ml-auto flex items-center gap-1.5">
          {hasDietary && (
            <NutOff className="h-3 w-3 text-amber-400/60" />
          )}
          {hasSpecial && (
            <Sparkles className="h-3 w-3 text-pink-400/60" />
          )}
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/40 hidden sm:inline">
            {sectionConfig[table.section].name}
          </span>
        </div>
      </div>

      {/* ── Alert Banner ────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="px-3.5 pb-2">
          <AlertBanner alerts={alerts} />
        </div>
      )}

      {/* ── Wave Progress ───────────────────────────────────────── */}
      {waves.length > 0 && !isFree && (
        <div className="px-4 pb-2.5">
          {/* Compact on mobile, detailed on tablet+ */}
          <div className="sm:hidden">
            <WaveProgress waves={waves} compact />
          </div>
          <div className="hidden sm:block">
            <WaveProgress waves={waves} />
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      {!isFree && (
        <div className="flex items-center gap-2 border-t border-white/[0.04] px-4 py-2.5">
          {serverName && (
            <span className="text-[11px] text-muted-foreground/60 truncate">
              {serverName}
              {serverIsYou && (
                <span className="ml-1 text-primary/70 font-medium">(You)</span>
              )}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {billTotal > 0 && (
              <span className="font-mono text-xs font-bold text-foreground/80">
                {"\u20AC"}{billTotal.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Action Buttons (Desktop hover only) ───────────── */}
      {hovered && !isFree && (
        <div className="hidden lg:flex items-center gap-1 border-t border-white/[0.04] px-3 py-2 animate-fade-slide-in">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 rounded-lg px-2.5 text-[10px] font-medium",
                action.accent
                  ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
              )}
              onClick={(e) => {
                e.stopPropagation()
                // Quick action handler placeholder
              }}
            >
              {action.icon && <action.icon className="h-3 w-3" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
})

// ── Sticky Urgent Banner (Mobile) ──────────────────────────────────────────
function UrgentBanner({
  urgentCount,
  onScrollToUrgent,
}: {
  urgentCount: number
  onScrollToUrgent: () => void
}) {
  if (urgentCount === 0) return null
  return (
    <button
      type="button"
      onClick={onScrollToUrgent}
      className={cn(
        "sticky top-0 z-20 flex w-full items-center justify-between px-4 py-2.5 sm:hidden",
        "bg-red-500/15 border-b border-red-400/20 backdrop-blur-md",
        "animate-pulse-ring",
      )}
      style={{"--glow-urgent": "0 72% 51%"} as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
          <span className="relative rounded-full h-2.5 w-2.5 bg-red-400" />
        </span>
        <span className="font-mono text-xs font-bold text-red-400 tracking-wider">
          {urgentCount} URGENT
        </span>
      </div>
      <span className="text-[10px] text-red-400/70 font-medium">
        View all urgent {"->"}
      </span>
    </button>
  )
}

// ── Main GridView ──────────────────────────────────────────────────────────
export function GridView({ tables, ownTableIds, onTableTap }: GridViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<FloorTableStatus>>(() => {
    const initial = new Set<FloorTableStatus>()
    for (const s of statusOrder) {
      if (!groupConfig[s].defaultExpanded) initial.add(s)
    }
    return initial
  })
  const urgentRef = useRef<HTMLDivElement>(null)

  const grouped = useMemo(() =>
    statusOrder
      .map((status) => ({
        status,
        tables: tables
          .filter((t) => t.status === status)
          .sort((a, b) => {
            // Within urgent, sort by oldest first (most neglected)
            if (a.seatedAt && b.seatedAt) return new Date(a.seatedAt).getTime() - new Date(b.seatedAt).getTime()
            return a.number - b.number
          }),
      })),
    [tables]
  )

  const urgentCount = grouped.find((g) => g.status === "urgent")?.tables.length ?? 0

  const toggleGroup = useCallback((status: FloorTableStatus) => {
    // Urgent is always expanded
    if (status === "urgent") return
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }, [])

  const scrollToUrgent = useCallback(() => {
    urgentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  if (tables.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass-surface">
          <UtensilsCrossed className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="font-mono text-sm font-semibold text-foreground/80">No tables found</p>
        <p className="text-xs text-muted-foreground/60 max-w-[240px]">
          Try adjusting your filters to see more tables.
        </p>
      </div>
    )
  }

  let globalCardIndex = 0

  return (
    <div className="h-full overflow-y-auto scrollbar-none">
      {/* Mobile sticky urgent banner */}
      <UrgentBanner urgentCount={urgentCount} onScrollToUrgent={scrollToUrgent} />

      {grouped.map(({ status, tables: groupTables }) => {
        if (groupTables.length === 0 && status !== "urgent") return null

        const cfg = floorStatusConfig[status]
        const gcfg = groupConfig[status]
        const isCollapsed = collapsedGroups.has(status)
        const isUrgentGroup = status === "urgent"

        return (
          <div key={status} ref={isUrgentGroup ? urgentRef : undefined}>
            {/* Group Header */}
            <button
              type="button"
              onClick={() => toggleGroup(status)}
              className={cn(
                "sticky top-0 z-10 flex w-full items-center gap-2.5 px-4 py-2.5 md:px-6",
                "bg-background/85 backdrop-blur-md border-b border-white/[0.04]",
                "transition-colors hover:bg-white/[0.02]",
                isUrgentGroup && "cursor-default",
              )}
              aria-expanded={!isCollapsed}
              aria-label={`${gcfg.label} group, ${groupTables.length} tables`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}40` }}
              />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                {gcfg.label}
              </span>
              <span
                className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                style={{
                  backgroundColor: `${cfg.color}18`,
                  color: cfg.color,
                }}
              >
                {groupTables.length}
              </span>

              <div className="ml-2 flex-1 border-t border-white/[0.04]" />

              {!isUrgentGroup && (
                isCollapsed
                  ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                  : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
            </button>

            {/* Cards */}
            {!isCollapsed && (
              <div className="px-3 pb-4 pt-2 md:px-5">
                {groupTables.length === 0 ? (
                  <div className="flex items-center justify-center rounded-xl glass-surface py-6 px-4">
                    <p className="text-xs text-muted-foreground/50 font-mono">
                      {gcfg.emptyMsg}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupTables.map((table) => {
                      const isOwn = ownTableIds.includes(table.id)
                      const idx = globalCardIndex++
                      return (
                        <TableCard
                          key={table.id}
                          table={table}
                          isOwn={isOwn}
                          onTap={() => onTableTap(table.id)}
                          cardIndex={idx}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
