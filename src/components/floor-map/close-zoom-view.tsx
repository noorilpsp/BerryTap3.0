"use client"

import { useState, useEffect, useCallback } from "react"
// useRouter removed - no table detail route yet
import {
  ArrowLeft,
  ExternalLink,
  Users,
  Clock,
  Plus,
  Flame,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TableVisual } from "./table-visual"
import { SeatDetailPanel } from "./seat-detail-panel"
import { MealProgress } from "./meal-progress"
import { AlertCards } from "./alert-cards"
import { TableNotesCard } from "./table-notes-card"
import {
  tables as allTablesData,
  sectionConfig,
  minutesAgo,
  floorStatusConfig,
} from "@/lib/floor-map-data"
import {
  getTableDetailById,
  getTableDetailFallback,
} from "@/lib/table-detail-data"
import type { TableDetailInfo } from "@/lib/table-detail-data"
import { usePrefersReducedMotion, useSwipeDown } from "@/hooks/use-map-gestures"
import { DURATIONS, getAnimatedDuration } from "@/lib/animation-config"

interface CloseZoomViewProps {
  tableId: string
  onBack: () => void
  isExiting: boolean
}

type LoadState = "loaded" | "error"

export function CloseZoomView({ tableId, onBack, isExiting }: CloseZoomViewProps) {
  const reducedMotion = usePrefersReducedMotion()
  const baseTable = allTablesData.find((t) => t.id === tableId)

  // Load detail data synchronously (all local mock data)
  const detail: TableDetailInfo | null = (() => {
    const found = getTableDetailById(tableId)
    if (found) return found
    if (baseTable) {
      return getTableDetailFallback(
        tableId,
        baseTable.number,
        baseTable.section,
        sectionConfig[baseTable.section].name,
        baseTable.guests,
        baseTable.status,
        baseTable.seatedAt,
      )
    }
    return null
  })()

  const loadState: LoadState = detail ? "loaded" : "error"

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [seatsRevealed, setSeatsRevealed] = useState(false)
  const [cardsRevealed, setCardsRevealed] = useState(false)
  const [navigatingToDetail, setNavigatingToDetail] = useState(false)

  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024

  const { swipeProgress, isSwiping, swipeHandlers } = useSwipeDown({
    enabled: loadState === "loaded" && !isExiting,
    threshold: 120,
    onSwipeDown: onBack,
  })

  // Staggered reveal
  useEffect(() => {
    if (loadState !== "loaded" || !detail) return
    const seatDelay = reducedMotion
      ? 1
      : getAnimatedDuration(300 + detail.seats.length * DURATIONS.seatStagger, windowWidth, reducedMotion)
    const cardDelay = reducedMotion ? 1 : seatDelay + 100
    const seatTimer = setTimeout(() => setSeatsRevealed(true), 100)
    const cardTimer = setTimeout(() => setCardsRevealed(true), cardDelay)
    return () => {
      clearTimeout(seatTimer)
      clearTimeout(cardTimer)
    }
  }, [loadState, detail, reducedMotion, windowWidth])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selectedSeat !== null) setSelectedSeat(null)
        else onBack()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onBack, selectedSeat])

  const handleSeatTap = useCallback((seatNumber: number) => {
    setSelectedSeat((prev) => (prev === seatNumber ? null : seatNumber))
  }, [])

  const handleTableCenterTap = useCallback(() => {
    // Select/deselect all seats or show overview
    setSelectedSeat(null)
  }, [])

  const handleEmptyTap = useCallback(() => setSelectedSeat(null), [])

  const handleEnterTable = useCallback(() => {
    // No full table-detail route yet -- currently a no-op placeholder
    setNavigatingToDetail(true)
    const delay = reducedMotion ? 1 : 150
    setTimeout(() => setNavigatingToDetail(false), delay)
  }, [reducedMotion])

  // ── Error ────────────────────────────────────────────────────────────────
  if (loadState === "error" || !detail) {
    return (
      <div className="flex h-full flex-col bg-background">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-[hsl(225,15%,8%)] px-4 py-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-sm text-muted-foreground">Unable to load table details</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-transparent border-white/[0.08]"
            onClick={onBack}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // ── Loaded ───────────────────────────────────────────────────────────────
  const isFree = detail.status === "free" || detail.guests === 0
  const seated = detail.seatedAt ? minutesAgo(detail.seatedAt) : 0
  const statusCfg = floorStatusConfig[detail.status as keyof typeof floorStatusConfig]
  const selectedSeatData = selectedSeat
    ? detail.seats.find((s) => s.number === selectedSeat) ?? null
    : null

  const swipeTransform = isSwiping ? `translateY(${swipeProgress * 80}px)` : undefined
  const swipeOpacity = isSwiping ? 1 - swipeProgress * 0.3 : undefined

  const statusGlowColor = statusCfg
    ? detail.status === "urgent" ? "shadow-red-500/5"
    : detail.status === "active" ? "shadow-amber-500/5"
    : detail.status === "billing" ? "shadow-blue-500/5"
    : ""
    : ""

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background",
        !isExiting && !navigatingToDetail && "animate-zoom-in",
        isExiting && "animate-zoom-out",
        navigatingToDetail && "animate-map-compress",
      )}
      style={{ transform: swipeTransform, opacity: swipeOpacity }}
      {...swipeHandlers}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[hsl(225,15%,8%)] px-4 py-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Map</span>
        </Button>
        <Button size="sm" className="gap-1.5 text-sm bg-primary/90 hover:bg-primary text-primary-foreground" onClick={handleEnterTable}>
          Enter Table
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          {/* Header */}
          <div className="text-center animate-fade-slide-in">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-bold font-mono text-foreground tracking-wider">T{detail.number}</h2>
              <span className="text-lg text-white/10">{'|'}</span>
              <span className="text-base text-muted-foreground">{detail.sectionLabel}</span>
            </div>

            {!isFree ? (
              <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="font-mono">{detail.guests}</span> Guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="font-mono">{seated}</span>m
                </span>
                {statusCfg && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      statusGlowColor,
                    )}
                    style={{
                      backgroundColor: `${statusCfg.color}10`,
                      borderColor: `${statusCfg.color}30`,
                      color: statusCfg.color,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                    {statusCfg.label}
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Free {'·'} <span className="font-mono">{detail.capacity}</span>-top
              </p>
            )}
          </div>

          {/* Table Visual */}
          <div
            className={cn(
              "transition-opacity",
              seatsRevealed ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: reducedMotion ? "1ms" : "200ms" }}
          >
            <TableVisual
              shape={detail.shape}
              tableNumber={detail.number}
              seats={detail.seats}
              selectedSeat={selectedSeat}
              onSeatTap={handleSeatTap}
              onTableCenterTap={handleTableCenterTap}
              onEmptyTap={handleEmptyTap}
              status={detail.status}
            />
          </div>

          {/* Seat Detail */}
          {selectedSeatData && (
            <div className="animate-slide-up">
              <SeatDetailPanel seat={selectedSeatData} />
            </div>
          )}

          {/* Free table CTA */}
          {isFree && cardsRevealed && (
            <div className="flex flex-col items-center gap-3 py-4 animate-slide-up">
              <p className="text-sm text-muted-foreground">Table is available</p>
              <Button size="lg" className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground">
                <Users className="h-4 w-4" />
                Seat Party Here
              </Button>
            </div>
          )}

          {/* Meal Progress */}
          {!isFree && detail.waves.length > 0 && cardsRevealed && (
            <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
              <MealProgress waves={detail.waves} />
            </div>
          )}

          {/* Alert Cards */}
          {detail.alerts.length > 0 && cardsRevealed && (
            <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <AlertCards alerts={detail.alerts} />
            </div>
          )}

          {/* Table Notes */}
          {detail.notes.length > 0 && cardsRevealed && (
            <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
              <TableNotesCard notes={detail.notes} />
            </div>
          )}

          {/* Quick Actions */}
          {!isFree && cardsRevealed && (
            <div
              className="flex flex-wrap gap-2 pb-4 animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              {[
                { icon: Plus, label: "Add Items", accent: "border-emerald-500/30 text-emerald-400 hover:border-emerald-400/50 hover:text-emerald-300" },
                { icon: Flame, label: "Fire Wave", accent: "border-amber-500/30 text-amber-400 hover:border-amber-400/50 hover:text-amber-300" },
                { icon: MessageSquare, label: "Kitchen", accent: "border-blue-500/30 text-blue-400 hover:border-blue-400/50 hover:text-blue-300" },
                { icon: CreditCard, label: "Bill", accent: "border-violet-500/30 text-violet-400 hover:border-violet-400/50 hover:text-violet-300" },
              ].map(({ icon: Icon, label, accent }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 min-w-[100px] gap-1.5 text-xs",
                    "bg-transparent transition-all",
                    accent,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mini-Map ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute bottom-4 left-4 rounded-xl border border-white/[0.06] p-2.5 shadow-xl shadow-black/30",
          "bg-[hsl(225,15%,8%)]/90 backdrop-blur-xl",
          cardsRevealed ? "animate-fade-slide-in" : "opacity-0"
        )}
      >
        <p className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 font-mono">
          Mini-map
        </p>
        <div className="relative h-16 w-24">
          {allTablesData.map((t) => {
            const x = (t.position.x / 1060) * 88 + 4
            const y = (t.position.y / 380) * 52 + 4
            const isCurrent = t.id === tableId
            return (
              <span
                key={t.id}
                className={cn(
                  "absolute block rounded-full",
                  isCurrent
                    ? "h-3 w-3 border-2 border-primary bg-primary/30 -ml-0.5 -mt-0.5 shadow-sm shadow-primary/30"
                    : "h-1.5 w-1.5",
                  !isCurrent && t.status === "free" && "bg-emerald-400/60",
                  !isCurrent && t.status === "active" && "bg-amber-400/60",
                  !isCurrent && t.status === "urgent" && "bg-red-400/60",
                  !isCurrent && t.status === "billing" && "bg-blue-400/60",
                  !isCurrent && t.status === "closed" && "bg-white/10",
                )}
                style={{ left: x, top: y }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
