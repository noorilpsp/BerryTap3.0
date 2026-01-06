"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell, Mail, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DisputeSettingsTabProps {
  onSettingsChange: () => void
}

export function DisputeSettingsTab({ onSettingsChange }: DisputeSettingsTabProps) {
  const [settings, setSettings] = useState({
    autoResponseEnabled: false,
    notifyOnNewDispute: true,
    notifyBeforeDeadline: true,
    deadlineWarningDays: "3",
    autoGatherEvidence: true,
    requireManagerReview: true,
    allowAutoAccept: false,
    autoAcceptThreshold: "25",
    emailNotifications: true,
    smsNotifications: false,
    defaultResponseTemplate: "",
  })

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    onSettingsChange()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dispute Notifications</CardTitle>
          <CardDescription>Configure alerts for new disputes and deadlines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify on New Disputes</Label>
              <p className="text-sm text-muted-foreground">Alert team when new disputes are filed</p>
            </div>
            <Switch
              checked={settings.notifyOnNewDispute}
              onCheckedChange={(checked) => handleChange("notifyOnNewDispute", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Deadline Warnings</Label>
              <p className="text-sm text-muted-foreground">Alert before dispute response deadlines</p>
            </div>
            <Switch
              checked={settings.notifyBeforeDeadline}
              onCheckedChange={(checked) => handleChange("notifyBeforeDeadline", checked)}
            />
          </div>

          {settings.notifyBeforeDeadline && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label>Warning Days Before Deadline</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.deadlineWarningDays}
                  onChange={(e) => handleChange("deadlineWarningDays", e.target.value)}
                  className="max-w-[200px]"
                />
                <span className="text-sm">days</span>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-medium">Notification Channels</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label>SMS Notifications</Label>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleChange("smsNotifications", checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated Response</CardTitle>
          <CardDescription>Configure automatic dispute handling and responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              AI-powered automatic responses help you respond quickly to disputes with relevant evidence.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                Auto-Response <Badge>Beta</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">Automatically respond to disputes with AI</p>
            </div>
            <Switch
              checked={settings.autoResponseEnabled}
              onCheckedChange={(checked) => handleChange("autoResponseEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Gather Evidence</Label>
              <p className="text-sm text-muted-foreground">Collect transaction data, receipts, and proof of delivery</p>
            </div>
            <Switch
              checked={settings.autoGatherEvidence}
              onCheckedChange={(checked) => handleChange("autoGatherEvidence", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Manager Review</Label>
              <p className="text-sm text-muted-foreground">Manager must approve before sending response</p>
            </div>
            <Switch
              checked={settings.requireManagerReview}
              onCheckedChange={(checked) => handleChange("requireManagerReview", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispute Policies</CardTitle>
          <CardDescription>Set rules for handling specific dispute scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Auto-Accept</Label>
              <p className="text-sm text-muted-foreground">Automatically accept low-value disputes</p>
            </div>
            <Switch
              checked={settings.allowAutoAccept}
              onCheckedChange={(checked) => handleChange("allowAutoAccept", checked)}
            />
          </div>

          {settings.allowAutoAccept && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label>Auto-Accept Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={settings.autoAcceptThreshold}
                  onChange={(e) => handleChange("autoAcceptThreshold", e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">Disputes below this amount may be automatically accepted</p>
            </div>
          )}

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Auto-accepting disputes means you agree to refund the customer and lose the dispute fee. Use with caution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>Default message template for dispute responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Response Template</Label>
            <Textarea
              placeholder="Enter your default dispute response template..."
              value={settings.defaultResponseTemplate}
              onChange={(e) => handleChange("defaultResponseTemplate", e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              This template will be used as a starting point for all dispute responses
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Load Template
            </Button>
            <Button variant="outline" size="sm">
              Save as Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
