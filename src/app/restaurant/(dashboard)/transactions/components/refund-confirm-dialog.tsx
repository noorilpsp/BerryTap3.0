"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import type { TransactionDetail } from "../types/detail-types"

interface RefundConfirmDialogProps {
  open: boolean
  transaction: TransactionDetail
  amount: number
  type: "full" | "partial"
  reason: string
  reasonDetail?: string
  destination: string
  managerName?: string
  requiresAmountConfirmation: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RefundConfirmDialog({
  open,
  transaction,
  amount,
  type,
  reason,
  reasonDetail,
  destination,
  managerName,
  requiresAmountConfirmation,
  onConfirm,
  onCancel,
}: RefundConfirmDialogProps) {
  const [confirmAmount, setConfirmAmount] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const isAmountValid = requiresAmountConfirmation ? confirmAmount === amount.toFixed(2) : true
  const canProceed = requiresAmountConfirmation ? isAmountValid && confirmed : confirmed

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm()
      setConfirmAmount("")
      setConfirmed(false)
    }
  }

  const handleClose = () => {
    setConfirmAmount("")
    setConfirmed(false)
    onCancel()
  }

  const getDestinationText = () => {
    if (destination === "original_method") {
      return `Original Payment Method (${transaction.paymentMethod.brand || transaction.paymentMethod.type} ${transaction.paymentMethod.last4 ? `••${transaction.paymentMethod.last4}` : ""})`
    }
    if (destination === "store_credit") {
      return "Store Credit"
    }
    if (destination === "cash") {
      return "Cash"
    }
    return destination
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Confirm Refund
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {requiresAmountConfirmation && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>THIS ACTION CANNOT BE UNDONE</AlertTitle>
              <AlertDescription className="text-xs">
                You are about to issue a {amount > 500 ? "high-value" : "significant"} refund. Please review carefully
                before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {!requiresAmountConfirmation && <p className="text-sm">Please confirm the refund details:</p>}

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="font-medium text-base">REFUND SUMMARY</div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-muted-foreground">Transaction:</div>
                  <div className="font-medium">{transaction.transactionId}</div>

                  <div className="text-muted-foreground">Order:</div>
                  <div className="font-medium">#{transaction.order?.orderNumber || "N/A"}</div>

                  <div className="text-muted-foreground">Date:</div>
                  <div>{format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' h:mm a")}</div>

                  {transaction.order?.customer && (
                    <>
                      <div className="text-muted-foreground">Customer:</div>
                      <div>{transaction.order.customer.name}</div>

                      <div className="text-muted-foreground">Email:</div>
                      <div>{transaction.order.customer.email}</div>
                    </>
                  )}

                  <div className="text-muted-foreground">Payment Method:</div>
                  <div className="capitalize">
                    {transaction.paymentMethod.brand || transaction.paymentMethod.type}{" "}
                    {transaction.paymentMethod.last4 && `••${transaction.paymentMethod.last4}`}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-muted-foreground">Refund Amount:</div>
                  <div className="font-medium text-lg">€{amount.toFixed(2)}</div>

                  <div className="text-muted-foreground">Refund Type:</div>
                  <div className="capitalize">{type} Refund</div>

                  <div className="text-muted-foreground">Destination:</div>
                  <div>{getDestinationText()}</div>

                  <div className="text-muted-foreground">Reason:</div>
                  <div className="capitalize">{reason.replace(/_/g, " ")}</div>

                  {reasonDetail && (
                    <>
                      <div className="text-muted-foreground">Details:</div>
                      <div className="italic">"{reasonDetail}"</div>
                    </>
                  )}

                  {managerName && (
                    <>
                      <div className="text-muted-foreground">Authorized By:</div>
                      <div>{managerName} (Manager)</div>

                      <div className="text-muted-foreground">PIN Verified:</div>
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-4 w-4" />
                        Yes
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {requiresAmountConfirmation && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="font-medium">Impact:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• Customer will receive €{amount.toFixed(2)} to their card in 5-10 business days</div>
                  <div>
                    • Processing fees (€{(transaction.fees * (amount / transaction.amount)).toFixed(2)}) will be
                    refunded to you
                  </div>
                  <div>
                    • Net impact to your account: -€
                    {(amount - transaction.fees * (amount / transaction.amount)).toFixed(2)}
                  </div>
                  <div>• Transaction status will change to "{type === "full" ? "Refunded" : "Partially Refunded"}"</div>
                  <div>• Customer will receive email confirmation</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-amount">To confirm, please type the refund amount:</Label>
                <Input
                  id="confirm-amount"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  placeholder={`Type "${amount.toFixed(2)}" to continue`}
                />
                <p className="text-xs text-muted-foreground">Type "{amount.toFixed(2)}" to continue</p>
                {confirmAmount && !isAmountValid && <p className="text-xs text-destructive">Amount does not match</p>}
              </div>
            </div>
          )}

          {!requiresAmountConfirmation && type === "partial" && (
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Remaining balance:</span> €{(transaction.amount - amount).toFixed(2)}
              </div>
              <p className="text-muted-foreground text-xs">(can be refunded later if needed)</p>
              <p className="text-muted-foreground text-xs mt-2">Customer will receive email confirmation.</p>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <Label htmlFor="confirm" className="font-normal cursor-pointer text-sm">
              I confirm this refund is correct
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canProceed}>
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
