"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SKU {
  skuId: string
  code: string
  name: string
  emoji: string
  baseUnit: string
  unitLabel: string
  costPerUnit: number
  stock: {
    onHand: number
    parLevel: number
    status: "good" | "low" | "critical" | "out" | "over"
  }
}

interface QuickAdjustDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: SKU | null
}

const adjustmentReasons = [
  { id: "count", label: "Stock count adjustment" },
  { id: "received_no_po", label: "Received delivery (no PO)" },
  { id: "waste", label: "Waste / spoilage" },
  { id: "theft", label: "Theft / loss" },
  { id: "transfer_in", label: "Transfer in" },
  { id: "transfer_out", label: "Transfer out" },
  { id: "testing", label: "Recipe testing" },
  { id: "staff_meal", label: "Staff meal" },
  { id: "other", label: "Other" },
]

const locations = [
  { id: "loc_main", name: "Main Kitchen" },
  { id: "loc_bar", name: "Bar" },
  { id: "loc_prep", name: "Prep Station" },
  { id: "loc_cold", name: "Cold Storage" },
  { id: "loc_dry", name: "Dry Storage" },
]

export function QuickAdjustDrawer({ open, onOpenChange, sku }: QuickAdjustDrawerProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove" | "set">("set")
  const [quantity, setQuantity] = useState(0)
  const [location, setLocation] = useState("loc_main")
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  if (!sku) return null

  const beforeValue = sku.stock.onHand
  let changeValue = 0
  let afterValue = 0

  if (adjustmentType === "add") {
    changeValue = quantity
    afterValue = beforeValue + quantity
  } else if (adjustmentType === "remove") {
    changeValue = -quantity
    afterValue = beforeValue - quantity
  } else {
    changeValue = quantity - beforeValue
    afterValue = quantity
  }

  const percentOfPar = (afterValue / sku.stock.parLevel) * 100
  let newStatus: "good" | "low" | "critical" | "out" | "over" = "good"

  if (afterValue === 0) {
    newStatus = "out"
  } else if (percentOfPar <= 25) {
    newStatus = "critical"
  } else if (percentOfPar <= 50) {
    newStatus = "low"
  } else if (percentOfPar > 100) {
    newStatus = "over"
  } else {
    newStatus = "good"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">🟢 Good</Badge>
      case "low":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">🟡 Low</Badge>
      case "critical":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">🔴 Critical</Badge>
      case "out":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">🔴 OUT</Badge>
      case "over":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">🔵 Over</Badge>
      default:
        return null
    }
  }

  const handleSave = () => {
    // Here you would make an API call to save the adjustment
    console.log("[v0] Saving adjustment:", {
      skuId: sku.skuId,
      type: adjustmentType,
      quantity,
      location,
      reason,
      note,
      before: beforeValue,
      after: afterValue,
      change: changeValue,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>± Adjust Stock</SheetTitle>
          <SheetDescription>Update inventory levels and track changes</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* SKU Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-lg">
              <span className="mr-2">{sku.emoji}</span>
              {sku.name}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {sku.code} • Current: {beforeValue} {sku.baseUnit}
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-3">
            <Label>Adjustment Type</Label>
            <RadioGroup value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="cursor-pointer">
                  Add (+)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="cursor-pointer">
                  Remove (-)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="set" id="set" />
                <Label htmlFor="set" className="cursor-pointer">
                  Set exact amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(0, quantity - 1))}>
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="text-center text-lg font-medium"
                min={0}
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Unit: {sku.baseUnit} ({sku.unitLabel})
            </p>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {adjustmentReasons.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-3">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="font-medium mb-3">Summary</div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Before:</span>
                <span className="font-medium">
                  {beforeValue} {sku.baseUnit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change:</span>
                <span
                  className={`font-medium ${changeValue > 0 ? "text-green-600" : changeValue < 0 ? "text-red-600" : ""}`}
                >
                  {changeValue > 0 ? "+" : ""}
                  {changeValue} {sku.baseUnit}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">After:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {afterValue} {sku.baseUnit}
                  </span>
                  {getStatusBadge(newStatus)}
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Stock value change:</span>
                <span
                  className={`font-medium ${changeValue > 0 ? "text-green-600" : changeValue < 0 ? "text-red-600" : ""}`}
                >
                  {changeValue > 0 ? "+" : ""}€{(changeValue * sku.costPerUnit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!reason}>
              Save Adjustment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
