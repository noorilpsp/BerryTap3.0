"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"

interface LinkMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: any
}

export function LinkMenuModal({ open, onOpenChange, recipe }: LinkMenuModalProps) {
  if (!recipe) return null

  const menuItems = [
    { id: "M001", name: "Classic Omelet", category: "Breakfast", price: 12.5, costPercent: 12.8 },
    { id: "M002", name: "Veggie Omelet", category: "Breakfast", price: 11.0, costPercent: 14.5 },
    { id: "M004", name: "Spanish Omelet", category: "Breakfast", price: 13.5, costPercent: 11.8 },
    { id: "M008", name: "Protein Breakfast", category: "Breakfast", price: 15.0, costPercent: null },
    { id: "M099", name: "Chef's Special", category: "Specials", price: 18.0, costPercent: null },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Recipe to Menu Item</DialogTitle>
          <DialogDescription>
            Recipe: {recipe.emoji} {recipe.name}
            <br />
            Food Cost: €{recipe.costing.totalCost.toFixed(2)} per serving
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search menu items..." className="pl-9" />
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Suggested Matches</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {menuItems.slice(0, 3).map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                >
                  <input type="radio" name="menu-item" value={item.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.name} ({item.id})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} • €{item.price.toFixed(2)}
                      {item.costPercent && (
                        <>
                          {" "}
                          • Cost: {item.costPercent}% <span className="text-green-600">🟢</span>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">All Unlinked Menu Items</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {menuItems.slice(3).map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                >
                  <input type="radio" name="menu-item" value={item.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.name} ({item.id})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} • €{item.price.toFixed(2)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox id="auto-consume" defaultChecked />
              <Label htmlFor="auto-consume" className="text-sm font-normal">
                Enable auto-consumption when orders placed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sync-price" />
              <Label htmlFor="sync-price" className="text-sm font-normal">
                Sync price changes bidirectionally
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Link to Selected</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
