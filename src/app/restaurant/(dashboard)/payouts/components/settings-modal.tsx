"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [dateFormat, setDateFormat] = useState<"mdy" | "dmy" | "ymd">("mdy")
  const [defaultView, setDefaultView] = useState<"30days" | "month" | "90days">("30days")
  const [rowsPerPage, setRowsPerPage] = useState("25")
  const [showReconciled, setShowReconciled] = useState(true)
  const [highlightPending, setHighlightPending] = useState(true)
  const [showTransactionCount, setShowTransactionCount] = useState(true)

  const [emailOnPaid, setEmailOnPaid] = useState(true)
  const [emailOnFailed, setEmailOnFailed] = useState(true)
  const [emailOnLarge, setEmailOnLarge] = useState(false)
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(false)
  const [emailAddress, setEmailAddress] = useState("sarah.johnson@berrytap.com")

  const [requireNote, setRequireNote] = useState(true)
  const [autoReconcile, setAutoReconcile] = useState(false)
  const [showReconciledDate, setShowReconciledDate] = useState(true)

  const handleSave = () => {
    // Save settings
    onClose()
  }

  const handleReset = () => {
    setDateFormat("mdy")
    setDefaultView("30days")
    setRowsPerPage("25")
    setShowReconciled(true)
    setHighlightPending(true)
    setShowTransactionCount(true)
    setEmailOnPaid(true)
    setEmailOnFailed(true)
    setEmailOnLarge(false)
    setEmailWeeklySummary(false)
    setRequireNote(true)
    setAutoReconcile(false)
    setShowReconciledDate(true)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Payout Settings</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Display Preferences */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">DISPLAY PREFERENCES</Label>

              <div className="space-y-3">
                <Label className="text-sm">Date Format:</Label>
                <RadioGroup value={dateFormat} onValueChange={(value: any) => setDateFormat(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mdy" id="mdy" />
                    <Label htmlFor="mdy" className="font-normal cursor-pointer">
                      Nov 20, 2024
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dmy" id="dmy" />
                    <Label htmlFor="dmy" className="font-normal cursor-pointer">
                      20/11/2024
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ymd" id="ymd" />
                    <Label htmlFor="ymd" className="font-normal cursor-pointer">
                      2024-11-20
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Default View:</Label>
                <RadioGroup value={defaultView} onValueChange={(value: any) => setDefaultView(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30days" id="30days" />
                    <Label htmlFor="30days" className="font-normal cursor-pointer">
                      Last 30 days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" />
                    <Label htmlFor="month" className="font-normal cursor-pointer">
                      This month
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="90days" id="90days" />
                    <Label htmlFor="90days" className="font-normal cursor-pointer">
                      Last 90 days
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Rows per page:</Label>
                <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showReconciled"
                    checked={showReconciled}
                    onCheckedChange={(checked) => setShowReconciled(!!checked)}
                  />
                  <Label htmlFor="showReconciled" className="font-normal cursor-pointer">
                    Show reconciled badge in list
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="highlightPending"
                    checked={highlightPending}
                    onCheckedChange={(checked) => setHighlightPending(!!checked)}
                  />
                  <Label htmlFor="highlightPending" className="font-normal cursor-pointer">
                    Highlight pending payouts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showTransactionCount"
                    checked={showTransactionCount}
                    onCheckedChange={(checked) => setShowTransactionCount(!!checked)}
                  />
                  <Label htmlFor="showTransactionCount" className="font-normal cursor-pointer">
                    Show transaction count
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">NOTIFICATIONS</Label>

              <div className="space-y-3">
                <Label className="text-sm">Email me when:</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailOnPaid"
                      checked={emailOnPaid}
                      onCheckedChange={(checked) => setEmailOnPaid(!!checked)}
                    />
                    <Label htmlFor="emailOnPaid" className="font-normal cursor-pointer">
                      New payout arrives in bank
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailOnFailed"
                      checked={emailOnFailed}
                      onCheckedChange={(checked) => setEmailOnFailed(!!checked)}
                    />
                    <Label htmlFor="emailOnFailed" className="font-normal cursor-pointer">
                      Payout fails
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailOnLarge"
                      checked={emailOnLarge}
                      onCheckedChange={(checked) => setEmailOnLarge(!!checked)}
                    />
                    <Label htmlFor="emailOnLarge" className="font-normal cursor-pointer">
                      Large payout ({">"} €10,000)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailWeeklySummary"
                      checked={emailWeeklySummary}
                      onCheckedChange={(checked) => setEmailWeeklySummary(!!checked)}
                    />
                    <Label htmlFor="emailWeeklySummary" className="font-normal cursor-pointer">
                      Weekly payout summary
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Send to:</Label>
                <Input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <Separator />

            {/* Reconciliation */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">RECONCILIATION</Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireNote"
                    checked={requireNote}
                    onCheckedChange={(checked) => setRequireNote(!!checked)}
                  />
                  <Label htmlFor="requireNote" className="font-normal cursor-pointer">
                    Require note when marking as reconciled
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoReconcile"
                    checked={autoReconcile}
                    onCheckedChange={(checked) => setAutoReconcile(!!checked)}
                  />
                  <Label htmlFor="autoReconcile" className="font-normal cursor-pointer">
                    Auto-mark as reconciled after 7 days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showReconciledDate"
                    checked={showReconciledDate}
                    onCheckedChange={(checked) => setShowReconciledDate(!!checked)}
                  />
                  <Label htmlFor="showReconciledDate" className="font-normal cursor-pointer">
                    Show reconciled date in list
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
