"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, Repeat, ArrowLeftRight } from "lucide-react"

interface QuickTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: {
    name: string
    code: string
    emoji: string
  }
}

export function QuickTransferModal({ open, onOpenChange, sku }: QuickTransferModalProps) {
  const [fromLocation, setFromLocation] = useState("main_kitchen")
  const [toLocation, setToLocation] = useState("prep_station")
  const [quantity, setQuantity] = useState(3.0)
  const [note, setNote] = useState("")

  const fromStock = 8.5
  const toStock = 4.0
  const afterFromStock = fromStock - quantity
  const afterToStock = toStock + quantity
  const transferValue = quantity * 8.9

  const fromStatus = afterFromStock < 7 ? "low" : "healthy"
  const toStatus = afterToStock >= 7 ? "healthy" : "low"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">
              Transferring: {sku.emoji} {sku.name} ({sku.code})
            </p>
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="space-y-2">
              <Label>FROM</Label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_kitchen">🍳 Main Kitchen</SelectItem>
                  <SelectItem value="prep_station">🔪 Prep Station</SelectItem>
                  <SelectItem value="walk_in">❄️ Walk-in Cooler</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Available: {fromStock} kg</p>
                <p className="text-muted-foreground">Status: 🟢 Healthy</p>
              </div>
            </div>

            <div className="flex items-center justify-center pt-6">
              <Button variant="ghost" size="icon">
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>TO</Label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_kitchen">🍳 Main Kitchen</SelectItem>
                  <SelectItem value="prep_station">🔪 Prep Station</SelectItem>
                  <SelectItem value="walk_in">❄️ Walk-in Cooler</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Current: {toStock} kg</p>
                <p className="text-muted-foreground">Status: 🟡 Low</p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <Label>Transfer Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(0, quantity - 0.5))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
                className="text-center"
                step="0.1"
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 0.5)}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">kg</span>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 5].map((amt) => (
                <Button key={amt} size="sm" variant="outline" onClick={() => setQuantity(amt)}>
                  {amt}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={() => setQuantity(fromStock)}>
                All: {fromStock}
              </Button>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
              <p className="font-medium text-sm">After transfer:</p>
              <p className="text-sm">
                Main Kitchen: {afterFromStock.toFixed(1)} kg ({fromStatus === "low" ? "🟢 → 🟡 Low" : "🟢 Healthy"})
              </p>
              <p className="text-sm">
                Prep Station: {afterToStock.toFixed(1)} kg ({toStatus === "healthy" ? "🟡 → 🟢 Healthy" : "🟡 Low"})
              </p>
              <p className="text-sm font-medium">Transfer value: €{transferValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Prep for dinner service"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Repeat className="mr-2 h-4 w-4" />
            Create Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
