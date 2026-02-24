"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ElementRenderer } from "@/components/builder/element-renderer"
import type { PlacedElement } from "@/lib/floorplan-types"
import type { FloorTableStatus, MealStage } from "@/lib/floor-map-data"
import { minutesAgo, currentServer } from "@/lib/floor-map-data"
import type { Wave, WaveStatus, DetailAlert } from "@/lib/table-detail-data"
import { Users, Flame, Wine, UtensilsCrossed, Cake } from "lucide-react"

// ── Status overlay visuals for tables in view mode ──────────────────────────

export interface TableStatusInfo {
  elementId: string // matches PlacedElement.id
  tableNumber: number
  status: FloorTableStatus
  guests: number
  capacity: number
  stage?: MealStage | null
  seatedAt?: string
  serverName?: string | null
  serverId?: string | null
  waves?: Wave[]
  alerts?: DetailAlert[]
}

const statusRingColors: Record<FloorTableStatus, string> = {
  free: "ring-emerald-400/50",
  active: "ring-amber-400/50",
  urgent: "ring-red-500/70",
  billing: "ring-blue-400/50",
  closed: "ring-muted-foreground/20",
}

const statusGlows: Record<FloorTableStatus, string> = {
  free: "0 0 18px 3px rgba(52,211,153,0.25), inset 0 0 12px rgba(52,211,153,0.08)",
  active: "0 0 18px 3px rgba(251,191,36,0.25), inset 0 0 12px rgba(251,191,36,0.08)",
  urgent: "0 0 24px 6px rgba(248,113,113,0.35), inset 0 0 16px rgba(248,113,113,0.12)",
  billing: "0 0 18px 3px rgba(96,165,250,0.25), inset 0 0 12px rgba(96,165,250,0.08)",
  closed: "none",
}

// HSL fill colors for table surfaces - tinted by status
const statusFillColors: Record<FloorTableStatus, string> = {
  free: "hsl(160, 30%, 22%)",
  active: "hsl(38, 35%, 22%)",
  urgent: "hsl(0, 40%, 24%)",
  billing: "hsl(215, 35%, 24%)",
  closed: "hsl(220, 10%, 18%)",
}

// ── Props ───────────────────────────────────────────────────────────────────

interface FloorplanSceneProps {
  elements: PlacedElement[]
  mode: "edit" | "view"
  /** Table status info for view mode - maps element IDs to live table data */
  tableStatuses?: TableStatusInfo[]
  /** Which table IDs are "own" (assigned to current server) */
  ownTableIds?: string[]
  /** Currently highlighted table */
  highlightedId?: string | null
  /** Dimmed table IDs (filtered out) */
  dimmedIds?: Set<string>
  /** Click handler for tables in view mode */
  onTableTap?: (elementId: string) => void
  /** Long press handler for tables in view mode */
  onTableLongPress?: (elementId: string, e: React.MouseEvent | React.TouchEvent) => void
  /** Whether entry animation has completed */
  appeared?: boolean
}

// ── Scene Component ─────────────────────────────────────────────────────────

export function FloorplanScene({
  elements,
  mode,
  tableStatuses = [],
  ownTableIds = [],
  highlightedId,
  dimmedIds,
  onTableTap,
  onTableLongPress,
  appeared = true,
}: FloorplanSceneProps) {
  // Build a lookup map for quick status access
  const statusMap = new Map<string, TableStatusInfo>()
  for (const s of tableStatuses) {
    statusMap.set(s.elementId, s)
  }

  // Separate elements: non-tables render first (background), tables on top
  const backgroundElements = elements.filter(
    (el) => el.category !== "tables" && el.category !== "seating"
  )
  const seatingElements = elements.filter((el) => el.category === "seating")
  const tableElements = elements.filter(
    (el) => el.category === "tables" && (el.seats ?? 0) > 0
  )
  const decorativeTableElements = elements.filter(
    (el) => el.category === "tables" && (el.seats ?? 0) === 0
  )

  return (
    <>
      {/* Layer 1: Walls, fixtures, decor (non-interactive) */}
      {backgroundElements.map((el) => (
        <SceneElement key={el.id} element={el} mode={mode} appeared={appeared} />
      ))}

      {/* Layer 2: Decorative tables (coffee tables, etc.) */}
      {decorativeTableElements.map((el) => (
        <SceneElement key={el.id} element={el} mode={mode} appeared={appeared} />
      ))}

      {/* Layer 3: Seating */}
      {seatingElements.map((el) => (
        <SceneElement
          key={el.id}
          element={el}
          mode={mode}
          statusInfo={statusMap.get(el.id)}
          isOwn={ownTableIds.includes(el.id)}
          isHighlighted={highlightedId === el.id}
          isDimmed={dimmedIds?.has(el.id)}
          onTap={onTableTap}
          onLongPress={onTableLongPress}
          appeared={appeared}
        />
      ))}

      {/* Layer 4: Tables (interactive in view mode) */}
      {tableElements.map((el) => (
        <SceneElement
          key={el.id}
          element={el}
          mode={mode}
          statusInfo={statusMap.get(el.id)}
          isOwn={ownTableIds.includes(el.id)}
          isHighlighted={highlightedId === el.id}
          isDimmed={dimmedIds?.has(el.id)}
          onTap={onTableTap}
          onLongPress={onTableLongPress}
          appeared={appeared}
        />
      ))}
    </>
  )
}

