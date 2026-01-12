"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface AddTriggerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTriggerModal({ open, onOpenChange }: AddTriggerModalProps) {
  const [eventType, setEventType] = useState("")
  const [template, setTemplate] = useState("")
  const [channels, setChannels] = useState<string[]>([])
  const { toast } = useToast()

  const handleAdd = () => {
    if (!eventType || !template || channels.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Trigger created",
      description: `Notifications will be sent when "${eventType}" occurs`,
    })
    onOpenChange(false)
    setEventType("")
    setTemplate("")
    setChannels([])
  }

  const toggleChannel = (channel: string) => {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Notification Trigger</DialogTitle>
          <DialogDescription>Create an automated notification trigger based on events</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Order Placed">Order Placed</SelectItem>
                <SelectItem value="Order Completed">Order Completed</SelectItem>
                <SelectItem value="Order Cancelled">Order Cancelled</SelectItem>
                <SelectItem value="Payment Received">Payment Received</SelectItem>
                <SelectItem value="Reservation Confirmed">Reservation Confirmed</SelectItem>
                <SelectItem value="Low Inventory">Low Inventory Alert</SelectItem>
                <SelectItem value="Staff Clock In">Staff Clock In</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="inventory-alert">Inventory Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="space-y-3 border rounded-lg p-4">
              {[
                { id: "email", label: "📧 Email", description: "Send via email" },
                { id: "sms", label: "📱 SMS", description: "Send text message" },
                { id: "push", label: "🔔 Push", description: "Send push notification" },
                { id: "whatsapp", label: "💬 WhatsApp", description: "Send via WhatsApp" },
              ].map((channel) => (
                <div key={channel.id} className="flex items-start gap-3">
                  <Checkbox
                    id={channel.id}
                    checked={channels.includes(channel.id)}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={channel.id} className="font-normal cursor-pointer">
                      {channel.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Create Trigger</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
