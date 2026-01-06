"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, MoreVertical, Star, Mail, Copy, Trash2, Plus, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileTransactionCardProps {
  transaction: any
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onClick?: () => void
}

export function MobileTransactionCard({ transaction, onClick }: MobileTransactionCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeAction, setSwipeAction] = useState<"left" | "right" | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setSwipeAction("left")
      setTimeout(() => setSwipeAction(null), 2000)
    }
    if (isRightSwipe) {
      setSwipeAction("right")
      setTimeout(() => setSwipeAction(null), 2000)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action buttons - left swipe */}
      {swipeAction === "left" && (
        <div className="absolute right-0 top-0 flex h-full items-center gap-1 bg-muted px-2">
          <Button size="sm" variant="ghost" className="h-full">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-full text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Swipe action buttons - right swipe */}
      {swipeAction === "right" && (
        <div className="absolute left-0 top-0 flex h-full items-center gap-1 bg-muted px-2">
          <Button size="sm" variant="ghost" className="h-full">
            <Star className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-full">
            <Mail className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-full">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Card content */}
      <Card
        className={cn(
          "transition-transform duration-200",
          swipeAction === "left" && "-translate-x-32",
          swipeAction === "right" && "translate-x-32",
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium">💳 Charge</span>
                <Badge variant="secondary">{transaction.status}</Badge>
              </div>
              <div className="text-2xl font-bold">€{transaction.amount.toFixed(2)}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {transaction.paymentMethod.brand} ••{transaction.paymentMethod.last4} • {transaction.channel}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MobileFilterSheetProps {
  open: boolean
  onClose: () => void
  filters: any
  onFiltersChange: (filters: any) => void
}

export function MobileFilterSheet({ open, onClose, filters, onFiltersChange }: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Date Range</label>
            <select className="w-full rounded-md border p-2">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Today</option>
              <option>Custom</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Succeeded</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Failed</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Pending</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Refunded</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Amount Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Min" className="rounded-md border p-2" />
              <input type="number" placeholder="Max" className="rounded-md border p-2" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Clear All
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && touchStart > 0) {
      const currentTouch = e.touches[0].clientY
      const distance = Math.max(0, Math.min(100, currentTouch - touchStart))
      setPullDistance(distance)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
    setTouchStart(0)
  }

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [touchStart, pullDistance])

  if (pullDistance === 0 && !isRefreshing) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center bg-background/80 transition-all"
      style={{ height: `${pullDistance}px` }}
    >
      <div className="text-sm text-muted-foreground">
        {isRefreshing ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : pullDistance > 60 ? (
          "Release to refresh"
        ) : (
          "Pull to refresh"
        )}
      </div>
    </div>
  )
}

export function FloatingActionButton({ onClick }: { onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <Button
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg transition-transform md:hidden",
        !isVisible && "translate-y-24",
      )}
      onClick={onClick}
      aria-label="Add transaction"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-24 right-6 h-12 w-12 rounded-full shadow-lg bg-transparent"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}
