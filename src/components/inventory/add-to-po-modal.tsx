"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AddToPOModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: {
    name: string
    code: string
    emoji: string
    stock: number
    unit: string
    parLevel: number
    status: string
  }
}

export function AddToPOModal({ open, onOpenChange, sku }: AddToPOModalProps) {
  const [supplier, setSupplier] = useState("meat_masters")
  const [quantity, setQuantity] = useState(10)
  const [addTo, setAddTo] = useState("new")

  const suggestedQty = sku.parLevel - sku.stock
  const toPar = sku.parLevel - sku.stock
  const doublePar = sku.parLevel * 2 - sku.stock
  const unitPrice = 8.9
  const lineTotal = quantity * unitPrice
  const afterDeliveryStock = sku.stock + quantity
  const afterDeliveryPercent = (afterDeliveryStock / sku.parLevel) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add to Purchase Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium mb-2">
              Adding: {sku.emoji} {sku.name} ({sku.code})
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Current stock: {sku.stock} {sku.unit} ({sku.status})
              </p>
              <p>
                Par level: {sku.parLevel} {sku.unit}
              </p>
              <p>
                Suggested order: {suggestedQty.toFixed(1)} {sku.unit}
              </p>
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-3">
            <Label>Select Supplier</Label>
            <RadioGroup value={supplier} onValueChange={setSupplier}>
              <div className="flex items-start space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="meat_masters" id="meat_masters" className="mt-1" />
                <Label htmlFor="meat_masters" className="flex-1 cursor-pointer font-normal">
                  <div className="space-y-1">
                    <p className="font-medium">
                      🏪 Meat Masters <span className="text-yellow-600">⭐ Preferred</span>
                    </p>
                    <p className="text-sm text-muted-foreground">€8.90/kg • 2-day lead time • Min order: €100</p>
                    <p className="text-xs text-muted-foreground">Last order: Nov 10 • Reliability: 98%</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="poultry_plus" id="poultry_plus" className="mt-1" />
                <Label htmlFor="poultry_plus" className="flex-1 cursor-pointer font-normal">
                  <div className="space-y-1">
                    <p className="font-medium">🏪 Poultry Plus</p>
                    <p className="text-sm text-muted-foreground">€9.20/kg • 1-day lead time • Min order: €75</p>
                    <p className="text-xs text-muted-foreground">Last order: Oct 28 • Reliability: 94%</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <Label>Order Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(0, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
                className="text-center"
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{sku.unit}</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setQuantity(suggestedQty)}>
                Suggested: {suggestedQty.toFixed(1)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setQuantity(toPar)}>
                To Par: {toPar.toFixed(1)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setQuantity(doublePar)}>
                Double Par: {doublePar.toFixed(1)}
              </Button>
            </div>

            <div className="rounded-lg border p-3 bg-muted/50 space-y-1 text-sm">
              <p>
                Unit price: €{unitPrice.toFixed(2)}/{sku.unit}
              </p>
              <p>Line total: €{lineTotal.toFixed(2)}</p>
              <p>
                After delivery stock: {afterDeliveryStock.toFixed(1)} {sku.unit} ({afterDeliveryPercent.toFixed(0)}% of
                par)
              </p>
            </div>
          </div>

          {/* Add To */}
          <div className="space-y-3">
            <Label>Add to:</Label>
            <RadioGroup value={addTo} onValueChange={setAddTo}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  Create new PO for Meat Masters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-normal cursor-pointer">
                  Add to existing draft: PO #1859 (3 items, €234.50)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Purchase Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
