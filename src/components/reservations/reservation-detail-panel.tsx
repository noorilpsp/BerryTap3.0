"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { type DetailReservation } from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

import { DetailHeader } from "./detail-header"
import { DetailGuestProfile } from "./detail-guest-profile"
import { DetailBooking } from "./detail-booking"
import { DetailServiceStatus } from "./detail-service-status"
import { DetailNotes } from "./detail-notes"
import { DetailCommunications } from "./detail-communications"
import { DetailHistory } from "./detail-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReservationDetailPanelProps {
  reservation: DetailReservation
  open: boolean
  onClose: () => void
}

/**
 * The main detail panel. Responsive:
 * - Desktop (>=1280): right slide-over panel, 480px wide
 * - Tablet (768-1279): full-screen modal
 * - Mobile (<768): bottom sheet
 */
export function ReservationDetailPanel({
  reservation,
  open,
  onClose,
}: ReservationDetailPanelProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)")
  const isMobile = useMediaQuery("(max-width: 767px)")

  // Focus trap: track previous focus
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the panel on open
      setTimeout(() => panelRef.current?.focus(), 100)
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Mobile bottom sheet drag
  const [dragY, setDragY] = useState(0)
  const dragStartRef = useRef(0)
  const isDraggingRef = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartRef.current = e.touches[0].clientY
    isDraggingRef.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    const delta = e.touches[0].clientY - dragStartRef.current
    if (delta > 0) setDragY(delta)
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false
    if (dragY > 120) {
      onClose()
    }
    setDragY(0)
  }, [dragY, onClose])

  if (!open) return null

  const panelContent = (
    <>
      <DetailHeader reservation={reservation} onClose={onClose} />
      {isTablet ? (
        <TabletContent reservation={reservation} />
      ) : (
        <ScrollContent reservation={reservation} />
      )}
    </>
  )

  // Desktop: right slide-over panel
  if (isDesktop) {
    return (
      <>
        {/* Backdrop */}
        <div className="detail-backdrop fixed inset-0 z-40 bg-zinc-950/60" onClick={onClose} />
        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Reservation detail for ${reservation.guestName}`}
          className="detail-panel-ops detail-panel-slide-right fixed bottom-0 right-0 top-0 z-50 flex w-[480px] flex-col border-l border-zinc-800/50 bg-zinc-950 shadow-2xl backdrop-blur-xl text-zinc-100"
        >
          {panelContent}
        </div>
      </>
    )
  }

  // Tablet: full-screen modal
  if (isTablet) {
    return (
      <>
        <div className="detail-backdrop fixed inset-0 z-40 bg-zinc-950/60" onClick={onClose} />
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Reservation detail for ${reservation.guestName}`}
          className="detail-panel-ops detail-panel-fade fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 shadow-2xl backdrop-blur-xl text-zinc-100"
        >
          {panelContent}
        </div>
      </>
    )
  }

  // Mobile: bottom sheet
  return (
    <>
      <div className="detail-backdrop fixed inset-0 z-40 bg-zinc-950/60" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Reservation detail for ${reservation.guestName}`}
        className="detail-panel-ops detail-panel-slide-up fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl border-t border-zinc-800/50 bg-zinc-950 shadow-2xl backdrop-blur-xl text-zinc-100"
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined }}
      >
        {/* Drag handle */}
        <div
          className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full bg-zinc-600" />
        </div>
        {panelContent}
      </div>
    </>
  )
}

/** Scrollable content for desktop and mobile */
function ScrollContent({ reservation }: { reservation: DetailReservation }) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="space-y-4 p-4">
        <DetailGuestProfile reservation={reservation} />
        <DetailBooking reservation={reservation} />
        {reservation.status === "seated" && reservation.serviceStatus && (
          <DetailServiceStatus service={reservation.serviceStatus} />
        )}
        <DetailNotes notes={reservation.notes} />
        <DetailCommunications communications={reservation.communications} />
        <DetailHistory history={reservation.history} />
        {/* Bottom safe area */}
        <div className="h-8" />
      </div>
    </ScrollArea>
  )
}

/** Tablet: two-column layout with tabs for lower sections */
function TabletContent({ reservation }: { reservation: DetailReservation }) {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="space-y-4 p-5">
        {/* Two-column top */}
        <div className="grid grid-cols-2 gap-4">
          <DetailGuestProfile reservation={reservation} />
          <DetailBooking reservation={reservation} />
        </div>

        {/* Service status (full width) */}
        {reservation.status === "seated" && reservation.serviceStatus && (
          <DetailServiceStatus service={reservation.serviceStatus} />
        )}

        {/* Tabbed bottom sections */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <TabsTrigger value="notes" className="text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Notes & Requests</TabsTrigger>
            <TabsTrigger value="comms" className="text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Communications</TabsTrigger>
            <TabsTrigger value="history" className="text-xs text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">History</TabsTrigger>
          </TabsList>
          <TabsContent value="notes"><DetailNotes notes={reservation.notes} /></TabsContent>
          <TabsContent value="comms"><DetailCommunications communications={reservation.communications} /></TabsContent>
          <TabsContent value="history"><DetailHistory history={reservation.history} /></TabsContent>
        </Tabs>

        <div className="h-8" />
      </div>
    </ScrollArea>
  )
}
