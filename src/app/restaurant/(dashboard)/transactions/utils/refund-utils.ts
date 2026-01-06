import type { TransactionDetail, RefundRequest } from "../types/detail-types"
import type { RefundValidation, RefundSettings } from "../types/refund-types"
import { DEFAULT_REFUND_SETTINGS } from "../types/refund-types"
import { differenceInDays } from "date-fns"

export function calculateRefundableAmount(transaction: TransactionDetail): number {
  const totalRefunded = transaction.refunds.reduce((sum, refund) => sum + refund.amount, 0)
  return transaction.amount - totalRefunded
}

export function validateRefund(
  transaction: TransactionDetail,
  amount: number,
  reason: string,
  destination: string,
  settings: RefundSettings = DEFAULT_REFUND_SETTINGS,
): RefundValidation {
  const errors: Array<{ field: string; message: string }> = []
  const warnings: Array<{ field: string; message: string }> = []

  const availableAmount = calculateRefundableAmount(transaction)

  // Amount validation
  if (!amount || amount <= 0) {
    errors.push({ field: "amount", message: "Please enter a valid refund amount" })
  } else if (amount > availableAmount) {
    errors.push({ field: "amount", message: `Amount exceeds available balance (€${availableAmount.toFixed(2)})` })
  } else if (amount < 0.01) {
    errors.push({ field: "amount", message: "Minimum refund amount is €0.01" })
  }

  // Reason validation
  if (!reason) {
    errors.push({ field: "reason", message: "Please select a refund reason" })
  }

  // Destination validation
  if (!destination) {
    errors.push({ field: "destination", message: "Please select a refund destination" })
  }

  // Time-based warnings
  const daysSinceTransaction = differenceInDays(new Date(), new Date(transaction.createdAt))
  if (daysSinceTransaction > settings.limits.maxDaysAfterTransaction) {
    errors.push({
      field: "time",
      message: `This transaction is older than ${settings.limits.maxDaysAfterTransaction} days`,
    })
  } else if (daysSinceTransaction > settings.limits.requireApprovalAfterDays) {
    warnings.push({
      field: "time",
      message: "Refunds after 30 days require manager approval",
    })
  }

  // Authorization requirements
  const isFullRefund = amount >= availableAmount * 0.99
  const requiresManagerAuth =
    amount > settings.authorization.requirePinOverAmount ||
    (isFullRefund &&
      settings.authorization.requirePinForFullRefunds &&
      transaction.amount > settings.authorization.fullRefundThreshold) ||
    destination === "cash" ||
    daysSinceTransaction > settings.authorization.requirePinAfterDays

  // Confirmation requirements
  const requiresAmountConfirmation =
    amount > settings.confirmation.requireAmountConfirmationOverAmount ||
    (isFullRefund &&
      settings.confirmation.requireConfirmationForFullRefunds &&
      amount > settings.confirmation.fullRefundConfirmationThreshold)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    availableAmount,
    requiresManagerAuth,
    requiresAmountConfirmation,
  }
}

export function calculateFeeRefund(amount: number, originalAmount: number, originalFees: number): number {
  const feePercentage = originalFees / originalAmount
  return amount * feePercentage
}

export function calculateNetImpact(amount: number, feeRefund: number): number {
  return amount - feeRefund
}

export function generateGiftCardCode(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `GC-${year}-${month}${day}-${random}`
}

export function mockProcessRefund(request: RefundRequest): Promise<{ success: boolean; response?: any; error?: any }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success rate (95%)
      const success = Math.random() > 0.05

      if (success) {
        const refundId = `rf_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}_${Math.floor(
          Math.random() * 1000,
        )
          .toString()
          .padStart(3, "0")}`

        resolve({
          success: true,
          response: {
            refundId,
            transactionId: request.transactionId,
            amount: request.amount,
            currency: request.currency,
            status: "completed",
            destination: request.destination,
            processorRefundId: `re_${Math.random().toString(36).substring(2, 15)}`,
            giftCardCode: request.destination === "store_credit" ? generateGiftCardCode() : undefined,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        })
      } else {
        resolve({
          success: false,
          error: {
            code: "payment_provider_error",
            message: "The original charge has already been fully refunded.",
            details:
              "Stripe returned an error indicating this transaction has already been refunded. Please check the transaction history.",
          },
        })
      }
    }, 2000)
  })
}

export function verifyManagerPin(pin: string): { valid: boolean; attemptsRemaining?: number } {
  // Mock PIN verification (in real app, this would call an API)
  const correctPin = "1234"

  if (pin === correctPin) {
    return { valid: true }
  }

  return { valid: false, attemptsRemaining: 2 }
}
