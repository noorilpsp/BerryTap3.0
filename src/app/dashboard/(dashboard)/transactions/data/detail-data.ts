import type { TransactionDetail } from "../types/detail-types"

// Mock transaction detail data
export function getTransactionDetail(transactionId: string): TransactionDetail {
  // Simulate different transaction scenarios based on ID
  const idNum = Number.parseInt(transactionId.split("_").pop() || "0")

  // Successful transaction (default)
  if (idNum % 10 === 1 || idNum < 10) {
    return {
      transactionId,
      type: "charge",
      status: "succeeded",
      amount: 45.5,
      currency: "EUR",
      fees: 1.36,
      net: 44.14,

      feeBreakdown: {
        baseRate: 1.32,
        baseRatePercentage: 2.9,
        fixedFee: 0.04,
        effectiveRate: 2.99,
      },

      paymentMethod: {
        type: "card",
        brand: "visa",
        last4: "4242",
        cardholderName: "SARAH MITCHELL",
        expMonth: 12,
        expYear: 2025,
        funding: "credit",
        country: "MT",
      },

      channel: "dine_in",

      order: {
        orderId: "ord_1234",
        orderNumber: "1234",
        tableNumber: "12",
        items: [
          { name: "Margherita Pizza", quantity: 1, price: 12.5 },
          { name: "House Red Wine", quantity: 2, price: 9.0 },
          { name: "Tiramisu", quantity: 1, price: 7.0 },
        ],
        subtotal: 37.5,
        tax: 6.75,
        tip: 8.0,
        total: 52.25,
        customer: {
          customerId: "cus_001",
          name: "Sarah Mitchell",
          email: "sarah.m@email.com",
          phone: "+356 9945 1234",
          loyaltyTier: "gold",
          loyaltyPoints: 2345,
        },
        server: {
          staffId: "staff_01",
          name: "John Smith",
          role: "server",
        },
        shift: "evening",
      },

      location: {
        locationId: "loc_01",
        name: "Valletta Main",
        address: "123 Main Street, Valletta VLT 1234, Malta",
      },

      terminal: {
        terminalId: "term_05",
        name: "POS Terminal 5",
        type: "countertop",
      },

      processor: {
        provider: "Stripe",
        processorId: "ch_1A2B3C4D5E6F",
        paymentIntentId: "pi_1A2B3C4D5E6F",
        payoutId: "po_20241122_001",
        authCode: "123456",
        riskScore: 12,
        riskLevel: "low",
        fraudDetection: "passed",
        threeDSecure: false,
        rawResponse: {
          id: "ch_1A2B3C4D5E6F",
          object: "charge",
          amount: 4550,
          currency: "eur",
          status: "succeeded",
          payment_method: "pm_1X2Y3Z",
          payment_method_details: {
            type: "card",
            card: {
              brand: "visa",
              last4: "4242",
              exp_month: 12,
              exp_year: 2025,
              funding: "credit",
              country: "MT",
            },
          },
          receipt_url: "https://receipts.stripe.com/...",
          created: 1700507040,
          paid: true,
          captured: true,
          application_fee_amount: 136,
        },
      },

      timeline: [
        {
          event: "created",
          timestamp: "2024-11-20T19:24:00+01:00",
          actor: "POS Terminal term_05",
          details: "Transaction created for Order #1234",
          status: "completed",
        },
        {
          event: "authorized",
          timestamp: "2024-11-20T19:24:02+01:00",
          actor: "Stripe",
          details: "Payment authorized, Auth code: 123456",
          status: "completed",
        },
        {
          event: "captured",
          timestamp: "2024-11-20T19:24:05+01:00",
          actor: "System",
          details: "Payment captured, Net: €44.14 (after fees)",
          status: "completed",
        },
        {
          event: "receipt_sent",
          timestamp: "2024-11-20T19:25:00+01:00",
          actor: "System",
          details: "Receipt emailed to sarah.m@email.com",
          status: "completed",
        },
        {
          event: "tip_added",
          timestamp: "2024-11-20T19:30:00+01:00",
          actor: "Customer",
          details: "Tip added: €8.00",
          status: "completed",
        },
        {
          event: "payout_scheduled",
          timestamp: "2024-11-22T00:00:00+01:00",
          actor: "System",
          details: "Payout scheduled: po_20241122_001",
          status: "pending",
        },
      ],

      refunds: [],
      chargebacks: [],

      metadata: {
        tags: ["high-value", "reviewed"],
        notes: [
          {
            noteId: "note_001",
            type: "internal",
            content: "Customer requested no paper receipt. Emailed digital copy as requested.",
            author: "John Smith",
            authorId: "staff_01",
            authorRole: "Server",
            createdAt: "2024-11-20T19:25:00+01:00",
            pinned: true,
          },
        ],
        customFields: {
          reference: "REF-2024-1234",
          campaign: "Weekend Special",
          promoCode: "WEEKEND20",
        },
      },

      receipt: {
        sent: true,
        sentTo: "sarah.m@email.com",
        sentAt: "2024-11-20T19:25:00+01:00",
        deliveryStatus: "delivered",
        receiptUrl: "https://receipts.berrytap.com/tx_20241120_0001.pdf",
      },

      relatedTransactions: {
        sameOrder: ["tx_0002"],
        sameCustomer: {
          count: 4,
          total: 234.75,
          last30Days: [
            { transactionId: "tx_0089", amount: 67.5, date: "2024-11-18" },
            { transactionId: "tx_0045", amount: 45.25, date: "2024-11-15" },
            { transactionId: "tx_0023", amount: 78.5, date: "2024-11-12" },
          ],
        },
        sameCard: {
          count: 8,
          total: 456.3,
          last90Days: [],
        },
      },

      createdAt: "2024-11-20T19:24:00+01:00",
      updatedAt: "2024-11-20T19:30:00+01:00",
      settledAt: undefined,
      expectedPayoutDate: "2024-11-22T00:00:00+01:00",
    }
  }

  // Failed transaction
  if (idNum % 10 === 6) {
    return {
      transactionId,
      type: "charge",
      status: "failed",
      amount: 67.2,
      currency: "EUR",
      fees: 0,
      net: 0,

      feeBreakdown: {
        baseRate: 0,
        baseRatePercentage: 2.9,
        fixedFee: 0,
        effectiveRate: 0,
      },

      paymentMethod: {
        type: "card",
        brand: "visa",
        last4: "XXXX",
      },

      channel: "online",

      processor: {
        provider: "Stripe",
        processorId: `ch_failed_${idNum}`,
        riskLevel: "low",
      },

      timeline: [
        {
          event: "created",
          timestamp: "2024-11-20T15:12:00+01:00",
          actor: "Web Checkout",
          details: "Transaction created for Order #1237",
          status: "completed",
        },
        {
          event: "authorization_attempted",
          timestamp: "2024-11-20T15:12:02+01:00",
          actor: "Stripe",
          details: "Payment authorization attempted, Amount: €67.20",
          status: "completed",
        },
        {
          event: "payment_failed",
          timestamp: "2024-11-20T15:12:03+01:00",
          actor: "Payment Processor",
          details: "Error: card_declined - Insufficient funds",
          status: "failed",
        },
        {
          event: "customer_notified",
          timestamp: "2024-11-20T15:13:00+01:00",
          actor: "System",
          details: 'Email sent to: temp@email.com, Subject: "Payment Failed"',
          status: "completed",
        },
      ],

      refunds: [],
      chargebacks: [],

      metadata: {
        tags: [],
        notes: [],
      },

      createdAt: "2024-11-20T15:12:00+01:00",
      updatedAt: "2024-11-20T15:12:03+01:00",
    }
  }

  // Partially refunded transaction
  if (idNum % 10 === 5) {
    return {
      transactionId,
      type: "charge",
      status: "partially_refunded",
      amount: 125.0,
      currency: "EUR",
      fees: 3.75,
      net: 96.25,

      feeBreakdown: {
        baseRate: 3.63,
        baseRatePercentage: 2.9,
        fixedFee: 0.12,
        effectiveRate: 3.0,
      },

      paymentMethod: {
        type: "card",
        brand: "mastercard",
        last4: "5555",
        cardholderName: "JOHN DOE",
        funding: "credit",
      },

      channel: "delivery",

      processor: {
        provider: "Stripe",
        processorId: `ch_${idNum}`,
        riskLevel: "low",
      },

      timeline: [
        {
          event: "created",
          timestamp: "2024-11-15T14:30:00+01:00",
          actor: "Online Order System",
          details: "Transaction created for Order #1456 • Delivery",
          status: "completed",
        },
        {
          event: "authorized",
          timestamp: "2024-11-15T14:30:02+01:00",
          actor: "Stripe",
          details: "Payment authorized, Auth code: 789012",
          status: "completed",
        },
        {
          event: "captured",
          timestamp: "2024-11-15T14:30:05+01:00",
          actor: "System",
          details: "Payment captured, Net: €121.25 (after fees)",
          status: "completed",
        },
        {
          event: "receipt_sent",
          timestamp: "2024-11-15T14:31:00+01:00",
          actor: "System",
          details: "Receipt emailed to customer@email.com",
          status: "completed",
        },
        {
          event: "refund_initiated",
          timestamp: "2024-11-16T15:45:00+01:00",
          actor: "Sarah Johnson (Manager)",
          details: "Refund initiated with manager PIN authorization",
          status: "completed",
        },
        {
          event: "refund_completed",
          timestamp: "2024-11-16T15:47:00+01:00",
          actor: "Sarah Johnson",
          details: "Amount: €25.00, Reason: Customer request",
          status: "completed",
        },
      ],

      refunds: [
        {
          refundId: "rf_20241116_001",
          status: "completed",
          amount: 25.0,
          reason: "requested_by_customer",
          reasonDescription: "Item was cold upon arrival",
          processedBy: "Sarah Johnson",
          processedByEmail: "sarah.j@berrytap.com",
          createdAt: "2024-11-16T15:45:00+01:00",
          completedAt: "2024-11-16T15:47:00+01:00",
          destination: "Original payment method",
          destinationDetails: "Mastercard ••5555",
        },
      ],

      chargebacks: [],

      metadata: {
        tags: ["refunded", "delivery-issue"],
        notes: [
          {
            noteId: "note_101",
            type: "internal",
            content: "Customer complained about cold food. Issued partial refund for one item.",
            author: "Sarah Johnson",
            authorId: "manager_01",
            authorRole: "Manager",
            createdAt: "2024-11-16T15:45:00+01:00",
            pinned: false,
          },
        ],
      },

      createdAt: "2024-11-15T14:30:00+01:00",
      updatedAt: "2024-11-16T15:47:00+01:00",
    }
  }

  // Disputed transaction
  if (idNum % 10 === 9) {
    return {
      transactionId,
      type: "charge",
      status: "disputed",
      amount: 89.0,
      currency: "EUR",
      fees: 2.67,
      net: 86.33,

      feeBreakdown: {
        baseRate: 2.58,
        baseRatePercentage: 2.9,
        fixedFee: 0.09,
        effectiveRate: 3.0,
      },

      paymentMethod: {
        type: "card",
        brand: "visa",
        last4: "1212",
        cardholderName: "[REDACTED FOR DISPUTE]",
      },

      channel: "online",

      processor: {
        provider: "Stripe",
        processorId: `ch_${idNum}`,
        riskLevel: "medium",
        riskScore: 45,
      },

      timeline: [
        {
          event: "created",
          timestamp: "2024-11-10T18:45:00+01:00",
          actor: "Online Order System",
          details: "Transaction created for Order #1789 • Online",
          status: "completed",
        },
        {
          event: "authorized",
          timestamp: "2024-11-10T18:45:02+01:00",
          actor: "Stripe",
          details: "Payment authorized, Auth code: 456789",
          status: "completed",
        },
        {
          event: "captured",
          timestamp: "2024-11-10T18:46:00+01:00",
          actor: "System",
          details: "Payment captured, Net: €86.33 (after fees)",
          status: "completed",
        },
        {
          event: "receipt_sent",
          timestamp: "2024-11-10T18:46:30+01:00",
          actor: "System",
          details: "Receipt emailed to disputed@email.com",
          status: "completed",
        },
        {
          event: "dispute_received",
          timestamp: "2024-11-18T09:00:00+01:00",
          actor: "Stripe (automatic)",
          details: "Dispute received from card network, Reason: Fraudulent transaction, Amount: €89.00 held",
          status: "completed",
        },
        {
          event: "notification_sent",
          timestamp: "2024-11-18T09:00:30+01:00",
          actor: "System",
          details: 'To: owner@berrytap.com, Subject: "Chargeback Alert"',
          status: "completed",
        },
        {
          event: "evidence_submitted",
          timestamp: "2024-11-18T14:30:00+01:00",
          actor: "Sarah Johnson (Manager)",
          details: "4 documents uploaded",
          status: "completed",
        },
      ],

      refunds: [],

      chargebacks: [
        {
          chargebackId: "dp_20241118_001",
          status: "in_review",
          type: "chargeback",
          reason: "Fraudulent",
          reasonCode: "10.4 (Card-absent fraud)",
          cardholderClaim: "I did not authorize this transaction. My card was stolen.",
          amount: 89.0,
          disputeFee: 15.0,
          initiatedAt: "2024-11-18T09:00:00+01:00",
          responseDeadline: "2024-11-25T23:59:59+01:00",
          expectedOutcome: "2024-12-02T00:00:00+01:00",
          evidenceSubmitted: [
            { type: "Receipt (PDF)", submitted: true, name: "receipt_1789.pdf" },
            { type: "Customer signature (image)", submitted: true, name: "signature.jpg" },
            { type: "Delivery confirmation", submitted: true, name: "delivery_proof.pdf" },
            { type: "Customer communication (email)", submitted: true, name: "emails.pdf" },
            { type: "3D Secure authentication", submitted: false },
          ],
          timeline: [
            {
              event: "dispute_received",
              timestamp: "2024-11-18T09:00:00+01:00",
              actor: "Card Network",
              details: "Chargeback initiated by cardholder",
              status: "completed",
            },
            {
              event: "evidence_submitted",
              timestamp: "2024-11-18T14:30:00+01:00",
              actor: "Sarah Johnson",
              details: "Submitted 4 documents as evidence",
              status: "completed",
            },
          ],
          winProbability: 45,
        },
      ],

      metadata: {
        tags: ["disputed", "fraudulent-claim"],
        notes: [
          {
            noteId: "note_201",
            type: "internal",
            content:
              "Collected all available evidence for the dispute. Customer did sign for delivery and we have email confirmation.",
            author: "Sarah Johnson",
            authorId: "manager_01",
            authorRole: "Manager",
            createdAt: "2024-11-18T14:30:00+01:00",
            pinned: true,
          },
        ],
      },

      createdAt: "2024-11-10T18:45:00+01:00",
      updatedAt: "2024-11-18T14:30:00+01:00",
    }
  }

  // Default: return a basic successful transaction
  return {
    transactionId,
    type: "charge",
    status: "succeeded",
    amount: Math.random() * 100 + 20,
    currency: "EUR",
    fees: 2.5,
    net: Math.random() * 100 + 17.5,

    feeBreakdown: {
      baseRate: 2.32,
      baseRatePercentage: 2.9,
      fixedFee: 0.18,
      effectiveRate: 2.95,
    },

    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242",
    },

    channel: "dine_in",

    processor: {
      provider: "Stripe",
      processorId: `ch_${Math.random().toString(36).substr(2, 9)}`,
      riskLevel: "low",
    },

    timeline: [
      {
        event: "created",
        timestamp: new Date().toISOString(),
        actor: "POS Terminal",
        details: "Transaction created",
        status: "completed",
      },
    ],

    refunds: [],
    chargebacks: [],

    metadata: {
      tags: [],
      notes: [],
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
