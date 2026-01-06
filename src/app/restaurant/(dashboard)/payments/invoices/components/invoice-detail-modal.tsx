"use client"

import type { Invoice } from "../types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Mail, ExternalLink, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InvoiceDetailModalProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkReviewed: (id: string, note?: string) => void
  onUnmarkReviewed: (id: string) => void
}

export function InvoiceDetailModal({
  invoice,
  open,
  onOpenChange,
  onMarkReviewed,
  onUnmarkReviewed,
}: InvoiceDetailModalProps) {
  const [reviewNote, setReviewNote] = useState("")

  if (!invoice) return null

  const handleDownloadPDF = () => {
    // Simulate PDF download
    console.log("[v0] Downloading PDF for invoice:", invoice.invoiceNumber)
  }

  const handleEmailInvoice = () => {
    console.log("[v0] Emailing invoice:", invoice.invoiceNumber)
  }

  const handleViewInStripe = () => {
    console.log("[v0] Opening invoice in Stripe:", invoice.invoiceNumber)
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants = {
      paid: { label: "Paid", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" },
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      unpaid: { label: "Unpaid", variant: "secondary" as const, icon: AlertCircle, color: "text-orange-600" },
      past_due: { label: "Past Due", variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
      void: { label: "Void", variant: "outline" as const, icon: AlertCircle, color: "text-gray-600" },
      refunded: { label: "Refunded", variant: "secondary" as const, icon: CheckCircle2, color: "text-blue-600" },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MT", {
      style: "currency",
      currency: invoice.currency,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-2xl">Invoice #{invoice.invoiceNumber}</SheetTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                {invoice.status === "paid" && invoice.paidDate && (
                  <span className="text-sm text-muted-foreground">Paid on {formatDate(invoice.paidDate)}</span>
                )}
                {invoice.status === "past_due" && invoice.daysOverdue && (
                  <span className="text-sm text-destructive">{invoice.daysOverdue} days overdue</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleEmailInvoice}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div>
              <div className="text-muted-foreground">Invoice Date</div>
              <div className="font-medium">{formatDate(invoice.date)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Due Date</div>
              <div className="font-medium">{formatDate(invoice.dueDate)}</div>
            </div>
            {invoice.paidDate && (
              <div>
                <div className="text-muted-foreground">Paid</div>
                <div className="font-medium">{formatDateTime(invoice.paidDate)}</div>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Past Due Alert */}
        {invoice.status === "past_due" && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-destructive mb-1">Payment Required</h4>
                  <p className="text-sm text-muted-foreground">
                    This invoice is overdue. Please pay to maintain service.
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount Due:</span>
                    <span className="font-medium">{formatCurrency(invoice.balance)}</span>
                  </div>
                  {invoice.lateFee && (
                    <div className="flex justify-between">
                      <span>Late Fee:</span>
                      <span className="font-medium">{formatCurrency(invoice.lateFee)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Due:</span>
                    <span>{formatCurrency(invoice.balance + (invoice.lateFee || 0))}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Pay Now
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Bill To */}
        <div>
          <h3 className="font-semibold mb-3">Bill To</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-1 text-sm">
            <div className="font-medium">{invoice.billTo.businessName}</div>
            {invoice.billTo.location && <div className="text-muted-foreground">{invoice.billTo.location}</div>}
            <div className="text-muted-foreground">{invoice.billTo.address}</div>
            <div className="text-muted-foreground">
              {invoice.billTo.city} {invoice.billTo.postalCode}, {invoice.billTo.country}
            </div>
            {invoice.billTo.vatId && <div className="text-muted-foreground mt-2">VAT ID: {invoice.billTo.vatId}</div>}
            <div className="text-muted-foreground mt-2">Contact: {invoice.billTo.contact}</div>
            <div className="text-muted-foreground">Email: {invoice.billTo.email}</div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Line Items */}
        <div>
          <h3 className="font-semibold mb-3">Line Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-right p-3 font-medium">Qty</th>
                  <th className="text-right p-3 font-medium">Unit Price</th>
                  <th className="text-right p-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{item.description}</div>
                      {item.details && (
                        <div className="text-muted-foreground text-xs mt-1 whitespace-pre-line">{item.details}</div>
                      )}
                    </td>
                    <td className="text-right p-3">{item.quantity}</td>
                    <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right p-3 font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t bg-muted/20 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              {invoice.credits !== 0 && (
                <div className="flex justify-between text-sm">
                  <span>Credits:</span>
                  <span>{formatCurrency(invoice.credits)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Balance:</span>
                <span className={cn(invoice.balance > 0 && "text-destructive")}>{formatCurrency(invoice.balance)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Information */}
        {invoice.status === "paid" && invoice.transactionId && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{invoice.paymentMethod}</span>
                </div>
                {invoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span className="font-medium">{formatDateTime(invoice.paidDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">{invoice.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium text-green-600">Succeeded</span>
                </div>
                <Button variant="link" className="p-0 h-auto" onClick={() => console.log("[v0] View transaction")}>
                  View Transaction →
                </Button>
              </div>
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* Payment Failure Details */}
        {invoice.status === "past_due" && invoice.paymentFailureReason && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Payment Failure Details</h3>
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                {invoice.lastAttemptDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Attempt:</span>
                    <span className="font-medium">{formatDateTime(invoice.lastAttemptDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="font-medium text-destructive">{invoice.paymentFailureReason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{invoice.paymentMethod}</span>
                </div>
                <p className="text-muted-foreground mt-3">
                  We attempted to charge your card on file but the payment failed. Please update your payment method or
                  pay manually.
                </p>
              </div>
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* Notes */}
        {invoice.notes && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Notes</h3>
              <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-line text-muted-foreground">
                {invoice.notes}
              </div>
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* Review Status */}
        <div>
          <h3 className="font-semibold mb-3">Review Status</h3>
          {invoice.reviewed ? (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-green-900 dark:text-green-100">Reviewed</div>
                  {invoice.reviewedBy && (
                    <div className="text-sm text-muted-foreground">Reviewed by: {invoice.reviewedBy}</div>
                  )}
                  {invoice.reviewedAt && (
                    <div className="text-sm text-muted-foreground">Date: {formatDateTime(invoice.reviewedAt)}</div>
                  )}
                  {invoice.reviewNote && (
                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-background rounded">
                      {invoice.reviewNote}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => onUnmarkReviewed(invoice.id)}
                  >
                    Unmark as Reviewed
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">Mark this invoice as reviewed for your records.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add review note (optional):</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Reviewed for accounting reconciliation..."
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <Button
                onClick={() => {
                  onMarkReviewed(invoice.id, reviewNote || undefined)
                  setReviewNote("")
                }}
                className="w-full"
              >
                Mark as Reviewed
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleEmailInvoice}>
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleViewInStripe}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Stripe
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
