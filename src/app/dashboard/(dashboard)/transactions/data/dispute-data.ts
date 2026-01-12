import type { Dispute, DisputeSummary } from "../types/dispute-types"
import { addDays, subDays, format } from "date-fns"

export function getDisputeForTransaction(transactionId: string): Dispute | null {
  // Return dispute for specific transaction patterns
  if (transactionId.endsWith("9")) {
    return generateDispute(transactionId, "under_review")
  }
  return null
}

export function generateDispute(transactionId: string, status: Dispute["status"]): Dispute {
  const now = new Date()
  const initiatedAt = subDays(now, 2)
  const responseDeadline = addDays(initiatedAt, 7)

  const dispute: Dispute = {
    disputeId: `dp_${format(initiatedAt, "yyyyMMdd")}_001`,
    transactionId,
    chargebackId: `cb_${format(initiatedAt, "yyyyMMdd")}_001`,
    type: "chargeback",
    status,
    amount: 89.0,
    currency: "EUR",
    disputeFee: 15.0,
    reason: "Fraudulent Transaction",
    reasonCode: "10.4",
    reasonDescription: "Card-absent fraud",
    cardholderClaim:
      "I did not authorize this transaction. My card was stolen and I did not make this purchase. I have never visited this merchant and do not recognize this charge.",
    cardholderEvidence: ["police_report.pdf", "affidavit.pdf"],
    network: "visa",
    caseId: "CN-2024-1118-001",
    initiatedAt: initiatedAt.toISOString(),
    responseDeadline: responseDeadline.toISOString(),
    expectedDecisionDate: addDays(initiatedAt, 65).toISOString(),
    evidence: [],
    timeline: [
      {
        eventId: "evt_001",
        disputeId: `dp_${format(initiatedAt, "yyyyMMdd")}_001`,
        event: "received",
        description: "Chargeback filed by cardholder's bank",
        actor: "visa_network",
        actorName: "Visa Network",
        createdAt: initiatedAt.toISOString(),
        metadata: {
          reason: "Fraudulent Transaction (10.4)",
          amount: 89.0,
        },
      },
      {
        eventId: "evt_002",
        disputeId: `dp_${format(initiatedAt, "yyyyMMdd")}_001`,
        event: "notification_sent",
        description: "Email sent to: owner@berrytap.com, manager@berrytap.com",
        actor: "system",
        actorName: "System",
        createdAt: addDays(initiatedAt, 0, { hours: 0, minutes: 1 } as any).toISOString(),
      },
      {
        eventId: "evt_003",
        disputeId: `dp_${format(initiatedAt, "yyyyMMdd")}_001`,
        event: "amount_held",
        description: "€89.00 held from available balance",
        actor: "payment_processor",
        actorName: "Payment Processor",
        createdAt: addDays(initiatedAt, 0, { hours: 0, minutes: 2 } as any).toISOString(),
      },
    ],
    winProbability: 45,
    winProbabilityFactors: [
      { factor: "Delivery confirmation available", impact: 20, present: true },
      { factor: "Customer signature on file", impact: 15, present: true },
      { factor: "IP address matches customer location", impact: 10, present: true },
      { factor: "No 3D Secure authentication", impact: -25, present: false },
      { factor: "High-risk transaction flags", impact: -15, present: true },
      { factor: "No customer communication history", impact: -10, present: false },
    ],
    recommendations: [
      {
        recommendationId: "rec_001",
        priority: "high",
        impact: 15,
        title: "Add IP Address Evidence",
        description:
          "The transaction originated from IP: 194.32.xxx.xxx\nLocation: Malta (matches customer billing address)\nDevice: Mobile (iOS 17.0, Safari)\n\nThis strongly suggests the customer made the purchase.",
        actionType: "auto_generate",
        actionLabel: "Generate IP Report",
        available: true,
        completed: false,
        evidenceType: "ip_address",
      },
      {
        recommendationId: "rec_002",
        priority: "high",
        impact: 10,
        title: "Include AVS/CVV Verification",
        description:
          "AVS Result: Match (address and ZIP)\nCVV Result: Match\n\nPassing both checks indicates card was present.",
        actionType: "auto_generate",
        actionLabel: "Generate Verification Report",
        available: true,
        completed: false,
        evidenceType: "avs_cvv",
      },
      {
        recommendationId: "rec_003",
        priority: "high",
        impact: 5,
        title: "Add Customer Purchase History",
        description:
          "Customer has made 8 previous purchases:\n• Total value: €567.80\n• All successful, no disputes\n• Similar transaction patterns\n\nLong purchase history supports legitimate transaction.",
        actionType: "auto_generate",
        actionLabel: "Generate History Report",
        available: true,
        completed: false,
        evidenceType: "purchase_history",
      },
    ],
    notifications: [
      {
        type: "dispute_received",
        sentTo: "owner@berrytap.com",
        sentAt: initiatedAt.toISOString(),
        status: "delivered",
      },
    ],
  }

  // Add submitted evidence if status is submitted or under_review
  if (status === "submitted" || status === "under_review") {
    dispute.evidence = [
      {
        evidenceId: "evd_001",
        disputeId: dispute.disputeId,
        type: "receipt",
        files: [
          {
            fileId: "file_001",
            filename: "receipt_001.pdf",
            fileType: "application/pdf",
            fileSize: 234000,
            url: "/placeholder-receipt.pdf",
            uploadedAt: addDays(initiatedAt, 0, { hours: 5, minutes: 30 } as any).toISOString(),
            uploadedBy: "sarah@berrytap.com",
          },
        ],
        createdAt: addDays(initiatedAt, 0, { hours: 5, minutes: 30 } as any).toISOString(),
        createdBy: "sarah@berrytap.com",
        createdByName: "Sarah Johnson",
      },
      {
        evidenceId: "evd_002",
        disputeId: dispute.disputeId,
        type: "signature",
        files: [
          {
            fileId: "file_002",
            filename: "signature_scan.jpg",
            fileType: "image/jpeg",
            fileSize: 1200000,
            url: "/placeholder-signature.jpg",
            uploadedAt: addDays(initiatedAt, 0, { hours: 5, minutes: 32 } as any).toISOString(),
            uploadedBy: "sarah@berrytap.com",
          },
        ],
        createdAt: addDays(initiatedAt, 0, { hours: 5, minutes: 32 } as any).toISOString(),
        createdBy: "sarah@berrytap.com",
        createdByName: "Sarah Johnson",
      },
    ]

    dispute.timeline.push(
      {
        eventId: "evt_004",
        disputeId: dispute.disputeId,
        event: "evidence_uploaded",
        description: "4 documents uploaded (2.6 MB total)",
        actor: "sarah@berrytap.com",
        actorName: "Sarah Johnson (Manager)",
        createdAt: addDays(initiatedAt, 0, { hours: 5, minutes: 30 } as any).toISOString(),
      },
      {
        eventId: "evt_005",
        disputeId: dispute.disputeId,
        event: "response_submitted",
        description: "Dispute response sent to card network",
        actor: "sarah@berrytap.com",
        actorName: "Sarah Johnson (Manager)",
        createdAt: addDays(initiatedAt, 0, { hours: 5, minutes: 45 } as any).toISOString(),
      },
      {
        eventId: "evt_006",
        disputeId: dispute.disputeId,
        event: "response_acknowledged",
        description: "Card network confirmed receipt",
        actor: "visa_network",
        actorName: "Visa Network",
        createdAt: addDays(initiatedAt, 0, { hours: 5, minutes: 46 } as any).toISOString(),
      },
    )

    dispute.submittedBy = "sarah@berrytap.com"
    dispute.submittedByName = "Sarah Johnson"
    dispute.submittedAt = addDays(initiatedAt, 0, { hours: 5, minutes: 45 } as any).toISOString()
    dispute.winProbability = 75
  }

  return dispute
}

