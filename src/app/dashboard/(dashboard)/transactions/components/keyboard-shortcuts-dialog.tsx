"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Keyboard, X } from "lucide-react"

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      category: "General",
      items: [
        { keys: ["?", "⇧ /"], description: "Show keyboard shortcuts" },
        { keys: ["⌘ K", "Ctrl K"], description: "Open command palette" },
        { keys: ["⌘ /", "Ctrl /"], description: "Focus search" },
        { keys: ["Esc"], description: "Close dialog/drawer" },
        { keys: ["⌘ ,", "Ctrl ,"], description: "Open settings" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: ["G then T"], description: "Go to Transactions" },
        { keys: ["G then O"], description: "Go to Orders" },
        { keys: ["G then C"], description: "Go to Customers" },
        { keys: ["G then R"], description: "Go to Reports" },
        { keys: ["J", "↓"], description: "Next transaction" },
        { keys: ["K", "↑"], description: "Previous transaction" },
        { keys: ["Enter"], description: "Open selected transaction" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["⌘ N", "Ctrl N"], description: "New transaction" },
        { keys: ["⌘ E", "Ctrl E"], description: "Export transactions" },
        { keys: ["⌘ R", "Ctrl R"], description: "Generate report" },
        { keys: ["⌘ ⇧ S", "Ctrl ⇧ S"], description: "Sync now" },
        { keys: ["⌘ A", "Ctrl A"], description: "Select all" },
        { keys: ["⌘ D", "Ctrl D"], description: "Duplicate selected" },
        { keys: ["Delete", "⌫"], description: "Delete selected" },
      ],
    },
    {
      category: "Filtering",
      items: [
        { keys: ["F"], description: "Toggle filters" },
        { keys: ["⌘ ⇧ F"], description: "Advanced filters" },
        { keys: ["⌘ ⌫"], description: "Clear all filters" },
        { keys: ["⌘ 1-9"], description: "Apply saved view (1-9)" },
      ],
    },
    {
      category: "In Transaction Detail",
      items: [
        { keys: ["⌘ S", "Ctrl S"], description: "Save changes" },
        { keys: ["⌘ ⇧ R", "Ctrl ⇧ R"], description: "Issue refund" },
        { keys: ["⌘ P", "Ctrl P"], description: "Print/preview" },
        { keys: ["←", "P"], description: "Previous transaction" },
        { keys: ["→", "N"], description: "Next transaction" },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.category}
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.description}</span>
                        <div className="flex gap-1">
                          {item.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="rounded border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