// ── Individual Element ──────────────────────────────────────────────────────

function SceneElement({
  element,
  mode,
  statusInfo,
  isOwn,
  isHighlighted,
  isDimmed,
  onTap,
  onLongPress,
  appeared,
}: {
  element: PlacedElement
  mode: "edit" | "view"
  statusInfo?: TableStatusInfo
  isOwn?: boolean
  isHighlighted?: boolean
  isDimmed?: boolean
  onTap?: (id: string) => void
  onLongPress?: (id: string, e: React.MouseEvent | React.TouchEvent) => void
  appeared?: boolean
}) {
  const isTable = element.category === "tables" && (element.seats ?? 0) > 0
  const isSeatingWithSeats = element.category === "seating" && (element.seats ?? 0) > 0
  const isInteractive = mode === "view" && (isTable || isSeatingWithSeats) && !!onTap
  const status = statusInfo?.status ?? "free"

  // Long press handling
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    if (!isInteractive || !onLongPress) return
    longPressTimer.current = setTimeout(() => {
      onLongPress(element.id, e as unknown as React.MouseEvent)
    }, 500)
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const Tag = isInteractive ? "button" : "div"
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Tag
      {...(isInteractive
        ? {
            type: "button" as const,
            onClick: () => onTap?.(element.id),
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerUp,
            onPointerLeave: (e: React.PointerEvent) => { handlePointerUp(); setIsHovered(false) },
            onPointerEnter: () => setIsHovered(true),
            "aria-label": `Table ${statusInfo?.tableNumber ?? ""}, ${status}${statusInfo?.guests ? `, ${statusInfo.guests} guests` : ""}`,
          }
        : {
            "aria-hidden": true as const,
          })}
      className={cn(
        "absolute",
        // Interactive table styling
        isInteractive && [
          "ring-[2.5px] transition-all duration-200 gpu-layer",
          statusRingColors[status],
          status === "urgent" && "animate-pulse-ring",
          isDimmed && "opacity-15 pointer-events-none",
          isOwn && !isDimmed && "ring-offset-2 ring-offset-background ring-primary/50",
          isHighlighted && "animate-highlight-pulse",
          !isDimmed && "cursor-pointer",
          !appeared && "animate-node-appear",
        ],
        // Non-interactive elements
        !isInteractive && "pointer-events-none",
        // Shape-based border radius
        element.shape === "circle" && "rounded-full",
        element.shape === "ellipse" && "rounded-full",
        element.shape === "rect" && "rounded-md",
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg) scale(${isInteractive && !isDimmed && isHovered ? 1.12 : 1})`,
        opacity: isDimmed ? 0.15 : element.opacity,
        filter: isInteractive && !isDimmed ? `brightness(${isHovered ? 1.45 : 1.3})` : undefined,
        boxShadow: isInteractive && !isDimmed ? statusGlows[status] : undefined,
        zIndex: isTable ? 10 : isSeatingWithSeats ? 5 : 1,
      }}
    >
      {/* The actual SVG element rendering - tinted by status in view mode */}
      <ElementRenderer
        element={element}
        width={element.width}
        height={element.height}
        colorOverride={isInteractive && statusInfo ? statusFillColors[status] : undefined}
      />

      {/* Rich status overlay (view mode only) */}
      {isInteractive && statusInfo && !isDimmed && (
        <RichTableOverlay element={element} statusInfo={statusInfo} />
      )}
    </Tag>
  )
}

// ── Status Colors ───────────────────────────────────────────────────────────

const numberColors: Record<FloorTableStatus, string> = {
  free: "text-emerald-400",
  active: "text-amber-300",
  urgent: "text-red-400",
  billing: "text-blue-400",
  closed: "text-muted-foreground",
}

const statusDotColors: Record<FloorTableStatus, string> = {
  free: "bg-emerald-400",
  active: "bg-amber-400",
  urgent: "bg-red-400 animate-pulse",
  billing: "bg-blue-400",
  closed: "bg-muted-foreground/40",
}

const waveDotColors: Record<WaveStatus, string> = {
  served: "bg-emerald-400",
  ready: "bg-red-400 animate-pulse",
  cooking: "bg-amber-400",
  held: "bg-muted-foreground/30",
  not_started: "bg-muted-foreground/15",
}

const waveIcons: Record<string, typeof Wine> = {
  drinks: Wine,
  food: UtensilsCrossed,
  dessert: Cake,
}

// ── Effective usable dimensions after rotation & shape ──────────────────────

function getUsableDims(w: number, h: number, rotation: number, isRound: boolean) {
  // After rotation, the bounding box stays the same but the
  // visible content area effectively swaps major/minor axis.
  const rad = ((rotation % 180) * Math.PI) / 180
  const s = Math.abs(Math.sin(rad))
  const c = Math.abs(Math.cos(rad))
  let effW = w * c + h * s
  let effH = w * s + h * c

  // Round shapes: inscribe a rectangle inside the ellipse (factor ~0.7)
  if (isRound) {
    effW *= 0.7
    effH *= 0.7
  }

  return { effW, effH }
}

// ── Rich Table Overlay ──────────────────────────────────────────────────────

function RichTableOverlay({
  element,
  statusInfo,
}: {
  element: PlacedElement
  statusInfo: TableStatusInfo
}) {
  const { width: w, height: h, rotation, shape } = element
  const status = statusInfo.status
  const isFree = status === "free"
  const elapsed = statusInfo.seatedAt ? minutesAgo(statusInfo.seatedAt) : null
  const waves = statusInfo.waves ?? []
  const alerts = statusInfo.alerts ?? []
  const hasAlert = alerts.length > 0
  const serverIsYou = statusInfo.serverId === currentServer.id
  const isRound = shape === "circle" || shape === "ellipse"

  // Compute usable content area after rotation and shape constraints
  const { effW, effH } = getUsableDims(w, h, rotation, isRound)
  const minDim = Math.min(effW, effH)
  const maxDim = Math.max(effW, effH)
  const area = effW * effH
  const isWide = effW / effH > 1.5

  // Counter-rotate so text is always upright
  const counterRotation = rotation !== 0 ? -rotation : 0

  // ── All sizes are proportional to usable space ──────────────────────
  const unit = minDim / 10 // base unit: 1/10th of smallest dimension
  const numFont = Math.max(8, Math.min(18, unit * 2.2))
  const subFont = Math.max(6, Math.min(12, unit * 1.4))
  const microFont = Math.max(5, Math.min(10, unit * 1.1))
  const iconSize = Math.max(6, Math.min(14, unit * 1.5))
  const dotSize = Math.max(3, Math.min(7, unit * 0.7))
  const gap = Math.max(1, Math.min(6, unit * 0.5))
  const pad = isRound ? Math.max(4, minDim * 0.14) : Math.max(2, unit * 0.4)

  // Decide what fits: progressively add info layers
  const showGuests = minDim > 40
  const showTimer = minDim > 50 && !isFree
  const showWaves = area > 5500 && waves.length > 0 && !isFree
  const showAlert = hasAlert && minDim > 35
  const showServer = minDim > 65 && statusInfo.serverName && !isFree
  const showAlertText = showAlert && area > 7000

  // ── Free table: clean minimal ───────────────────────────────────────
  if (isFree) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ padding: pad }}>
        <div style={{ transform: `rotate(${counterRotation}deg)`, gap }}
          className="flex flex-col items-center">
          <span className={cn("font-mono font-bold drop-shadow-lg leading-none", numberColors[status])}
            style={{ fontSize: numFont }}>
            {statusInfo.tableNumber}
          </span>
          {showGuests && (
            <span className="font-mono text-emerald-400/50 drop-shadow leading-none"
              style={{ fontSize: microFont }}>
              {statusInfo.capacity}p
            </span>
          )}
        </div>
      </div>
    )
  }

  // ── Horizontal layout for wide tables ───────────────────────────────
  if (isWide) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]"
        style={{ padding: pad }}>
        <div style={{ transform: `rotate(${counterRotation}deg)`, gap: gap * 1.5 }}
          className="flex items-center justify-center h-full w-full">
          {/* Number + guests */}
          <div className="flex flex-col items-center shrink-0" style={{ gap: gap * 0.5 }}>
            <span className={cn("font-mono font-bold drop-shadow-lg leading-none", numberColors[status])}
              style={{ fontSize: numFont }}>
              T{statusInfo.tableNumber}
            </span>
            {showGuests && (
              <div className="flex items-center" style={{ gap: gap * 0.4 }}>
                <Users className="text-white/40 shrink-0" style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
                <span className="font-mono text-white/50 leading-none" style={{ fontSize: microFont }}>
                  {statusInfo.guests}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="shrink-0 bg-white/10" style={{ width: 1, height: effH * 0.4 }} />

          {/* Waves */}
          {showWaves && (
            <div className="flex items-center shrink-0" style={{ gap: gap * 1.2 }}>
              {waves.map((wv) => {
                const WIcon = waveIcons[wv.type]
                return WIcon ? (
                  <div key={wv.type} className="flex flex-col items-center" style={{ gap: gap * 0.3 }}>
                    <WIcon className="text-white/40 shrink-0" style={{ width: iconSize, height: iconSize }} />
                    <span className={cn("rounded-full shrink-0", waveDotColors[wv.status])}
                      style={{ width: dotSize, height: dotSize }} />
                  </div>
                ) : null
              })}
            </div>
          )}

          {/* Timer + alert */}
          {(showTimer || showAlert) && (
            <div className="flex flex-col items-center shrink-0" style={{ gap: gap * 0.4 }}>
              {showTimer && elapsed !== null && (
                <span className={cn(
                  "font-mono font-bold leading-none",
                  elapsed > 40 ? "text-red-400" : elapsed > 25 ? "text-amber-400/70" : "text-white/30"
                )} style={{ fontSize: subFont }}>
                  {elapsed}m
                </span>
              )}
              {showAlert && (
                <Flame className="text-red-400 animate-pulse shrink-0"
                  style={{ width: iconSize, height: iconSize }} />
              )}
            </div>
          )}

          {/* Server */}
          {showServer && (
            <>
              <div className="shrink-0 bg-white/10" style={{ width: 1, height: effH * 0.4 }} />
              <span className={cn(
                "font-mono leading-none truncate shrink-0",
                serverIsYou ? "text-primary/80 font-bold" : "text-white/25"
              )} style={{ fontSize: microFont, maxWidth: maxDim * 0.2 }}>
                {serverIsYou ? "YOU" : statusInfo.serverName}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Vertical layout (square, round, tall) ───────────────────────────
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]"
      style={{ padding: pad }}>
      <div style={{ transform: `rotate(${counterRotation}deg)`, gap }}
        className="flex flex-col items-center justify-center h-full w-full">
        {/* Number + guests row */}
        <div className="flex items-center" style={{ gap: gap * 0.8 }}>
          <span className={cn("font-mono font-bold drop-shadow-lg leading-none", numberColors[status])}
            style={{ fontSize: numFont }}>
            T{statusInfo.tableNumber}
          </span>
          {showGuests && (
            <div className="flex items-center" style={{ gap: gap * 0.3 }}>
              <Users className="text-white/40 shrink-0" style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
              <span className="font-mono text-white/50 leading-none" style={{ fontSize: microFont }}>
                {statusInfo.guests}
              </span>
            </div>
          )}
        </div>

        {/* Timer */}
        {showTimer && elapsed !== null && (
          <span className={cn(
            "font-mono leading-none",
            elapsed > 40 ? "text-red-400" : elapsed > 25 ? "text-amber-400/70" : "text-white/30"
          )} style={{ fontSize: microFont }}>
            {elapsed}m
          </span>
        )}

        {/* Waves */}
        {showWaves && (
          <div className="flex items-center" style={{ gap: gap * 0.8 }}>
            {waves.map((wv) => {
              const WIcon = waveIcons[wv.type]
              return WIcon ? (
                <div key={wv.type} className="flex items-center" style={{ gap: gap * 0.3 }}>
                  <WIcon className="text-white/40 shrink-0" style={{ width: iconSize * 0.85, height: iconSize * 0.85 }} />
                  <span className={cn("rounded-full shrink-0", waveDotColors[wv.status])}
                    style={{ width: dotSize, height: dotSize }} />
                </div>
              ) : null
            })}
          </div>
        )}

        {/* Alert */}
        {showAlert && (
          <div className="flex items-center" style={{ gap: gap * 0.4 }}>
            <Flame className="text-red-400 animate-pulse shrink-0"
              style={{ width: iconSize, height: iconSize }} />
            {showAlertText && (
              <span className="font-mono font-bold text-red-400 uppercase tracking-wider leading-none"
                style={{ fontSize: microFont }}>
                {alerts[0].type === "food_ready" ? "READY" : "ALERT"}
              </span>
            )}
          </div>
        )}

        {/* Server */}
        {showServer && (
          <span className={cn(
            "font-mono truncate leading-none",
            serverIsYou ? "text-primary/80 font-bold" : "text-white/25"
          )} style={{ fontSize: microFont, maxWidth: effW * 0.9 }}>
            {serverIsYou ? "YOU" : statusInfo.serverName}
          </span>
        )}
      </div>
    </div>
  )
}
