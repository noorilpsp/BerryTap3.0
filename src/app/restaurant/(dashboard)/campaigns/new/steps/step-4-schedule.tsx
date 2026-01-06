"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Clock, Info, Zap } from "lucide-react"
import type { CampaignDraft } from "../wizard-types"

interface Props {
  data: CampaignDraft["step4"]
  onChange: (data: CampaignDraft["step4"]) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
}

export function ScheduleStep({ data, onChange, onNext, onBack, onSaveDraft }: Props) {
  const handleChange = (field: keyof CampaignDraft["step4"], value: any) => {
    onChange({ ...data, [field]: value })
  }

  const handleThrottlingChange = (field: keyof typeof data.throttling, value: any) => {
    onChange({
      ...data,
      throttling: { ...data.throttling, [field]: value },
    })
  }

  const handleNotificationChange = (field: keyof typeof data.notifications, value: any) => {
    onChange({
      ...data,
      notifications: { ...data.notifications, [field]: value },
    })
  }

  const handleRecurringChange = (field: keyof NonNullable<typeof data.recurring>, value: any) => {
    onChange({
      ...data,
      recurring: { ...(data.recurring || getDefaultRecurring()), [field]: value },
    })
  }

  function getDefaultRecurring() {
    return {
      frequency: "weekly" as const,
      days: [2, 5], // Tuesday, Friday
      endCondition: "after" as const,
      endValue: 12,
    }
  }

  const toggleRecurringDay = (day: number) => {
    const currentDays = data.recurring?.days || []
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]
    handleRecurringChange("days", newDays)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Step 4: Schedule & Send</h2>
        <div className="text-sm text-muted-foreground">Auto-saved 30 seconds ago</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>When to Send</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={data.sendTiming} onValueChange={(value: any) => handleChange("sendTiming", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="cursor-pointer flex-1">
                <div className="font-medium">Send immediately</div>
                <div className="text-sm text-muted-foreground">Campaign will begin sending within 5 minutes</div>
              </Label>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scheduled" id="scheduled" />
              <Label htmlFor="scheduled" className="cursor-pointer flex-1">
                <div className="font-medium">Schedule for later</div>
                <div className="text-sm text-muted-foreground">Choose a specific date and time</div>
              </Label>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recurring" id="recurring" />
              <Label htmlFor="recurring" className="cursor-pointer flex-1">
                <div className="font-medium">Recurring campaign</div>
                <div className="text-sm text-muted-foreground">Send automatically on a schedule</div>
              </Label>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {data.sendTiming === "scheduled" && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Send Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={data.scheduledDate || ""}
                  onChange={(e) => handleChange("scheduledDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Send Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={data.scheduledTime || ""}
                  onChange={(e) => handleChange("scheduledTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={data.timezone} onValueChange={(value) => handleChange("timezone", value)}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Malta">Europe/Malta (CET, GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.scheduledDate && data.scheduledTime && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Scheduled send</AlertTitle>
                <AlertDescription>
                  {data.scheduledDate} at {data.scheduledTime} {data.timezone}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {data.sendTiming === "recurring" && (
        <Card>
          <CardHeader>
            <CardTitle>Recurring Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={data.recurring?.frequency || "weekly"}
                onValueChange={(value: any) => handleRecurringChange("frequency", value)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.recurring?.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Send on *</Label>
                <div className="flex gap-2">
                  {[
                    { day: 1, label: "Mon" },
                    { day: 2, label: "Tue" },
                    { day: 3, label: "Wed" },
                    { day: 4, label: "Thu" },
                    { day: 5, label: "Fri" },
                    { day: 6, label: "Sat" },
                    { day: 0, label: "Sun" },
                  ].map(({ day, label }) => (
                    <Button
                      key={day}
                      variant={(data.recurring?.days || []).includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleRecurringDay(day)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>End Date</Label>
              <RadioGroup
                value={data.recurring?.endCondition || "never"}
                onValueChange={(value: any) => handleRecurringChange("endCondition", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never" className="cursor-pointer">
                    Never end (continues indefinitely)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="after" />
                  <Label htmlFor="after" className="cursor-pointer flex items-center gap-2">
                    End after
                    <Input
                      type="number"
                      value={data.recurring?.endValue as number}
                      onChange={(e) => handleRecurringChange("endValue", Number.parseInt(e.target.value))}
                      className="w-20"
                      disabled={data.recurring?.endCondition !== "after"}
                    />
                    occurrences
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableThrottling" className="cursor-pointer">
                Enable send throttling
              </Label>
              <div className="text-sm text-muted-foreground">Prevents overwhelming your provider</div>
            </div>
            <Switch
              id="enableThrottling"
              checked={data.throttling.enabled}
              onCheckedChange={(checked) => handleThrottlingChange("enabled", checked)}
            />
          </div>

          {data.throttling.enabled && (
            <div className="space-y-2">
              <Label htmlFor="throttleRate">Send rate (messages per hour)</Label>
              <Input
                id="throttleRate"
                type="number"
                value={data.throttling.rate}
                onChange={(e) => handleThrottlingChange("rate", Number.parseInt(e.target.value))}
              />
              <div className="text-sm text-muted-foreground">Estimated send time: ~2.4 hours</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onStart"
              checked={data.notifications.onStart}
              onCheckedChange={(checked: boolean) => handleNotificationChange("onStart", checked)}
            />
            <Label htmlFor="onStart" className="cursor-pointer">
              Campaign starts sending
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onComplete"
              checked={data.notifications.onComplete}
              onCheckedChange={(checked: boolean) => handleNotificationChange("onComplete", checked)}
            />
            <Label htmlFor="onComplete" className="cursor-pointer">
              Campaign completes successfully
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onError"
              checked={data.notifications.onError}
              onCheckedChange={(checked: boolean) => handleNotificationChange("onError", checked)}
            />
            <Label htmlFor="onError" className="cursor-pointer">
              Campaign encounters errors
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="highUnsubscribe"
              checked={data.notifications.highUnsubscribe}
              onCheckedChange={(checked: boolean) => handleNotificationChange("highUnsubscribe", checked)}
            />
            <Label htmlFor="highUnsubscribe" className="cursor-pointer">
              High unsubscribe rate detected (&gt;5%)
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={onNext}>Next: Review →</Button>
        </div>
      </div>
    </div>
  )
}
