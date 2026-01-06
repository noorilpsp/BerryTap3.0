"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Home, ShoppingCart, Menu, Settings, PlusCircle, Grid3x3, Tag, Search, Command } from "lucide-react"

interface ShortcutGroup {
  title: string
  shortcuts: {
    keys: string[]
    description: string
    icon?: React.ElementType
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "H"], description: "Home", icon: Home },
      { keys: ["⌘", "O"], description: "Orders", icon: ShoppingCart },
      { keys: ["⌘", "M"], description: "Menu", icon: Menu },
      { keys: ["⌘", ","], description: "Settings", icon: Settings },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["⌘", "N"], description: "New Order", icon: PlusCircle },
      { keys: ["⌘", "T"], description: "Open Table", icon: Grid3x3 },
      { keys: ["⌘", "P"], description: "Promotions", icon: Tag },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["⌘", "/"], description: "Search", icon: Search },
      { keys: ["⌘", "B"], description: "Toggle Sidebar" },
      { keys: ["⌘", "K"], description: "Shortcuts (this)", icon: Command },
      { keys: ["Esc"], description: "Close modal" },
    ],
  },
]

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => {
                  const Icon = shortcut.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                              {key === "⌘" && !isMac ? "Ctrl" : key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">Esc</kbd> to
          close
        </div>
      </DialogContent>
    </Dialog>
  )
}
