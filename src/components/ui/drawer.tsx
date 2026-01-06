"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

interface DrawerProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title?: string | React.ReactNode
  subtitle?: string
  description?: string
  children: React.ReactNode
  className?: string
  side?: "right" | "bottom"
}

export function Drawer({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  className,
  side = "right",
}: DrawerProps) {
  const isDrawerOpen = open ?? isOpen ?? false
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  React.useEffect(() => {
    if (!isDrawerOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isDrawerOpen, onClose])

  if (!mounted || !isDrawerOpen) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "fixed bg-background z-[80] transition-transform duration-300 shadow-xl",
          side === "right" && "top-0 right-0 h-full w-full md:w-[500px] border-l animate-in slide-in-from-right",
          side === "bottom" &&
            "bottom-0 left-0 right-0 h-[90vh] border-t rounded-t-2xl animate-in slide-in-from-bottom",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {side === "bottom" && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between p-4 md:p-6 border-b shrink-0">
            <div className="space-y-1 flex-1 min-w-0">
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  )
}
