"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const shortcuts = [
  { keys: ["Arrow Up", "Arrow Down"], description: "Navigate rows" },
  { keys: ["Enter"], description: "Open detail" },
  { keys: ["S"], description: "Seat selected" },
  { keys: ["T"], description: "Text selected guest" },
  { keys: ["E"], description: "Edit selected" },
  { keys: ["N"], description: "New reservation" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["Space"], description: "Toggle row selection" },
  { keys: ["Cmd", "A"], description: "Select all visible" },
  { keys: ["?"], description: "Show/hide shortcuts" },
]

interface ListKeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ListKeyboardShortcuts({ open, onOpenChange }: ListKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-foreground">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1">
                {s.keys.map((key, j) => (
                  <span key={j}>
                    {j > 0 && <span className="mx-0.5 text-zinc-600">+</span>}
                    <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
              <span className="text-xs text-zinc-400">{s.description}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
