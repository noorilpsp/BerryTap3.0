"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Mail, FileText, Eye } from "lucide-react"
import { format, addDays } from "date-fns"
import type { TransactionDetail } from "../types/detail-types"

interface RefundSuccessDialogProps {
  open: boolean
  transaction: TransactionDetail
  refundResponse: any
  destination: string
  onClose: () => void
}

export function RefundSuccessDialog({
  open,
  transaction,
  refundResponse,
  destination,
  onClose,
}: RefundSuccessDialogProps) {
  if (!refundResponse) return null

  const expectedDate = addDays(new Date(), 5)
  const expectedEndDate = addDays(new Date(), 10)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Refund Successful
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center py-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Refund Processed Successfully</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">REFUND DETAILS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Refund ID:</div>
                <div className="font-medium">{refundResponse.refundId}</div>

                <div className="text-muted-foreground">Transaction ID:</div>
                <div className="font-medium">{refundResponse.transactionId}</div>

                <div className="text-muted-foreground">Order:</div>
                <div>#{transaction.order?.orderNumber || "N/A"}</div>

                <Separator className="col-span-2" />

                <div className="text-muted-foreground">Refund Amount:</div>
                <div className="font-medium text-lg">€{refundResponse.amount.toFixed(2)}</div>

                <div className="text-muted-foreground">Processed:</div>
                <div>{format(new Date(refundResponse.createdAt), "MMM dd, yyyy 'at' h:mm a")}</div>

                {transaction.order?.server?.name && (
                  <>
                    <div className="text-muted-foreground">Processed By:</div>
                    <div>{transaction.order.server.name}</div>
                  </>
                )}

                <Separator className="col-span-2" />

                <div className="text-muted-foreground">Status:</div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="capitalize">
                    {refundResponse.status}
                  </Badge>
                </div>

                <div className="text-muted-foreground">Destination:</div>
                <div className="capitalize">
                  {destination === "original_method" && (
                    <>
                      {transaction.paymentMethod.brand || transaction.paymentMethod.type}{" "}
                      {transaction.paymentMethod.last4 && `••${transaction.paymentMethod.last4}`}
                    </>
                  )}
                  {destination === "store_credit" && "Store Credit"}
                  {destination === "cash" && "Cash"}
                </div>

                {destination === "original_method" && (
                  <>
                    <div className="text-muted-foreground">Expected in Customer Account:</div>
                    <div>
                      {format(expectedDate, "MMM dd")}-{format(expectedEndDate, "dd, yyyy")} (5-10 business days)
                    </div>
                  </>
                )}

                {destination === "store_credit" && refundResponse.giftCardCode && (
                  <>
                    <div className="text-muted-foreground">Gift Card Code:</div>
                    <div className="font-mono font-medium">{refundResponse.giftCardCode}</div>
                  </>
                )}

                <Separator className="col-span-2" />

                <div className="text-muted-foreground">Customer Notification:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Sent to {transaction.order?.customer?.email || "customer"}</span>
                </div>

                <div className="text-muted-foreground"></div>
                <div className="text-muted-foreground">{format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="font-medium text-sm">What happens next:</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {destination === "original_method" && (
                <div>• Customer will see the refund in their account in 5-10 days</div>
              )}
              {destination === "store_credit" && (
                <div>• Customer can use the gift card immediately online or in-store</div>
              )}
              <div>• Transaction status has been updated to "Refunded"</div>
              <div>
                • Processing fees (€{(transaction.fees * (refundResponse.amount / transaction.amount)).toFixed(2)}) will
                be credited to your account
              </div>
              <div>• Refund receipt has been emailed to customer</div>
              <div>• This refund is logged in the audit trail</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Mail className="mr-2 h-4 w-4" />
              Resend Confirmation
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              View Receipt
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Eye className="mr-2 h-4 w-4" />
              View Transaction
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
