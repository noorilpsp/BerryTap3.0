"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Save } from "lucide-react"
import type { TransactionFilters } from "../data"

interface TransactionFiltersPanelProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  onClose: () => void
}

export function TransactionFiltersPanel({ filters, onFiltersChange, onClose }: TransactionFiltersPanelProps) {
  const updateFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: string,
    currentArray: string[] | undefined,
  ) => {
    const array = currentArray || []
    const newArray = array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
    updateFilter(key, newArray.length > 0 ? (newArray as TransactionFilters[K]) : undefined)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>Refine your transaction search</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
              Clear All
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Status</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {["succeeded", "pending", "failed", "refunded", "disputed", "settled"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes(status as any) || false}
                  onCheckedChange={() => toggleArrayFilter("status", status, filters.status as string[])}
                />
                <Label htmlFor={`status-${status}`} className="cursor-pointer capitalize">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Type</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {["charge", "refund", "tip", "adjustment", "chargeback"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.type?.includes(type as any) || false}
                  onCheckedChange={() => toggleArrayFilter("type", type, filters.type as string[])}
                />
                <Label htmlFor={`type-${type}`} className="cursor-pointer capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Payment Method</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {["card", "cash", "gift_card", "wallet", "bank"].map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-${method}`}
                  checked={filters.paymentMethod?.includes(method as any) || false}
                  onCheckedChange={() => toggleArrayFilter("paymentMethod", method, filters.paymentMethod as string[])}
                />
                <Label htmlFor={`payment-${method}`} className="cursor-pointer capitalize">
                  {method.replace("_", " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Card Brand Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Card Brand</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {["visa", "mastercard", "amex", "discover"].map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.cardBrand?.includes(brand as any) || false}
                  onCheckedChange={() => toggleArrayFilter("cardBrand", brand, filters.cardBrand as string[])}
                />
                <Label htmlFor={`brand-${brand}`} className="cursor-pointer capitalize">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Channel</Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {["dine_in", "takeaway", "delivery", "online"].map((channel) => (
              <div key={channel} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${channel}`}
                  checked={filters.channel?.includes(channel as any) || false}
                  onCheckedChange={() => toggleArrayFilter("channel", channel, filters.channel as string[])}
                />
                <Label htmlFor={`channel-${channel}`} className="cursor-pointer capitalize">
                  {channel.replace("_", " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Amount Range</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="amount-min" className="text-sm">
                Min
              </Label>
              <Input
                id="amount-min"
                type="number"
                placeholder="€0"
                value={filters.amountMin || ""}
                onChange={(e) => updateFilter("amountMin", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="amount-max" className="text-sm">
                Max
              </Label>
              <Input
                id="amount-max"
                type="number"
                placeholder="€1000"
                value={filters.amountMax || ""}
                onChange={(e) => updateFilter("amountMax", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => updateFilter("amountMax", 10)}>
              {"< €10"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter("amountMin", 10)
                updateFilter("amountMax", 50)
              }}
            >
              €10-€50
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter("amountMin", 50)
                updateFilter("amountMax", 100)
              }}
            >
              €50-€100
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilter("amountMin", 100)
                updateFilter("amountMax", 500)
              }}
            >
              €100-€500
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateFilter("amountMin", 500)}>
              {"> €500"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
