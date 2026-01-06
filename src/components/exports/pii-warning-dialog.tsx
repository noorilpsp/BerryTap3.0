"use client"

import { useState } from 'react'
import { Lock, AlertTriangle, Shield, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface PIIWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  piiColumns: Array<{ key: string; label: string; category: string }>
  onContinue: (option: 'continue' | 'mask' | 'remove', justification?: string) => void
}

export function PIIWarningDialog({ open, onOpenChange, piiColumns, onContinue }: PIIWarningDialogProps) {
  const [protectionOption, setProtectionOption] = useState<'continue' | 'mask' | 'remove'>('mask')
  const [acknowledgments, setAcknowledgments] = useState({
    auth: false,
    responsibility: false,
    compliance: false,
    deletion: false
  })
  const [justification, setJustification] = useState("")

  const allAcknowledged = Object.values(acknowledgments).every(Boolean)
  const canProceed = protectionOption !== 'continue' || allAcknowledged

  const handleContinue = () => {
    onContinue(protectionOption, justification || undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Personally Identifiable Information (PII) Warning
          </DialogTitle>
          <DialogDescription>
            Your export configuration includes columns containing personally identifiable information (PII).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* PII Columns Detected */}
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4" />
                PII Columns Detected ({piiColumns.length})
              </h3>
              <ul className="space-y-2 text-sm">
                {piiColumns.map((col) => (
                  <li key={col.key} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <span className="font-medium">{col.label}</span>
                      <span className="text-muted-foreground ml-2">({col.category})</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Legal Requirements */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Legal & Compliance Requirements</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">Exporting PII requires:</p>
              <ul className="space-y-1 text-sm">
                <li>• Proper authorization and business justification</li>
                <li>• Compliance with data protection regulations (GDPR, CCPA, etc.)</li>
                <li>• Secure handling and storage of exported files</li>
                <li>• Appropriate access controls for recipients</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Data Protection Options */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              Data Protection Options
            </h3>
            <RadioGroup value={protectionOption} onValueChange={(v) => setProtectionOption(v as any)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value="continue" id="continue" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="continue" className="font-medium cursor-pointer">
                      Continue with PII (requires explicit consent)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Export will include all personal data as configured
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-3 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
                  <RadioGroupItem value="mask" id="mask" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="mask" className="font-medium cursor-pointer flex items-center gap-2">
                      Mask PII fields (recommended)
                      <Badge className="bg-green-600 text-white">Recommended</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Personal data will be anonymized:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Names: John Doe → J*** D**</li>
                      <li>• Emails: john@example.com → j***@e******.com</li>
                      <li>• Phone: +1-555-0123 → ***-***-0123</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value="remove" id="remove" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="remove" className="font-medium cursor-pointer">
                      Remove PII columns
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      PII columns will be excluded from export
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Required Acknowledgments (only if continuing with PII) */}
          {protectionOption === 'continue' && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Required Acknowledgments</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="auth"
                      checked={acknowledgments.auth}
                      onCheckedChange={(checked) => setAcknowledgments(prev => ({ ...prev, auth: !!checked }))}
                    />
                    <Label htmlFor="auth" className="font-normal cursor-pointer">
                      I have authorization to export this data
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="responsibility"
                      checked={acknowledgments.responsibility}
                      onCheckedChange={(checked) => setAcknowledgments(prev => ({ ...prev, responsibility: !!checked }))}
                    />
                    <Label htmlFor="responsibility" className="font-normal cursor-pointer">
                      I understand my responsibility to protect this data
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="compliance"
                      checked={acknowledgments.compliance}
                      onCheckedChange={(checked) => setAcknowledgments(prev => ({ ...prev, compliance: !!checked }))}
                    />
                    <Label htmlFor="compliance" className="font-normal cursor-pointer">
                      I will handle exported files in compliance with data protection laws
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="deletion"
                      checked={acknowledgments.deletion}
                      onCheckedChange={(checked) => setAcknowledgments(prev => ({ ...prev, deletion: !!checked }))}
                    />
                    <Label htmlFor="deletion" className="font-normal cursor-pointer">
                      I will delete or securely destroy files when no longer needed
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Audit Trail Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Audit Trail</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="text-sm mb-2">This export will be logged with:</p>
              <ul className="space-y-1 text-sm">
                <li>• Your user ID and timestamp</li>
                <li>• PII columns included</li>
                <li>• Business justification (if provided)</li>
                <li>• Recipients (if applicable)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Business Justification */}
          <div>
            <Label htmlFor="justification" className="text-sm font-medium mb-2 block">
              Business Justification (Optional)
            </Label>
            <Textarea
              id="justification"
              placeholder="Monthly sales report for accounting department..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel Export
          </Button>
          {protectionOption === 'remove' && (
            <Button variant="outline" onClick={handleContinue}>
              Remove PII
            </Button>
          )}
          {protectionOption === 'mask' && (
            <Button onClick={handleContinue}>
              Continue with Masking
            </Button>
          )}
          {protectionOption === 'continue' && (
            <Button 
              onClick={handleContinue}
              disabled={!canProceed}
              variant="destructive"
            >
              Continue with PII
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
