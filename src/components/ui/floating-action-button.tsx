"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Plus,
  ShoppingCart,
  Menu,
  Grid3x3,
  Calendar,
  UserPlus,
  Tag,
  Zap,
  ChefHat,
  FolderPlus,
  Upload,
  CalendarDays,
  Mail,
  Gift,
  Megaphone,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SpeedDialAction {
  icon: React.ElementType
  label: string
  action: () => void
  color?: string
}

export function FloatingActionButton() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = React.useState<{ x: number; y: number } | null>(null)
  const [hasDragged, setHasDragged] = React.useState(false)
  const fabRef = React.useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const getSpeedDialActions = (): SpeedDialAction[] => {
    if (pathname === "/dashboard") {
      return [
        {
          icon: ShoppingCart,
          label: "New Order",
          action: () => console.log("[v0] Creating new order"),
          color: "text-green-600",
        },
        {
          icon: Calendar,
          label: "New Reservation",
          action: () => console.log("[v0] Creating reservation"),
          color: "text-blue-600",
        },
        {
          icon: Menu,
          label: "Add Menu Item",
          action: () => console.log("[v0] Adding menu item"),
          color: "text-orange-600",
        },
        {
          icon: Zap,
          label: "Quick Sale",
          action: () => console.log("[v0] Quick sale"),
          color: "text-yellow-600",
        },
      ]
    }

    if (pathname === "/orders") {
      return [
        {
          icon: ShoppingCart,
          label: "New Order",
          action: () => console.log("[v0] Creating new order"),
          color: "text-green-600",
        },
        {
          icon: Zap,
          label: "Quick Sale",
          action: () => console.log("[v0] Quick sale"),
          color: "text-yellow-600",
        },
        {
          icon: ChefHat,
          label: "Kitchen Display",
          action: () => console.log("[v0] Opening kitchen display"),
          color: "text-red-600",
        },
      ]
    }

    if (pathname === "/menu") {
      return [
        {
          icon: Plus,
          label: "Add Menu Item",
          action: () => console.log("[v0] Adding menu item"),
          color: "text-green-600",
        },
        {
          icon: FolderPlus,
          label: "Add Category",
          action: () => console.log("[v0] Adding category"),
          color: "text-blue-600",
        },
        {
          icon: Upload,
          label: "Import Menu",
          action: () => console.log("[v0] Importing menu"),
          color: "text-purple-600",
        },
      ]
    }

    if (pathname === "/tables") {
      return [
        {
          icon: Grid3x3,
          label: "Assign Table",
          action: () => console.log("[v0] Assigning table"),
          color: "text-blue-600",
        },
        {
          icon: Calendar,
          label: "Reserve Table",
          action: () => console.log("[v0] Reserving table"),
          color: "text-green-600",
        },
        {
          icon: ShoppingCart,
          label: "Quick Order",
          action: () => console.log("[v0] Quick order"),
          color: "text-orange-600",
        },
      ]
    }

    if (pathname === "/reservations") {
      return [
        {
          icon: Calendar,
          label: "New Reservation",
          action: () => console.log("[v0] Creating reservation"),
          color: "text-green-600",
        },
        {
          icon: UserPlus,
          label: "Walk-in Customer",
          action: () => console.log("[v0] Adding walk-in"),
          color: "text-blue-600",
        },
        {
          icon: CalendarDays,
          label: "View Calendar",
          action: () => console.log("[v0] Opening calendar"),
          color: "text-purple-600",
        },
      ]
    }

    if (pathname === "/customers") {
      return [
        {
          icon: UserPlus,
          label: "Add Customer",
          action: () => console.log("[v0] Adding customer"),
          color: "text-green-600",
        },
        {
          icon: Upload,
          label: "Import Customers",
          action: () => console.log("[v0] Importing customers"),
          color: "text-blue-600",
        },
        {
          icon: Mail,
          label: "Send Promotion",
          action: () => console.log("[v0] Sending promotion"),
          color: "text-orange-600",
        },
      ]
    }

    if (pathname === "/promotions" || pathname.includes("/marketing")) {
      return [
        {
          icon: Tag,
          label: "Create Promotion",
          action: () => console.log("[v0] Creating promotion"),
          color: "text-red-600",
        },
        {
          icon: Gift,
          label: "Create Loyalty Reward",
          action: () => console.log("[v0] Creating reward"),
          color: "text-purple-600",
        },
        {
          icon: Megaphone,
          label: "New Campaign",
          action: () => console.log("[v0] Creating campaign"),
          color: "text-blue-600",
        },
      ]
    }

    // Default actions
    return [
      {
        icon: ShoppingCart,
        label: "New Order",
        action: () => console.log("[v0] Creating new order"),
        color: "text-green-600",
      },
      {
        icon: UserPlus,
        label: "Add Customer",
        action: () => console.log("[v0] Adding customer"),
        color: "text-blue-600",
      },
    ]
  }

  const actions = getSpeedDialActions()

  const handleMainButtonClick = () => {
    if (!hasDragged) {
      setIsOpen(!isOpen)
    }
    setHasDragged(false)
  }

  const handleActionClick = (action: SpeedDialAction) => {
    action.action()
    setIsOpen(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (fabRef.current && e.touches.length === 1) {
      const touch = e.touches[0]
      const rect = fabRef.current.getBoundingClientRect()
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
      setDragStartPos({ x: touch.clientX, y: touch.clientY })
      setHasDragged(false)
      setIsDragging(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setDragStartPos({ x: e.clientX, y: e.clientY })
      setHasDragged(false)
      setIsDragging(false)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      handleMove(e.clientX, e.clientY)
    }
  }

  const handleMove = (clientX: number, clientY: number) => {
    const newX = clientX - dragOffset.x
    const newY = clientY - dragOffset.y

    const padding = 16
    const fabSize = window.innerWidth < 768 ? 56 : 48

    const maxX = window.innerWidth - fabSize - padding
    const maxY = window.innerHeight - fabSize - padding

    const constrainedX = Math.max(padding, Math.min(newX, maxX))
    const constrainedY = Math.max(padding, Math.min(newY, maxY))

    if (dragStartPos && !hasDragged) {
      const distanceX = Math.abs(clientX - dragStartPos.x)
      const distanceY = Math.abs(clientY - dragStartPos.y)
      const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (totalDistance > 10) {
        setHasDragged(true)
        setIsDragging(true)
      }
    }

    setPosition({ x: constrainedX, y: constrainedY })
  }

  const handleTouchEnd = () => {
    setDragOffset({ x: 0, y: 0 })
    setDragStartPos(null)
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setDragOffset({ x: 0, y: 0 })
    setDragStartPos(null)
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove, { passive: false })
      window.addEventListener("touchend", handleTouchEnd)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
        window.removeEventListener("touchmove", handleTouchMove)
        window.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [dragOffset, position, isDragging, dragStartPos, hasDragged])

  const getCircularPosition = (index: number, total: number) => {
    const radius = isMobile ? 100 : 90
    const angleStep = (2 * Math.PI) / total
    const startAngle = -Math.PI / 2 // Start from top
    const angle = startAngle + angleStep * index

    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    return {
      transform: `translate(${x}px, ${y}px)`,
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[98] transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center pointer-events-none">
          <div className="relative pointer-events-auto">
            <Button
              size="icon"
              onClick={() => setIsOpen(false)}
              className={cn(
                "shadow-2xl transition-all duration-200 bg-background hover:bg-accent text-foreground",
                "hover:scale-105 active:scale-95",
                "h-14 w-14 md:h-12 md:w-12",
                "rounded-full border-2 border-border",
                "flex items-center justify-center",
                "animate-in zoom-in-50 duration-200",
              )}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>

            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <div
                  key={action.label}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 duration-200"
                  style={{
                    ...getCircularPosition(index, actions.length),
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        "h-[52px] w-[52px] md:h-11 md:w-11 rounded-full transition-all duration-200",
                        "bg-background hover:bg-accent hover:scale-110 active:scale-95",
                        "shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]",
                        "hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", action.color)} />
                    </Button>
                    <span className="text-xs font-medium text-foreground whitespace-nowrap bg-background/90 px-2 py-0.5 rounded-full shadow-sm">
                      {action.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        ref={fabRef}
        className="fixed z-[100]"
        style={{
          bottom: position === null ? "2rem" : "auto",
          right: position === null ? "2rem" : "auto",
          top: position !== null ? `${position.y}px` : "auto",
          left: position !== null ? `${position.x}px` : "auto",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <Button
          size="icon"
          onClick={handleMainButtonClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={cn(
            "shadow-2xl transition-all duration-200 bg-transparent hover:bg-accent text-foreground",
            "hover:scale-105 active:scale-95",
            "h-12 w-12 md:h-12 md:w-12 max-md:h-14 max-md:w-14",
            "rounded-full border-2 border-border",
            "flex items-center justify-center relative",
            "pointer-events-auto",
            isDragging && "cursor-grabbing",
          )}
          aria-label={isOpen ? "Close menu" : "Open quick actions"}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
