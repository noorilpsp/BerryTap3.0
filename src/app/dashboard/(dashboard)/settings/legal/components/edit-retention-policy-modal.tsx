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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import type { RetentionPolicy } from "../types"

interface EditRetentionPolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: RetentionPolicy
}

export function EditRetentionPolicyModal({ open, onOpenChange, policy }: EditRetentionPolicyModalProps) {
  const [retentionPeriod, setRetentionPeriod] = useState(policy.retentionPeriod)
  const [autoDelete, setAutoDelete] = useState(policy.autoDelete)

  const handleSave = () => {
    toast({
      title: "Retention policy updated",
      description: `${policy.displayName} retention policy has been saved`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Retention Policy: {policy.displayName}</DialogTitle>
          <DialogDescription>Configure how long this data type is retained</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="font-medium mb-2">Data Type: {policy.displayName}</p>
            <p className="text-sm text-muted-foreground">Includes: {policy.includes}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Retention Period</h3>
            <RadioGroup value={retentionPeriod} onValueChange={setRetentionPeriod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7_years" id="7_years" />
                <Label htmlFor="7_years">7 years after last transaction (recommended for tax compliance)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5_years" id="5_years" />
                <Label htmlFor="5_years">5 years after last transaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3_years" id="3_years" />
                <Label htmlFor="3_years">3 years after last transaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1_year" id="1_year" />
                <Label htmlFor="1_year">1 year after last transaction</Label>
              </div>
            </RadioGroup>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-3 text-sm">
              <p className="font-medium mb-1">ℹ️ Legal requirements:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• EU GDPR: No specific requirement, but must be "necessary"</li>
                <li>• Malta tax law: Minimum 5 years for financial records</li>
                <li>• PCI DSS: Maximum 1 year unless business need justifies longer</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Auto-Deletion</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoDelete"
                checked={autoDelete}
                onCheckedChange={(checked) => setAutoDelete(checked as boolean)}
              />
              <Label htmlFor="autoDelete">Automatically delete data after retention period</Label>
            </div>

            {autoDelete && (
              <div className="ml-6 space-y-2 text-sm text-muted-foreground">
                <p>Deletion process:</p>
                <ul className="space-y-1">
                  <li>• Monthly scan for expired records</li>
                  <li>• 30-day grace period with notification</li>
                  <li>• Permanent deletion (non-recoverable)</li>
                  <li>• Audit log entry created</li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Impact Assessment</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current records affected:</p>
                <p className="font-semibold">12,345 customers</p>
              </div>
              <div>
                <p className="text-muted-foreground">Records eligible for deletion:</p>
                <p className="font-semibold">234 customers</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save & Apply Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
