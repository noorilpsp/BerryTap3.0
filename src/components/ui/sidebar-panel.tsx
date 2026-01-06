"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarPanelProps {
  children: React.ReactNode
  title?: string
  defaultCollapsed?: boolean
  isCollapsed?: boolean
  onToggle?: () => void
  onCollapse?: () => void
  collapsible?: boolean
  side?: "left" | "right"
  className?: string
  contentClassName?: string
  bodyClassName?: string
}

export function SidebarPanel({
  children,
  title,
  defaultCollapsed = false,
  isCollapsed: controlledCollapsed,
  onToggle,
  onCollapse,
  collapsible = false,
  side = "right",
  className,
  contentClassName,
  bodyClassName,
}: SidebarPanelProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const handleToggle = () => {
    if (onCollapse && !isCollapsed) {
      onCollapse()
    }

    if (onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  return (
    <aside
      className={cn(
        "relative bg-background transition-all duration-300 flex-shrink-0 self-start",
        !isCollapsed && "border-border",
        side === "left" && !isCollapsed && "border-r",
        side === "right" && !isCollapsed && "border-l",
        className,
      )}
    >
      <div className={cn("h-full overflow-hidden", isCollapsed && "invisible w-0", contentClassName)}>
        {title && (
          <div className="border-b p-4 md:p-6 py-2.5 md:py-2.5">
            <h3 className="font-semibold text-base">{title}</h3>
          </div>
        )}
        <div className={cn("p-4 md:p-6 space-y-4 md:py-6 md:px-6 md:pr-0 md:pb-0", bodyClassName)}>{children}</div>
      </div>

      {collapsible && (
        <Button
          variant="outline"
          onClick={handleToggle}
          className={cn(
            "absolute top-[9px] !h-7 !w-7 rounded-full z-[5] !p-0 !min-w-0 !min-h-0",
            side === "left" && "-right-3 lg:-right-4",
            side === "right" && "-left-[14px] lg:-left-[15px]",
          )}
        >
          {side === "left" ? (
            isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )
          ) : isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} sidebar</span>
        </Button>
      )}
    </aside>
  )
}
