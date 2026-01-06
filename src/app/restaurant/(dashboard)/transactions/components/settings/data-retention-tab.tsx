"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DataRetentionTabProps {
  onSettingsChange: () => void
}

export function DataRetentionTab({ onSettingsChange }: DataRetentionTabProps) {
  return (
    <div className="space-y-6">
      {/* Transaction Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Data Retention</CardTitle>
          <CardDescription>Configure how long transaction records are stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="retentionPeriod">Keep transaction data for:</Label>
            <Select defaultValue="7years" onValueChange={onSettingsChange}>
              <SelectTrigger id="retentionPeriod" className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 year</SelectItem>
                <SelectItem value="3years">3 years</SelectItem>
                <SelectItem value="5years">5 years</SelectItem>
                <SelectItem value="7years">7 years (recommended for tax/audit)</SelectItem>
                <SelectItem value="10years">10 years</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>After retention period:</Label>
            <RadioGroup defaultValue="archive" onValueChange={onSettingsChange}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="archive" id="archive" />
                <div className="grid gap-1">
                  <Label htmlFor="archive" className="font-normal">
                    Archive to cold storage
                  </Label>
                  <p className="text-sm text-muted-foreground">Reduced access, lower cost</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="delete" id="delete" />
                <div className="grid gap-1">
                  <Label htmlFor="delete" className="font-normal">
                    Permanently delete
                  </Label>
                  <p className="text-sm text-muted-foreground">Cannot be recovered</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your jurisdiction may require minimum retention periods for financial records (typically 7 years). Check
              with your legal advisor before reducing retention periods.
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="space-y-2">
            <Label>What to retain:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="retainTx" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainTx" className="font-normal">
                  Transaction records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="retainRefunds" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainRefunds" className="font-normal">
                  Refund records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="retainDisputes" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainDisputes" className="font-normal">
                  Dispute records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="retainPayment" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainPayment" className="font-normal">
                  Customer payment information (tokenized)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="retainReceipts" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainReceipts" className="font-normal">
                  Receipts and invoices
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="retainAudit" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="retainAudit" className="font-normal">
                  Audit logs
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Sensitive Data:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="fullCards" onCheckedChange={onSettingsChange} />
                <Label htmlFor="fullCards" className="font-normal">
                  Full card numbers (PCI compliant storage required)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="last4" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="last4" className="font-normal">
                  Last 4 digits only (recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cardholderNames" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="cardholderNames" className="font-normal">
                  Cardholder names
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="customerContact" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="customerContact" className="font-normal">
                  Customer contact information
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Settings</CardTitle>
          <CardDescription>Configure activity logging and retention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="auditRetention">Audit Log Retention:</Label>
            <Select defaultValue="3years" onValueChange={onSettingsChange}>
              <SelectTrigger id="auditRetention" className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 year</SelectItem>
                <SelectItem value="3years">3 years</SelectItem>
                <SelectItem value="5years">5 years</SelectItem>
                <SelectItem value="7years">7 years</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Log these actions:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="logViews" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logViews" className="font-normal">
                  Transaction views
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logExports" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logExports" className="font-normal">
                  Transaction exports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logRefunds" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logRefunds" className="font-normal">
                  Refund actions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logDisputes" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logDisputes" className="font-normal">
                  Dispute actions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logSettings" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logSettings" className="font-normal">
                  Settings changes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logPermissions" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logPermissions" className="font-normal">
                  Permission changes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="logAuth" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="logAuth" className="font-normal">
                  User login/logout and failed attempts
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Log detail level:</Label>
            <RadioGroup defaultValue="detailed" onValueChange={onSettingsChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="detailed" />
                <Label htmlFor="detailed" className="font-normal">
                  Detailed (includes all metadata)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="font-normal">
                  Standard (key actions only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="minimal" />
                <Label htmlFor="minimal" className="font-normal">
                  Minimal (security events only)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card>
        <CardHeader>
          <CardTitle>Data Deletion Requests</CardTitle>
          <CardDescription>Handle customer data deletion requests (GDPR compliance)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="enableDeletion" defaultChecked onCheckedChange={onSettingsChange} />
            <Label htmlFor="enableDeletion" className="font-medium">
              Enable customer data deletion requests
            </Label>
          </div>

          <div className="ml-6 space-y-4">
            <div className="space-y-3">
              <Label>When customer requests deletion:</Label>
              <RadioGroup defaultValue="anonymize" onValueChange={onSettingsChange}>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="anonymize" id="anonymize" />
                  <div className="grid gap-1">
                    <Label htmlFor="anonymize" className="font-normal">
                      Anonymize transaction data
                    </Label>
                    <p className="text-sm text-muted-foreground">Keep records for compliance, remove personal info</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="deleteAll" id="deleteAll" />
                  <div className="grid gap-1">
                    <Label htmlFor="deleteAll" className="font-normal">
                      Delete all customer data
                    </Label>
                    <p className="text-sm text-muted-foreground">May affect legal compliance requirements</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Retention exceptions:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="exceptDisputes" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="exceptDisputes" className="font-normal">
                    Keep data for active disputes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="exceptLegal" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="exceptLegal" className="font-normal">
                    Keep data required for tax/legal compliance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="exceptFraud" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="exceptFraud" className="font-normal">
                    Keep data for fraud prevention (1 year)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalRequired">Approval required from:</Label>
              <Select defaultValue="owner-legal" onValueChange={onSettingsChange}>
                <SelectTrigger id="approvalRequired" className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="owner-legal">Owner + Legal</SelectItem>
                  <SelectItem value="manager">Manager or above</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
