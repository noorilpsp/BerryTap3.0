"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface FeeSettingsTabProps {
  onSettingsChange: () => void
}

export function FeeSettingsTab({ onSettingsChange }: FeeSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Calculation</CardTitle>
          <CardDescription>Configure how processing fees are calculated and displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Fee Structure Source</Label>
            <RadioGroup defaultValue="auto" onValueChange={onSettingsChange}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <div className="grid gap-1">
                  <Label htmlFor="auto" className="font-normal">
                    Auto-import from processor
                  </Label>
                  <p className="text-sm text-muted-foreground">Fees calculated automatically based on processor data</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <div className="grid gap-1">
                  <Label htmlFor="manual" className="font-normal">
                    Manual configuration
                  </Label>
                  <p className="text-sm text-muted-foreground">Define your own fee structures</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Fee Display</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="showInList" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="showInList" className="font-normal">
                  Show fees in transaction list
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showInDetail" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="showInDetail" className="font-normal">
                  Show fees in transaction details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showInReports" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="showInReports" className="font-normal">
                  Include fees in reports and exports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showEffectiveRate" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="showEffectiveRate" className="font-normal">
                  Show effective rate percentage
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Fee Breakdown Detail</Label>
            <RadioGroup defaultValue="detailed" onValueChange={onSettingsChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="detailed" />
                <Label htmlFor="detailed" className="font-normal">
                  Show detailed breakdown (base + fixed + extras)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="total" id="total" />
                <Label htmlFor="total" className="font-normal">
                  Show total fee only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hidden" id="hidden" />
                <Label htmlFor="hidden" className="font-normal">
                  Hide fees (show net amounts only)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Fee Structure</CardTitle>
          <CardDescription>Auto-imported from Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Card Payments:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard cards:</span>
                <span className="font-mono">2.9% + €0.04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amex:</span>
                <span className="font-mono">3.4% + €0.04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">International cards:</span>
                <span className="font-mono">+1.5%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Disputes:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chargeback fee (if lost):</span>
                <span className="font-mono">€15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chargeback fee (if won):</span>
                <span className="font-mono">€0.00</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">Last updated: Nov 20, 2024</p>
            <Button variant="outline" size="sm">
              Refresh from Stripe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
