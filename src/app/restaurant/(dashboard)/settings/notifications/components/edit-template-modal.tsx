"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { NotificationTemplate } from "../types"

interface EditTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: NotificationTemplate | null
}

export function EditTemplateModal({ open, onOpenChange, template }: EditTemplateModalProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(template?.name || "")
  const [subject, setSubject] = useState("Your order has been confirmed")
  const [emailBody, setEmailBody] = useState("Hi {{customer_name}},\n\nYour order #{{order_id}} has been confirmed...")
  const [smsBody, setSmsBody] = useState("Your order #{{order_id}} is confirmed. Track at {{tracking_url}}")
  const [active, setActive] = useState(template?.active ?? true)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    toast({
      title: "Template saved",
      description: `Successfully ${template ? "updated" : "created"} template "${name}"`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "New Template"}</DialogTitle>
          <DialogDescription>
            {template ? "Update the notification template" : "Create a new notification template"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Order Confirmed" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">📧 Email</TabsTrigger>
              <TabsTrigger value="sms">📱 SMS</TabsTrigger>
              <TabsTrigger value="push">🔔 Push</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Message Body</Label>
                <Textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Enter your message..."
                />
                <p className="text-xs text-muted-foreground">
                  Use variables: {`{{customer_name}}`}, {`{{order_id}}`}, {`{{tracking_url}}`}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="sms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sms-body">Message Body</Label>
                <Textarea
                  id="sms-body"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  rows={4}
                  maxLength={160}
                  placeholder="Enter your SMS message..."
                />
                <p className="text-xs text-muted-foreground">{smsBody.length}/160 characters</p>
              </div>
            </TabsContent>
            <TabsContent value="push" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="push-title">Title</Label>
                <Input id="push-title" placeholder="Order Confirmed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="push-body">Message</Label>
                <Textarea id="push-body" rows={3} placeholder="Your order is on its way!" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? "Save Changes" : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
