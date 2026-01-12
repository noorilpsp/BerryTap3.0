"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle, AlertCircle, RefreshCw, Eye, MessageSquare } from "lucide-react"
import type { TransactionDetail } from "../types/detail-types"

interface RefundErrorDialogProps {
  open: boolean
  error: any
  transaction: TransactionDetail
  onTryAgain: () => void
  onClose: () => void
}

export function RefundErrorDialog({ open, error, transaction, onTryAgain, onClose }: RefundErrorDialogProps) {
  if (!error) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Refund Failed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center py-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">Unable to Process Refund</p>
          </div>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-sm font-medium">ERROR DETAILS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Transaction:</div>
                <div className="font-medium">{transaction.transactionId}</div>

                <div className="text-muted-foreground">Attempted Refund:</div>
                <div className="font-medium">€{transaction.amount.toFixed(2)}</div>

                <div className="text-muted-foreground">Time:</div>
                <div>{new Date().toLocaleString()}</div>

                <div className="col-span-2 h-px bg-border" />

                <div className="text-muted-foreground">Error Code:</div>
                <div className="font-mono text-xs">{error.code}</div>

                <div className="text-muted-foreground">Error Message:</div>
                <div className="font-medium">"{error.message}"</div>

                {error.details && (
                  <>
                    <div className="text-muted-foreground">Processor Response:</div>
                    <div className="text-muted-foreground text-xs col-span-2 mt-2">{error.details}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="font-medium text-sm">Possible reasons:</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="mt-1">•</div>
                <div>Transaction already refunded</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">•</div>
                <div>Refund amount exceeds available balance</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">•</div>
                <div>Payment method no longer valid</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">•</div>
                <div>Connection to payment processor failed</div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>What to do:</AlertTitle>
            <AlertDescription className="text-xs space-y-1 mt-2">
              <div>1. Check transaction history for existing refunds</div>
              <div>2. Verify the refund amount is within available balance</div>
              <div>3. Try again in a few moments</div>
              <div>4. Contact support if error persists</div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Transaction
            </Button>
            <Button variant="outline" size="sm" onClick={onTryAgain}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" size="sm" className="col-span-2 bg-transparent">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
