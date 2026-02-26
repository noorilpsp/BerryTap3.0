"use client"

import { useState, useEffect } from "react"
import { useLocation } from "@/lib/contexts/LocationContext"
import {
  getAllFloorplansDb,
  deleteFloorplanDb,
  type SavedFloorplan,
} from "@/lib/floorplan-storage-db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, FolderOpen, Trash2, Calendar, Users, LayoutGrid } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SaveLoadModalProps {
  open: boolean
  mode: "save" | "load"
  currentName?: string
  currentFloorplanId?: string | null
  onClose: () => void
  onSave: (name: string, overwriteId?: string) => void
  onLoad: (floorplan: SavedFloorplan) => void
}

export function SaveLoadModal({
  open,
  mode,
  currentName,
  currentFloorplanId,
  onClose,
  onSave,
  onLoad,
}: SaveLoadModalProps) {
  const { currentLocationId } = useLocation()
  const [name, setName] = useState(currentName || "")
  const [saveAsNew, setSaveAsNew] = useState(!currentFloorplanId)
  const [floorplans, setFloorplans] = useState<SavedFloorplan[]>([])

  useEffect(() => {
    if (!open || !currentLocationId) return
    if (mode === "load") {
      let cancelled = false
      getAllFloorplansDb(currentLocationId).then((all) => {
        if (!cancelled) setFloorplans(all)
      })
      return () => { cancelled = true }
    }
    if (mode === "save") {
      setName(currentName || "")
      setSaveAsNew(!currentFloorplanId)
    }
  }, [open, mode, currentName, currentLocationId])

  const handleSave = () => {
    if (!name.trim()) return
    const overwriteId = !saveAsNew && currentFloorplanId ? currentFloorplanId : undefined
    onSave(name.trim(), overwriteId)
    onClose()
  }

  const handleLoad = (floorplan: SavedFloorplan) => {
    onLoad(floorplan)
    onClose()
  }

  const handleDelete = async (id: string) => {
    if (!currentLocationId) return
    await deleteFloorplanDb(currentLocationId, id)
    const all = await getAllFloorplansDb(currentLocationId)
    setFloorplans(all)
  }

  if (mode === "save") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Save Floorplan
            </DialogTitle>
            <DialogDescription>
              Give your floorplan a name to save it and use it in the floor map view.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentFloorplanId && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <input
                  type="checkbox"
                  id="save-as-new"
                  checked={saveAsNew}
                  onChange={(e) => setSaveAsNew(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="save-as-new" className="text-sm cursor-pointer flex-1">
                  Save as new floor plan (currently editing: <span className="font-medium text-foreground">{currentName || "Unnamed"}</span>)
                </Label>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="floorplan-name">
                {saveAsNew ? "New Floorplan Name" : `Overwrite "${currentName || "Unnamed"}"`}
              </Label>
              <Input
                id="floorplan-name"
                placeholder="e.g., Main Dining Room, Patio Layout..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Load Floorplan
          </DialogTitle>
          <DialogDescription>
            Select a saved floorplan to load into the builder.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-2">
            {floorplans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No saved floorplans yet</p>
                <p className="text-xs mt-1">Create and save a floorplan to see it here</p>
              </div>
            ) : (
              floorplans.map((floorplan) => (
                <div
                  key={floorplan.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {floorplan.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(floorplan.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="h-3 w-3" />
                        {floorplan.elements.length} elements
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {floorplan.totalSeats} seats
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoad(floorplan)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(floorplan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
