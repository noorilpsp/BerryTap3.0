"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Upload, AlertTriangle } from "lucide-react"
import type { CampaignDraft, Channel } from "../wizard-types"

interface Props {
  data: CampaignDraft["step2"]
  selectedChannels: Channel[]
  onChange: (data: CampaignDraft["step2"]) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
}

const mockSegments = [
  {
    id: "seg_001",
    name: "New Customers (Last 7 Days)",
    description: "Customers who signed up in the last 7 days",
    count: 1234,
    lastUpdated: "2 hours ago",
    autoRefreshing: true,
    emailAvailable: 100,
    smsAvailable: 95.6,
  },
  {
    id: "seg_002",
    name: "VIP Customers",
    description: "Platinum and Gold tier loyalty members",
    count: 456,
    lastUpdated: "1 day ago",
    autoRefreshing: false,
    emailAvailable: 100,
    smsAvailable: 98.2,
  },
  {
    id: "seg_003",
    name: "Lapsed 30-90 Days",
    description: "Customers who haven't visited in 30-90 days",
    count: 892,
    lastUpdated: "6 hours ago",
    autoRefreshing: true,
    emailAvailable: 100,
    smsAvailable: 87.4,
  },
]

export function AudienceSelectionStep({ data, selectedChannels, onChange, onNext, onBack, onSaveDraft }: Props) {
  const selectedSegment = mockSegments.find((s) => data.selectedSegments.includes(s.id))
  const totalRecipients = selectedSegment?.count || 0
  const hasSMS = selectedChannels.includes("sms")
  const smsAvailable = selectedSegment ? Math.floor((selectedSegment.count * selectedSegment.smsAvailable) / 100) : 0
  const smsUnavailable = totalRecipients - smsAvailable

  const canProceed = data.selectedSegments.length > 0 || data.csvData !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Step 2: Audience Selection</h2>
      </div>

      {/* Selection Method */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Audience</CardTitle>
          <CardDescription>Choose how to target this campaign:</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.selectionMethod}
            onValueChange={(value) => onChange({ ...data, selectionMethod: value as any })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="segment" id="segment" />
              <Label htmlFor="segment">Use existing segment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">Upload custom list (CSV)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Select individual recipients</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Segment Selection */}
      {data.selectionMethod === "segment" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Choose Segment <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search segments..." className="pl-9" />
              </div>

              <div className="space-y-2">
                {mockSegments.map((segment) => (
                  <Card
                    key={segment.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      data.selectedSegments.includes(segment.id) ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onChange({ ...data, selectedSegments: [segment.id] })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={data.selectedSegments.includes(segment.id)} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{segment.name}</span>
                            <Badge variant="secondary">{segment.count.toLocaleString()} members</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{segment.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Last updated: {segment.lastUpdated}
                            {segment.autoRefreshing && " • Auto-refreshing"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedSegment && (
            <Card>
              <CardHeader>
                <CardTitle>Segment Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Selected: {selectedSegment.name}</span>
                  </p>
                  <p className="text-2xl font-bold">{selectedSegment.count.toLocaleString()} members</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Channel breakdown:</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      • Email available: {selectedSegment.count.toLocaleString()} ({selectedSegment.emailAvailable}%)
                    </p>
                    <p>
                      • SMS available: {smsAvailable.toLocaleString()} ({selectedSegment.smsAvailable}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Filters & Exclusions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.filters.removeDuplicates}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, filters: { ...data.filters, removeDuplicates: !!checked } })
                  }
                />
                <Label>Remove duplicates (same email/phone across segments)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.filters.excludeUnsubscribed}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, filters: { ...data.filters, excludeUnsubscribed: !!checked } })
                  }
                />
                <Label>Exclude unsubscribed contacts</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.filters.excludeBounced}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, filters: { ...data.filters, excludeBounced: !!checked } })
                  }
                />
                <Label>Exclude bounced emails (hard bounces)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.filters.excludeRecentRecipients}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, filters: { ...data.filters, excludeRecentRecipients: !!checked } })
                  }
                />
                <Label>Exclude recent campaign recipients (sent within last 7 days)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {hasSMS && smsUnavailable > 0 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Channel Availability Warning</AlertTitle>
              <AlertDescription>
                SMS channel selected but {smsUnavailable} recipients (
                {((smsUnavailable / totalRecipients) * 100).toFixed(1)}%) don't have phone numbers. These recipients
                will only receive email.
              </AlertDescription>
            </Alert>
          )}

          {/* Cost Estimate */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email ({totalRecipients.toLocaleString()} recipients):</span>
                <span className="font-medium">Free</span>
              </div>
              {hasSMS && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>SMS ({smsAvailable.toLocaleString()} recipients):</span>
                    <span className="font-medium">€{(smsAvailable * 0.2).toFixed(2)} (€0.20 per message)</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total estimated cost:</span>
                    <span>€{(smsAvailable * 0.2).toFixed(2)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* CSV Upload */}
      {data.selectionMethod === "csv" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Recipient List</CardTitle>
            <CardDescription>Upload a CSV file with your recipient list:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drag and drop CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground">Supported format: .csv (max 50MB)</p>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              Download Sample CSV Template
            </Button>

            <div className="text-sm space-y-1">
              <p className="font-medium">Required columns:</p>
              <p className="text-muted-foreground">• email OR phone (at least one required)</p>
              <p className="text-muted-foreground">• firstName (optional but recommended)</p>
              <p className="text-muted-foreground">• lastName (optional but recommended)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onSaveDraft}>
                Save Draft
              </Button>
              <Button onClick={onNext} disabled={!canProceed}>
                Next: Message →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
