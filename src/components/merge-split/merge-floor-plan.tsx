"use client"

import { useState, useMemo, useCallback } from "react"
import { Lock, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  floorTables,
  activeMerges,
  adjacencyMap,
  isTableInActiveMerge,
  getActiveMergeForTable,
  canMergeTables,
  type FloorTable,
} from "@/lib/merge-split-data"

interface MergeFloorPlanProps {
  selectedTables: string[]
  onTableSelect: (tableId: string) => void
  onMergedTableClick: (mergeId: string) => void
}

const ZONE_CONFIGS: Record<string, { label: string; y: number }> = {
  "Main Dining": { label: "MAIN DINING", y: 30 },
  Patio: { label: "PATIO", y: 565 },
  "Private Room": { label: "PRIVATE ROOM", y: 30 },
}

export function MergeFloorPlan({ selectedTables, onTableSelect, onMergedTableClick }: MergeFloorPlanProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)

  const adjacentToSelected = useMemo(() => {
    if (selectedTables.length === 0) return new Set<string>()
    const adj = new Set<string>()
    for (const id of selectedTables) {
      const neighbors = adjacencyMap[id] || []
      for (const n of neighbors) {
        if (!selectedTables.includes(n) && !isTableInActiveMerge(n)) {
          adj.add(n)
        }
      }
    }
    return adj
  }, [selectedTables])

  const getTableState = useCallback(
    (table: FloorTable) => {
      if (selectedTables.includes(table.id)) return "selected"
      if (table.status === "merged") return "merged"
      if (adjacentToSelected.has(table.id)) return "candidate"
      if (selectedTables.length > 0 && !adjacentToSelected.has(table.id) && table.status !== "merged") return "incompatible"
      if (table.status === "occupied") return "occupied"
      return "normal"
    },
    [selectedTables, adjacentToSelected]
  )

  const mergedGroups = useMemo(() => {
    const groups: Record<string, FloorTable[]> = {}
    for (const t of floorTables) {
      if (t.mergeId) {
        if (!groups[t.mergeId]) groups[t.mergeId] = []
        groups[t.mergeId].push(t)
      }
    }
    return groups
  }, [])

  const handleTableClick = useCallback(
    (table: FloorTable) => {
      if (table.status === "merged" && table.mergeId) {
        onMergedTableClick(table.mergeId)
        return
      }
      if (table.status === "occupied") return
      const state = getTableState(table)
      if (state === "incompatible") return
      onTableSelect(table.id)
    },
    [getTableState, onTableSelect, onMergedTableClick]
  )

  // Calculate SVG viewBox
  const svgWidth = 880
  const svgHeight = 700

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative h-full w-full overflow-auto rounded-xl border border-border/30 bg-background/50">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full" style={{ minHeight: 500 }}>
          <defs>
            {/* Glow filter for selected tables */}
            <filter id="glow-cyan" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#22d3ee" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Glow for merged tables */}
            <filter id="glow-emerald" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#10b981" floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Dashed animation for candidates */}
            <pattern id="dash-pattern" patternUnits="userSpaceOnUse" width="8" height="1">
              <rect width="5" height="1" fill="#22d3ee" opacity="0.5" />
            </pattern>
          </defs>

          {/* Zone backgrounds */}
          <rect x="20" y="20" width="540" height="520" rx="12" fill="hsl(220 18% 7% / 0.6)" stroke="hsl(220 15% 18% / 0.3)" strokeWidth="1" />
          <text x="40" y={ZONE_CONFIGS["Main Dining"].y + 14} className="fp-zone-label" fill="hsl(210 15% 40%)" fontSize="11" fontWeight="600" letterSpacing="0.12em">
            MAIN DINING
          </text>

          <rect x="20" y="560" width="620" height="110" rx="12" fill="hsl(220 18% 7% / 0.6)" stroke="hsl(220 15% 18% / 0.3)" strokeWidth="1" />
          <text x="40" y="578" className="fp-zone-label" fill="hsl(210 15% 40%)" fontSize="11" fontWeight="600" letterSpacing="0.12em">
            PATIO
          </text>

          <rect x="575" y="20" width="280" height="280" rx="12" fill="hsl(220 18% 7% / 0.6)" stroke="hsl(220 15% 18% / 0.3)" strokeWidth="1" />
          <text x="595" y="44" className="fp-zone-label" fill="hsl(210 15% 40%)" fontSize="11" fontWeight="600" letterSpacing="0.12em">
            PRIVATE ROOM
          </text>

          {/* Connection bridges for merged tables */}
          {Object.entries(mergedGroups).map(([mergeId, tables]) => {
            if (tables.length < 2) return null
            const merge = activeMerges.find((m) => m.id === mergeId)
            if (!merge) return null

            const sortedTables = [...tables].sort((a, b) => a.x - b.x || a.y - b.y)
            const bridges: React.ReactNode[] = []

            for (let i = 0; i < sortedTables.length - 1; i++) {
              const t1 = sortedTables[i]
              const t2 = sortedTables[i + 1]
              const cx1 = t1.x + t1.width / 2
              const cy1 = t1.y + t1.height / 2
              const cx2 = t2.x + t2.width / 2
              const cy2 = t2.y + t2.height / 2
              const midX = (cx1 + cx2) / 2
              const midY = (cy1 + cy2) / 2

              bridges.push(
                <g key={`bridge-${mergeId}-${i}`}>
                  {/* Bridge line */}
                  <line
                    x1={t1.x + t1.width}
                    y1={cy1}
                    x2={t2.x}
                    y2={cy2}
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="0"
                    opacity="0.7"
                  />
                  {/* Bridge label */}
                  <rect x={midX - 38} y={midY - 10} width="76" height="20" rx="4" fill="hsl(220 18% 7% / 0.9)" stroke="#10b981" strokeWidth="1" />
                  <text x={midX} y={midY + 4} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="600">
                    MERGED = {merge.combinedSeats}p
                  </text>
                </g>
              )
            }

            // Merged group outline
            const minX = Math.min(...tables.map((t) => t.x)) - 6
            const minY = Math.min(...tables.map((t) => t.y)) - 6
            const maxX = Math.max(...tables.map((t) => t.x + t.width)) + 6
            const maxY = Math.max(...tables.map((t) => t.y + t.height)) + 6

            return (
              <g key={`merge-group-${mergeId}`}>
                <rect
                  x={minX}
                  y={minY}
                  width={maxX - minX}
                  height={maxY - minY}
                  rx="8"
                  fill="hsl(160 84% 39% / 0.06)"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="0"
                  opacity="0.6"
                />
                {bridges}
              </g>
            )
          })}

          {/* Potential merge line for selected + hovered */}
          {selectedTables.length > 0 &&
            hoveredTable &&
            adjacentToSelected.has(hoveredTable) &&
            (() => {
              const ht = floorTables.find((t) => t.id === hoveredTable)
              // Connect to closest selected table
              const closest = selectedTables.reduce((best, id) => {
                const st = floorTables.find((t) => t.id === id)!
                const bt = floorTables.find((t) => t.id === best)!
                const dSt = Math.hypot(st.x - (ht?.x || 0), st.y - (ht?.y || 0))
                const dBt = Math.hypot(bt.x - (ht?.x || 0), bt.y - (ht?.y || 0))
                return dSt < dBt ? id : best
              })
              const st = floorTables.find((t) => t.id === closest)
              if (!st || !ht) return null
              return (
                <line
                  x1={st.x + st.width / 2}
                  y1={st.y + st.height / 2}
                  x2={ht.x + ht.width / 2}
                  y2={ht.y + ht.height / 2}
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.6"
                  className="merge-dash-animate"
                />
              )
            })()}

          {/* Connection lines between selected tables */}
          {selectedTables.length >= 2 &&
            selectedTables.map((id, i) => {
              if (i === 0) return null
              const prev = floorTables.find((t) => t.id === selectedTables[i - 1])
              const curr = floorTables.find((t) => t.id === id)
              if (!prev || !curr) return null
              return (
                <line
                  key={`sel-line-${i}`}
                  x1={prev.x + prev.width / 2}
                  y1={prev.y + prev.height / 2}
                  x2={curr.x + curr.width / 2}
                  y2={curr.y + curr.height / 2}
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
              )
            })}

          {/* Tables */}
          {floorTables.map((table) => {
            const state = getTableState(table)
            const merge = table.mergeId ? activeMerges.find((m) => m.id === table.mergeId) : null

            return (
              <Tooltip key={table.id}>
                <TooltipTrigger asChild>
                  <g
                    className="cursor-pointer transition-all"
                    style={{
                      opacity: state === "incompatible" ? 0.3 : 1,
                      transform: state === "selected" ? `translate(${table.x + table.width / 2}px, ${table.y + table.height / 2}px) scale(1.05) translate(${-(table.x + table.width / 2)}px, ${-(table.y + table.height / 2)}px)` : undefined,
                    }}
                    onClick={() => handleTableClick(table)}
                    onMouseEnter={() => setHoveredTable(table.id)}
                    onMouseLeave={() => setHoveredTable(null)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Table ${table.number}, ${table.seats} seats, ${state}`}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault()
                        handleTableClick(table)
                      }
                    }}
                  >
                    {/* Table background */}
                    <rect
                      x={table.x}
                      y={table.y}
                      width={table.width}
                      height={table.height}
                      rx="8"
                      fill={
                        state === "selected"
                          ? "hsl(185 85% 45% / 0.15)"
                          : state === "merged"
                            ? "hsl(160 84% 39% / 0.12)"
                            : state === "candidate"
                              ? "hsl(185 85% 45% / 0.06)"
                              : state === "occupied"
                                ? "hsl(38 92% 50% / 0.08)"
                                : "hsl(220 15% 12%)"
                      }
                      stroke={
                        state === "selected"
                          ? "#22d3ee"
                          : state === "merged"
                            ? "#10b981"
                            : state === "candidate"
                              ? "#22d3ee"
                              : state === "occupied"
                                ? "hsl(38 92% 50% / 0.4)"
                                : "hsl(220 15% 18%)"
                      }
                      strokeWidth={state === "selected" ? 2.5 : state === "merged" ? 2 : state === "candidate" ? 1.5 : 1}
                      strokeDasharray={state === "candidate" ? "4 3" : "0"}
                      filter={state === "selected" ? "url(#glow-cyan)" : state === "merged" ? "url(#glow-emerald)" : undefined}
                    />

                    {/* Table number */}
                    <text
                      x={table.x + table.width / 2}
                      y={table.y + (state === "merged" ? 20 : table.height / 2 - 4)}
                      textAnchor="middle"
                      fill={
                        state === "selected"
                          ? "#22d3ee"
                          : state === "merged"
                            ? "#10b981"
                            : "hsl(210 20% 85%)"
                      }
                      fontSize="13"
                      fontWeight="700"
                    >
                      T{table.number}
                    </text>

                    {/* Seat count */}
                    <text
                      x={table.x + table.width / 2}
                      y={table.y + (state === "merged" ? 34 : table.height / 2 + 12)}
                      textAnchor="middle"
                      fill="hsl(220 10% 48%)"
                      fontSize="10"
                    >
                      {table.seats}p
                    </text>

                    {/* Merged reservation info */}
                    {state === "merged" && merge && table === floorTables.find((t) => t.mergeId === table.mergeId) && (
                      <>
                        <text
                          x={table.x + table.width / 2}
                          y={table.y + 50}
                          textAnchor="middle"
                          fill="#10b981"
                          fontSize="8"
                          opacity="0.8"
                        >
                          {merge.reservation.guest} ({merge.reservation.partySize}p)
                        </text>
                      </>
                    )}

                    {/* Lock icon for occupied */}
                    {state === "occupied" && (
                      <g transform={`translate(${table.x + table.width - 16}, ${table.y + 4})`}>
                        <Lock width={12} height={12} color="hsl(38 92% 50%)" opacity={0.7} />
                      </g>
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="glass-surface border-border/50 text-foreground">
                  {state === "merged" && merge ? (
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-400">
                        {merge.tables.join(" + ")} = {merge.combinedSeats} seats
                      </p>
                      <p className="text-muted-foreground">
                        {merge.reservation.guest} ({merge.reservation.partySize}p)
                      </p>
                      <p className="text-muted-foreground">Click to manage</p>
                    </div>
                  ) : state === "candidate" ? (
                    <div className="text-xs">
                      <p className="font-medium text-cyan-400">
                        Click to add T{table.number} to merge
                      </p>
                      <p className="text-muted-foreground">
                        {selectedTables.map((id) => floorTables.find((t) => t.id === id)?.seats || 0).reduce((a, b) => a + b, 0) + table.seats} seats combined
                      </p>
                    </div>
                  ) : state === "occupied" ? (
                    <div className="text-xs">
                      <p className="font-medium text-amber-400">T{table.number} is occupied</p>
                      <p className="text-muted-foreground">Cannot merge while in use</p>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <p className="font-medium">T{table.number} - {table.seats} seats</p>
                      <p className="text-muted-foreground">{table.zone}</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Selected merge preview label */}
          {selectedTables.length >= 2 && (() => {
            const selTables = selectedTables.map((id) => floorTables.find((t) => t.id === id)!).filter(Boolean)
            const totalSeats = selTables.reduce((sum, t) => sum + t.seats, 0)
            const avgX = selTables.reduce((sum, t) => sum + t.x + t.width / 2, 0) / selTables.length
            const minY = Math.min(...selTables.map((t) => t.y))
            return (
              <g>
                <rect x={avgX - 50} y={minY - 30} width="100" height="22" rx="6" fill="hsl(185 85% 45% / 0.15)" stroke="#22d3ee" strokeWidth="1" />
                <text x={avgX} y={minY - 15} textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="600">
                  {selectedTables.map((id) => id).join(" + ")} = {totalSeats}p
                </text>
              </g>
            )
          })()}
        </svg>
      </div>
    </TooltipProvider>
  )
}
