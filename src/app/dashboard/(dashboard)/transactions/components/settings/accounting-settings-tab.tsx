"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccountingSettingsTabProps {
  onSettingsChange: () => void
}

export function AccountingSettingsTab({ onSettingsChange }: AccountingSettingsTabProps) {
  const [settings, setSettings] = useState({
    quickbooksConnected: true,
    xeroConnected: false,
    autoSync: true,
    syncFrequency: "daily",
    syncRefunds: true,
    syncFees: true,
    syncDisputes: true,
    accountMapping: {
      revenue: "Sales Income",
      fees: "Processing Fees",
      refunds: "Sales Returns",
    },
    lastSync: "2 hours ago",
  })

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    onSettingsChange()
  }

  const handleConnect = (platform: string) => {
    console.log("[v0] Connecting to", platform)
  }

  const handleDisconnect = (platform: string) => {
    console.log("[v0] Disconnecting from", platform)
  }

  const handleSync = () => {
    console.log("[v0] Syncing accounting data")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>Link your accounting software for automatic transaction sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QuickBooks */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span className="text-lg font-bold text-green-700">QB</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">QuickBooks Online</h3>
                  {settings.quickbooksConnected && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings.quickbooksConnected ? `Last synced: ${settings.lastSync}` : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {settings.quickbooksConnected ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleSync}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect("quickbooks")}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => handleConnect("quickbooks")}>
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Xero */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-lg font-bold text-blue-700">X</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Xero</h3>
                  {settings.xeroConnected && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings.xeroConnected ? "Last synced: Never" : "Not connected"}
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => handleConnect("xero")}>
              Connect
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connecting your accounting software allows automatic transaction sync, reducing manual data entry.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {settings.quickbooksConnected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Configure how transaction data syncs to your accounting software</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">Sync transactions automatically on schedule</p>
                </div>
                <Switch checked={settings.autoSync} onCheckedChange={(checked) => handleChange("autoSync", checked)} />
              </div>

              {settings.autoSync && (
                <div className="space-y-2 rounded-lg border p-4">
                  <Label>Sync Frequency</Label>
                  <Select
                    value={settings.syncFrequency}
                    onValueChange={(value) => handleChange("syncFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-medium">Data to Sync</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Refunds</Label>
                    <Switch
                      checked={settings.syncRefunds}
                      onCheckedChange={(checked) => handleChange("syncRefunds", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Processing Fees</Label>
                    <Switch
                      checked={settings.syncFees}
                      onCheckedChange={(checked) => handleChange("syncFees", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Disputes & Chargebacks</Label>
                    <Switch
                      checked={settings.syncDisputes}
                      onCheckedChange={(checked) => handleChange("syncDisputes", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Mapping</CardTitle>
              <CardDescription>Map transaction types to your chart of accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Revenue Account</Label>
                <Select
                  value={settings.accountMapping.revenue}
                  onValueChange={(value) =>
                    handleChange("accountMapping", { ...settings.accountMapping, revenue: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Income">Sales Income</SelectItem>
                    <SelectItem value="Service Revenue">Service Revenue</SelectItem>
                    <SelectItem value="Other Income">Other Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Processing Fees Account</Label>
                <Select
                  value={settings.accountMapping.fees}
                  onValueChange={(value) => handleChange("accountMapping", { ...settings.accountMapping, fees: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Processing Fees">Processing Fees</SelectItem>
                    <SelectItem value="Bank Charges">Bank Charges</SelectItem>
                    <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Refunds Account</Label>
                <Select
                  value={settings.accountMapping.refunds}
                  onValueChange={(value) =>
                    handleChange("accountMapping", { ...settings.accountMapping, refunds: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Returns">Sales Returns</SelectItem>
                    <SelectItem value="Refunds">Refunds</SelectItem>
                    <SelectItem value="Sales Adjustments">Sales Adjustments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Chart of Accounts
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
