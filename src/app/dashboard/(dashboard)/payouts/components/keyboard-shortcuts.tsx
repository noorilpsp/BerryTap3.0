"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⌨️</span> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">NAVIGATION</h3>
            <div className="space-y-2">
              {[
                { keys: ["?", "⇧ /"], action: "Show keyboard shortcuts" },
                { keys: ["/", "⌘ K"], action: "Focus search" },
                { keys: ["Esc"], action: "Close drawer/modal" },
                { keys: ["J", "↓"], action: "Next payout" },
                { keys: ["K", "↑"], action: "Previous payout" },
                { keys: ["Enter"], action: "Open payout details" },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, j) => (
                      <kbd key={j} className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-muted-foreground">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">ACTIONS</h3>
            <div className="space-y-2">
              {[
                { keys: ["E"], action: "Export current view" },
                { keys: ["R"], action: "Mark as reconciled" },
                { keys: ["D"], action: "Download CSV" },
                { keys: ["F"], action: "Toggle filters" },
                { keys: ["C"], action: "Clear filters" },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, j) => (
                      <kbd key={j} className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-muted-foreground">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">DETAIL VIEW</h3>
            <div className="space-y-2">
              {[
                { keys: ["←", "P"], action: "Previous payout" },
                { keys: ["→", "N"], action: "Next payout" },
                { keys: ["T"], action: "View transactions" },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {shortcut.keys.map((key, j) => (
                      <kbd key={j} className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-muted-foreground">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
