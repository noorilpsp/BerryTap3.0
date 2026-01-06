"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
import { DollarSign, Eye, Info, RotateCcw } from "lucide-react"
import type { ConditionalPricing, CustomizationGroup } from "@/types/customization"

interface ConditionalPricingBuilderProps {
  currentGroup: CustomizationGroup
  availableGroups: CustomizationGroup[]
  value: ConditionalPricing
  onChange: (value: ConditionalPricing) => void
}

export function ConditionalPricingBuilder({
  currentGroup,
  availableGroups,
  value,
  onChange,
}: ConditionalPricingBuilderProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const baseGroup = availableGroups.find((g) => g.id === value.basedOnGroupId)

  const handleToggle = (enabled: boolean) => {
    onChange({ ...value, enabled })
  }

  const handleBaseGroupChange = (groupId: string) => {
    const group = availableGroups.find((g) => g.id === groupId)
    if (!group) return

    // Initialize price matrix with base prices
    const priceMatrix: ConditionalPricing["priceMatrix"] = {}
    currentGroup.options.forEach((option) => {
      priceMatrix[option.id] = {}
      group.options.forEach((baseOption) => {
        priceMatrix[option.id][baseOption.id] = option.priceDelta
      })
    })

    onChange({ ...value, basedOnGroupId: groupId, priceMatrix })
  }

  const handlePriceChange = (optionId: string, baseOptionId: string, price: number) => {
    const newMatrix = { ...value.priceMatrix }
    if (!newMatrix[optionId]) newMatrix[optionId] = {}
    newMatrix[optionId][baseOptionId] = price
    onChange({ ...value, priceMatrix: newMatrix })
  }

  const applyPriceToRow = (optionId: string, price: number) => {
    const newMatrix = { ...value.priceMatrix }
    if (baseGroup) {
      baseGroup.options.forEach((baseOption) => {
        if (!newMatrix[optionId]) newMatrix[optionId] = {}
        newMatrix[optionId][baseOption.id] = price
      })
    }
    onChange({ ...value, priceMatrix: newMatrix })
  }

  const increaseColumnByPercent = (baseOptionId: string, percent: number) => {
    const newMatrix = { ...value.priceMatrix }
    currentGroup.options.forEach((option) => {
      if (newMatrix[option.id]?.[baseOptionId] !== undefined) {
        const currentPrice = newMatrix[option.id][baseOptionId]
        newMatrix[option.id][baseOptionId] = Number((currentPrice * (1 + percent / 100)).toFixed(2))
      }
    })
    onChange({ ...value, priceMatrix: newMatrix })
  }

  const resetToStandard = () => {
    onChange({
      enabled: false,
      basedOnGroupId: "",
      priceMatrix: {},
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Conditional Pricing</CardTitle>
            <CardDescription>Set different prices based on another customization selection</CardDescription>
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
                <DialogDescription>How customers will see pricing based on their selections</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {value.enabled && baseGroup && (
                  <div className="space-y-3">
                    {baseGroup.options.map((baseOption) => (
                      <div key={baseOption.id} className="rounded-lg border p-4">
                        <h4 className="mb-3 font-semibold">If customer selects: {baseOption.name}</h4>
                        <div className="space-y-2">
                          {currentGroup.options.map((option) => {
                            const price = value.priceMatrix[option.id]?.[baseOption.id] ?? option.priceDelta
                            return (
                              <div key={option.id} className="flex items-center justify-between text-sm">
                                <span>{option.name}</span>
                                <span className="font-medium">
                                  {price > 0
                                    ? `+$${price.toFixed(2)}`
                                    : price < 0
                                      ? `-$${Math.abs(price).toFixed(2)}`
                                      : "Included"}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-conditional-pricing">Use conditional pricing</Label>
            <p className="text-sm text-muted-foreground">Enable to set different prices based on selections</p>
          </div>
          <Switch id="enable-conditional-pricing" checked={value.enabled} onCheckedChange={handleToggle} />
        </div>

        {value.enabled && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="base-group">Base prices on which customization?</Label>
              <Select value={value.basedOnGroupId} onValueChange={handleBaseGroupChange}>
                <SelectTrigger id="base-group">
                  <SelectValue placeholder="Select a customization group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups
                    .filter((g) => g.id !== currentGroup.id)
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {baseGroup && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Set prices for each combination. Cells highlighted in orange differ from base price.</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left font-medium">Option</th>
                        {baseGroup.options.map((baseOption) => (
                          <th key={baseOption.id} className="p-3 text-center font-medium">
                            {baseOption.name}
                          </th>
                        ))}
                        <th className="p-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGroup.options.map((option) => (
                        <tr key={option.id} className="border-b">
                          <td className="p-3 font-medium">{option.name}</td>
                          {baseGroup.options.map((baseOption) => {
                            const price = value.priceMatrix[option.id]?.[baseOption.id] ?? option.priceDelta
                            const isDifferent = price !== option.priceDelta
                            return (
                              <td key={baseOption.id} className="p-3">
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        option.id,
                                        baseOption.id,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className={`pl-8 text-center ${isDifferent ? "border-orange-500 bg-orange-50" : ""}`}
                                  />
                                </div>
                              </td>
                            )
                          })}
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const price = prompt("Apply same price to all:")
                                if (price) applyPriceToRow(option.id, Number.parseFloat(price))
                              }}
                            >
                              Apply to Row
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const percent = prompt("Increase all prices by what percent?")
                      if (percent) {
                        baseGroup.options.forEach((baseOption) => {
                          increaseColumnByPercent(baseOption.id, Number.parseFloat(percent))
                        })
                      }
                    }}
                  >
                    Bulk Adjust Prices
                  </Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Example: If customer selects {baseGroup.options[baseGroup.options.length - 1]?.name},{" "}
                    {currentGroup.options[0]?.name} will cost +$
                    {value.priceMatrix[currentGroup.options[0]?.id]?.[
                      baseGroup.options[baseGroup.options.length - 1]?.id
                    ]?.toFixed(2) ?? "0.00"}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <Separator />

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={resetToStandard}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Standard Pricing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
