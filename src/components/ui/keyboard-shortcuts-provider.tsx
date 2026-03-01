"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal"
import { useSidebar } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const { toast } = useToast()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isModifierKey = e.metaKey || e.ctrlKey

      // ⌘K or Ctrl+K - Open shortcuts modal
      if (isModifierKey && e.key === "k") {
        e.preventDefault()
        setShortcutsOpen(true)
        return
      }

      // Esc - Close any open modal
      if (e.key === "Escape") {
        setShortcutsOpen(false)
        return
      }

      // Navigation shortcuts
      if (isModifierKey && e.key === "h") {
        e.preventDefault()
        router.push("/")
        toast({ title: "Navigated to Home" })
        return
      }

      if (isModifierKey && e.key === "o") {
        e.preventDefault()
        router.push("/orders")
        toast({ title: "Navigated to Orders" })
        return
      }

      if (isModifierKey && e.key === "m") {
        e.preventDefault()
        router.push("/menu")
        toast({ title: "Navigated to Menu" })
        return
      }

      if (isModifierKey && e.key === ",") {
        e.preventDefault()
        router.push("/settings/restaurant")
        toast({ title: "Navigated to Settings" })
        return
      }

      // Action shortcuts (UI placeholders)
      if (isModifierKey && e.key === "n") {
        e.preventDefault()
        toast({ title: "New Order - Feature coming soon" })
        return
      }

      if (isModifierKey && e.key === "t") {
        e.preventDefault()
        toast({ title: "Table Assignment - Feature coming soon" })
        return
      }

      if (isModifierKey && e.key === "p") {
        e.preventDefault()
        router.push("/promotions")
        toast({ title: "Navigated to Promotions" })
        return
      }

      // General shortcuts
      if (isModifierKey && e.key === "/") {
        e.preventDefault()
        // Focus search bar
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          toast({ title: "Search focused" })
        }
        return
      }

      if (isModifierKey && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
        toast({ title: "Sidebar toggled" })
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, toggleSidebar, toast])

  return (
    <>
      {children}
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
