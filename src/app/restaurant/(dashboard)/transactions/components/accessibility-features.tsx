"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to main content
    </a>
  )
}

interface ScreenReaderAnnouncementProps {
  message: string
  priority?: "polite" | "assertive"
}

export function ScreenReaderAnnouncement({ message, priority = "polite" }: ScreenReaderAnnouncementProps) {
  return (
    <div className="sr-only" role="status" aria-live={priority} aria-atomic="true">
      {message}
    </div>
  )
}

export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  useEffect(() => {
    if (!active) return

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const modal = document.querySelector("[role=dialog]")
    if (!modal) return

    const firstFocusable = modal.querySelector(focusableElements) as HTMLElement
    const focusableContent = modal.querySelectorAll(focusableElements)
    const lastFocusable = focusableContent[focusableContent.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    firstFocusable?.focus()

    return () => {
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [active])

  return <>{children}</>
}

export function ReducedMotion({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return <div className={cn(prefersReducedMotion && "motion-reduce")}>{children}</div>
}

export function HighContrastMode({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)")
    setHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return <div className={cn(highContrast && "high-contrast")}>{children}</div>
}
