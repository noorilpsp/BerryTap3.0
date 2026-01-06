"use client"

import type React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, ShoppingCart, Repeat, FileText } from "lucide-react"

interface SKUQuickViewProps {
  children: React.ReactNode
  sku: {
    id: string
    code: string
    name: string
    emoji: string
    category: string
    supplier: string
    stock: number
    unit: string
    status: "healthy" | "low" | "out"
    parLevel: number
    avgCost: number
  }
}

export function SKUQuickViewPopover({ children, sku }: SKUQuickViewProps) {
  const parPercent = (sku.stock / sku.parLevel) * 100
  const totalValue = sku.stock * sku.avgCost

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[400px]" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="text-3xl">{sku.emoji}</div>
            <div className="flex-1">
              <h4 className="font-semibold">{sku.name}</h4>
              <p className="text-sm text-muted-foreground">
                {sku.code} • {sku.category} • {sku.supplier}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border p-2 text-center">
              <p className="text-xs text-muted-foreground">STOCK</p>
              <p className="text-sm font-semibold">
                {sku.stock} {sku.unit}
              </p>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <p className="text-xs text-muted-foreground">STATUS</p>
              <p className="text-sm font-semibold">
                {sku.status === "healthy" ? "🟢" : sku.status === "low" ? "🟡" : "🔴"}{" "}
                {sku.status === "healthy" ? "Healthy" : sku.status === "low" ? "Low" : "Out"}
              </p>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <p className="text-xs text-muted-foreground">AVG COST</p>
              <p className="text-sm font-semibold">
                €{sku.avgCost.toFixed(2)}/{sku.unit}
              </p>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <p className="text-xs text-muted-foreground">VALUE</p>
              <p className="text-sm font-semibold">€{totalValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <Progress value={parPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {parPercent.toFixed(0)}% of par ({sku.parLevel} {sku.unit})
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-2">📍 Locations</p>
              <div className="space-y-1 text-xs">
                <p>Main Kitchen: 8.5 kg</p>
                <p>Prep Station: 4.0 kg</p>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-2">📅 Expiry</p>
              <div className="space-y-1 text-xs">
                <p>Batch #2847: Nov 18 (3 days)</p>
                <p>Batch #2912: Nov 22 (7 days)</p>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-2">📦 Last PO</p>
              <div className="space-y-1 text-xs">
                <p>PO #1845 • Nov 10</p>
                <p>15 kg @ €8.75/kg</p>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-2">📊 Usage (7d)</p>
              <div className="space-y-1 text-xs">
                <p>Avg: 2.3 kg/day</p>
                <p>Total: 16.1 kg</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <Edit className="mr-2 h-3 w-3" />
              Adjust Stock
            </Button>
            <Button size="sm" variant="outline">
              <ShoppingCart className="mr-2 h-3 w-3" />
              Add to PO
            </Button>
            <Button size="sm" variant="outline">
              <Repeat className="mr-2 h-3 w-3" />
              Transfer
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-3 w-3" />
              View Full Details
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
