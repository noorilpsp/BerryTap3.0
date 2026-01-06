"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, Eye, Lightbulb } from "lucide-react"
import type { DefaultSelections, CustomizationGroup } from "@/types/customization"

interface DefaultSelectionsUIProps {
  currentGroup: CustomizationGroup
  value: DefaultSelections
  onChange: (value: DefaultSelections) => void
}

export function DefaultSelectionsUI({ currentGroup, value, onChange }: DefaultSelectionsUIProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleToggle = (optionId: string, checked: boolean) => {
    const newValue = { ...value }
    if (checked) {
      newValue[optionId] = 1
    } else {
      delete newValue[optionId]
    }
    onChange(newValue)
  }

  const handleQuantityChange = (optionId: string, quantity: number) => {
    const newValue = { ...value }
    if (quantity > 0) {
      newValue[optionId] = quantity
    } else {
      delete newValue[optionId]
    }
    onChange(newValue)
  }

  const selectAll = () => {
    const newValue: DefaultSelections = {}
    currentGroup.options.forEach((option) => {
      newValue[option.id] = 1
    })
    onChange(newValue)
  }

  const clearAll = () => {
    onChange({})
  }

  const selectedCount = Object.keys(value).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Default Selections</CardTitle>
            <CardDescription>Pre-select options for customers (they can still change)</CardDescription>
          </div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer View Preview</DialogTitle>
                <DialogDescription>How customers will see pre-selected options</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">{currentGroup.name}</h4>
                  <p className="mb-4 text-sm text-muted-foreground">{currentGroup.customerInstructions}</p>
                  <div className="space-y-2">
                    {currentGroup.options.map((option) => {
                      const isSelected = value[option.id] !== undefined
                      const quantity = value[option.id] || 0
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between rounded-md border p-3 ${
                            isSelected ? "border-orange-500 bg-orange-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isSelected} disabled />
                            <div>
                              <div className="font-medium">{option.name}</div>
                              {isSelected && quantity > 1 && (
                                <div className="text-xs text-muted-foreground">Quantity: {quantity}</div>
                              )}
                            </div>
                          </div>
                          <div className="font-medium">
                            {option.priceDelta > 0
                              ? `+$${option.priceDelta.toFixed(2)}`
                              : option.priceDelta < 0
                                ? `-$${Math.abs(option.priceDelta).toFixed(2)}`
                                : "Included"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">✓ Customer can remove or add more options</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCount} option{selectedCount !== 1 ? "s" : ""} pre-selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {currentGroup.options.map((option) => {
            const isSelected = value[option.id] !== undefined
            const quantity = value[option.id] || 0

            return (
              <Card key={option.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`default-${option.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggle(option.id, checked === true)}
                      />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`default-${option.id}`} className="text-base font-medium cursor-pointer">
                          {option.name}
                        </Label>
                        {isSelected && (
                          <div className="flex items-center gap-2 animate-in fade-in-50 duration-200">
                            <Label htmlFor={`quantity-${option.id}`} className="text-sm text-muted-foreground">
                              Default Quantity:
                            </Label>
                            <Select
                              value={quantity.toString()}
                              onValueChange={(v) => handleQuantityChange(option.id, Number.parseInt(v))}
                            >
                              <SelectTrigger id={`quantity-${option.id}`} className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {isSelected && (
                          <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in-50 duration-200">
                            <Check className="h-4 w-4" />
                            <span>This will be pre-selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {option.priceDelta > 0
                        ? `+$${option.priceDelta.toFixed(2)}`
                        : option.priceDelta < 0
                          ? `-$${Math.abs(option.priceDelta).toFixed(2)}`
                          : "$0.00"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Separator />

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Best Practices:</p>
              <ul className="list-disc pl-4 text-sm space-y-1">
                <li>Use defaults to show how the item typically comes</li>
                <li>Don't default expensive add-ons unless they're standard</li>
                <li>Make sure defaults match your item description</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
