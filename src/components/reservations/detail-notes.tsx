"use client"

import { useState } from "react"
import { Plus, Pin, StickyNote, Check, Clock, X } from "lucide-react"
import { type ReservationNote, formatDateTime } from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

interface DetailNotesProps {
  notes: ReservationNote[]
}

export function DetailNotes({ notes }: DetailNotesProps) {
  const [showInput, setShowInput] = useState(false)
  const [newNote, setNewNote] = useState("")

  const statusIcon = {
    matched: <Check className="h-3 w-3 text-emerald-400" />,
    ordered: <Check className="h-3 w-3 text-emerald-400" />,
    pending: <Clock className="h-3 w-3 text-amber-400" />,
    unavailable: <X className="h-3 w-3 text-rose-400" />,
  }

  const statusLabel = {
    matched: "Matched",
    ordered: "Ordered",
    pending: "Pending",
    unavailable: "Unavailable",
  }

  return (
    <section className="detail-section-stagger rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes & Requests</h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <Plus className="h-3 w-3" /> Add Note
        </button>
      </div>

      {/* Inline note input */}
      {showInput && (
        <div className="mb-3 detail-note-expand">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a staff note..."
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            rows={2}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => { setShowInput(false); setNewNote("") }} className="rounded px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-emerald-50 hover:bg-emerald-500">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.map((note, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/30 bg-zinc-800/20 p-3">
            {note.type === "guest_request" ? (
              <>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500">
                  <Pin className="h-3 w-3" /> Guest request
                </div>
                <p className="mb-1.5 text-xs text-zinc-200">{"\u201C"}{note.text}{"\u201D"}</p>
                {note.status && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {statusIcon[note.status]}
                    <span className={cn(
                      note.status === "matched" || note.status === "ordered" ? "text-emerald-400" :
                      note.status === "pending" ? "text-amber-400" : "text-rose-400"
                    )}>
                      {statusLabel[note.status]}
                      {note.matchDetail && ` (${note.matchDetail})`}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <StickyNote className="h-3 w-3" />
                  <span className="font-semibold uppercase">Staff note</span>
                  {note.author && (
                    <span className="text-zinc-600">
                      {" -- "}{note.author} ({note.role}), {note.timestamp ? formatDateTime(note.timestamp) : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300">{"\u201C"}{note.text}{"\u201D"}</p>
              </>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-600">No notes or requests</p>
        )}
      </div>
    </section>
  )
}
