"use client"

import React from "react"

import { useState, useCallback, useEffect } from "react"
import { MapTopBar } from "@/components/floor-map/map-top-bar"
import { MapStatsBar } from "@/components/floor-map/map-stats-bar"
import { MapCanvas } from "@/components/floor-map/map-canvas"
import { GridView } from "@/components/floor-map/grid-view"
import { QuickActionsMenu } from "@/components/floor-map/quick-actions-menu"
import { SeatPartyModal } from "@/components/floor-map/seat-party-modal"
import {
  currentServer,
  getStatusCounts,
  filterTablesByMode,
  filterTablesByStatus,
  buildSectionConfig,
  floorStatusConfig,
  getSectionBounds,
  storeTablesToFloorTables,
} from "@/lib/floor-map-data"
import { useRestaurantStore } from "@/store/restaurantStore"
import {
  getAllFloorplansDb,
  getActiveFloorplanDb,
  setActiveFloorplanIdDb,
  getTablesForFloorplanDb,
  type SavedFloorplan,
} from "@/lib/floorplan-storage-db"
import { useLocation } from "@/lib/contexts/LocationContext"
import { FloorplanSelector } from "@/components/floor-map/floorplan-selector"
import { ensureSessionForTable } from "@/app/actions/orders"
import { recordSessionEvent } from "@/app/actions/session-events"
import type { FilterMode, ViewMode, FloorTableStatus, SectionId, SeatPartyForm } from "@/lib/floor-map-data"
import { Plus, Hammer } from "lucide-react"
import Link from "next/link"
import {
  ZOOM_LEVELS,
  DURATIONS,
  EASING,
  getAnimatedDuration,
  getTableCenter,
} from "@/lib/animation-config"
import { usePrefersReducedMotion } from "@/hooks/use-map-gestures"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"

