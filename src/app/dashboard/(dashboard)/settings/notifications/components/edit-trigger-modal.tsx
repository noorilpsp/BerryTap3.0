"use client"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import type { NotificationTrigger } from "../types"

interface EditTriggerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: NotificationTrigger | null
}

export function EditTriggerModal({ open, onOpenChange, trigger }: EditTriggerModalProps) {
  const [template, setTemplate] = useState(trigger?.template || "")
  const [channels, setChannels] = useState<string[]>(trigger?.channels || [])
  const { toast } = useToast()

  const handleSave = () => {
    if (!template || channels.length === 0) {
      toast({
        title: "Error",
        description: "Please select a template and at least one channel",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Trigger updated",
      description: `Changes to "${trigger?.event}" trigger have been saved`,
    })
    onOpenChange(false)
  }

  const toggleChannel = (channel: string) => {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]))
  }

  if (!trigger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Trigger</DialogTitle>
          <DialogDescription>Update notification trigger settings for "{trigger.event}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event</Label>
            <Input value={trigger.event} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Event type cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
                <SelectItem value="order-ready">Order Ready</SelectItem>
                <SelectItem value="payment-receipt">Payment Receipt</SelectItem>
                <SelectItem value="reservation-reminder">Reservation Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="space-y-3 border rounded-lg p-4">
              {[
                { id: "email", label: "📧 Email" },
                { id: "sms", label: "📱 SMS" },
                { id: "push", label: "🔔 Push" },
                { id: "whatsapp", label: "💬 WhatsApp" },
              ].map((channel) => (
                <div key={channel.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`edit-${channel.id}`}
                    checked={channels.includes(channel.id)}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                  <Label htmlFor={`edit-${channel.id}`} className="font-normal cursor-pointer">
                    {channel.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Sent {trigger.sentLast7Days} times in the last 7 days with {trigger.successRate}% success rate
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
