"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, FlaskConical, CheckCircle, AlertCircle, Zap, Eye, X, Save } from "lucide-react"
import { getABTestData } from "./ab-test-mock-data"

export default function ABTestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [testType, setTestType] = useState("subject_line")
  const [variantA, setVariantA] = useState("Welcome! Here's 20% off your first visit")
  const [variantB, setVariantB] = useState("🎉 Welcome bonus: 20% off just for you!")
  const [sampleSize, setSampleSize] = useState("20")
  const [winningMetric, setWinningMetric] = useState("open_rate")
  const [testDuration, setTestDuration] = useState("4")
  const [winnerSelection, setWinnerSelection] = useState("automatic")
  const [confidence, setConfidence] = useState("95")
  const [autoSaved, setAutoSaved] = useState(false)

  const data = getABTestData(params.id)

  // Calculate sample distribution
  const totalAudience = 1198
  const sampleRecipients = Math.round((Number.parseInt(sampleSize) / 100) * totalAudience)
  const perVariant = Math.round(sampleRecipients / 2)
  const remaining = totalAudience - sampleRecipients

  const handleSave = () => {
    setAutoSaved(true)
    setTimeout(() => setAutoSaved(false), 2000)
  }

  if (data?.status === "running" || data?.status === "complete") {
    return <ABTestResults data={data} router={router} />
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push(`/campaigns/${params.id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Button>
        <div className="flex items-center gap-2">
          {autoSaved && (
            <span className="text-sm text-success flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Auto-saved 1 minute ago
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push(`/campaigns/${params.id}`)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">A/B Test Configuration</h1>
        </div>
        <p className="text-muted-foreground">Campaign: Welcome Series - New Customers</p>
      </div>

      {/* Test Setup */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">What to test? *</Label>
            <RadioGroup value={testType} onValueChange={setTestType} className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="subject_line" id="subject_line" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="subject_line" className="font-semibold cursor-pointer">
                    Subject line (Email only)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Test different subject lines to see which gets more opens
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="message_content" id="message_content" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="message_content" className="font-semibold cursor-pointer">
                    Message content (Email or SMS body)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Test different message variations to see which performs better
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="sender_name" id="sender_name" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="sender_name" className="font-semibold cursor-pointer">
                    Sender name (Email only)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Test different "from" names</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="send_time" id="send_time" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="send_time" className="font-semibold cursor-pointer">
                    Send time
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Test different days/times to find optimal delivery window
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="cta" id="cta" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="cta" className="font-semibold cursor-pointer">
                    Call-to-action (Button or link text)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Test different CTA wording and placement</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Variant A (Control) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              A
            </Badge>
            Variant A (Control)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="variantA">Subject Line A (Control) *</Label>
            <Input
              id="variantA"
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              className="mt-2"
              placeholder="Enter subject line..."
            />
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{variantA.length} characters</span>
              <span>•</span>
              <span>Includes emoji: {/[\p{Emoji}]/u.test(variantA) ? "✅" : "❌"}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">This is your current/original subject line</p>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview Email A
          </Button>
        </CardContent>
      </Card>

      {/* Variant B (Test) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              B
            </Badge>
            Variant B (Test)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="variantB">Subject Line B (Test) *</Label>
            <Input
              id="variantB"
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              className="mt-2"
              placeholder="Enter subject line..."
            />
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{variantB.length} characters</span>
              <span>•</span>
              <span>Includes emoji: {/[\p{Emoji}]/u.test(variantB) ? "✅" : "❌"}</span>
            </div>
          </div>

          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Tips for effective subject lines:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li>Keep under 50 characters for mobile</li>
                <li>Use action words and urgency</li>
                <li>Personalization increases opens by 26%</li>
                <li>Emojis can increase open rates by 56%</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview Email B
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-6">
        <Button variant="outline">+ Add Variant C (up to 5 variants total)</Button>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Size */}
          <div>
            <Label htmlFor="sampleSize" className="text-base font-semibold">
              Test sample size *
            </Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="sampleSize"
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  className="w-24"
                  min="10"
                  max="50"
                />
                <span>% of total audience ({sampleRecipients} recipients)</span>
              </div>
              <Progress value={Number.parseInt(sampleSize)} className="h-2" />
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Split:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Variant A: {perVariant} recipients (50%)</li>
                  <li>• Variant B: {perVariant} recipients (50%)</li>
                  <li>
                    • Remaining: {remaining} recipients ({100 - Number.parseInt(sampleSize)}%) will receive winning
                    variant
                  </li>
                </ul>
              </div>
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>ℹ️ Recommended: 15-30% for reliable results</AlertDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          {/* Winning Metric */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Winning metric *</Label>
            <RadioGroup value={winningMetric} onValueChange={setWinningMetric} className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="open_rate" id="open_rate" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="open_rate" className="font-medium cursor-pointer">
                    Open Rate (most common for subject line tests)
                  </Label>
                  <p className="text-sm text-muted-foreground">Winner = highest % of recipients who opened the email</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="click_rate" id="click_rate" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="click_rate" className="font-medium cursor-pointer">
                    Click-Through Rate (CTR)
                  </Label>
                  <p className="text-sm text-muted-foreground">Winner = highest % of recipients who clicked a link</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="conversion_rate" id="conversion_rate" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="conversion_rate" className="font-medium cursor-pointer">
                    Conversion Rate
                  </Label>
                  <p className="text-sm text-muted-foreground">Winner = highest % of recipients who made a purchase</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="revenue" id="revenue" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="revenue" className="font-medium cursor-pointer">
                    Revenue
                  </Label>
                  <p className="text-sm text-muted-foreground">Winner = variant that generated most revenue</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Test Duration */}
          <div>
            <Label htmlFor="testDuration" className="text-base font-semibold">
              Test duration *
            </Label>
            <div className="mt-3 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Send test sample, then wait</span>
                <Input
                  id="testDuration"
                  type="number"
                  value={testDuration}
                  onChange={(e) => setTestDuration(e.target.value)}
                  className="w-24"
                  min="1"
                  max="48"
                />
                <span className="text-sm">hours before selecting winner</span>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Winner selection:</Label>
                <RadioGroup value={winnerSelection} onValueChange={setWinnerSelection} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="automatic" id="automatic" />
                    <Label htmlFor="automatic" className="font-normal cursor-pointer">
                      Automatic (send winning variant to remaining audience after duration)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="font-normal cursor-pointer">
                      Manual (I will review results and choose winner)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  ⚠️ If no clear winner after {testDuration} hours, Variant A will be sent to remaining audience. Minimum
                  10% performance difference required.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          {/* Statistical Confidence */}
          <div>
            <Label htmlFor="confidence" className="text-base font-semibold">
              Statistical confidence
            </Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Require</span>
                <Input
                  id="confidence"
                  type="number"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className="w-24"
                  min="80"
                  max="99"
                />
                <span className="text-sm">% confidence level to declare winner</span>
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  With your current sample size ({sampleRecipients}) and estimated performance, you'll likely reach
                  statistical significance within {testDuration} hours if there's a 10%+ difference.
                </AlertDescription>
              </Alert>

              <Button variant="outline" size="sm">
                Calculate Sample Size Needed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="font-semibold">Timeline Preview:</Label>

            <div className="space-y-4 pl-4 border-l-2">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <div className="font-medium">Nov 22, 10:00 AM</div>
                  <div className="text-sm text-muted-foreground">
                    Test variants sent to {sampleRecipients} recipients
                  </div>
                  <ul className="text-sm text-muted-foreground ml-4 mt-1">
                    <li>• {perVariant} receive Variant A</li>
                    <li>• {perVariant} receive Variant B</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <div className="font-medium">Nov 22, 2:00 PM</div>
                  <div className="text-sm text-muted-foreground">Winner selected (automatic)</div>
                  <div className="text-sm text-muted-foreground">
                    Based on {winningMetric.replace("_", " ")} after {testDuration} hours
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <div className="font-medium">Nov 22, 2:05 PM</div>
                  <div className="text-sm text-muted-foreground">Winning variant sent to remaining {remaining}</div>
                  <div className="text-sm text-muted-foreground">Campaign completes</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium">
                Total campaign duration: ~{Number.parseInt(testDuration) + 0.25} hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push(`/campaigns/${params.id}`)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview Test
        </Button>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Launch A/B Test
        </Button>
      </div>
    </div>
  )
}

// A/B Test Results Component
function ABTestResults({ data, router }: { data: any; router: any }) {
  const isRunning = data.status === "running"
  const timeElapsed = isRunning ? "2 hours 15 minutes" : "4 hours"
  const timeRemaining = isRunning ? "1 hour 45 minutes" : "0 minutes"
  const progressPercentage = isRunning ? 56 : 100

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      {/* Header */}
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/campaigns")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Campaign
      </Button>

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">A/B Test Results: Subject Line Test</h1>
        </div>
        <p className="text-muted-foreground">Campaign: Welcome Series - New Customers</p>
      </div>

      {/* Test Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            {isRunning ? (
              <>
                <Zap className="w-6 h-6 text-warning animate-pulse" />
                <h3 className="text-xl font-semibold">Test In Progress</h3>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-success" />
                <h3 className="text-xl font-semibold">Test Complete - Winner Selected</h3>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-muted-foreground">Sent:</span>
              <span className="font-medium ml-2">Nov 22, 10:00 AM</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time elapsed:</span>
              <span className="font-medium ml-2">{timeElapsed}</span>
            </div>
            {isRunning && (
              <div>
                <span className="text-muted-foreground">Time remaining:</span>
                <span className="font-medium ml-2">{timeRemaining}</span>
              </div>
            )}
          </div>

          <Progress value={progressPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground mb-4">{progressPercentage}% complete</p>

          {isRunning ? (
            <>
              <p className="text-sm mb-4">Winner will be selected automatically at 2:00 PM</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  End Test Early
                </Button>
                <Button variant="outline" size="sm">
                  Select Winner Manually
                </Button>
              </div>
            </>
          ) : (
            <Alert className="bg-success/10 border-success">
              <CheckCircle className="w-4 h-4 text-success" />
              <AlertTitle className="text-success">🏆 Winner: Variant B</AlertTitle>
              <AlertDescription>
                Winning variant sent to remaining 958 recipients at 2:00 PM. Campaign completed successfully at 2:12 PM.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Variant Performance Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Variant A */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                A
              </Badge>
              Variant A (Control)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Subject: "Welcome! Here's 20% off"</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Sent to: 120 recipients</p>
                <p>Delivered: 118 (98.3%)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Opens</div>
                  <div className="text-2xl font-bold">45</div>
                  <div className="text-sm text-muted-foreground">38.1%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">10.2%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Conversions</div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">2.5%</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-semibold ml-2">€287</span>
            </div>
          </CardContent>
        </Card>

        {/* Variant B */}
        <Card className={!isRunning ? "border-success border-2" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                B
              </Badge>
              Variant B (Test)
              {!isRunning && <Badge className="bg-success">Winner</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Subject: "🎉 Welcome bonus: 20% off"</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Sent to: 120 recipients</p>
                <p>Delivered: 119 (99.2%)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Opens</div>
                  <div className="text-2xl font-bold text-success">58</div>
                  <div className="text-sm text-success font-semibold">48.7%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                  <div className="text-2xl font-bold text-success">18</div>
                  <div className="text-sm text-success font-semibold">15.1%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Conversions</div>
                  <div className="text-2xl font-bold text-success">7</div>
                  <div className="text-sm text-success font-semibold">5.9%</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-semibold text-success ml-2">€645</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistical Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistical Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-lg font-semibold">🏆 Current Leader: Variant B</h4>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Performance Difference:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                <span>Open Rate:</span>
                <span className="font-semibold text-success">+10.6 percentage points (27.8% improvement) ✅</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                <span>Click Rate:</span>
                <span className="font-semibold text-success">+4.9 percentage points (48.0% improvement) ✅</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                <span>Conversion Rate:</span>
                <span className="font-semibold text-success">+3.4 percentage points (136% improvement) ✅</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Statistical Confidence: {isRunning ? "89.3%" : "96.2%"}</p>
            <Progress value={isRunning ? 89.3 : 96.2} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {isRunning ? "89.3% (need 95% to auto-select)" : "96.2% - High confidence in winner ✅"}
            </p>
          </div>

          {isRunning && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                ℹ️ Variant B is performing significantly better but hasn't reached 95% confidence yet. Test will continue
                until 2:00 PM.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm">
            <span className="text-muted-foreground">Projected winner:</span>
            <span className="font-semibold ml-2">Variant B (87% likelihood)</span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Over Time Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Opens Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1={50 + i * 40}
                  x2="760"
                  y2={50 + i * 40}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
              ))}

              {/* Variant B Line (better performance) */}
              <polyline
                points="80,200 140,180 200,150 260,130 320,110 380,100 440,95 500,90"
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="3"
              />

              {/* Variant A Line (control) */}
              <polyline
                points="80,220 140,210 200,195 260,185 320,180 380,178 440,176 500,175"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />

              {/* Labels */}
              <text x="520" y="95" fontSize="14" fill="hsl(var(--success))" fontWeight="600">
                Variant B
              </text>
              <text x="520" y="180" fontSize="14" fill="hsl(var(--primary))" fontWeight="600">
                Variant A
              </text>

              {/* X-axis labels */}
              {["10AM", "11AM", "12PM", "1PM", "2PM", "3PM"].map((time, i) => (
                <text
                  key={time}
                  x={80 + i * 85}
                  y="270"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                  textAnchor="middle"
                >
                  {time}
                </text>
              ))}

              {/* Y-axis labels */}
              {[0, 10, 20, 30, 40, 50, 60].map((val, i) => (
                <text
                  key={val}
                  x="45"
                  y={250 - i * 40}
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                  textAnchor="end"
                >
                  {val}
                </text>
              ))}
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Variant B pulled ahead after the first hour and maintained its lead
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">📊 View Detailed Analytics</Button>
        {isRunning ? (
          <>
            <Button>🏆 Select Winner Now</Button>
            <Button variant="outline">⏸ Pause Test</Button>
          </>
        ) : (
          <>
            <Button>Use Winner in New Campaign</Button>
            <Button variant="outline">View Full Campaign Results</Button>
          </>
        )}
      </div>
    </div>
  )
}
