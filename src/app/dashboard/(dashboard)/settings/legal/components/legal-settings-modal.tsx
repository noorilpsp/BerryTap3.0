"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface LegalSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LegalSettingsModal({ open, onOpenChange }: LegalSettingsModalProps) {
  const [dpoName, setDpoName] = useState("Sarah Johnson")
  const [dpoEmail, setDpoEmail] = useState("dpo@berrytap.com")
  const [autoApproveExports, setAutoApproveExports] = useState(false)
  const [notifyOnRequests, setNotifyOnRequests] = useState(true)

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Legal & compliance settings have been updated",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Legal & Compliance Settings</DialogTitle>
          <DialogDescription>Configure legal and compliance preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Data Protection Officer (DPO)</h3>
            <div className="space-y-2">
              <Label htmlFor="dpoName">DPO Name</Label>
              <Input id="dpoName" value={dpoName} onChange={(e) => setDpoName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpoEmail">DPO Email</Label>
              <Input id="dpoEmail" type="email" value={dpoEmail} onChange={(e) => setDpoEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Privacy Request Automation</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoApprove"
                  checked={autoApproveExports}
                  onCheckedChange={(checked) => setAutoApproveExports(checked as boolean)}
                />
                <Label htmlFor="autoApprove">Auto-approve data export requests for verified users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={notifyOnRequests}
                  onCheckedChange={(checked) => setNotifyOnRequests(checked as boolean)}
                />
                <Label htmlFor="notify">Send email notifications for new privacy requests</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Compliance Audit Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Quarterly compliance audits are scheduled automatically. Next audit: Jan 1, 2025
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
