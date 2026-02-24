"use client"

import { cn } from "@/lib/utils"
import { StickyNote, Pencil, Cake } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TableNote } from "@/lib/table-detail-data"

interface TableNotesCardProps {
  notes: TableNote[]
  className?: string
}

const noteIcons: Record<string, typeof StickyNote> = {
  note: StickyNote,
  cake: Cake,
}

export function TableNotesCard({ notes, className }: TableNotesCardProps) {
  if (notes.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] p-4",
        "bg-[hsl(225,15%,9%)]/80 backdrop-blur-sm",
        className,
      )}
      role="region"
      aria-label="Table notes"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          <StickyNote className="h-3 w-3" />
          Table Notes
        </h3>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </div>
      <div className="space-y-2">
        {notes.map((note, i) => {
          const Icon = noteIcons[note.icon] ?? StickyNote
          return (
            <p key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              {note.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}