export const mockDisputes: Dispute[] = [
  generateDispute("tx_20241110_0089", "evidence_required"),
  {
    ...generateDispute("tx_20241112_0123", "evidence_required"),
    disputeId: "dp_20241119_002",
    chargebackId: "cb_20241119_002",
    transactionId: "tx_20241112_0123",
    amount: 234.5,
    reason: "Product Not Received",
    reasonCode: "13.1",
    reasonDescription: "Services not provided or merchandise not received",
    initiatedAt: subDays(new Date(), 1).toISOString(),
    responseDeadline: addDays(new Date(), 6).toISOString(),
  },
  {
    ...generateDispute("tx_20241108_0067", "under_review"),
    disputeId: "dp_20241115_003",
    chargebackId: "cb_20241115_003",
    transactionId: "tx_20241108_0067",
    amount: 45.5,
    status: "under_review",
    initiatedAt: subDays(new Date(), 15).toISOString(),
  },
]

export function getDisputeSummary(): DisputeSummary {
  return {
    activeDisputes: 8,
    awaitingResponse: 2,
    underReview: 6,
    thisMonth: 12,
    monthlyWinRate: 75,
    amountAtRisk: 823.5,
    potentialFees: 120.0,
    wonLast30Days: {
      count: 9,
      amount: 1234.5,
    },
    lostLast30Days: {
      count: 3,
      amount: 456.8,
    },
  }
}
