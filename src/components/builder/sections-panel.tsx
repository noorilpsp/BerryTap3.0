"use client"

import React, { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { FloorSection } from "@/lib/floorplan-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SectionsPanelProps {
  sections: FloorSection[]
  elementsWithSeats: { sectionId?: string }[]
  onAddSection: (name: string) => void
  onUpdateSection: (id: string, name: string) => void
  onDeleteSection: (id: string) => void
}

export function SectionsPanel({
  sections,
  elementsWithSeats,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
}: SectionsPanelProps) {
  const [newSectionName, setNewSectionName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<FloorSection | null>(null)

  const handleAdd = () => {
    const trimmed = newSectionName.trim()
    if (trimmed) {
      onAddSection(trimmed)
      setNewSectionName("")
    }
  }

  const startEdit = (s: FloorSection) => {
    setEditingId(s.id)
    setEditingName(s.name)
  }

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateSection(editingId, editingName.trim())
      setEditingId(null)
    }
  }

  const countTablesInSection = (sectionId: string) =>
    elementsWithSeats.filter((el) => el.sectionId === sectionId).length

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Sections
        </h2>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="New section name"
            className="h-8 text-xs bg-card border-border/50"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 shrink-0"
            onClick={handleAdd}
            disabled={!newSectionName.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 group rounded-md px-2 py-1.5 hover:bg-accent/50"
            >
              {editingId === s.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit()
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    onBlur={saveEdit}
                    autoFocus
                    className="h-7 text-xs flex-1"
                  />
                </>
              ) : (
                <>
                  <span className="text-xs flex-1 truncate">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {countTablesInSection(s.id)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => startEdit(s)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(s)}
                    disabled={sections.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget &&
                (countTablesInSection(deleteTarget.id) > 0
                  ? `"${deleteTarget.name}" has ${countTablesInSection(deleteTarget.id)} table(s). They will be reassigned by position when you save.`
                  : `"${deleteTarget.name}" will be removed.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && onDeleteSection(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
