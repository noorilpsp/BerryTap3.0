"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Upload, Trash2 } from "lucide-react"

const recentItems = [
  { id: "1", name: "Romaine", emoji: "🥬" },
  { id: "2", name: "Tomatoes", emoji: "🍅" },
  { id: "3", name: "Heavy Cream", emoji: "🥛" },
  { id: "4", name: "Chicken", emoji: "🍗" },
  { id: "5", name: "Herbs", emoji: "🌿" },
]

const wasteReasons = [
  { id: "spoilage", icon: "🥀", label: "Spoilage / Expired" },
  { id: "overprep", icon: "🍳", label: "Over-prep / Over-production" },
  { id: "quality", icon: "👎", label: "Quality issues / Customer return" },
  { id: "damaged", icon: "📦", label: "Damaged packaging" },
  { id: "contamination", icon: "🧪", label: "Contamination" },
  { id: "correction", icon: "📝", label: "Inventory correction" },
  { id: "other", icon: "❓", label: "Other" },
]

interface LogWasteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogWasteModal({ open, onOpenChange }: LogWasteModalProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>("1")
  const [quantity, setQuantity] = useState(1.5)
  const [reason, setReason] = useState("spoilage")
  const [location, setLocation] = useState("main_kitchen")
  const [note, setNote] = useState("")
  const [continueLogging, setContinueLogging] = useState(false)

  const selectedItemData = recentItems.find((i) => i.id === selectedItem)
  const wasteValue = quantity * 2.8 // mock unit cost
  const newStock = 8.5 - quantity
  const newStatus = newStock < 5 ? "low" : "healthy"

  const handleSubmit = () => {
    console.log("[v0] Logging waste:", { selectedItem, quantity, reason, location, note })
    if (!continueLogging) {
      onOpenChange(false)
    }
    // Reset form if continuing
    if (continueLogging) {
      setQuantity(0)
      setNote("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Waste</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Selection */}
          <div className="space-y-3">
            <Label>Select Item</Label>
            <Input placeholder="🔍 Search items..." />
            <div className="flex flex-wrap gap-2">
              {recentItems.map((item) => (
                <Button
                  key={item.id}
                  variant={selectedItem === item.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedItem(item.id)}
                >
                  {item.emoji} {item.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Item Display */}
          {selectedItem && selectedItemData && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedItemData.emoji}</span>
                <div>
                  <p className="font-medium">{selectedItemData.emoji} Romaine Lettuce (LET001)</p>
                  <p className="text-sm text-muted-foreground">Current stock: 8.5 kg • €2.80/kg</p>
                </div>
              </div>
            </div>
          )}

          {/* Waste Details */}
          <div className="space-y-4">
            <Label>Waste Details</Label>

            <div className="space-y-2">
              <Label>Quantity wasted *</Label>
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

              <div className="rounded-lg border p-3 bg-muted/50 space-y-1">
                <p className="text-sm">💰 Waste value: €{wasteValue.toFixed(2)}</p>
                <p className="text-sm">
                  📊 New stock: {newStock.toFixed(1)} kg (will be {newStatus === "low" ? "🟡 Low" : "🟢 Healthy"})
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <Label>Reason *</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {wasteReasons.map((r) => (
                  <div key={r.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.id} id={r.id} />
                    <Label htmlFor={r.id} className="font-normal cursor-pointer">
                      {r.icon} {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_kitchen">🍳 Main Kitchen</SelectItem>
                  <SelectItem value="prep_station">🔪 Prep Station</SelectItem>
                  <SelectItem value="walk_in">❄️ Walk-in Cooler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Found wilted in walk-in cooler, past expiry date"
                rows={3}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label>Photo (optional)</Label>
            <div className="rounded-lg border-2 border-dashed p-6 text-center space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">📷 Take photo or upload</p>
              <p className="text-xs text-yellow-600">⚠️ Photo required for waste over €50</p>
            </div>
          </div>

          {/* Continue Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="continue"
              checked={continueLogging}
              onCheckedChange={(checked) => setContinueLogging(checked as boolean)}
            />
            <Label htmlFor="continue" className="font-normal cursor-pointer">
              Log another item after saving
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Trash2 className="mr-2 h-4 w-4" />
            Log Waste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
