"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface NotificationsSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsSettingsModal({ open, onOpenChange }: NotificationsSettingsModalProps) {
  const [enableRetry, setEnableRetry] = useState(true)
  const [maxRetries, setMaxRetries] = useState("3")
  const [retryDelay, setRetryDelay] = useState("5")
  const [enableLogging, setEnableLogging] = useState(true)
  const [logRetention, setLogRetention] = useState("90")
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Notification settings have been updated successfully",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Configure global notification system settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Retry Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Retry Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Retry</Label>
                <p className="text-sm text-muted-foreground">Automatically retry failed notifications</p>
              </div>
              <Switch checked={enableRetry} onCheckedChange={setEnableRetry} />
            </div>
            {enableRetry && (
              <div className="grid gap-4 md:grid-cols-2 ml-6">
                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Select value={maxRetries} onValueChange={setMaxRetries}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 retry</SelectItem>
                      <SelectItem value="2">2 retries</SelectItem>
                      <SelectItem value="3">3 retries</SelectItem>
                      <SelectItem value="5">5 retries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retry Delay (minutes)</Label>
                  <Input type="number" value={retryDelay} onChange={(e) => setRetryDelay(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Logging Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Logging Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Detailed Logging</Label>
                <p className="text-sm text-muted-foreground">Store detailed logs of all notifications</p>
              </div>
              <Switch checked={enableLogging} onCheckedChange={setEnableLogging} />
            </div>
            {enableLogging && (
              <div className="ml-6 space-y-2">
                <Label>Log Retention (days)</Label>
                <Select value={logRetention} onValueChange={setLogRetention}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Rate Limiting */}
          <div className="space-y-4">
            <h3 className="font-semibold">Rate Limiting</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email Rate Limit (per hour)</Label>
                <Input type="number" defaultValue="1000" />
              </div>
              <div className="space-y-2">
                <Label>SMS Rate Limit (per hour)</Label>
                <Input type="number" defaultValue="500" />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quiet Hours</h3>
            <p className="text-sm text-muted-foreground">Prevent notifications during specific hours</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="22:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
