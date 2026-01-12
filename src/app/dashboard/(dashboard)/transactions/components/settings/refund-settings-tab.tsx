"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RefundSettingsTabProps {
  onSettingsChange: () => void
}

export function RefundSettingsTab({ onSettingsChange }: RefundSettingsTabProps) {
  const [settings, setSettings] = useState({
    autoRefundEnabled: true,
    requireManagerApproval: true,
    managerApprovalThreshold: "500",
    maxRefundAmount: "5000",
    maxRefundPercentage: "100",
    refundWindowDays: "180",
    allowPartialRefunds: true,
    allowMultipleRefunds: true,
    restockInventory: true,
    notifyCustomer: true,
    requireReason: true,
    allowStoreCredit: true,
    allowCashRefunds: false,
  })

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    onSettingsChange()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Refund Policies</CardTitle>
          <CardDescription>Configure refund rules and approval workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Refunds</Label>
              <p className="text-sm text-muted-foreground">Process refunds automatically when criteria are met</p>
            </div>
            <Switch
              checked={settings.autoRefundEnabled}
              onCheckedChange={(checked) => handleChange("autoRefundEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Manager Approval</Label>
              <p className="text-sm text-muted-foreground">Large refunds need manager authorization</p>
            </div>
            <Switch
              checked={settings.requireManagerApproval}
              onCheckedChange={(checked) => handleChange("requireManagerApproval", checked)}
            />
          </div>

          {settings.requireManagerApproval && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label>Manager Approval Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={settings.managerApprovalThreshold}
                  onChange={(e) => handleChange("managerApprovalThreshold", e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">Refunds above this amount require manager approval</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Limits</CardTitle>
          <CardDescription>Set maximum refund amounts and timeframes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Maximum Refund Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={settings.maxRefundAmount}
                  onChange={(e) => handleChange("maxRefundAmount", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Maximum Refund Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.maxRefundPercentage}
                  onChange={(e) => handleChange("maxRefundPercentage", e.target.value)}
                />
                <span className="text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Refund Window</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.refundWindowDays}
                onChange={(e) => handleChange("refundWindowDays", e.target.value)}
                className="max-w-[200px]"
              />
              <span className="text-sm">days after purchase</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Options</CardTitle>
          <CardDescription>Configure available refund methods and behaviors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Partial Refunds</Label>
              <p className="text-sm text-muted-foreground">Enable refunding a portion of the transaction</p>
            </div>
            <Switch
              checked={settings.allowPartialRefunds}
              onCheckedChange={(checked) => handleChange("allowPartialRefunds", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Multiple Refunds</Label>
              <p className="text-sm text-muted-foreground">Process multiple refunds for same transaction</p>
            </div>
            <Switch
              checked={settings.allowMultipleRefunds}
              onCheckedChange={(checked) => handleChange("allowMultipleRefunds", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Restock Inventory</Label>
              <p className="text-sm text-muted-foreground">Return items to inventory when refunded</p>
            </div>
            <Switch
              checked={settings.restockInventory}
              onCheckedChange={(checked) => handleChange("restockInventory", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify Customer</Label>
              <p className="text-sm text-muted-foreground">Send email notification when refund is processed</p>
            </div>
            <Switch
              checked={settings.notifyCustomer}
              onCheckedChange={(checked) => handleChange("notifyCustomer", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Refund Reason</Label>
              <p className="text-sm text-muted-foreground">Staff must provide reason for refund</p>
            </div>
            <Switch
              checked={settings.requireReason}
              onCheckedChange={(checked) => handleChange("requireReason", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Destinations</CardTitle>
          <CardDescription>Choose how refunds can be issued to customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                Store Credit <Badge variant="secondary">Recommended</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">Issue refunds as store credit</p>
            </div>
            <Switch
              checked={settings.allowStoreCredit}
              onCheckedChange={(checked) => handleChange("allowStoreCredit", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cash Refunds</Label>
              <p className="text-sm text-muted-foreground">Allow cash refunds at point of sale</p>
            </div>
            <Switch
              checked={settings.allowCashRefunds}
              onCheckedChange={(checked) => handleChange("allowCashRefunds", checked)}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Original payment method refunds are always available and processed automatically by the payment processor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