export default function FloorMapPage() {
  const router = useRouter()
  const { currentLocationId } = useLocation()
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024

  // ── Tables: single source from store; loading a floorplan applies it to the store ──
  const storeTables = useRestaurantStore((s) => s.tables)
  const tables = React.useMemo(
    () => storeTablesToFloorTables(storeTables),
    [storeTables]
  )
  const [floorplanElements, setFloorplanElements] = useState<any[]>([])
  const [allFloorplans, setAllFloorplans] = useState<SavedFloorplan[]>([])
  const [activeFloorplanId, setActiveFloorplanIdState] = useState<string | null>(null)
  const [activeFloorplanSections, setActiveFloorplanSections] = useState<{ id: string; name: string }[] | undefined>()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const sectionConfig = buildSectionConfig(activeFloorplanSections)

  useEffect(() => {
    if (!currentLocationId) {
      setInitialLoadDone(false)
      return
    }
    let cancelled = false
    setInitialLoadDone(false)
    async function load() {
      try {
        const [all, active] = await Promise.all([
          getAllFloorplansDb(currentLocationId!),
          getActiveFloorplanDb(currentLocationId!),
        ])
        if (cancelled) return
        setAllFloorplans(all)
        setActiveFloorplanIdState(active?.id ?? null)
        setActiveFloorplanSections(active?.sections)
        if (active?.elements?.length && active?.id) {
          const storeTablesFromPlan = await getTablesForFloorplanDb(currentLocationId!, active.id)
          if (storeTablesFromPlan.length > 0) {
            useRestaurantStore.getState().setTables(storeTablesFromPlan)
            setFloorplanElements(active.elements)
          }
        }
      } finally {
        if (!cancelled) setInitialLoadDone(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [currentLocationId])

  const handleFloorplanChange = useCallback(async (floorplan: SavedFloorplan | null) => {
    if (!currentLocationId) return
    if (floorplan?.elements?.length && floorplan?.id) {
      const storeTablesFromPlan = await getTablesForFloorplanDb(currentLocationId, floorplan.id)
      if (storeTablesFromPlan.length > 0) {
        useRestaurantStore.getState().setTables(storeTablesFromPlan)
        setFloorplanElements(floorplan.elements)
        setActiveFloorplanIdState(floorplan.id)
        setActiveFloorplanSections(floorplan.sections)
        await setActiveFloorplanIdDb(currentLocationId, floorplan.id)
        return
      }
    }
    setFloorplanElements([])
    setActiveFloorplanIdState(null)
    setActiveFloorplanSections(undefined)
    await setActiveFloorplanIdDb(currentLocationId, null)
  }, [currentLocationId])
  
  // ── Tab Change Handler ─────────────────────────────────────────────────
  const handleTabChange = useCallback((tabId: string) => {
    const floorplan = allFloorplans.find(fp => fp.id === tabId)
    if (floorplan) {
      handleFloorplanChange(floorplan)
    }
  }, [allFloorplans, handleFloorplanChange])

  // ── Core Filter State ────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("map")
  const [statusFilter, setStatusFilter] = useState<FloorTableStatus | null>(null)
  const [sectionFilter, setSectionFilter] = useState<SectionId | null>(null)

  // ── Continuous Zoom State ────────────────────────────────────────────────
  const [scale, setScale] = useState(ZOOM_LEVELS.level1.scale)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)

  // ── Highlight State ──────────────────────────────────────────────────────
  const [highlightedTableId, setHighlightedTableId] = useState<string | null>(null)
  const [highlightType, setHighlightType] = useState<"search" | "alert" | null>(null)
  const [focusedSection, setFocusedSection] = useState<SectionId | null>(null)

  // ── Quick Actions ────────────────────────────────────────────────────────
  const [quickAction, setQuickAction] = useState<{
    tableId: string
    tableNumber: number
    position: { x: number; y: number }
  } | null>(null)

  // ── Seat Party State ──────────────────────────────────────────────────────
  const [seatPartyOpen, setSeatPartyOpen] = useState(false)
  const [seatPartyPreSelect, setSeatPartyPreSelect] = useState<string | null>(null)

  // ── View Switch Animation State ──────────────────────────────────────────
  const [viewTransition, setViewTransition] = useState<
    "none" | "grid-exit" | "map-enter" | "map-exit" | "grid-enter"
  >("none")
  const [mapEntering, setMapEntering] = useState(true)

  // Default to grid on mobile
  useEffect(() => {
    if (isMobile) setViewMode("grid")
  }, [isMobile])

  // Initial map entry animation
  useEffect(() => {
    if (viewMode === "map") {
      setMapEntering(true)
      const timer = setTimeout(
        () => setMapEntering(false),
        reducedMotion ? 1 : 400
      )
      return () => clearTimeout(timer)
    }
  }, []) // only on mount

  // ── Derived Data ─────────────────────────────────────────────────────────
  let filteredByMode = filterTablesByMode(tables, filterMode, currentServer)
  // Apply section filter
  if (sectionFilter) {
    filteredByMode = filteredByMode.filter((t) => t.section === sectionFilter)
  }
  const displayTables = filterTablesByStatus(filteredByMode, statusFilter)
  const counts = getStatusCounts(filteredByMode)

  // ── Active Filter Chips ──────────────────────────────────────────────────
  const activeFilterChips: string[] = []
  if (filterMode !== "all") {
    activeFilterChips.push(
      filterMode === "my_section"
        ? `Section: ${sectionConfig[currentServer.section]?.name ?? currentServer.section}`
        : `My Tables (${currentServer.assignedTables.length})`
    )
  }
  if (sectionFilter) {
    activeFilterChips.push(sectionConfig[sectionFilter]?.name ?? sectionFilter)
  }
  if (statusFilter) {
    activeFilterChips.push(floorStatusConfig[statusFilter].label)
  }

  const handleClearAllFilters = useCallback(() => {
    setFilterMode("all")
    setStatusFilter(null)
    setSectionFilter(null)
  }, [])

  // ── Transition Helper ────────────────────────────────────────────────────
  const animateTransition = useCallback(
    (
      targetScale: number,
      targetOffset: { x: number; y: number },
      duration?: number
    ) => {
      const dur = getAnimatedDuration(
        duration ?? DURATIONS.zoomIn,
        windowWidth,
        reducedMotion
      )
      setIsTransitioning(true)
      setScale(targetScale)
      setOffset(targetOffset)
      setTimeout(() => setIsTransitioning(false), dur)
    },
    [windowWidth, reducedMotion]
  )

  // ── Fit to Screen (Maximizes scale while keeping all elements visible) ──
  const handleFitToScreen = useCallback(() => {
    const PADDING = 32
    const containerWidth = windowWidth
    // The map container takes up the full height minus TopBar + StatsBar (~104px)
    const containerHeight = typeof window !== "undefined" ? window.innerHeight - 104 : 600

    let minX: number, minY: number, maxX: number, maxY: number
    if (floorplanElements.length > 0) {
      minX = Math.min(...floorplanElements.map((e) => e.x))
      minY = Math.min(...floorplanElements.map((e) => e.y))
      maxX = Math.max(...floorplanElements.map((e) => e.x + e.width))
      maxY = Math.max(...floorplanElements.map((e) => e.y + e.height))
    } else if (tables.length > 0) {
      const w = (t: { position: { x: number; y: number }; width?: number; height?: number }) => t.width ?? 64
      const h = (t: { position: { x: number; y: number }; width?: number; height?: number }) => t.height ?? 64
      minX = Math.min(...tables.map((t) => t.position.x))
      minY = Math.min(...tables.map((t) => t.position.y))
      maxX = Math.max(...tables.map((t) => t.position.x + w(t)))
      maxY = Math.max(...tables.map((t) => t.position.y + h(t)))
    } else {
      return
    }

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    if (contentWidth <= 0 || contentHeight <= 0) return

    // Available viewport after padding on each side
    const viewW = containerWidth - PADDING * 2
    const viewH = containerHeight - PADDING * 2

    // Choose the BIGGEST scale that fits both axes
    const targetScale = Math.min(viewW / contentWidth, viewH / contentHeight)

    // The CSS transform is: translate(offset) scale(targetScale)
    // with transformOrigin: "center center".
    //
    // With center-origin, a point at world coordinate (wx, wy) ends up at
    // screen position:
    //   sx = offset.x + containerCenter.x + (wx - containerCenter.x) * scale
    //   sy = offset.y + containerCenter.y + (wy - containerCenter.y) * scale
    //
    //   ... which simplifies to:
    //   sx = offset.x + containerCenter.x * (1 - scale) + wx * scale
    //
    // We want the content center to land at the screen center:
    //   screenCenter = offset + containerCenter * (1 - scale) + contentCenter * scale
    //   offset = screenCenter - containerCenter * (1 - scale) - contentCenter * scale

    const containerCenterX = containerWidth / 2
    const containerCenterY = containerHeight / 2
    const contentCenterX = minX + contentWidth / 2
    const contentCenterY = minY + contentHeight / 2

    const targetOffset = {
      x: containerCenterX - containerCenterX * (1 - targetScale) - contentCenterX * targetScale,
      y: containerCenterY - containerCenterY * (1 - targetScale) - contentCenterY * targetScale,
    }

    animateTransition(targetScale, targetOffset, DURATIONS.zoomIn)
  }, [floorplanElements, tables, windowWidth, animateTransition])

  // Auto-fit when we have tables or floorplan elements
  useEffect(() => {
    if (floorplanElements.length > 0 || tables.length > 0) {
      const timer = setTimeout(() => handleFitToScreen(), 100)
      return () => clearTimeout(timer)
    }
  }, [floorplanElements, tables, handleFitToScreen])

  // Re-fit on window resize
  useEffect(() => {
    if (floorplanElements.length === 0 && tables.length === 0) return
    const onResize = () => handleFitToScreen()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [floorplanElements, tables, handleFitToScreen])

  // ── Zoom In/Out ──────────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    if (scale < ZOOM_LEVELS.level2.scale) {
      animateTransition(ZOOM_LEVELS.level2.scale, { x: 0, y: 0 }, DURATIONS.zoomIn)
    }
  }, [scale, animateTransition])

  const handleZoomOut = useCallback(() => {
    if (scale > ZOOM_LEVELS.level1.scale) {
      animateTransition(ZOOM_LEVELS.level1.scale, { x: 0, y: 0 }, DURATIONS.zoomOut)
    }
  }, [scale, animateTransition])

  const handleScaleChange = useCallback(
    (newScale: number) => setScale(newScale),
    []
  )
  const handleOffsetChange = useCallback(
    (newOffset: { x: number; y: number }) => setOffset(newOffset),
    []
  )

  // ── Table Tap ───────────────────────────────────────────────────────────
  const handleTableTap = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return
      router.push(`/table/${tableId}`)
    },
    [tables, router]
  )

  // ── Seat Party ──────────────────────────────────────────────────────────
  const handleOpenSeatParty = useCallback((preSelectTableId?: string) => {
    setSeatPartyPreSelect(preSelectTableId ?? null)
    setSeatPartyOpen(true)
  }, [])

  const handleSeatPartyClose = useCallback(() => {
    setSeatPartyOpen(false)
    setSeatPartyPreSelect(null)
  }, [])

  const handlePartySeated = useCallback(
    (formData: SeatPartyForm) => {
      if (!formData.tableId) return

      const store = useRestaurantStore.getState()
      store.updateTable(formData.tableId, {
        status: "active",
        guests: formData.partySize,
        stage: "drinks",
        serverId: currentServer.id,
        seatedAt: new Date().toISOString(),
      })
      store.openOrderForTable(formData.tableId, formData.partySize)

      if (currentLocationId) {
        ensureSessionForTable(
          currentLocationId,
          formData.tableId,
          formData.partySize,
          currentServer.id
        ).then((sessionId) => {
          if (sessionId) {
            recordSessionEvent(currentLocationId, sessionId, "guest_seated", {
              guestCount: formData.partySize,
            }).catch(() => {})
          }
        })
      }

      setSeatPartyOpen(false)
      setSeatPartyPreSelect(null)
    },
    [currentLocationId]
  )

  // ── Long Press ───────────────────────────────────────────────────────────
  const handleTableLongPress = useCallback(
    (tableId: string, e: React.MouseEvent | React.TouchEvent) => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return
      let x = 0
      let y = 0
      if ("clientX" in e) {
        x = e.clientX
        y = e.clientY
      } else if ("touches" in e && e.touches.length > 0) {
        x = e.touches[0].clientX
        y = e.touches[0].clientY
      }
      setQuickAction({ tableId: table.id, tableNumber: table.number, position: { x, y } })
    },
    []
  )

  // ── Section Focus ────────────────────────────────────────────────────────
  const handleSectionFocus = useCallback(
    (sectionId: SectionId | null) => {
      if (sectionId === focusedSection) {
        // Double-tap to clear
        setFocusedSection(null)
        animateTransition(ZOOM_LEVELS.level1.scale, { x: 0, y: 0 }, DURATIONS.zoomOut)
        return
      }

      if (sectionId === null) {
        setFocusedSection(null)
        animateTransition(ZOOM_LEVELS.level1.scale, { x: 0, y: 0 }, DURATIONS.zoomOut)
        return
      }

      const bounds = getSectionBounds(sectionId, tables)
      if (!bounds) return

      setFocusedSection(sectionId)
      setViewMode("map")

      // Calculate zoom level to fit section with padding
      const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800
      const sectionWidth = bounds.width + 100
      const sectionHeight = bounds.height + 100
      const scaleX = (windowWidth * 0.85) / sectionWidth
      const scaleY = ((windowHeight - 200) * 0.85) / sectionHeight
      const targetScale = Math.min(scaleX, scaleY, ZOOM_LEVELS.level2.scale)

      // Pan to section center
      const sectionCenterX = bounds.x + bounds.width / 2
      const sectionCenterY = bounds.y + bounds.height / 2
      const targetOffset = {
        x: -(sectionCenterX * targetScale - windowWidth / 2),
        y: -(sectionCenterY * targetScale - windowHeight / 2 + 50),
      }

      animateTransition(targetScale, targetOffset, DURATIONS.sectionPan)
    },
    [windowWidth, animateTransition, focusedSection]
  )

  // ── Search Jump ──────────────────────────────────────────────────────────
  const handleSearchSelect = useCallback(
    (tableId: string) => {
      setViewMode("map")
      setHighlightType("search")
      setHighlightedTableId(tableId)
      const tableCenter = getTableCenter(tableId, tables)
      if (tableCenter) {
        const targetScale = ZOOM_LEVELS.level2.scale
        const targetOffset = {
          x: -(tableCenter.x * targetScale - windowWidth / 2),
          y: -(tableCenter.y * targetScale - 300),
        }
        animateTransition(targetScale, targetOffset, DURATIONS.searchJump)
      }
      setTimeout(() => {
        setHighlightedTableId(null)
        setHighlightType(null)
      }, 2500)
    },
    [windowWidth, animateTransition]
  )

  // ── View Mode Switch ─────────────────────────────────────────────────────
  const handleViewModeChange = useCallback(
    (newMode: ViewMode) => {
      if (newMode === viewMode) return
      if (reducedMotion) {
        setViewMode(newMode)
        return
      }
      if (newMode === "map") {
        setViewTransition("grid-exit")
        setTimeout(() => {
          setViewMode("map")
          setViewTransition("map-enter")
          setMapEntering(true)
          setTimeout(() => {
            setViewTransition("none")
            setMapEntering(false)
          }, 250)
        }, 150)
      } else {
        setViewTransition("map-exit")
        setTimeout(() => {
          setViewMode("grid")
          setViewTransition("grid-enter")
          setTimeout(() => setViewTransition("none"), 250)
        }, 150)
      }
    },
    [viewMode, reducedMotion]
  )

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      // Zoom
      if (e.key === "=" || e.key === "+") { e.preventDefault(); handleZoomIn() }
      else if (e.key === "-") { e.preventDefault(); handleZoomOut() }
      // Reset zoom
      else if (e.key === "0") {
        e.preventDefault()
        animateTransition(ZOOM_LEVELS.level1.scale, { x: 0, y: 0 }, DURATIONS.zoomOut)
      }
      // View toggle
      else if (e.key === "g" || e.key === "G") { e.preventDefault(); handleViewModeChange("grid") }
      else if (e.key === "m" || e.key === "M") { e.preventDefault(); handleViewModeChange("map") }
      // Quick filters
      else if (e.key === "u" || e.key === "U") { e.preventDefault(); setStatusFilter((p) => (p === "urgent" ? null : "urgent")) }
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); setStatusFilter((p) => (p === "free" ? null : "free")) }
      else if (e.key === "a" || e.key === "A") { e.preventDefault(); handleClearAllFilters() }
      // Pan
      else if (e.key === "ArrowLeft") { e.preventDefault(); setOffset((prev) => ({ ...prev, x: prev.x + 50 })) }
      else if (e.key === "ArrowRight") { e.preventDefault(); setOffset((prev) => ({ ...prev, x: prev.x - 50 })) }
      else if (e.key === "ArrowUp") { e.preventDefault(); setOffset((prev) => ({ ...prev, y: prev.y + 50 })) }
      else if (e.key === "ArrowDown") { e.preventDefault(); setOffset((prev) => ({ ...prev, y: prev.y - 50 })) }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleViewModeChange, handleClearAllFilters, animateTransition])

  // ── Normal Map / Grid View ───────────────────────────────────────────────
  const showGridExiting = viewTransition === "grid-exit" || viewTransition === "map-enter"
  const showMapExiting = viewTransition === "map-exit" || viewTransition === "grid-enter"

  const isReady = Boolean(currentLocationId && initialLoadDone)

  if (!isReady) {
    return (
      <div className="flex h-full flex-col bg-background overflow-hidden items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <MapTopBar
        sectionConfig={sectionConfig}
        filterMode={filterMode}
        viewMode={viewMode}
        serverSection={currentServer.section}
        tables={tables}
        statusFilter={statusFilter}
        sectionFilter={sectionFilter}
        activeFilterChips={activeFilterChips}
        ownTableIds={currentServer.assignedTables}
        allFloorplans={allFloorplans}
        activeFloorplanId={activeFloorplanId}
        onFilterModeChange={setFilterMode}
        onViewModeChange={handleViewModeChange}
        onTableSelect={handleSearchSelect}
        onStatusFilterChange={setStatusFilter}
        onSectionFilterChange={setSectionFilter}
        onClearAllFilters={handleClearAllFilters}
        onFloorplanChange={handleTabChange}
      />

      {/* Stats Bar */}
      <MapStatsBar
        counts={counts}
        activeStatusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
      />

      {/* Content */}
      <div className="relative flex-1 min-h-0">
        {viewMode === "map" ? (
          <div
            className={
              viewTransition === "map-enter"
                ? "animate-map-enter h-full overflow-hidden flex items-center justify-center"
                : showMapExiting
                  ? "animate-map-exit h-full overflow-hidden flex items-center justify-center"
                  : "h-full overflow-hidden flex items-center justify-center"
            }
          >
            <div className="relative h-full w-full max-w-[1600px]">
              <MapCanvas
                sectionConfig={sectionConfig}
                tables={displayTables}
                ownTableIds={currentServer.assignedTables}
                filterMode={filterMode}
                highlightedTableId={highlightedTableId}
                highlightType={highlightType}
                statusFilter={statusFilter}
                onTableTap={handleTableTap}
                onTableLongPress={handleTableLongPress}
                onScaleChange={handleScaleChange}
                scale={scale}
                offset={offset}
                onOffsetChange={handleOffsetChange}
                isTransitioning={isTransitioning}
                focusedTableId={null}
                focusedSection={focusedSection}
                onSectionTap={handleSectionFocus}
                entering={mapEntering}
                floorplanElements={floorplanElements}
                onFitToScreen={handleFitToScreen}
              />
            </div>
          </div>
        ) : (
          <div
            className={
              viewTransition === "grid-enter"
                ? "animate-grid-enter h-full"
                : showGridExiting
                  ? "animate-grid-exit h-full"
                  : "h-full"
            }
          >
            <GridView
              sectionConfig={sectionConfig}
              tables={displayTables}
              ownTableIds={currentServer.assignedTables}
              onTableTap={handleTableTap}
            />
          </div>
        )}
      </div>

      {/* Quick Actions Menu */}
      {quickAction && (
        <QuickActionsMenu
          tableNumber={quickAction.tableNumber}
          position={quickAction.position}
          onClose={() => setQuickAction(null)}
          onSeatParty={() => {
            setQuickAction(null)
            handleOpenSeatParty(quickAction.tableId)
          }}
        />
      )}

      {/* Floorplan Selector */}
      <div className="fixed top-20 left-4 z-50">
        <FloorplanSelector onFloorplanChange={handleFloorplanChange} />
      </div>

      {/* Section Focus Banner */}
      {focusedSection && viewMode === "map" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="glass-surface-strong rounded-2xl px-5 py-3 shadow-2xl border border-primary/30 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium">
                  Viewing <span className="text-primary font-semibold">{sectionConfig[focusedSection]?.name ?? focusedSection}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSectionFocus(null)}
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Show all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Link
          href="/builder"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground border border-border shadow-lg hover:bg-secondary/80 active:scale-95 transition-all"
          aria-label="Open floor plan builder"
        >
          <Hammer className="h-5 w-5" strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={() => handleOpenSeatParty()}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
          aria-label="Seat new party"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* Seat Party Modal */}
      <SeatPartyModal
        sectionConfig={sectionConfig}
        open={seatPartyOpen}
        tables={tables}
        preSelectedTableId={seatPartyPreSelect}
        onClose={handleSeatPartyClose}
        onSeated={handlePartySeated}
      />
    </div>
  )
}
