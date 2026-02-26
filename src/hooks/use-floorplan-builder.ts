"use client"

import { useState, useCallback, useRef } from "react"
import type {
  PlacedElement,
  CanvasState,
  HistoryEntry,
  FloorplanElementTemplate,
  FloorSection,
} from "@/lib/floorplan-types"

const MAX_HISTORY = 50

const DEFAULT_SECTIONS: FloorSection[] = [
  { id: "patio", name: "Patio" },
  { id: "bar", name: "Bar Area" },
  { id: "main", name: "Main Dining" },
]

function isSeatBearingElement(el: Pick<PlacedElement, "category" | "seats">): boolean {
  return (el.category === "tables" || el.category === "seating") && (el.seats ?? 0) > 0
}

function getNextTableNumber(elements: PlacedElement[]): number {
  let max = 0
  for (const element of elements) {
    if (!isSeatBearingElement(element)) continue
    const value = element.tableNumber
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) continue
    if (value > max) max = value
  }
  return max + 1
}

export function useFloorplanBuilder() {
  const [elements, setElements] = useState<PlacedElement[]>([])
  const [sections, setSectionsState] = useState<FloorSection[]>(DEFAULT_SECTIONS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [canvas, setCanvas] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    gridSize: 20,
    showGrid: true,
    snapToGrid: true,
  })

  const historyRef = useRef<HistoryEntry[]>([])
  const historyIndexRef = useRef(-1)
  const idCounterRef = useRef(0)

  const pushHistory = useCallback((newElements: PlacedElement[]) => {
    const entry: HistoryEntry = {
      elements: JSON.parse(JSON.stringify(newElements)),
      timestamp: Date.now(),
    }
    const newHistory = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    )
    newHistory.push(entry)
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    historyRef.current = newHistory
    historyIndexRef.current = newHistory.length - 1
  }, [])

  const addElement = useCallback(
    (template: FloorplanElementTemplate, x: number, y: number) => {
      const id = `el-${Date.now()}-${idCounterRef.current++}`
      const isSeatBearing = (template.category === "tables" || template.category === "seating") && (template.seats ?? 0) > 0
      const firstSectionId = sections.length > 0 ? sections[0].id : undefined
      const newEl: PlacedElement = {
        id,
        templateId: template.id,
        x,
        y,
        width: template.defaultWidth,
        height: template.defaultHeight,
        rotation: 0,
        label: template.label,
        shape: template.shape,
        color: template.color,
        locked: false,
        opacity: 1,
        category: template.category,
        seats: template.seats,
        ...(isSeatBearing && firstSectionId ? { sectionId: firstSectionId } : {}),
      }
      setElements((prev) => {
        const next = [...prev, newEl]
        pushHistory(next)
        return next
      })
      setSelectedId(id)
      return id
    },
    [pushHistory, sections]
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<PlacedElement>) => {
      setElements((prev) => {
        const next = prev.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        )
        pushHistory(next)
        return next
      })
    },
    [pushHistory]
  )

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        const next = prev.filter((el) => el.id !== id)
        pushHistory(next)
        return next
      })
      if (selectedId === id) setSelectedId(null)
    },
    [selectedId, pushHistory]
  )

  const duplicateElement = useCallback(
    (id: string) => {
      const el = elements.find((e) => e.id === id)
      if (!el) return
      const newId = `el-${Date.now()}-${idCounterRef.current++}`
      const shouldAssignNumber = isSeatBearingElement(el)
      const nextTableNumber = shouldAssignNumber ? getNextTableNumber(elements) : undefined
      const newEl: PlacedElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        x: el.x + 20,
        y: el.y + 20,
        tableNumber: nextTableNumber,
      }
      setElements((prev) => {
        const next = [...prev, newEl]
        pushHistory(next)
        return next
      })
      setSelectedId(newId)
    },
    [elements, pushHistory]
  )

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    const entry = historyRef.current[historyIndexRef.current]
    if (entry) {
      setElements(JSON.parse(JSON.stringify(entry.elements)))
    }
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    const entry = historyRef.current[historyIndexRef.current]
    if (entry) {
      setElements(JSON.parse(JSON.stringify(entry.elements)))
    }
  }, [])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  const zoomIn = useCallback(() => {
    setCanvas((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 5) }))
  }, [])

  const zoomOut = useCallback(() => {
    setCanvas((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.2) }))
  }, [])

  const resetZoom = useCallback(() => {
    setCanvas((prev) => ({ ...prev, zoom: 1, panX: 0, panY: 0 }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    setCanvas((prev) => ({ ...prev, zoom: Math.max(0.2, Math.min(5, zoom)) }))
  }, [])

  const setPan = useCallback((panX: number, panY: number) => {
    setCanvas((prev) => ({ ...prev, panX, panY }))
  }, [])

  const toggleGrid = useCallback(() => {
    setCanvas((prev) => ({ ...prev, showGrid: !prev.showGrid }))
  }, [])

  const toggleSnap = useCallback(() => {
    setCanvas((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }))
  }, [])

  const setGridSize = useCallback((size: number) => {
    setCanvas((prev) => ({ ...prev, gridSize: size }))
  }, [])

  const snapValue = useCallback(
    (value: number) => {
      if (!canvas.snapToGrid) return value
      return Math.round(value / canvas.gridSize) * canvas.gridSize
    },
    [canvas.snapToGrid, canvas.gridSize]
  )

  const clearAll = useCallback(() => {
    setElements([])
    setSectionsState(DEFAULT_SECTIONS)
    setSelectedId(null)
    pushHistory([])
  }, [pushHistory])

  const setSections = useCallback((next: FloorSection[]) => {
    setSectionsState(next)
  }, [])

  const addSection = useCallback((name: string) => {
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section"
    setSectionsState((prev) => {
      const ids = new Set(prev.map((s) => s.id))
      let id = slug
      let n = 1
      while (ids.has(id)) id = `${slug}-${n++}`
      return [...prev, { id, name }]
    })
  }, [])

  const updateSection = useCallback((sectionId: string, name: string) => {
    setSectionsState((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, name } : s))
    )
  }, [])

  const deleteSection = useCallback((sectionId: string) => {
    setSectionsState((prev) => prev.filter((s) => s.id !== sectionId))
    setElements((prev) =>
      prev.map((el) =>
        el.sectionId === sectionId ? { ...el, sectionId: undefined } : el
      )
    )
  }, [])

  const bringToFront = useCallback(
    (id: string) => {
      setElements((prev) => {
        const el = prev.find((e) => e.id === id)
        if (!el) return prev
        const next = [...prev.filter((e) => e.id !== id), el]
        pushHistory(next)
        return next
      })
    },
    [pushHistory]
  )

  const sendToBack = useCallback(
    (id: string) => {
      setElements((prev) => {
        const el = prev.find((e) => e.id === id)
        if (!el) return prev
        const next = [el, ...prev.filter((e) => e.id !== id)]
        pushHistory(next)
        return next
      })
    },
    [pushHistory]
  )

  const selectedElement = elements.find((e) => e.id === selectedId) ?? null
  const totalSeats = elements.reduce((acc, el) => acc + (el.seats ?? 0), 0)

  return {
    elements,
    sections,
    setSections,
    addSection,
    updateSection,
    deleteSection,
    selectedId,
    selectedElement,
    canvas,
    canUndo,
    canRedo,
    totalSeats,
    setSelectedId,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    setPan,
    toggleGrid,
    toggleSnap,
    setGridSize,
    snapValue,
    clearAll,
    bringToFront,
    sendToBack,
  }
}
