"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircleIcon,
  TrendingUp,
  Zap,
  Target,
  ChevronRight,
  Info,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import type { Dispute } from "../types/dispute-types"

interface ManageDisputeModalProps {
  dispute: Dispute
  open: boolean
  onClose: () => void
  onSubmitResponse: (data: { statement: string; confirmAccurate: boolean; confirmFinal: boolean }) => void
}

export function ManageDisputeModal({ dispute, open, onClose, onSubmitResponse }: ManageDisputeModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [responseStatement, setResponseStatement] = useState("")
  const [confirmAccurate, setConfirmAccurate] = useState(false)
  const [confirmFinal, setConfirmFinal] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const daysRemaining = differenceInDays(new Date(dispute.responseDeadline), new Date())
  const hoursRemaining = Math.floor((differenceInDays(new Date(dispute.responseDeadline), new Date()) * 24) % 24)

  const getWinProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-success"
    if (prob >= 40) return "text-warning"
    return "text-destructive"
  }

  const getProbabilityLabel = (prob: number) => {
    if (prob >= 70) return "High"
    if (prob >= 40) return "Medium"
    return "Low"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-xl">Manage Dispute: {dispute.disputeId}</DialogTitle>
            </DialogHeader>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">
                  Evidence{" "}
                  {dispute.evidence.length > 0 && <Badge className="ml-2 h-5">{dispute.evidence.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dispute Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Dispute ID:</span>
                        <div className="font-medium">{dispute.disputeId}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div>
                          <Badge variant="secondary" className="capitalize">
                            <Clock className="mr-1 h-3 w-3" />
                            {dispute.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transaction:</span>
                        <div className="font-medium">{dispute.transactionId}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="font-medium capitalize">{dispute.type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium">€{dispute.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <div className="font-medium capitalize">{dispute.network}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dispute Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reason:</span>
                      <div className="font-medium">{dispute.reason}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason Code:</span>
                      <div className="font-medium">
                        {dispute.reasonCode} ({dispute.reasonDescription})
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Initiated:</span>
                      <div>{format(new Date(dispute.initiatedAt), "MMM dd, yyyy 'at' h:mm a")}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Response Deadline:</span>
                      <div className="flex items-center gap-2">
                        <span>{format(new Date(dispute.responseDeadline), "MMM dd, yyyy 'at' h:mm a")}</span>
                        <Badge variant={daysRemaining <= 2 ? "destructive" : "secondary"}>
                          <Clock className="mr-1 h-3 w-3" />
                          {daysRemaining} days, {hoursRemaining} hours
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Amount at Risk:</span>
                      <div>€{dispute.amount.toFixed(2)} (transaction amount)</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dispute Fee:</span>
                      <div>€{dispute.disputeFee.toFixed(2)} (if lost)</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold">Total at Risk:</span>
                      <div className="font-semibold">€{(dispute.amount + dispute.disputeFee).toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cardholder's Claim</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">The cardholder states:</span>
                      <p className="mt-2 italic">"{dispute.cardholderClaim}"</p>
                    </div>
                    {dispute.cardholderEvidence && dispute.cardholderEvidence.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-muted-foreground">Supporting Documents Provided by Cardholder:</span>
                          <ul className="mt-2 space-y-1">
                            {dispute.cardholderEvidence.map((doc, idx) => (
                              <li key={idx}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {dispute.winProbability !== undefined && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Win Probability Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Current Win Probability:</span>
                          <span className={`text-xl font-bold ${getWinProbabilityColor(dispute.winProbability)}`}>
                            {dispute.winProbability}% ({getProbabilityLabel(dispute.winProbability)})
                          </span>
                        </div>
                        <Progress value={dispute.winProbability} className="h-3" />
                      </div>

                      {dispute.winProbabilityFactors && dispute.winProbabilityFactors.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <div className="text-sm font-medium mb-3">Strength Analysis:</div>
                            <div className="space-y-2">
                              {dispute.winProbabilityFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  {factor.present ? (
                                    factor.impact > 0 ? (
                                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                                    ) : (
                                      <AlertCircleIcon className="h-4 w-4 text-warning mt-0.5" />
                                    )
                                  ) : (
                                    <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                                  )}
                                  <span>
                                    {factor.factor} ({factor.impact > 0 ? "+" : ""}
                                    {factor.impact}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {dispute.recommendations && dispute.recommendations.filter((r) => !r.completed).length > 0 && (
                        <>
                          <Separator />
                          <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span>To improve your chances:</span>
                              </div>
                              <ul className="space-y-1 text-sm">
                                {dispute.recommendations
                                  .filter((r) => !r.completed)
                                  .slice(0, 3)
                                  .map((rec, idx) => (
                                    <li key={idx}>
                                      • {rec.title} (+{rec.impact}%)
                                    </li>
                                  ))}
                              </ul>
                              <div className="text-sm font-medium pt-2">
                                Potential win probability with improvements:{" "}
                                {dispute.winProbability +
                                  dispute.recommendations
                                    .filter((r) => !r.completed)
                                    .reduce((sum, r) => sum + r.impact, 0)}
                                %
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="space-y-4 mt-6">
                <EvidenceTab dispute={dispute} />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4 mt-6">
                <TimelineTab dispute={dispute} />
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4 mt-6">
                <RecommendationsTab dispute={dispute} />
              </TabsContent>
            </Tabs>

            {/* Footer Actions */}
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === "evidence") {
                    setActiveTab("recommendations")
                  } else if (activeTab === "recommendations") {
                    setShowSubmitConfirm(true)
                  } else {
                    setActiveTab("evidence")
                  }
                }}
              >
                {activeTab === "evidence"
                  ? "Next"
                  : activeTab === "recommendations"
                    ? "Submit Response"
                    : "View Evidence"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <SubmitResponseDialog
          dispute={dispute}
          open={showSubmitConfirm}
          onClose={() => setShowSubmitConfirm(false)}
          onSubmit={(data) => {
            onSubmitResponse(data)
            setShowSubmitConfirm(false)
            onClose()
          }}
        />
      )}
    </Dialog>
  )
}

// Evidence Tab Component
function EvidenceTab({ dispute }: { dispute: Dispute }) {
  const [selectedEvidenceType, setSelectedEvidenceType] = useState("")
  const [evidenceDescription, setEvidenceDescription] = useState("")

  const evidenceTypes = [
    "Receipt/Invoice",
    "Customer Signature",
    "Delivery Confirmation",
    "Customer Communication (emails, SMS, chat)",
    "Photos of Product/Service",
    "Tracking Information",
    "Terms & Conditions",
    "Refund/Cancellation Policy",
    "Customer Account History",
    "IP Address & Device Info",
    "AVS/CVV Verification",
    "Previous Purchase History",
    "Other (specify)",
  ]

  const requiredEvidence = [
    { type: "Receipt/Invoice", status: "uploaded", file: "receipt_001.pdf" },
    { type: "Customer Signature", status: "uploaded", file: "signature_scan.jpg" },
    { type: "Delivery Confirmation", status: "uploaded", file: "delivery_proof.pdf" },
    { type: "Customer Communication", status: "uploaded", file: "email_thread.pdf" },
    { type: "AVS/CVV Verification Details", status: "recommended", file: null },
    { type: "IP Address & Device Fingerprint", status: "recommended", file: null },
    { type: "3D Secure Authentication", status: "unavailable", file: null },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-medium">Required Evidence for Fraud Claims:</div>
          {requiredEvidence.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-start gap-3">
                {item.status === "uploaded" ? (
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                ) : item.status === "recommended" ? (
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-medium">
                    {item.type} ({item.status})
                  </div>
                  {item.file && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{item.file}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                  {item.status === "recommended" && (
                    <div className="text-sm text-muted-foreground">
                      {item.type.includes("AVS")
                        ? "Helps prove card was present"
                        : "Shows transaction came from customer's device"}
                      <div className="mt-1">
                        <Button size="sm" variant="outline">
                          + Add Evidence
                        </Button>
                      </div>
                    </div>
                  )}
                  {item.status === "unavailable" && (
                    <div className="text-sm text-muted-foreground">
                      Transaction did not use 3D Secure. Cannot be added retroactively.
                    </div>
                  )}
                </div>
              </div>
              {idx < requiredEvidence.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Evidence Type:</Label>
            <Select value={selectedEvidenceType} onValueChange={setSelectedEvidenceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {evidenceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Files:</Label>
            <Card className="border-dashed mt-2">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, JPG, PNG, DOCX • Max size: 5 MB per file • Max files: 10 total
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Label>Description (optional):</Label>
            <Textarea
              placeholder="Receipt from in-store purchase showing customer signature and date matching transaction."
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">{evidenceDescription.length}/500 characters</div>
          </div>

          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Evidence
          </Button>
        </CardContent>
      </Card>

      {dispute.evidence.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Uploaded Evidence ({dispute.evidence.length})</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dispute.evidence.map((evidence, idx) => (
              <Card key={evidence.evidenceId} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{evidence.files[0]?.filename}</span>
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        Type: {evidence.type.replace("_", " ")} • Size: {Math.round(evidence.files[0]?.fileSize / 1024)}{" "}
                        KB
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uploaded: {format(new Date(evidence.createdAt), "MMM dd, h:mm a")} by {evidence.createdByName}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Timeline Tab Component
function TimelineTab({ dispute }: { dispute: Dispute }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dispute Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dispute.timeline.map((event, idx) => (
          <div key={event.eventId} className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {event.event === "received" || event.event === "response_submitted" ? (
                <div className="h-2 w-2 rounded-full bg-primary" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1 pb-4">
              <div className="text-sm font-medium">{format(new Date(event.createdAt), "MMM dd, yyyy h:mm a")}</div>
              <div className="text-sm font-semibold capitalize">{event.event.replace(/_/g, " ")}</div>
              <div className="text-sm text-muted-foreground">{event.description}</div>
              {event.metadata && (
                <div className="text-xs text-muted-foreground">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key}>
                      {key}: {typeof value === "number" ? `€${value.toFixed(2)}` : value}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">By: {event.actorName || event.actor}</div>
            </div>
          </div>
        ))}

        {/* Future expected events */}
        <div className="flex gap-3 opacity-60">
          <div className="flex-shrink-0 mt-1">
            <div className="h-2 w-2 rounded-full border-2 border-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium">
              {format(new Date(dispute.responseDeadline), "MMM dd, yyyy 'at' h:mm a")} (expected)
            </div>
            <div className="text-sm font-semibold">Response Deadline</div>
            <div className="text-sm text-muted-foreground">Last day to submit additional evidence</div>
            <div className="text-xs text-muted-foreground">
              Status:{" "}
              {dispute.status === "submitted" || dispute.status === "under_review"
                ? "Met (response already submitted)"
                : "Pending"}
            </div>
          </div>
        </div>

        {dispute.expectedDecisionDate && (
          <div className="flex gap-3 opacity-60">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 rounded-full border-2 border-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium">
                {format(new Date(dispute.expectedDecisionDate), "MMM dd, yyyy")} (estimated)
              </div>
              <div className="text-sm font-semibold">Expected Outcome</div>
              <div className="text-sm text-muted-foreground">Card network to review evidence</div>
              <div className="text-xs text-muted-foreground">Decision typically within 60-75 days</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Recommendations Tab Component
function RecommendationsTab({ dispute }: { dispute: Dispute }) {
  if (!dispute.recommendations || dispute.recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2" />
          <p>No recommendations available at this time</p>
        </CardContent>
      </Card>
    )
  }

  const highImpact = dispute.recommendations.filter((r) => r.priority === "high" && !r.completed)
  const mediumImpact = dispute.recommendations.filter((r) => r.priority === "medium" && !r.completed)

  return (
    <div className="space-y-4">
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Based on dispute type ({dispute.reason} - {dispute.reasonCode}) and available data:
          </p>
        </CardContent>
      </Card>

      {highImpact.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              HIGH IMPACT ACTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highImpact.map((rec, idx) => (
              <div key={rec.recommendationId}>
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">
                          {idx + 1}. {rec.title} (+{rec.impact}% win probability)
                        </div>
                        <Badge variant="success" className="text-xs">
                          {rec.available ? "✅ Available in system" : "⚠️ Manual upload required"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">{rec.description}</div>
                    <div className="flex gap-2">
                      {rec.actionType === "auto_generate" ? (
                        <>
                          <Button size="sm">+ Generate {rec.evidenceType?.replace("_", " ")} Report</Button>
                          <Button size="sm" variant="outline">
                            Add to Evidence
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">+ {rec.actionLabel}</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                {idx < highImpact.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {mediumImpact.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              MEDIUM IMPACT ACTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mediumImpact.map((rec, idx) => (
              <div key={rec.recommendationId}>
                <div className="space-y-2">
                  <div className="font-medium">
                    {highImpact.length + idx + 1}. {rec.title} (+{rec.impact}% win probability)
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    ⚠️ {rec.available ? "Available" : "Manual upload required"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">{rec.description}</div>
                  <Button size="sm" variant="outline">
                    + {rec.actionLabel}
                  </Button>
                </div>
                {idx < mediumImpact.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            THINGS TO AVOID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            <li>• Don't admit fault or uncertainty</li>
            <li>• Don't include customer's personal attacks</li>
            <li>• Don't submit duplicate evidence</li>
            <li>• Don't miss the deadline ({format(new Date(dispute.responseDeadline), "MMM dd, yyyy")})</li>
            <li>• Don't submit poor quality scans</li>
          </ul>
        </CardContent>
      </Card>

      {dispute.winProbability !== undefined && (
        <Card className="bg-primary/5 border-primary/50">
          <CardHeader>
            <CardTitle className="text-base">ESTIMATED OUTCOME</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Current Win Probability:</span> {dispute.winProbability}% →{" "}
              {dispute.winProbability +
                dispute.recommendations.filter((r) => !r.completed).reduce((sum, r) => sum + r.impact, 0)}
              %{" (if all actions taken)"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Recommended:</span> Take all {highImpact.length} high-impact actions before
              deadline.
            </div>
            <div className="text-sm text-muted-foreground">Time to complete: ~15 minutes</div>
            <Button className="w-full">Add All Recommended Evidence</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Submit Response Dialog
function SubmitResponseDialog({
  dispute,
  open,
  onClose,
  onSubmit,
}: {
  dispute: Dispute
  open: boolean
  onClose: () => void
  onSubmit: (data: { statement: string; confirmAccurate: boolean; confirmFinal: boolean }) => void
}) {
  const [statement, setStatement] = useState("")
  const [confirmAccurate, setConfirmAccurate] = useState(false)
  const [confirmFinal, setConfirmFinal] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Dispute Response</DialogTitle>
          <DialogDescription>You are about to submit your dispute response to the card network.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Dispute ID:</span>
                  <div>{dispute.disputeId}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction:</span>
                  <div>
                    {dispute.transactionId} (€{dispute.amount.toFixed(2)})
                  </div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span> {dispute.reason} ({dispute.reasonCode})
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground">Evidence Submitted:</span> {dispute.evidence.length} documents (
                {(
                  dispute.evidence.reduce((sum, e) => sum + e.files.reduce((s, f) => s + f.fileSize, 0), 0) /
                  1024 /
                  1024
                ).toFixed(1)}{" "}
                MB total)
              </div>
              {dispute.evidence.map((e) => (
                <div key={e.evidenceId} className="text-xs pl-4">
                  ✅ {e.type.replace("_", " ")}
                </div>
              ))}
              <Separator />
              <div>
                <span className="text-muted-foreground">Win Probability:</span>{" "}
                <span className="font-medium">{dispute.winProbability}%</span>{" "}
                {dispute.winProbability && dispute.winProbability >= 70
                  ? "(High)"
                  : dispute.winProbability && dispute.winProbability >= 40
                    ? "(Medium)"
                    : "(Low)"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="font-medium">What happens next:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your evidence will be sent to the card network</li>
                <li>The cardholder's bank will review your response</li>
                <li>A decision will be made within 60-75 days</li>
                <li>You'll be notified of the outcome via email</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Important:
              </div>
              <ul className="space-y-1">
                <li>• Once submitted, you cannot add more evidence</li>
                <li>• Make sure all evidence is complete and accurate</li>
                <li>• You can still add evidence until {format(new Date(dispute.responseDeadline), "MMM dd, yyyy")}</li>
              </ul>
            </CardContent>
          </Card>

          <div>
            <Label>Response statement (optional):</Label>
            <Textarea
              placeholder="This transaction was legitimate. The customer made an in-store purchase and signed the receipt..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              maxLength={500}
              rows={4}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">{statement.length}/500 characters</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accurate"
                checked={confirmAccurate}
                onCheckedChange={(checked) => setConfirmAccurate(checked as boolean)}
              />
              <label
                htmlFor="accurate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm all evidence is accurate and complete
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="final"
                checked={confirmFinal}
                onCheckedChange={(checked) => setConfirmFinal(checked as boolean)}
              />
              <label
                htmlFor="final"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this submission is final
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!confirmAccurate || !confirmFinal}
            onClick={() =>
              onSubmit({
                statement,
                confirmAccurate,
                confirmFinal,
              })
            }
          >
            Submit Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
