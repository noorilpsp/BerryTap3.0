"use client"

import { useState, useMemo, useCallback } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  type HeatMapMode,
  type ZoneId,
  getFloorTableStates,
  minutesToTime,
  NOW_MIN,
  unassignedReservations,
} from "@/lib/floorplan-data"
import { FloorplanTopBar } from "./floorplan-top-bar"
import { FloorplanCanvas } from "./floorplan-canvas"
import { FloorplanTimeScrubber } from "./floorplan-time-scrubber"
import { FloorplanDetailPanel } from "./floorplan-detail-panel"
import { FloorplanUnassignedDock } from "./floorplan-unassigned-dock"
import { FloorplanMobile } from "./floorplan-mobile"

export function FloorplanView() {
  const isMobile = useMediaQuery("(max-width: 767px)")

  // State
  const [scrubMin, setScrubMin] = useState(NOW_MIN)
  const [isLive, setIsLive] = useState(true)
  const [heatMap, setHeatMap] = useState<HeatMapMode>("off")
  const [zone, setZone] = useState<ZoneId>("all")
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [whatIfMode, setWhatIfMode] = useState(false)
  const [highlightedSeats, setHighlightedSeats] = useState<number | null>(null)

  // Compute table states for the scrubbed time
  const scrubTime = useMemo(() => minutesToTime(scrubMin), [scrubMin])
  const tableStates = useMemo(() => getFloorTableStates(scrubTime), [scrubTime])

  const selectedState = useMemo(
    () => (selectedTableId ? tableStates.find((s) => s.table.id === selectedTableId) ?? null : null),
    [selectedTableId, tableStates]
  )

  // Time scrubber handlers
  const handleScrub = useCallback((min: number) => {
    setScrubMin(min)
    setIsLive(false)
  }, [])

  const handleGoLive = useCallback(() => {
    setScrubMin(NOW_MIN)
    setIsLive(true)
  }, [])

  const handleSelectTable = useCallback((id: string) => {
    setSelectedTableId((prev) => (prev === id ? null : id))
  }, [])

  const handleHighlightTables = useCallback((seats: number) => {
    setHighlightedSeats((prev) => (prev === seats ? null : seats))
  }, [])

  // Mobile
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <FloorplanTopBar
          heatMap={heatMap}
          onHeatMapChange={setHeatMap}
          zone={zone}
          onZoneChange={setZone}
          whatIfMode={whatIfMode}
          onToggleWhatIf={() => setWhatIfMode((p) => !p)}
        />
        <FloorplanTimeScrubber
          scrubMin={scrubMin}
          onScrubChange={handleScrub}
          isLive={isLive}
          onGoLive={handleGoLive}
          whatIfMode={whatIfMode}
          onToggleWhatIf={() => setWhatIfMode((p) => !p)}
        />
        <div className="flex-1 overflow-y-auto">
          <FloorplanMobile
            tableStates={tableStates}
            heatMap={heatMap}
            zone={zone}
            onSelectTable={handleSelectTable}
          />
        </div>
        <FloorplanDetailPanel
          state={selectedState}
          open={!!selectedState}
          onClose={() => setSelectedTableId(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FloorplanTopBar
        heatMap={heatMap}
        onHeatMapChange={setHeatMap}
        zone={zone}
        onZoneChange={setZone}
        whatIfMode={whatIfMode}
        onToggleWhatIf={() => setWhatIfMode((p) => !p)}
      />

      <FloorplanTimeScrubber
        scrubMin={scrubMin}
        onScrubChange={handleScrub}
        isLive={isLive}
        onGoLive={handleGoLive}
        whatIfMode={whatIfMode}
        onToggleWhatIf={() => setWhatIfMode((p) => !p)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Main canvas */}
        <FloorplanCanvas
          tableStates={tableStates}
          heatMap={heatMap}
          zone={zone}
          selectedTable={selectedTableId}
          whatIfMode={whatIfMode}
          onSelectTable={handleSelectTable}
        />

        {/* Detail panel */}
        <FloorplanDetailPanel
          state={selectedState}
          open={!!selectedState}
          onClose={() => setSelectedTableId(null)}
        />
      </div>

      {/* Unassigned dock */}
      {unassignedReservations.length > 0 && (
        <FloorplanUnassignedDock
          onHighlightTables={handleHighlightTables}
          className="mx-4 mb-3"
        />
      )}
    </div>
  )
}
