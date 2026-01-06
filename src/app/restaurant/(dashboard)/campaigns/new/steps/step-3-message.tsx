"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  AlertTriangle,
  Bold,
  Italic,
  Underline,
  Link2,
  ImageIcon,
  Code,
} from "lucide-react"
import type { CampaignDraft, Channel } from "../wizard-types"

interface Props {
  data: CampaignDraft["step3"]
  selectedChannels: Channel[]
  onChange: (data: CampaignDraft["step3"]) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
}

export function MessageCompositionStep({ data, selectedChannels, onChange, onNext, onBack, onSaveDraft }: Props) {
  const [activeChannel, setActiveChannel] = useState<"email" | "sms">("email")
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("desktop")

  const hasEmail = selectedChannels.includes("email")
  const hasSMS = selectedChannels.includes("sms")

  const handleEmailChange = (field: keyof typeof data.email, value: any) => {
    onChange({
      ...data,
      email: { ...data.email, [field]: value },
    })
  }

  const handleSMSChange = (field: keyof typeof data.sms, value: any) => {
    onChange({
      ...data,
      sms: { ...data.sms, [field]: value },
    })
  }

  const handleEmailSettingChange = (field: keyof typeof data.email.settings, value: boolean) => {
    onChange({
      ...data,
      email: {
        ...data.email,
        settings: { ...data.email.settings, [field]: value },
      },
    })
  }

  const smsCharCount = data.sms.message.length
  const smsSegments = Math.ceil(smsCharCount / 160) || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Step 3: Message Composition</h2>
        <div className="text-sm text-muted-foreground">Auto-saved 30 seconds ago</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%,40%] gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as "email" | "sms")}>
            <TabsList>
              {hasEmail && (
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
              )}
              {hasSMS && (
                <TabsTrigger value="sms">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </TabsTrigger>
              )}
            </TabsList>

            {/* Email Editor */}
            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line *</Label>
                    <Input
                      id="subject"
                      value={data.email.subject}
                      onChange={(e) => handleEmailChange("subject", e.target.value)}
                      placeholder="Welcome! Here's 20% off"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{data.email.subject.length} characters</span>
                      {data.email.subject.length > 40 && (
                        <span className="text-amber-600">May be truncated on mobile</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previewText">Preview Text (optional)</Label>
                    <Input
                      id="previewText"
                      value={data.email.previewText}
                      onChange={(e) => handleEmailChange("previewText", e.target.value)}
                      placeholder="Join us for an exclusive offer..."
                    />
                    <div className="text-sm text-muted-foreground">{data.email.previewText.length} characters</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Message Body *</Label>
                    <div className="border rounded-md">
                      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                        <Button variant="ghost" size="sm">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Underline className="w-4 h-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button variant="ghost" size="sm">
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Code className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="body"
                        value={data.email.body}
                        onChange={(e) => handleEmailChange("body", e.target.value)}
                        placeholder="Hi {{firstName}},&#10;&#10;Welcome to BerryTap! We're excited to have you..."
                        className="min-h-[300px] border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Variables available:</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "{{firstName}}",
                        "{{lastName}}",
                        "{{email}}",
                        "{{phone}}",
                        "{{tier}}",
                        "{{points}}",
                        "{{promoCode}}",
                      ].map((variable) => (
                        <Badge key={variable} variant="secondary" className="cursor-pointer">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trackOpens" className="cursor-pointer">
                          Track opens
                        </Label>
                        <Switch
                          id="trackOpens"
                          checked={data.email.settings.trackOpens}
                          onCheckedChange={(checked) => handleEmailSettingChange("trackOpens", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trackClicks" className="cursor-pointer">
                          Track clicks
                        </Label>
                        <Switch
                          id="trackClicks"
                          checked={data.email.settings.trackClicks}
                          onCheckedChange={(checked) => handleEmailSettingChange("trackClicks", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeUnsubscribe" className="cursor-pointer">
                          Include unsubscribe link
                        </Label>
                        <Switch
                          id="includeUnsubscribe"
                          checked={data.email.settings.includeUnsubscribe}
                          onCheckedChange={(checked) => handleEmailSettingChange("includeUnsubscribe", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeViewInBrowser" className="cursor-pointer">
                          Add view in browser link
                        </Label>
                        <Switch
                          id="includeViewInBrowser"
                          checked={data.email.settings.includeViewInBrowser}
                          onCheckedChange={(checked) => handleEmailSettingChange("includeViewInBrowser", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Editor */}
            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smsMessage">SMS Message *</Label>
                    <Textarea
                      id="smsMessage"
                      value={data.sms.message}
                      onChange={(e) => handleSMSChange("message", e.target.value)}
                      placeholder="Hi {{firstName}}! Welcome to BerryTap! 🎉&#10;&#10;As a thank you, here's 20% off your first visit..."
                      className="min-h-[200px]"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {smsCharCount}/160 characters • {smsSegments} message part{smsSegments > 1 ? "s" : ""}
                      </span>
                      {smsSegments > 1 && (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Will be split
                        </span>
                      )}
                    </div>
                  </div>

                  {smsSegments > 1 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This SMS is {smsCharCount} characters, which will be split into {smsSegments} message parts.
                        Cost per recipient: €{(smsSegments * 0.2).toFixed(2)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="useShortener" className="cursor-pointer">
                      Use URL shortener
                    </Label>
                    <Switch
                      id="useShortener"
                      checked={data.sms.useShortener}
                      onCheckedChange={(checked) => handleSMSChange("useShortener", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Variables available:</Label>
                    <div className="flex flex-wrap gap-2">
                      {["{{firstName}}", "{{promoCode}}", "{{expiryDate}}"].map((variable) => (
                        <Badge key={variable} variant="secondary" className="cursor-pointer">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2 text-sm">SMS Best Practices</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Keep under 160 characters for 1 message</li>
                        <li>• Include clear call-to-action</li>
                        <li>• Always add opt-out language</li>
                        <li>• Use URL shorteners for long links</li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={previewDevice === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {activeChannel === "email" ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-sm space-y-2 mb-4">
                      <div className="font-medium">From: BerryTap Restaurant</div>
                      <div className="font-medium">Subject: {data.email.subject || "Subject line"}</div>
                      {data.email.previewText && <div className="text-muted-foreground">{data.email.previewText}</div>}
                    </div>
                    <Separator className="my-4" />
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {data.email.body || "Email body"}
                    </div>
                    {data.email.settings.includeUnsubscribe && (
                      <>
                        <Separator className="my-4" />
                        <div className="text-xs text-muted-foreground text-center">
                          <a href="#" className="hover:underline">
                            Unsubscribe
                          </a>{" "}
                          |{" "}
                          <a href="#" className="hover:underline">
                            Preferences
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={`border rounded-lg p-4 ${previewDevice === "mobile" ? "max-w-[300px]" : ""}`}>
                    <div className="text-sm font-medium mb-2">BerryTap Restaurant</div>
                    <div className="bg-blue-500 text-white rounded-lg p-3 text-sm whitespace-pre-wrap">
                      {data.sms.message || "SMS message"}
                    </div>
                    <div className="text-xs text-muted-foreground text-right mt-1">Delivered</div>
                  </div>
                )}
              </ScrollArea>

              <div className="mt-4 space-y-2">
                <div className="text-sm">Preview as: Sarah Mitchell</div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Send Test {activeChannel === "email" ? "Email" : "SMS"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {data.email.subject.length > 40 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Subject line may be truncated on mobile devices ({data.email.subject.length} characters - recommended max
            40)
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={onNext}>Next: Schedule →</Button>
        </div>
      </div>
    </div>
  )
}
