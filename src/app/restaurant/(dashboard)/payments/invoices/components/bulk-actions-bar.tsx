"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Download, Mail, X } from "lucide-react"
import type { Invoice } from "../types"

interface BulkActionsBarProps {
  selectedInvoices: Invoice[]
  onMarkReviewed: () => void
  onExport: () => void
  onEmail: () => void
  onClear: () => void
}

export function BulkActionsBar({ selectedInvoices, onMarkReviewed, onExport, onEmail, onClear }: BulkActionsBarProps) {
  if (selectedInvoices.length === 0) return null

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 bg-primary text-primary-foreground border-b shadow-sm">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-primary-foreground text-primary">
          {selectedInvoices.length}
        </Badge>
        <span className="font-medium">
          {selectedInvoices.length} {selectedInvoices.length === 1 ? "invoice" : "invoices"} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onMarkReviewed} className="bg-primary-foreground text-primary">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark Reviewed
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport} className="bg-primary-foreground text-primary">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="secondary" size="sm" onClick={onEmail} className="bg-primary-foreground text-primary">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-primary-foreground hover:bg-primary/90">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
