"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Info, CreditCard, Gift, DollarSign, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import type { TransactionDetail } from "../types/detail-types"
import { REFUND_REASONS, DEFAULT_REFUND_SETTINGS, type RefundRequest } from "../types/refund-types"
import {
  calculateRefundableAmount,
  validateRefund,
  calculateFeeRefund,
  calculateNetImpact,
  mockProcessRefund,
} from "../utils/refund-utils"
import { ManagerPinDialog } from "./manager-pin-dialog"
import { RefundConfirmDialog } from "./refund-confirm-dialog"
import { RefundSuccessDialog } from "./refund-success-dialog"
import { RefundErrorDialog } from "./refund-error-dialog"

interface RefundModalProps {
  transaction: TransactionDetail | null
  open: boolean
  onClose: () => void
  onRefundComplete?: () => void
}

type RefundStep = "form" | "manager_pin" | "confirmation" | "processing" | "success" | "error"

export function RefundModal({ transaction, open, onClose, onRefundComplete }: RefundModalProps) {
  const [step, setStep] = useState<RefundStep>("form")
  const [refundType, setRefundType] = useState<"full" | "partial">("full")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [reasonDetail, setReasonDetail] = useState("")
  const [destination, setDestination] = useState<"original_method" | "store_credit" | "cash">("original_method")
  const [storeCreditType, setStoreCreditType] = useState<"gift_card" | "loyalty_points" | "account_credit">("gift_card")
  const [sendNotification, setSendNotification] = useState(true)
  const [includeReceipt, setIncludeReceipt] = useState(true)
  const [managerName, setManagerName] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [refundResponse, setRefundResponse] = useState<any>(null)
  const [refundError, setRefundError] = useState<any>(null)

  const availableAmount = transaction ? calculateRefundableAmount(transaction) : 0
  const settings = DEFAULT_REFUND_SETTINGS

  useEffect(() => {
    if (open && transaction) {
      // Reset form
      setStep("form")
      setRefundType("full")
      setAmount(availableAmount.toFixed(2))
      setReason("")
      setReasonDetail("")
      setDestination("original_method")
      setStoreCreditType("gift_card")
      setSendNotification(true)
      setIncludeReceipt(true)
      setManagerName("")
      setProcessingProgress(0)
      setRefundResponse(null)
      setRefundError(null)
    }
  }, [open, transaction, availableAmount])

  useEffect(() => {
    if (refundType === "full") {
      setAmount(availableAmount.toFixed(2))
    }
  }, [refundType, availableAmount])

  if (!transaction) return null

  const numericAmount = Number.parseFloat(amount) || 0
  const validation = validateRefund(transaction, numericAmount, reason, destination, settings)

  const feeRefund = calculateFeeRefund(numericAmount, transaction.amount, transaction.fees)
  const netImpact = calculateNetImpact(numericAmount, feeRefund)

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = availableAmount * percentage
    setAmount(quickAmount.toFixed(2))
    if (percentage === 1) {
      setRefundType("full")
    } else {
      setRefundType("partial")
    }
  }

  const handleContinue = () => {
    if (validation.valid) {
      if (validation.requiresManagerAuth) {
        setStep("manager_pin")
      } else if (validation.requiresAmountConfirmation) {
        setStep("confirmation")
      } else {
        processRefund()
      }
    }
  }

  const handleManagerAuthorized = (pin: string, name: string) => {
    setManagerName(name)
    if (validation.requiresAmountConfirmation) {
      setStep("confirmation")
    } else {
      processRefund(pin, name)
    }
  }

  const handleConfirmed = () => {
    processRefund()
  }

  const processRefund = async (pin?: string, name?: string) => {
    setStep("processing")
    setProcessingProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const request: RefundRequest = {
      transactionId: transaction.transactionId,
      amount: numericAmount,
      currency: transaction.currency,
      type: refundType,
      reason,
      reasonDetail: reasonDetail || undefined,
      destination,
      storeCreditType: destination === "store_credit" ? storeCreditType : undefined,
      managerPin: pin,
      managerName: name || managerName || undefined,
      sendNotification,
      includeReceipt,
    }

    const result = await mockProcessRefund(request)

    clearInterval(progressInterval)
    setProcessingProgress(100)

    setTimeout(() => {
      if (result.success) {
        setRefundResponse(result.response)
        setStep("success")
        onRefundComplete?.()
      } else {
        setRefundError(result.error)
        setStep("error")
      }
    }, 500)
  }

  const handleClose = () => {
    if (step === "processing") return
    onClose()
  }

  const handleTryAgain = () => {
    setStep("form")
    setRefundError(null)
  }

  return (
    <>
      <Dialog open={open && step === "form"} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Issue Refund: Transaction {transaction.transactionId}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">TRANSACTION SUMMARY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Original Transaction:</span>
                  </div>
                  <div className="text-muted-foreground">
                    • Order #{transaction.order?.orderNumber || "N/A"} •{" "}
                    {format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-muted-foreground">
                    • Payment:{" "}
                    <span className="capitalize">
                      {transaction.paymentMethod.brand || transaction.paymentMethod.type}
                    </span>{" "}
                    {transaction.paymentMethod.last4 && `••${transaction.paymentMethod.last4}`}
                  </div>
                  {transaction.order?.customer && (
                    <div className="text-muted-foreground">
                      • Customer: {transaction.order.customer.name} ({transaction.order.customer.email})
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Original Amount:</span>
                    <span className="font-medium">€{transaction.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Already Refunded:</span>
                    <span className="font-medium text-destructive">
                      €{(transaction.amount - availableAmount).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Available to Refund:</span>
                    <span>€{availableAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  REFUND AMOUNT <span className="text-destructive">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Refund Type:</Label>
                  <RadioGroup value={refundType} onValueChange={(v) => setRefundType(v as "full" | "partial")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="font-normal cursor-pointer">
                        Full Refund (€{availableAmount.toFixed(2)})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="partial" />
                      <Label htmlFor="partial" className="font-normal cursor-pointer">
                        Partial Refund
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount to refund:
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={refundType === "full"}
                        className="pl-7"
                        step="0.01"
                        min="0.01"
                        max={availableAmount}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{transaction.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Max: €{availableAmount.toFixed(2)} • Min: €0.01</span>
                    {refundType === "partial" && numericAmount > 0 && (
                      <span>Remaining after refund: €{(availableAmount - numericAmount).toFixed(2)}</span>
                    )}
                  </div>
                  {validation.errors.find((e) => e.field === "amount") && (
                    <p className="text-xs text-destructive mt-1">
                      {validation.errors.find((e) => e.field === "amount")?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick amounts:</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.5, 0.75, 1].map((percentage) => (
                      <Button
                        key={percentage}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(percentage)}
                        className="flex flex-col h-auto py-2"
                      >
                        <span className="font-semibold">{percentage * 100}%</span>
                        <span className="text-xs text-muted-foreground">
                          €{(availableAmount * percentage).toFixed(2)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {refundType === "partial" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Partial Refund Tip</AlertTitle>
                    <AlertDescription className="text-xs">
                      This will create a partial refund. The original transaction will remain open with a reduced
                      amount. You can issue additional refunds up to the remaining balance (€
                      {(availableAmount - numericAmount).toFixed(2)}).
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Refund Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  REFUND REASON <span className="text-destructive">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validation.errors.find((e) => e.field === "reason") && (
                    <p className="text-xs text-destructive mt-1">
                      {validation.errors.find((e) => e.field === "reason")?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reasonDetail" className="text-sm font-medium">
                    Additional details (optional):
                  </Label>
                  <Textarea
                    id="reasonDetail"
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    placeholder="Provide additional context for this refund..."
                    maxLength={500}
                    rows={3}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{reasonDetail.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>

            {/* Refund Destination */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">REFUND DESTINATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label className="text-sm font-medium">Where should the refund go?</Label>

                <RadioGroup value={destination} onValueChange={(v) => setDestination(v as any)}>
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="original_method" id="original_method" className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor="original_method"
                            className="font-medium cursor-pointer flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Original Payment Method (
                            <span className="capitalize">
                              {transaction.paymentMethod.brand || transaction.paymentMethod.type}
                            </span>{" "}
                            {transaction.paymentMethod.last4 && `••${transaction.paymentMethod.last4}`})
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">Refund will appear in 5-10 business days</p>
                          <p className="text-xs text-muted-foreground">Recommended for card payments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {settings.storeCredit.enabled && (
                    <Card className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="store_credit" id="store_credit" className="mt-1" />
                          <div className="flex-1">
                            <Label
                              htmlFor="store_credit"
                              className="font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Gift className="h-4 w-4" />
                              Store Credit
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">Issue as gift card or loyalty credit</p>
                            <p className="text-xs text-muted-foreground">Available immediately for next purchase</p>
                            {settings.storeCredit.bonusPercentage > 0 && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                +{settings.storeCredit.bonusPercentage}% bonus (€
                                {(numericAmount * (1 + settings.storeCredit.bonusPercentage / 100)).toFixed(2)} total)
                              </Badge>
                            )}
                          </div>
                        </div>
                        {destination === "store_credit" && (
                          <div className="mt-4 ml-7 space-y-2">
                            <RadioGroup value={storeCreditType} onValueChange={(v) => setStoreCreditType(v as any)}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="gift_card" id="gift_card" />
                                <Label htmlFor="gift_card" className="font-normal cursor-pointer text-sm">
                                  Gift Card (Digital)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="loyalty_points" id="loyalty_points" />
                                <Label htmlFor="loyalty_points" className="font-normal cursor-pointer text-sm">
                                  Loyalty Points
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="account_credit" id="account_credit" />
                                <Label htmlFor="account_credit" className="font-normal cursor-pointer text-sm">
                                  Account Credit
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="cash" id="cash" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="cash" className="font-medium cursor-pointer flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Cash (for in-person refunds only)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">Immediate cash refund at location</p>
                          <p className="text-xs text-muted-foreground">Requires manager approval</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Refund Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">REFUND PREVIEW</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount to refund:</span>
                    <span className="font-medium">€{numericAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing fee refund:</span>
                    <span className="font-medium">€{feeRefund.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total refund to customer:</span>
                    <span>€{numericAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net impact to merchant:</span>
                    <span className="font-medium text-destructive">-€{netImpact.toFixed(2)}</span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">Processing fees will be refunded to you</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Customer Notification */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Customer Notification:</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <Label htmlFor="sendNotification" className="font-normal cursor-pointer text-sm">
                  Send refund confirmation email to {transaction.order?.customer?.email || "customer"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeReceipt"
                  checked={includeReceipt}
                  onCheckedChange={(checked) => setIncludeReceipt(checked as boolean)}
                />
                <Label htmlFor="includeReceipt" className="font-normal cursor-pointer text-sm">
                  Include refund receipt
                </Label>
              </div>
            </div>

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription className="text-xs space-y-1">
                  {validation.warnings.map((warning, idx) => (
                    <div key={idx}>• {warning.message}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={!validation.valid}>
              Continue to Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager PIN Dialog */}
      <ManagerPinDialog
        open={step === "manager_pin"}
        transaction={transaction}
        refundAmount={numericAmount}
        reason={reason}
        onAuthorized={handleManagerAuthorized}
        onCancel={() => setStep("form")}
      />

      {/* Confirmation Dialog */}
      <RefundConfirmDialog
        open={step === "confirmation"}
        transaction={transaction}
        amount={numericAmount}
        type={refundType}
        reason={reason}
        reasonDetail={reasonDetail}
        destination={destination}
        managerName={managerName}
        requiresAmountConfirmation={validation.requiresAmountConfirmation}
        onConfirm={handleConfirmed}
        onCancel={() => setStep("form")}
      />

      {/* Processing Dialog */}
      <Dialog open={step === "processing"} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle>Processing Refund...</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm">Processing your refund...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments.</p>
              <p className="text-xs text-muted-foreground">Please do not close this window.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Step 1/3: Validating refund...</span>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Step 2/3: Processing with payment provider...</span>
                {processingProgress >= 50 ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Step 3/3: Updating transaction records...</span>
                {processingProgress >= 90 ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-muted" />
                )}
              </div>
            </div>
            <Progress value={processingProgress} />
            <p className="text-center text-sm font-medium">{processingProgress}%</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <RefundSuccessDialog
        open={step === "success"}
        transaction={transaction}
        refundResponse={refundResponse}
        destination={destination}
        onClose={handleClose}
      />

      {/* Error Dialog */}
      <RefundErrorDialog
        open={step === "error"}
        error={refundError}
        transaction={transaction}
        onTryAgain={handleTryAgain}
        onClose={handleClose}
      />
    </>
  )
}
