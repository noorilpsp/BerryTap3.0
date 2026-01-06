"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Search, SkipForward, ChevronLeft, ChevronRight, Minus, Plus, Save, CheckCircle2 } from "lucide-react"

const mockItems = [
  {
    id: 1,
    code: "BEF001",
    name: "Beef Tenderloin",
    emoji: "🥩",
    location: "Cold Storage → Shelf A3",
    systemQty: 8.5,
    unit: "kg",
  },
  {
    id: 2,
    code: "CHK001",
    name: "Chicken Breast",
    emoji: "🍗",
    location: "Cold Storage → Shelf A2",
    systemQty: 15,
    unit: "kg",
    countedQty: 12,
    variance: -3,
  },
  {
    id: 3,
    code: "BAC001",
    name: "Bacon Strips",
    emoji: "🥓",
    location: "Cold Storage → Shelf A4",
    systemQty: 8,
    unit: "kg",
    countedQty: 6.5,
    variance: -1.5,
  },
]

interface CountingModeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: any
}

export function CountingModeDrawer({ open, onOpenChange, count }: CountingModeDrawerProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [countedQty, setCountedQty] = useState("")
  const [note, setNote] = useState("")
  const [unableToCount, setUnableToCount] = useState(false)
  const [filter, setFilter] = useState("all")

  const currentItem = mockItems[currentItemIndex]
  const progress = { counted: 32, total: 45, percent: 71, variances: 4, time: "0:45:12" }

  const handleNext = () => {
    if (currentItemIndex < mockItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
      setCountedQty("")
      setNote("")
      setUnableToCount(false)
    }
  }

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>🧮 COUNT #{count?.countNumber || "CS-2024-089"}</SheetTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Pause
              </Button>
              <Button variant="outline" size="sm">
                Save & Exit
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Summary */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">🥩 Proteins Section • Main Kitchen</div>
            </div>
            <Progress value={progress.percent} className="h-2" />
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">✅ COUNTED</div>
                <div className="font-medium">{progress.counted} items</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">⏳ REMAIN</div>
                <div className="font-medium">{progress.total - progress.counted} items</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">⚠️ VARIANCE</div>
                <div className="font-medium">{progress.variances} items</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">⏱️ TIME</div>
                <div className="font-medium">{progress.time}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search Item
            </Button>
            <Button variant="outline" size="sm">
              <SkipForward className="h-4 w-4 mr-2" />
              Skip to Variances
            </Button>
          </div>

          {/* Current Item */}
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Item {currentItemIndex + 1} of {mockItems.length}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentItemIndex === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentItemIndex === mockItems.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-3xl">
                {currentItem.emoji}
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg">
                  {currentItem.emoji} {currentItem.name}
                </div>
                <div className="text-sm text-muted-foreground">{currentItem.code} • Proteins • Main Kitchen</div>
                <div className="text-sm text-muted-foreground">Location: {currentItem.location}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-2">SYSTEM QUANTITY</div>
                <div className="text-2xl font-bold">
                  {currentItem.systemQty} {currentItem.unit}
                </div>
                <div className="text-xs text-muted-foreground mt-2">Last updated: Nov 14, 3:00 PM</div>
              </div>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="text-sm text-muted-foreground mb-2">COUNTED QUANTITY</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCountedQty((prev) => Math.max(0, Number.parseFloat(prev || "0") - 1).toString())}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                    placeholder="0"
                    className="text-center"
                  />
                  <span className="text-sm">{currentItem.unit}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCountedQty((prev) => (Number.parseFloat(prev || "0") + 1).toString())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCountedQty("0")}>
                    0
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCountedQty("5")}>
                    5
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCountedQty("10")}>
                    10
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={unableToCount} onCheckedChange={(checked) => setUnableToCount(!!checked)} />
              <label className="text-sm">Item not found / Unable to count</label>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Note (optional):</label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1" />
            </div>

            <Button className="w-full" size="lg" onClick={handleNext}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm & Next
            </Button>
          </div>

          {/* Counted Items List */}
          <div className="rounded-lg border">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All (32)
                </TabsTrigger>
                <TabsTrigger value="matched" className="flex-1">
                  ✅ Matched (28)
                </TabsTrigger>
                <TabsTrigger value="variance" className="flex-1">
                  ⚠️ Variance (4)
                </TabsTrigger>
              </TabsList>
              <TabsContent value={filter} className="p-4">
                <div className="space-y-2">
                  {mockItems
                    .filter((item) => item.countedQty)
                    .map((item) => {
                      const hasVariance = item.variance !== 0
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border ${hasVariance ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {hasVariance ? <span>⚠️</span> : <span>✅</span>}
                              <span>
                                {item.emoji} {item.name}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm mt-2">
                            <div>
                              <div className="text-muted-foreground">System</div>
                              <div className="font-medium">
                                {item.systemQty} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Counted</div>
                              <div className="font-medium">
                                {item.countedQty} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Variance</div>
                              <div className={`font-medium ${hasVariance ? "text-red-600" : ""}`}>
                                {item.variance ? `${item.variance} ${item.unit}` : "0"}
                              </div>
                            </div>
                            <div>
                              <Badge variant={hasVariance ? "destructive" : "secondary"}>
                                {hasVariance ? "Short" : "Match"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button className="flex-1">
              Complete Count <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
