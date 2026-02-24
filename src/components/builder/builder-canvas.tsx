"use client"

import React, { useRef, useCallback, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type {
  PlacedElement,
  CanvasState,
  FloorplanElementTemplate,
} from "@/lib/floorplan-types"
import { ElementRenderer } from "@/components/builder/element-renderer"

interface BuilderCanvasProps {
  elements: PlacedElement[]
  selectedId: string | null
  canvas: CanvasState
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<PlacedElement>) => void
  onAddElement: (
    template: FloorplanElementTemplate,
    x: number,
    y: number
  ) => void
  onSetZoom: (zoom: number) => void
  onSetPan: (panX: number, panY: number) => void
  snapValue: (v: number) => number
  onDeleteElement: (id: string) => void
  draggingTemplate: FloorplanElementTemplate | null
  onDraggingTemplate: (t: FloorplanElementTemplate | null) => void
  /** Initial cursor position when template was picked (e.g. from palette click) so ghost shows immediately */
  initialDragCursorPos?: { x: number; y: number } | null
}

interface DragState {
  type: "move" | "resize"
  elementId: string
  startX: number
  startY: number
  startElX: number
  startElY: number
  startElW: number
  startElH: number
  resizeHandle?: string
}

export function BuilderCanvas({
  elements,
  selectedId,
  canvas,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onSetZoom,
  onSetPan,
  snapValue,
  onDeleteElement,
  draggingTemplate,
  onDraggingTemplate,
  initialDragCursorPos = null,
}: BuilderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [panStartOffset, setPanStartOffset] = useState({ x: 0, y: 0 })
  const [dropPreview, setDropPreview] = useState<{
    x: number
    y: number
  } | null>(null)
  /** Cursor position in screen coords when dragging from palette (for ghost that follows mouse) */
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null)
  const dropPreviewRef = useRef<{ x: number; y: number } | null>(null)
  dropPreviewRef.current = dropPreview

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const container = containerRef.current
      if (!container) return { x: 0, y: 0 }
      const rect = container.getBoundingClientRect()
      const x = (screenX - rect.left - canvas.panX) / canvas.zoom
      const y = (screenY - rect.top - canvas.panY) / canvas.zoom
      return { x, y }
    },
    [canvas.panX, canvas.panY, canvas.zoom]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.2, Math.min(5, canvas.zoom * delta))
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const newPanX = mouseX - (mouseX - canvas.panX) * (newZoom / canvas.zoom)
      const newPanY = mouseY - (mouseY - canvas.panY) * (newZoom / canvas.zoom)
      onSetZoom(newZoom)
      onSetPan(newPanX, newPanY)
    },
    [canvas.zoom, canvas.panX, canvas.panY, onSetZoom, onSetPan]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true)
        setPanStart({ x: e.clientX, y: e.clientY })
        setPanStartOffset({ x: canvas.panX, y: canvas.panY })
        e.preventDefault()
        return
      }
      // Click-to-place: with a template selected, click on canvas to place (no drag needed)
      if (e.button === 0 && !e.altKey && draggingTemplate) {
        const pos = screenToCanvas(e.clientX, e.clientY)
        const x = snapValue(pos.x - draggingTemplate.defaultWidth / 2)
        const y = snapValue(pos.y - draggingTemplate.defaultHeight / 2)
        onAddElement(draggingTemplate, x, y)
        onDraggingTemplate(null)
        setDropPreview(null)
        setDragCursorPos(null)
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (e.button === 0 && e.target === e.currentTarget) {
        onSelectElement(null)
      }
    },
    [canvas.panX, canvas.panY, onSelectElement, draggingTemplate, screenToCanvas, snapValue, onAddElement, onDraggingTemplate]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x
        const dy = e.clientY - panStart.y
        onSetPan(panStartOffset.x + dx, panStartOffset.y + dy)
        return
      }
      if (draggingTemplate) {
        const pos = screenToCanvas(e.clientX, e.clientY)
        setDropPreview({
          x: snapValue(pos.x - draggingTemplate.defaultWidth / 2),
          y: snapValue(pos.y - draggingTemplate.defaultHeight / 2),
        })
        return
      }
      if (drag) {
        const pos = screenToCanvas(e.clientX, e.clientY)
        if (drag.type === "move") {
          const dx = pos.x - drag.startX
          const dy = pos.y - drag.startY
          onUpdateElement(drag.elementId, {
            x: snapValue(drag.startElX + dx),
            y: snapValue(drag.startElY + dy),
          })
        } else if (drag.type === "resize" && drag.resizeHandle) {
          const dx = pos.x - drag.startX
          const dy = pos.y - drag.startY
          const h = drag.resizeHandle
          let newX = drag.startElX
          let newY = drag.startElY
          let newW = drag.startElW
          let newH = drag.startElH
          if (h.includes("e")) newW = Math.max(20, drag.startElW + dx)
          if (h.includes("w")) {
            newW = Math.max(20, drag.startElW - dx)
            newX = drag.startElX + (drag.startElW - newW)
          }
          if (h.includes("s")) newH = Math.max(20, drag.startElH + dy)
          if (h.includes("n")) {
            newH = Math.max(20, drag.startElH - dy)
            newY = drag.startElY + (drag.startElH - newH)
          }
          onUpdateElement(drag.elementId, {
            x: snapValue(newX),
            y: snapValue(newY),
            width: snapValue(newW),
            height: snapValue(newH),
          })
        }
      }
    },
    [
      isPanning,
      panStart,
      panStartOffset,
      drag,
      screenToCanvas,
      snapValue,
      onSetPan,
      onUpdateElement,
      draggingTemplate,
    ]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setIsPanning(false)
        return
      }
      // Palette drag place is handled by window mouseup so we don't double-place
      if (draggingTemplate && dropPreview) return
      if (drag) setDrag(null)
    },
    [isPanning, drag, draggingTemplate, dropPreview]
  )

  const startElementDrag = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation()
      const el = elements.find((el) => el.id === elementId)
      if (!el || el.locked) return
      onSelectElement(elementId)
      const pos = screenToCanvas(e.clientX, e.clientY)
      setDrag({
        type: "move",
        elementId,
        startX: pos.x,
        startY: pos.y,
        startElX: el.x,
        startElY: el.y,
        startElW: el.width,
        startElH: el.height,
      })
    },
    [elements, screenToCanvas, onSelectElement]
  )

  const startResize = useCallback(
    (e: React.MouseEvent, elementId: string, handle: string) => {
      e.stopPropagation()
      const el = elements.find((el) => el.id === elementId)
      if (!el || el.locked) return
      const pos = screenToCanvas(e.clientX, e.clientY)
      setDrag({
        type: "resize",
        elementId,
        startX: pos.x,
        startY: pos.y,
        startElX: el.x,
        startElY: el.y,
        startElW: el.width,
        startElH: el.height,
        resizeHandle: handle,
      })
    },
    [elements, screenToCanvas]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedId &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          onDeleteElement(selectedId)
        }
      }
      if (e.key === "Escape") {
        onSelectElement(null)
        if (draggingTemplate) {
          onDraggingTemplate(null)
          setDropPreview(null)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [
    selectedId,
    onDeleteElement,
    onSelectElement,
    draggingTemplate,
    onDraggingTemplate,
  ])

  // When dragging from palette: track cursor globally so preview and ghost follow the mouse
  // even when the pointer is over the palette or outside the canvas
  useEffect(() => {
    if (!draggingTemplate) {
      setDragCursorPos(null)
      return
    }
    const onWindowMouseMove = (e: MouseEvent) => {
      setDragCursorPos({ x: e.clientX, y: e.clientY })
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const inCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (inCanvas) {
        const pos = screenToCanvas(e.clientX, e.clientY)
        setDropPreview({
          x: snapValue(pos.x - draggingTemplate.defaultWidth / 2),
          y: snapValue(pos.y - draggingTemplate.defaultHeight / 2),
        })
      } else {
        setDropPreview(null)
      }
    }
    const onWindowMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return
      const container = containerRef.current
      const preview = dropPreviewRef.current
      const hadPreview = preview !== null
      onDraggingTemplate(null)
      setDropPreview(null)
      setDragCursorPos(null)
      if (container && hadPreview && preview) {
        const rect = container.getBoundingClientRect()
        const inCanvas =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        if (inCanvas) {
          onAddElement(draggingTemplate, preview.x, preview.y)
        }
      }
      window.removeEventListener("mousemove", onWindowMouseMove)
      window.removeEventListener("mouseup", onWindowMouseUp)
    }
    window.addEventListener("mousemove", onWindowMouseMove)
    window.addEventListener("mouseup", onWindowMouseUp)
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove)
      window.removeEventListener("mouseup", onWindowMouseUp)
    }
  }, [
    draggingTemplate,
    screenToCanvas,
    snapValue,
    onAddElement,
    onDraggingTemplate,
  ])

  const gridSize = canvas.gridSize
  const majorGridSize = gridSize * 5

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{
        cursor: isPanning
          ? "grabbing"
          : draggingTemplate
            ? "crosshair"
            : "default",
        background: "hsl(var(--canvas-bg))",
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsPanning(false)
        setDrag(null)
        if (draggingTemplate) setDropPreview(null)
      }}
    >
      {/* Cursor-following ghost: full-size dashed hollow shape – portaled to body so it's never clipped, explicit cyan so it always shows */}
      {typeof document !== "undefined" &&
        draggingTemplate &&
        (dragCursorPos ?? initialDragCursorPos) &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{
              left:
                (dragCursorPos ?? initialDragCursorPos)!.x -
                draggingTemplate.defaultWidth / 2,
              top:
                (dragCursorPos ?? initialDragCursorPos)!.y -
                draggingTemplate.defaultHeight / 2,
              width: draggingTemplate.defaultWidth,
              height: draggingTemplate.defaultHeight,
              borderRadius:
                draggingTemplate.shape === "circle" ? "50%" : "4px",
              border: "2px dashed hsl(185 85% 45%)",
              background: "hsl(185 85% 45% / 0.15)",
            }}
          />,
          document.body
        )}

      {canvas.showGrid && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="minor-grid"
              width={gridSize * canvas.zoom}
              height={gridSize * canvas.zoom}
              patternUnits="userSpaceOnUse"
              x={canvas.panX % (gridSize * canvas.zoom)}
              y={canvas.panY % (gridSize * canvas.zoom)}
            >
              <path
                d={`M ${gridSize * canvas.zoom} 0 L 0 0 0 ${gridSize * canvas.zoom}`}
                fill="none"
                stroke="hsl(var(--canvas-grid-minor))"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="major-grid"
              width={majorGridSize * canvas.zoom}
              height={majorGridSize * canvas.zoom}
              patternUnits="userSpaceOnUse"
              x={canvas.panX % (majorGridSize * canvas.zoom)}
              y={canvas.panY % (majorGridSize * canvas.zoom)}
            >
              <path
                d={`M ${majorGridSize * canvas.zoom} 0 L 0 0 0 ${majorGridSize * canvas.zoom}`}
                fill="none"
                stroke="hsl(var(--canvas-grid-major) / 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#minor-grid)" />
          <rect width="100%" height="100%" fill="url(#major-grid)" />
        </svg>
      )}

      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
        }}
      >
        <div
          className="absolute"
          style={{
            left: -1,
            top: -20,
            width: 2,
            height: 40,
            background: "hsl(var(--canvas-grid) / 0.15)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: -20,
            top: -1,
            width: 40,
            height: 2,
            background: "hsl(var(--canvas-grid) / 0.15)",
          }}
        />

        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
            zoom={canvas.zoom}
            onMouseDown={(e) => {
              if (draggingTemplate) return
              startElementDrag(e, el.id)
            }}
            onResizeStart={(e, handle) => startResize(e, el.id, handle)}
          />
        ))}

        {draggingTemplate && dropPreview && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: dropPreview.x,
              top: dropPreview.y,
              width: draggingTemplate.defaultWidth,
              height: draggingTemplate.defaultHeight,
              borderRadius:
                draggingTemplate.shape === "circle" ? "50%" : "4px",
              border: "2px dashed hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.1)",
            }}
          />
        )}
      </div>

      <div className="absolute bottom-4 left-4 glass-surface-strong rounded-md px-3 py-1.5 text-xs font-mono text-muted-foreground">
        {Math.round(canvas.zoom * 100)}%
      </div>

      {elements.length === 0 && !draggingTemplate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <p className="text-sm font-sans">
              Click an element from the palette to place it
            </p>
            <p className="text-xs">
              Alt+Drag or Middle-click to pan | Scroll to zoom
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CanvasElement({
  element,
  isSelected,
  zoom,
  onMouseDown,
  onResizeStart,
}: {
  element: PlacedElement
  isSelected: boolean
  zoom: number
  onMouseDown: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent, handle: string) => void
}) {
  const isCircle = element.shape === "circle"
  const handleSize = Math.max(6, 8 / zoom)

  return (
    <div
      className="absolute group"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        overflow: "visible",
        opacity: element.opacity,
        transform: `rotate(${element.rotation}deg)`,
        cursor: element.locked ? "not-allowed" : "move",
      }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute inset-0 transition-shadow duration-150"
        style={{
          overflow: "visible",
          border: isSelected
            ? "2px solid hsl(var(--element-selected))"
            : "1px solid transparent",
          borderRadius: isCircle ? "50%" : "4px",
          boxShadow: isSelected
            ? "0 0 20px 2px hsl(var(--element-selected) / 0.25), 0 0 40px 4px hsl(var(--element-selected) / 0.1)"
            : "none",
        }}
      >
        <ElementRenderer element={element} width={element.width} height={element.height} />
      </div>

      {element.width > 55 && element.height > 35 && (element.customLabel || element.category === "fixtures") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="font-sans text-foreground/60 leading-none text-center truncate max-w-full px-1 drop-shadow-sm"
            style={{ fontSize: Math.max(7, Math.min(9, element.width / 12)) }}
          >
            {element.customLabel || element.label}
          </span>
        </div>
      )}

      {isSelected && !element.locked && (
        <>
          {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((handle) => {
            const style: React.CSSProperties = {
              position: "absolute",
              width: handleSize,
              height: handleSize,
              background: "hsl(var(--element-selected))",
              border: "1px solid hsl(var(--background))",
              borderRadius: "2px",
              zIndex: 10,
            }
            if (handle.includes("n")) style.top = -handleSize / 2
            if (handle.includes("s")) style.bottom = -handleSize / 2
            if (handle.includes("w")) style.left = -handleSize / 2
            if (handle.includes("e")) style.right = -handleSize / 2
            if (handle === "n" || handle === "s") {
              style.left = "50%"
              style.marginLeft = -handleSize / 2
            }
            if (handle === "e" || handle === "w") {
              style.top = "50%"
              style.marginTop = -handleSize / 2
            }
            const cursorMap: Record<string, string> = {
              nw: "nw-resize", ne: "ne-resize", sw: "sw-resize", se: "se-resize",
              n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
            }
            style.cursor = cursorMap[handle]
            return (
              <div
                key={handle}
                style={style}
                onMouseDown={(e) => onResizeStart(e, handle)}
              />
            )
          })}
        </>
      )}

      {!isSelected && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            borderRadius: isCircle ? "50%" : "4px",
            border: "1px solid hsl(var(--element-hover) / 0.5)",
            boxShadow: "0 0 8px hsl(var(--element-hover) / 0.15)",
          }}
        />
      )}
    </div>
  )
}
