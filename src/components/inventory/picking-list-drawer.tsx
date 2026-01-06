"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CheckCircle, Camera, Printer, Check } from "lucide-react"

const pickingListItems = [
  {
    id: "pl_001",
    name: "House Red Wine",
    emoji: "🍷",
    code: "WIN001",
    location: "Wine Cellar",
    shelf: "Rack A, Shelf 2",
    qty: 6,
    unit: "btl",
    status: "picked",
    section: "Wine Cellar",
  },
  {
    id: "pl_002",
    name: "Prosecco",
    emoji: "🍾",
    code: "PRO001",
    location: "Wine Cellar",
    shelf: "Rack A, Shelf 3",
    qty: 4,
    unit: "btl",
    status: "picked",
    section: "Wine Cellar",
  },
  {
    id: "pl_003",
    name: "Bourbon Whiskey",
    emoji: "🥃",
    code: "BRB001",
    location: "Spirits Cabinet",
    shelf: "Cabinet B, Shelf 1",
    qty: 2,
    unit: "btl",
    status: "picked",
    section: "Spirits Cabinet",
  },
  {
    id: "pl_004",
    name: "Lemons",
    emoji: "🍋",
    code: "LEM001",
    location: "Cold Storage",
    shelf: "Produce Drawer 1",
    qty: 2,
    unit: "kg",
    status: "pending",
    section: "Cold Storage",
  },
  {
    id: "pl_005",
    name: "Oranges",
    emoji: "🍊",
    code: "ORA001",
    location: "Cold Storage",
    shelf: "Produce Drawer 1",
    qty: 1.5,
    unit: "kg",
    status: "pending",
    section: "Cold Storage",
  },
  {
    id: "pl_006",
    name: "Fresh Mint",
    emoji: "🌿",
    code: "MNT001",
    location: "Cold Storage",
    shelf: "Herb Section",
    qty: 200,
    unit: "g",
    status: "pending",
    section: "Cold Storage",
  },
]

interface PickingListDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transfer: any
}

export function PickingListDrawer({ open, onOpenChange, transfer }: PickingListDrawerProps) {
  const [items, setItems] = useState(pickingListItems)

  const pickedCount = items.filter((i) => i.status === "picked").length
  const totalCount = items.length
  const progress = (pickedCount / totalCount) * 100

  const toggleItemStatus = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: item.status === "picked" ? "pending" : "picked" } : item,
      ),
    )
  }

  // Group items by section
  const sections = Array.from(new Set(items.map((i) => i.section)))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Picking List #{transfer?.transferNumber}</SheetTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="text-sm">
              {transfer?.fromLocation.emoji} {transfer?.fromLocation.name} → {transfer?.toLocation.emoji}{" "}
              {transfer?.toLocation.name}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {pickedCount}/{totalCount} picked ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Camera className="mr-2 h-4 w-4" />
              Scan
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => {
                setItems(items.map((item) => ({ ...item, status: "picked" })))
              }}
            >
              Mark All
            </Button>
          </div>

          {/* Items by Section */}
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section}>
                  <div className="mb-3 text-sm font-semibold text-muted-foreground">── {section} ──────────</div>
                  <div className="space-y-3">
                    {items
                      .filter((item) => item.section === section)
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-lg border p-4 ${item.status === "picked" ? "bg-muted/50" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              {item.status === "picked" ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground mt-0.5 animate-pulse" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">
                                  {item.emoji} {item.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.shelf} → {item.qty} {item.unit}
                                </div>
                              </div>
                            </div>
                            {item.status === "picked" ? (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Picked
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </div>

                          {item.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="flex-1" onClick={() => toggleItemStatus(item.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Picked
                              </Button>
                              <Button size="sm" variant="outline">
                                Not Available
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="border-t pt-4 space-y-2">
            <Button className="w-full" disabled={pickedCount < totalCount}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete & Ship
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => onOpenChange(false)}>
              Save Progress
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
