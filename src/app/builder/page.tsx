"use client"

import React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useFloorplanBuilder } from "@/hooks/use-floorplan-builder"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { ElementPalette } from "@/components/builder/element-palette"
import { PropertiesPanel } from "@/components/builder/properties-panel"
import { BuilderToolbar } from "@/components/builder/builder-toolbar"
import { SaveLoadModal } from "@/components/builder/save-load-modal"
import { ELEMENT_TEMPLATES, type FloorplanElementTemplate } from "@/lib/floorplan-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ArrowLeft } from "lucide-react"
import {
  saveFloorplan,
  getActiveFloorplan,
  setActiveFloorplanId,
  type SavedFloorplan,
} from "@/lib/floorplan-storage"

export default function BuilderPage() {
  const builder = useFloorplanBuilder()
  const [draggingTemplate, setDraggingTemplate] =
    useState<FloorplanElementTemplate | null>(null)
  const [initialDragCursorPos, setInitialDragCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [saveLoadModalOpen, setSaveLoadModalOpen] = useState(false)
  const [saveLoadMode, setSaveLoadMode] = useState<"save" | "load">("save")
  const [currentFloorplanId, setCurrentFloorplanId] = useState<string | null>(null)
  const [currentFloorplanName, setCurrentFloorplanName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const active = getActiveFloorplan()
    if (active) {
      setCurrentFloorplanId(active.id)
      setCurrentFloorplanName(active.name)
    }
  }, [])

  const handleSave = useCallback((name: string) => {
    const id = saveFloorplan(
      name,
      builder.elements,
      builder.canvas.gridSize,
      builder.totalSeats,
      currentFloorplanId || undefined
    )
    setCurrentFloorplanId(id)
    setCurrentFloorplanName(name)
  }, [builder.elements, builder.canvas.gridSize, builder.totalSeats, currentFloorplanId])

  const handleLoad = useCallback((floorplan: SavedFloorplan) => {
    builder.clearAll()
    setCurrentFloorplanId(floorplan.id)
    setCurrentFloorplanName(floorplan.name)
    setActiveFloorplanId(floorplan.id)
    setTimeout(() => {
      floorplan.elements.forEach((el) => {
        const template = ELEMENT_TEMPLATES.find((t) => t.id === el.templateId)
        if (template) {
          const id = builder.addElement(template, el.x, el.y)
          builder.updateElement(id, {
            width: el.width,
            height: el.height,
            rotation: el.rotation,
            customLabel: el.customLabel,
            opacity: el.opacity,
            locked: el.locked,
          })
        }
      })
    }, 100)
  }, [builder])

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (!json.elements || !Array.isArray(json.elements)) {
          alert("Invalid floorplan file format")
          return
        }
        builder.clearAll()
        setTimeout(() => {
          json.elements.forEach((el: { templateId: string; x: number; y: number; width?: number; height?: number; rotation?: number; label?: string }) => {
            const template = ELEMENT_TEMPLATES.find((t) => t.id === el.templateId)
            if (template) {
              const id = builder.addElement(template, el.x, el.y)
              builder.updateElement(id, {
                width: el.width,
                height: el.height,
                rotation: el.rotation,
                customLabel: el.label !== template.label ? el.label : undefined,
              })
            }
          })
        }, 100)
        setCurrentFloorplanId(null)
        setCurrentFloorplanName("")
      } catch (error) {
        console.error("Error parsing JSON file:", error)
        alert("Failed to parse JSON file. Please check the file format.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }, [builder])

  const handleExport = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      canvas: { gridSize: builder.canvas.gridSize },
      elements: builder.elements.map((el) => ({
        templateId: el.templateId,
        label: el.customLabel || el.label,
        x: Math.round(el.x),
        y: Math.round(el.y),
        width: Math.round(el.width),
        height: Math.round(el.height),
        rotation: el.rotation,
        seats: el.seats,
      })),
      totalSeats: builder.totalSeats,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `floorplan-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [builder])

  const handleOpenSave = useCallback(() => {
    setSaveLoadMode("save")
    setSaveLoadModalOpen(true)
  }, [])

  const handleOpenLoad = useCallback(() => {
    setSaveLoadMode("load")
    setSaveLoadModalOpen(true)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) builder.redo()
        else builder.undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleOpenSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault()
        handleOpenLoad()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && builder.selectedId) {
        e.preventDefault()
        builder.duplicateElement(builder.selectedId)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [builder, handleOpenSave, handleOpenLoad])

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Link
        href="/floor-map"
        className="fixed top-16 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Floor Map
      </Link>

      <BuilderToolbar
        canUndo={builder.canUndo}
        canRedo={builder.canRedo}
        showGrid={builder.canvas.showGrid}
        snapToGrid={builder.canvas.snapToGrid}
        zoom={builder.canvas.zoom}
        elementCount={builder.elements.length}
        totalSeats={builder.totalSeats}
        currentFloorplanName={currentFloorplanName}
        onUndo={builder.undo}
        onRedo={builder.redo}
        onZoomIn={builder.zoomIn}
        onZoomOut={builder.zoomOut}
        onResetZoom={builder.resetZoom}
        onToggleGrid={builder.toggleGrid}
        onToggleSnap={builder.toggleSnap}
        onClearAll={builder.clearAll}
        onExport={handleExport}
        onSave={handleOpenSave}
        onLoad={handleOpenLoad}
        onImport={handleImport}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "relative flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
            leftPanelOpen ? "w-[260px]" : "w-0"
          )}
        >
          {leftPanelOpen && (
            <>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Elements
                </h2>
                <button
                  onClick={() => setLeftPanelOpen(false)}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </div>
              <ElementPalette
                onPick={(template, e) => {
                  setDraggingTemplate(template)
                  setInitialDragCursorPos({ x: e.clientX, y: e.clientY })
                }}
              />
            </>
          )}
        </div>

        {!leftPanelOpen && (
          <button
            onClick={() => setLeftPanelOpen(true)}
            className="absolute left-0 top-16 z-20 h-8 w-8 flex items-center justify-center rounded-r-md bg-card border border-l-0 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
          </button>
        )}

        <BuilderCanvas
          elements={builder.elements}
          selectedId={builder.selectedId}
          canvas={builder.canvas}
          onSelectElement={builder.setSelectedId}
          onUpdateElement={builder.updateElement}
          onAddElement={builder.addElement}
          onSetZoom={builder.setZoom}
          onSetPan={builder.setPan}
          snapValue={builder.snapValue}
          onDeleteElement={builder.deleteElement}
          draggingTemplate={draggingTemplate}
          onDraggingTemplate={(t) => {
            setDraggingTemplate(t)
            if (!t) setInitialDragCursorPos(null)
          }}
          initialDragCursorPos={initialDragCursorPos}
        />

        <div
          className={cn(
            "relative flex flex-col border-l border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
            rightPanelOpen && builder.selectedElement ? "w-[260px]" : "w-0"
          )}
        >
          {rightPanelOpen && builder.selectedElement && (
            <>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Inspector
                </h2>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <PanelRightClose className="h-3.5 w-3.5" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <PropertiesPanel
                  element={builder.selectedElement}
                  onUpdate={builder.updateElement}
                  onDelete={builder.deleteElement}
                  onDuplicate={builder.duplicateElement}
                  onBringToFront={builder.bringToFront}
                  onSendToBack={builder.sendToBack}
                />
              </ScrollArea>
            </>
          )}
        </div>

        {!rightPanelOpen && builder.selectedElement && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="absolute right-0 top-16 z-20 h-8 w-8 flex items-center justify-center rounded-l-md bg-card border border-r-0 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <SaveLoadModal
        open={saveLoadModalOpen}
        mode={saveLoadMode}
        currentName={currentFloorplanName}
        onClose={() => setSaveLoadModalOpen(false)}
        onSave={handleSave}
        onLoad={handleLoad}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
