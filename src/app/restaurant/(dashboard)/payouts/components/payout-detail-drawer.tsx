"use client"

import type { Payout } from "../types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Download, X, CheckCircle, Clock, XCircle, ExternalLink, Copy, ArrowRight } from "lucide-react"
import { useState } from "react"

interface PayoutDetailDrawerProps {
  payout: Payout | null
  open: boolean
  onClose: () => void
  onReconcile?: (payoutId: string, note: string) => void
  onUnreconcile?: (payoutId: string) => void
}

export function PayoutDetailDrawer({ payout, open, onClose, onReconcile, onUnreconcile }: PayoutDetailDrawerProps) {
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [note, setNote] = useState("")

  if (!payout) return null

  const handleReconcile = () => {
    if (onReconcile) {
      onReconcile(payout.payoutId, note)
      setNote("")
      setIsEditingNote(false)
    }
  }

  const handleUnreconcile = () => {
    if (onUnreconcile) {
      onUnreconcile(payout.payoutId)
    }
  }

  const getStatusIcon = () => {
    switch (payout.status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (payout.status) {
      case "paid":
        return "Paid • Deposited to bank"
      case "pending":
        return "Pending • Processing"
      case "failed":
        return `Failed • ${payout.error?.message || "Unknown error"}`
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-2xl">{payout.payoutId}</SheetTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm text-muted-foreground">{getStatusText()}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(payout.settledAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6 py-6">
            <Separator />

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold mb-4">SUMMARY</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Gross Amount</p>
                    <p className="text-xs text-muted-foreground">Sum of all transactions included</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {payout.currency === "EUR" ? "€" : "$"}
                    {payout.grossAmount.toFixed(2)}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Processing Fees</p>
                    <p className="text-xs text-muted-foreground">Payment processor fees (2.75%)</p>
                  </div>
                  <p className="text-lg font-semibold text-red-500">
                    -{payout.currency === "EUR" ? "€" : "$"}
                    {payout.feesAmount.toFixed(2)}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Net Amount Deposited</p>
                    <p className="text-xs text-muted-foreground">Amount received in bank account</p>
                  </div>
                  <p className="text-xl font-bold">
                    {payout.currency === "EUR" ? "€" : "$"}
                    {payout.netAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold mb-4">TIMELINE</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="w-px h-full bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">Settled</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.settledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Transactions processed and settlement initiated
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {payout.status === "paid" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : payout.status === "pending" ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {payout.status !== "failed" && <div className="w-px h-full bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">
                      {payout.status === "pending" ? "Sent to Bank (Processing)" : "Sent to Bank"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.settledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payout.status === "pending"
                        ? `Estimated arrival: ${new Date(payout.estimatedArrivalAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                        : `Payout initiated to bank account ••${payout.bankAccount.last4}`}
                    </p>
                  </div>
                </div>

                {payout.status === "paid" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deposited</p>
                      <p className="text-xs text-muted-foreground">
                        {payout.bankArrivalAt &&
                          new Date(payout.bankArrivalAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Funds arrived in bank account</p>
                    </div>
                  </div>
                )}

                {payout.status === "pending" && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">
                      ⓘ Pending payouts typically arrive within 2-3 business days
                    </p>
                  </div>
                )}

                {payout.status === "failed" && payout.error && (
                  <div className="rounded-lg bg-destructive/10 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-destructive">ERROR DETAILS</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {payout.error.message}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Code:</span> {payout.error.code}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Time:</span>{" "}
                          {new Date(payout.error.time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">RESOLUTION STEPS</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Update your bank account in Stripe</li>
                        <li>Contact Stripe support to retry this payout</li>
                        <li>
                          The funds ({payout.currency === "EUR" ? "€" : "$"}
                          {payout.netAmount.toFixed(2)}) will be held until resolved
                        </li>
                      </ol>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          Update Bank Account <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Contact Support <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h3 className="text-sm font-semibold mb-4">TRANSACTIONS</h3>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Contains {payout.transactionCount} transactions</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Date range:{" "}
                  {new Date(payout.transactionDateRange.from).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(payout.transactionDateRange.to).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Location: {payout.locationName}</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  View Transactions in This Payout <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-sm font-semibold mb-4">BANK DETAILS</h3>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Account:</span> {payout.bankAccount.bankName} ••
                  {payout.bankAccount.last4}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Reference:</span> {payout.processor.reference}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Method:</span> {payout.bankAccount.method}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Processor:</span> {payout.processor.name}
                </p>
              </div>
            </div>

            {/* Reconciliation */}
            <div>
              <h3 className="text-sm font-semibold mb-4">RECONCILIATION</h3>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Status:</p>
                  {payout.reconciled ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reconciled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Reconciled</Badge>
                  )}
                </div>

                {payout.reconciled && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Marked by:</span> {payout.reconciledByName} (Owner)
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {payout.reconciledAt &&
                        new Date(payout.reconciledAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </p>

                    {payout.note && (
                      <div>
                        <p className="text-sm font-medium mb-1">Note:</p>
                        <p className="text-sm text-muted-foreground">{payout.note}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingNote(true)}>
                        Edit Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleUnreconcile}>
                        Unmark as Reconciled
                      </Button>
                    </div>
                  </>
                )}

                {!payout.reconciled && payout.status === "paid" && (
                  <>
                    {isEditingNote ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add reconciliation note (optional)..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleReconcile}>
                            Mark as Reconciled
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setIsEditingNote(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditingNote(true)}>
                        Mark as Reconciled
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold mb-4">ACTIONS</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Payout ID
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Stripe
                </Button>
              </div>
            </div>

            <Separator />

            {/* Audit Trail */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(payout.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                (Automatic)
              </p>
              <p>
                <span className="font-medium">Updated:</span>{" "}
                {new Date(payout.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {payout.reconciledByName && `by ${payout.reconciledByName}`}
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
