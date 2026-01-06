"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface AddChannelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddChannelModal({ open, onOpenChange }: AddChannelModalProps) {
  const [channelType, setChannelType] = useState("")
  const { toast } = useToast()

  const handleAdd = () => {
    if (!channelType) {
      toast({
        title: "Error",
        description: "Please select a channel type",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Channel added",
      description: `${channelType} channel has been added. Configure it to start sending notifications.`,
    })
    onOpenChange(false)
    setChannelType("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Notification Channel</DialogTitle>
          <DialogDescription>Choose a channel type to add to your notification system</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <Select value={channelType} onValueChange={setChannelType}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">📧 Email</SelectItem>
                <SelectItem value="SMS">📱 SMS</SelectItem>
                <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
                <SelectItem value="Push">🔔 Push Notifications</SelectItem>
                <SelectItem value="In-App">📲 In-App Notifications</SelectItem>
                <SelectItem value="Receipt">🧾 Receipt Printer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Channel will be added to your account</li>
              <li>You'll need to configure provider settings</li>
              <li>Test the channel before activating</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Channel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
