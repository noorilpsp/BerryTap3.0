"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Mail, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "../types"
import { Badge } from "@/components/ui/badge"

interface EmailInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  invoices?: Invoice[] // For bulk email
}

export function EmailInvoiceModal({ open, onOpenChange, invoice, invoices }: EmailInvoiceModalProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const isBulk = invoices && invoices.length > 1
  const targetInvoice = invoice || (invoices && invoices[0])

  const [formData, setFormData] = useState({
    to: targetInvoice?.billTo.email || "",
    cc: "",
    subject: isBulk
      ? `Invoices from BerryTap Platform`
      : `Invoice #${targetInvoice?.invoiceNumber} from BerryTap Platform`,
    message: isBulk
      ? `Here are your invoices.\n\nPlease let us know if you have any questions.`
      : `Here is your invoice for ${targetInvoice?.typeDescription}.\n\nPlease let us know if you have any questions.`,
    includePdf: true,
    includePaymentLink: targetInvoice?.status === "unpaid" || targetInvoice?.status === "past_due",
    includeLateFeeReminder: targetInvoice?.status === "past_due",
    sendSeparately: true,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleSend = async () => {
    if (!formData.to) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSending(false)
    onOpenChange(false)

    const recipients = [formData.to, formData.cc].filter(Boolean)

    toast({
      title: "Email Sent",
      description: (
        <div className="space-y-2">
          <div>
            Invoice{isBulk ? "s" : ""} {isBulk ? `(${invoices?.length})` : `#${targetInvoice?.invoiceNumber}`} sent to:
          </div>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {recipients.map((email, i) => (
              <li key={i}>{email}</li>
            ))}
          </ul>
        </div>
      ),
      duration: 5000,
    })
  }

  if (!targetInvoice) return null

  const isPastDue = targetInvoice.status === "past_due"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Invoice{isBulk ? "s" : ""}</DialogTitle>
          <DialogDescription>Send invoice{isBulk ? "s" : ""} via email</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            {isBulk && invoices ? (
              <>
                <div className="font-medium">You're about to email {invoices.length} invoices:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {invoices.slice(0, 3).map((inv) => (
                    <li key={inv.id}>
                      • {inv.invoiceNumber} - {formatCurrency(inv.amount)}
                    </li>
                  ))}
                  {invoices.length > 3 && <li>... and {invoices.length - 3} more</li>}
                </ul>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invoice:</span>
                  <span className="font-medium">#{targetInvoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">{formatCurrency(targetInvoice.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(targetInvoice.date)}</span>
                </div>
                {isPastDue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Past Due ({targetInvoice.daysOverdue} days)
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Recipient */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Recipient</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="to">
                  Send to: <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="to"
                  type="email"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cc">CC (optional):</Label>
                <Input
                  id="cc"
                  type="email"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                  placeholder="cc@example.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Email Content */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Email Content</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject:</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional):</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  placeholder="Add a personal message..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.includePdf}
                    onCheckedChange={(checked) => setFormData({ ...formData, includePdf: checked as boolean })}
                    id="includePdf"
                  />
                  <Label htmlFor="includePdf" className="cursor-pointer">
                    Include PDF attachment
                  </Label>
                </div>

                {(targetInvoice.status === "unpaid" || targetInvoice.status === "past_due") && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.includePaymentLink}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, includePaymentLink: checked as boolean })
                      }
                      id="includePaymentLink"
                    />
                    <Label htmlFor="includePaymentLink" className="cursor-pointer">
                      Include payment link
                    </Label>
                  </div>
                )}

                {isPastDue && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.includeLateFeeReminder}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, includeLateFeeReminder: checked as boolean })
                      }
                      id="includeLateFeeReminder"
                    />
                    <Label htmlFor="includeLateFeeReminder" className="cursor-pointer">
                      Include late payment reminder
                    </Label>
                  </div>
                )}

                {isBulk && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.sendSeparately}
                      onCheckedChange={(checked) => setFormData({ ...formData, sendSeparately: checked as boolean })}
                      id="sendSeparately"
                    />
                    <Label htmlFor="sendSeparately" className="cursor-pointer">
                      Send as separate emails (one per invoice)
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preview</Label>
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span> billing@berrytap.com
              </div>
              <div>
                <span className="text-muted-foreground">To:</span> {formData.to || "recipient@example.com"}
              </div>
              {formData.cc && (
                <div>
                  <span className="text-muted-foreground">CC:</span> {formData.cc}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Subject:</span> {formData.subject}
              </div>

              <Separator />

              <div className="whitespace-pre-line text-muted-foreground">
                <p>Hello,</p>
                <p className="mt-3">{formData.message}</p>

                {!isBulk && (
                  <div className="mt-4">
                    <p className="font-medium text-foreground">Invoice Details:</p>
                    <ul className="mt-2 space-y-1">
                      <li>- Invoice #: {targetInvoice.invoiceNumber}</li>
                      <li>- Date: {formatDate(targetInvoice.date)}</li>
                      <li>- Amount: {formatCurrency(targetInvoice.amount)}</li>
                      <li>
                        - Status: {targetInvoice.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </li>
                    </ul>

                    {isPastDue && formData.includeLateFeeReminder && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
                        <p className="font-medium text-destructive">Payment Required</p>
                        <p className="mt-1">
                          This invoice is {targetInvoice.daysOverdue} days overdue. Please make payment as soon as
                          possible to avoid service interruption.
                        </p>
                        {targetInvoice.lateFee && (
                          <p className="mt-1">Late Fee: {formatCurrency(targetInvoice.lateFee)}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {formData.includePdf && (
                  <p className="mt-4">Attached: invoice_{isBulk ? "batch" : targetInvoice.invoiceNumber}.pdf</p>
                )}

                {formData.includePaymentLink && (
                  <div className="mt-4">
                    <Button size="sm">Pay Invoice Now →</Button>
                  </div>
                )}

                <p className="mt-4">
                  Best regards,
                  <br />
                  BerryTap Platform Team
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
