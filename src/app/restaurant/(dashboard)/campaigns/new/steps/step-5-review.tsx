"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, AlertTriangle, Edit, Mail, MessageSquare, Users, Clock } from "lucide-react"
import type { CampaignDraft } from "../wizard-types"

interface Props {
  campaignDraft: CampaignDraft
  onChange: (data: CampaignDraft["step5"]) => void
  onBack: () => void
  onEdit: (step: number) => void
  onSaveDraft: () => void
}

export function ReviewStep({ campaignDraft, onChange, onBack, onEdit, onSaveDraft }: Props) {
  const { step1, step2, step3, step4, step5 } = campaignDraft

  const totalRecipients = 1198 // Mock data
  const emailRecipients = 1198
  const smsRecipients = 1144
  const smsSegments = Math.ceil(step3.sms.message.length / 160) || 1
  const smsCost = smsRecipients * smsSegments * 0.2
  const totalCost = smsCost

  const validations = [
    { passed: true, message: "All required fields completed" },
    { passed: true, message: "At least one channel selected with valid recipients" },
    { passed: true, message: "Message contains no broken variables" },
    { passed: true, message: "All links are valid and working" },
    { passed: true, message: "Opt-out/unsubscribe language included" },
    { passed: true, message: "No recent campaign sent to this audience (last 7 days)" },
  ]

  const warnings = [
    step3.email.subject.length > 40
      ? `Subject line may be truncated on mobile devices (${step3.email.subject.length} characters)`
      : null,
    smsSegments > 1 ? `SMS message will be split into ${smsSegments} parts, doubling cost per recipient` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Step 5: Review & Send</h2>

      <Alert>
        <AlertTitle>Campaign Summary</AlertTitle>
        <AlertDescription>Please review your campaign details before sending</AlertDescription>
      </Alert>

      {/* Setup Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">1</div>
            <CardTitle>Campaign Setup</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{step1.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Channels:</span>
            <div className="flex gap-2">
              {step1.channels.map((channel) => (
                <Badge key={channel} variant="secondary">
                  {channel === "email" && <Mail className="w-3 h-3 mr-1" />}
                  {channel === "sms" && <MessageSquare className="w-3 h-3 mr-1" />}
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tags:</span>
            <div className="flex gap-1">
              {step1.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UTM Tracking:</span>
            <span>{step1.utmTracking.enabled ? "Enabled" : "Disabled"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Audience Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">2</div>
            <CardTitle>Audience</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Selection Method:</span>
            <Badge>
              <Users className="w-3 h-3 mr-1" />
              {step2.selectionMethod}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total recipients:</span>
            <span className="font-medium">{totalRecipients.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{emailRecipients.toLocaleString()} (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMS:</span>
              <span>{smsRecipients.toLocaleString()} (95.5%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">3</div>
            <CardTitle>Message</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="font-medium mb-1">Email:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span>{step3.email.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preview Text:</span>
                <span>{step3.email.previewText || "None"}</span>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <div className="font-medium mb-1">SMS:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Length:</span>
                <span>
                  {step3.sms.message.length} characters ({smsSegments} part{smsSegments > 1 ? "s" : ""})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">4</div>
            <CardTitle>Schedule</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Send Time:</span>
            <Badge>
              <Clock className="w-3 h-3 mr-1" />
              {step4.sendTiming === "immediate" && "Immediately"}
              {step4.sendTiming === "scheduled" && `${step4.scheduledDate} at ${step4.scheduledTime}`}
              {step4.sendTiming === "recurring" && "Recurring"}
            </Badge>
          </div>
          {step4.throttling.enabled && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Throttling:</span>
              <span>{step4.throttling.rate} messages/hour</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Email ({emailRecipients.toLocaleString()} recipients):</span>
            <span className="font-medium">Free</span>
          </div>
          <div className="flex justify-between">
            <span>
              SMS ({smsRecipients.toLocaleString()} recipients × {smsSegments} part{smsSegments > 1 ? "s" : ""}):
            </span>
            <span className="font-medium">€{smsCost.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total campaign cost:</span>
            <span>€{totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Send Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {validations.map((validation, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm">{validation.message}</span>
            </div>
          ))}

          {warnings.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {warnings.length} warning{warnings.length > 1 ? "s" : ""} (non-blocking)
                  </span>
                </div>
                {warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-muted-foreground ml-6">
                    • {warning}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmations */}
      {totalCost > 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Cost Confirmation Required</AlertTitle>
          <AlertDescription>This campaign will cost €{totalCost.toFixed(2)} to send (SMS charges).</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Final Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You are about to send this campaign to {totalRecipients.toLocaleString()} recipients. This action cannot
              be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="costConfirmed"
                checked={step5.costConfirmed}
                onCheckedChange={(checked: boolean) => onChange({ ...step5, costConfirmed: checked })}
              />
              <Label htmlFor="costConfirmed" className="cursor-pointer">
                I authorize the estimated cost of €{totalCost.toFixed(2)}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="finalConfirmed"
                checked={step5.finalConfirmed}
                onCheckedChange={(checked: boolean) => onChange({ ...step5, finalConfirmed: checked })}
              />
              <Label htmlFor="finalConfirmed" className="cursor-pointer">
                I have reviewed all campaign details and confirm they are correct
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button disabled={!step5.costConfirmed || !step5.finalConfirmed} size="lg">
            🚀 Send Campaign Now
          </Button>
        </div>
      </div>
    </div>
  )
}
