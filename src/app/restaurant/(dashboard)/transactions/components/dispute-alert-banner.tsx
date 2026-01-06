"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Eye, Upload, FileText, X } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import type { Dispute } from "../types/dispute-types"

interface DisputeAlertBannerProps {
  dispute: Dispute
  onManageDispute: () => void
  onViewEvidence: () => void
  onAddEvidence: () => void
  onDismiss?: () => void
  variant?: "transaction" | "global"
}

export function DisputeAlertBanner({
  dispute,
  onManageDispute,
  onViewEvidence,
  onAddEvidence,
  onDismiss,
  variant = "transaction",
}: DisputeAlertBannerProps) {
  const daysRemaining = differenceInDays(new Date(dispute.responseDeadline), new Date())
  const isUrgent = daysRemaining <= 2
  const isExpired = daysRemaining < 0

  if (isExpired) {
    return (
      <Alert variant="destructive" className="border-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <AlertTitle className="text-base font-semibold">URGENT: Dispute Response Overdue</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>Dispute {dispute.disputeId} response deadline has passed.</p>
                  <p>
                    Without a response, this dispute will be automatically lost, resulting in:
                    <br />• €{dispute.amount.toFixed(2)} refunded to customer
                    <br />• €{dispute.disputeFee.toFixed(2)} dispute fee charged
                    <br />• Total loss: €{(dispute.amount + dispute.disputeFee).toFixed(2)}
                  </p>
                  <p className="font-medium">Contact your payment processor immediately to request an extension.</p>
                </AlertDescription>
              </div>
              {onDismiss && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={onManageDispute}>
                Contact Support
              </Button>
              <Button size="sm" variant="outline" onClick={onViewEvidence}>
                View Dispute
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <Alert variant={isUrgent ? "destructive" : "default"} className={isUrgent ? "border-2 border-destructive" : ""}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <AlertTitle className="text-base font-semibold">
                {variant === "global" ? "DISPUTE ALERT - ACTION REQUIRED" : "⚠️ DISPUTE ALERT - ACTION REQUIRED"}
              </AlertTitle>
              <AlertDescription className="space-y-2 text-sm">
                <p>
                  {variant === "global"
                    ? `Dispute ${dispute.disputeId} requires your attention`
                    : "This transaction is under dispute by the cardholder."}
                </p>

                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Dispute ID:</span> {dispute.disputeId}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant={dispute.status === "evidence_required" ? "destructive" : "secondary"}>
                      <Clock className="mr-1 h-3 w-3" />
                      {dispute.status.replace("_", " ")}
                    </Badge>
                    <span>•</span>
                    <span className="font-medium">Reason:</span>
                    <span>{dispute.reason}</span>
                  </div>
                  <div>
                    <span className="font-medium">Amount Held:</span> €{dispute.amount.toFixed(2)} •{" "}
                    <span className="font-medium">Dispute Fee:</span> €{dispute.disputeFee.toFixed(2)} (if lost)
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Response Deadline:</span>
                    <span>{format(new Date(dispute.responseDeadline), "MMM dd, yyyy")}</span>
                    <Badge variant={isUrgent ? "destructive" : "secondary"} className="ml-2">
                      {daysRemaining} days remaining
                    </Badge>
                  </div>
                  {dispute.winProbability !== undefined && (
                    <div>
                      <span className="font-medium">Win Probability:</span> {dispute.winProbability}% (
                      {dispute.winProbability >= 70 ? "High" : dispute.winProbability >= 40 ? "Medium" : "Low"}){" "}
                      {dispute.winProbability < 70 && "- More evidence needed"}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onManageDispute}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Dispute
            </Button>
            <Button size="sm" variant="outline" onClick={onViewEvidence}>
              <Eye className="mr-2 h-4 w-4" />
              View Evidence
            </Button>
            <Button size="sm" variant="outline" onClick={onAddEvidence}>
              <Upload className="mr-2 h-4 w-4" />
              Add Evidence
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  )
}

interface MultipleDisputesAlertProps {
  disputes: Array<{
    disputeId: string
    amount: number
    reason: string
    daysToRespond: number
  }>
  totalAtRisk: number
  totalFees: number
  onReviewDisputes: () => void
  onDismiss: () => void
}

export function MultipleDisputesAlert({
  disputes,
  totalAtRisk,
  totalFees,
  onReviewDisputes,
  onDismiss,
}: MultipleDisputesAlertProps) {
  return (
    <Alert variant="destructive" className="border-2">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <AlertTitle className="text-base font-semibold">
                ⚠️ {disputes.length} New Disputes Require Your Attention
              </AlertTitle>
              <AlertDescription className="space-y-2 text-sm">
                {disputes.map((d) => (
                  <p key={d.disputeId}>
                    • Dispute {d.disputeId} - €{d.amount.toFixed(2)} - {d.reason} - {d.daysToRespond} days to respond
                  </p>
                ))}
                <p className="font-medium mt-2">
                  Total at risk: €{totalAtRisk.toFixed(2)} + up to €{totalFees.toFixed(2)} in fees
                </p>
              </AlertDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={onReviewDisputes}>
              Review Disputes
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  )
}
