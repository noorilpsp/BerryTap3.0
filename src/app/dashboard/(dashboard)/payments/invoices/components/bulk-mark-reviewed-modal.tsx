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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "../types"

interface BulkMarkReviewedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  onConfirm: (note?: string) => void
}

export function BulkMarkReviewedModal({ open, onOpenChange, invoices, onConfirm }: BulkMarkReviewedModalProps) {
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const [note, setNote] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)

  const handleConfirm = async () => {
    setProcessing(true)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onConfirm(note || undefined)
    setProcessing(false)
    onOpenChange(false)
    setNote("")

    toast({
      title: "Marked as Reviewed",
      description: `${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"} marked as reviewed.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark Multiple Invoices as Reviewed</DialogTitle>
          <DialogDescription>
            You're about to mark {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} as reviewed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between text-sm">
                <span>
                  {invoice.invoiceNumber} - {formatDate(invoice.date)}
                </span>
                <span className="font-medium">{formatCurrency(invoice.amount)}</span>
              </div>
            ))}
            {invoices.length > 3 && (
              <div className="text-sm text-muted-foreground">... and {invoices.length - 3} more</div>
            )}

            <div className="pt-2 mt-2 border-t flex items-center justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Add note for all (optional):</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Q4 2024 billing reconciliation..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={processing}>
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All as Reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
