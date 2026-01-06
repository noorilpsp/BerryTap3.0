"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  MoreVertical,
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Copy,
  ChevronDown,
  Filter,
} from "lucide-react"
import { mockInvoices, calculateKPIs } from "./data"
import type { Invoice, InvoiceFilters, InvoiceStatus, InvoiceType } from "./types"
import { InvoiceDetailModal } from "./components/invoice-detail-modal"
import { ExportModal } from "./components/export-modal"
import { EmailInvoiceModal } from "./components/email-invoice-modal"
import { BulkActionsBar } from "./components/bulk-actions-bar"
import { BulkMarkReviewedModal } from "./components/bulk-mark-reviewed-modal"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null)
  const [bulkReviewOpen, setBulkReviewOpen] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([])

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    type: [],
    status: [],
    dateRange: "last_12_months",
    reviewed: "all",
  })

  const kpis = useMemo(() => calculateKPIs(invoices), [invoices])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !invoice.invoiceNumber.toLowerCase().includes(search) &&
          !invoice.typeDescription.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(invoice.type)) {
        return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(invoice.status)) {
        return false
      }

      // Reviewed filter
      if (filters.reviewed === "reviewed" && !invoice.reviewed) {
        return false
      }
      if (filters.reviewed === "not_reviewed" && invoice.reviewed) {
        return false
      }

      return true
    })
  }, [invoices, filters])

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailOpen(true)
  }

  const handleMarkReviewed = (id: string, note?: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              reviewed: true,
              reviewedBy: "Sarah Johnson (Owner)",
              reviewedAt: new Date(),
              reviewNote: note,
            }
          : inv,
      ),
    )

    toast({
      title: "Marked as Reviewed",
      description: `Invoice #${invoices.find((i) => i.id === id)?.invoiceNumber} has been marked as reviewed.`,
    })

    // Update selected invoice if it's the one being marked
    if (selectedInvoice?.id === id) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              reviewed: true,
              reviewedBy: "Sarah Johnson (Owner)",
              reviewedAt: new Date(),
              reviewNote: note,
            }
          : null,
      )
    }
  }

  const handleUnmarkReviewed = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              reviewed: false,
              reviewedBy: undefined,
              reviewedAt: undefined,
              reviewNote: undefined,
            }
          : inv,
      ),
    )

    toast({
      title: "Unmarked as Reviewed",
      description: `Invoice #${invoices.find((i) => i.id === id)?.invoiceNumber} review status has been removed.`,
    })

    // Update selected invoice if it's the one being unmarked
    if (selectedInvoice?.id === id) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              reviewed: false,
              reviewedBy: undefined,
              reviewedAt: undefined,
              reviewNote: undefined,
            }
          : null,
      )
    }
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    toast({
      title: "Download Started",
      description: `invoice_${invoice.invoiceNumber}.pdf`,
    })
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your invoices export is being prepared...",
    })
  }

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

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants = {
      paid: { label: "Paid", variant: "default" as const, icon: CheckCircle2 },
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      unpaid: { label: "Unpaid", variant: "secondary" as const, icon: AlertCircle },
      past_due: { label: "Past Due", variant: "destructive" as const, icon: AlertCircle },
      void: { label: "Void", variant: "outline" as const, icon: AlertCircle },
      refunded: { label: "Refunded", variant: "secondary" as const, icon: CheckCircle2 },
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

  const getTypeIcon = (type: InvoiceType) => {
    switch (type) {
      case "subscription":
        return <CreditCard className="h-4 w-4" />
      case "one_off":
        return <DollarSign className="h-4 w-4" />
      case "credit":
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices)
    } else {
      setSelectedInvoices([])
    }
  }

  const handleSelectInvoice = (invoice: Invoice, checked: boolean) => {
    if (checked) {
      setSelectedInvoices((prev) => [...prev, invoice])
    } else {
      setSelectedInvoices((prev) => prev.filter((i) => i.id !== invoice.id))
    }
  }

  const isInvoiceSelected = (id: string) => {
    return selectedInvoices.some((inv) => inv.id === id)
  }

  const handleBulkMarkReviewed = (note?: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        selectedInvoices.some((sel) => sel.id === inv.id)
          ? {
              ...inv,
              reviewed: true,
              reviewedBy: "Sarah Johnson (Owner)",
              reviewedAt: new Date(),
              reviewNote: note,
            }
          : inv,
      ),
    )
    setSelectedInvoices([])
  }

  const handleBulkExport = () => {
    setExportOpen(true)
  }

  const handleBulkEmail = () => {
    setEmailOpen(true)
  }

  const handleEmailInvoice = (invoice: Invoice) => {
    setEmailInvoice(invoice)
    setEmailOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Invoices</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Export Current View (CSV)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Export with Details (Excel)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Export Last Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Export Last Quarter</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Export This Year</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setExportOpen(true)}>Custom Export...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            Total Due
          </div>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalDue)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {kpis.totalDue === 0 ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                All caught up!
              </span>
            ) : (
              "Action needed"
            )}
          </div>
          {kpis.nextDueDate && (
            <div className="text-xs text-muted-foreground mt-1">Next: {formatDate(kpis.nextDueDate)}</div>
          )}
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <AlertCircle className="h-4 w-4" />
            Past Due
          </div>
          <div className="text-2xl font-bold">
            {kpis.pastDueCount} {kpis.pastDueCount === 1 ? "invoice" : "invoices"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {kpis.pastDueCount === 0 ? (
              "No overdue bills"
            ) : (
              <span className="text-destructive">Total: {formatCurrency(kpis.pastDueAmount)}</span>
            )}
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            Last Invoice
          </div>
          {kpis.lastInvoice ? (
            <>
              <div className="text-2xl font-bold">{formatDate(kpis.lastInvoice.date)}</div>
              <div className="text-sm text-muted-foreground mt-1">Invoice #{kpis.lastInvoice.number}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(kpis.lastInvoice.amount)} • {getStatusBadge(kpis.lastInvoice.status)}
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">N/A</div>
          )}
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            This Month
          </div>
          <div className="text-2xl font-bold">{formatCurrency(kpis.thisMonth.amount)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {kpis.thisMonth.count} {kpis.thisMonth.count === 1 ? "invoice" : "invoices"}
          </div>
          <div className="text-xs text-muted-foreground">
            {kpis.thisMonth.paid ? (
              <span className="text-green-600">Paid</span>
            ) : (
              <span className="text-orange-600">Unpaid</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice # or description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Type
              {filters.type.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.type.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Invoice Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.type.includes("subscription")}
              onCheckedChange={(checked) => {
                setFilters({
                  ...filters,
                  type: checked ? [...filters.type, "subscription"] : filters.type.filter((t) => t !== "subscription"),
                })
              }}
            >
              Subscription
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.type.includes("one_off")}
              onCheckedChange={(checked) => {
                setFilters({
                  ...filters,
                  type: checked ? [...filters.type, "one_off"] : filters.type.filter((t) => t !== "one_off"),
                })
              }}
            >
              One-off
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.type.includes("credit")}
              onCheckedChange={(checked) => {
                setFilters({
                  ...filters,
                  type: checked ? [...filters.type, "credit"] : filters.type.filter((t) => t !== "credit"),
                })
              }}
            >
              Credit
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.status.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["paid", "unpaid", "past_due", "void", "refunded"] as InvoiceStatus[]).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.status.includes(status)}
                onCheckedChange={(checked) => {
                  setFilters({
                    ...filters,
                    status: checked ? [...filters.status, status] : filters.status.filter((s) => s !== status),
                  })
                }}
              >
                {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Reviewed
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Reviewed Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters({ ...filters, reviewed: "all" })}>
              <div className="flex items-center gap-2">
                {filters.reviewed === "all" && <CheckCircle2 className="h-4 w-4" />}
                All invoices
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, reviewed: "reviewed" })}>
              <div className="flex items-center gap-2">
                {filters.reviewed === "reviewed" && <CheckCircle2 className="h-4 w-4" />}
                Reviewed only
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, reviewed: "not_reviewed" })}>
              <div className="flex items-center gap-2">
                {filters.reviewed === "not_reviewed" && <CheckCircle2 className="h-4 w-4" />}
                Not reviewed only
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(filters.type.length > 0 || filters.status.length > 0 || filters.reviewed !== "all") && (
          <Button
            variant="ghost"
            onClick={() =>
              setFilters({
                ...filters,
                type: [],
                status: [],
                reviewed: "all",
              })
            }
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedInvoices={selectedInvoices}
        onMarkReviewed={() => setBulkReviewOpen(true)}
        onExport={handleBulkExport}
        onEmail={handleBulkEmail}
        onClear={() => setSelectedInvoices([])}
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4">
                <Checkbox
                  checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-4 font-medium">Date & Time</th>
              <th className="text-left p-4 font-medium">Invoice #</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Amount</th>
              <th className="text-left p-4 font-medium">Paid via</th>
              <th className="text-center p-4 font-medium">Reviewed</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t hover:bg-muted/50 cursor-pointer"
                onClick={() => handleViewInvoice(invoice)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isInvoiceSelected(invoice.id)}
                    onCheckedChange={(checked) => handleSelectInvoice(invoice, checked as boolean)}
                  />
                </td>
                <td className="p-4">
                  <div className="font-medium">{formatDate(invoice.date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground">{invoice.invoiceId}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(invoice.type)}
                    <div>
                      <div className="font-medium capitalize">{invoice.type.replace("_", "-")}</div>
                      <div className="text-sm text-muted-foreground">{invoice.typeDescription}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {getStatusBadge(invoice.status)}
                  {invoice.paidDate && (
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(invoice.paidDate)}</div>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{invoice.paymentMethod}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {invoice.paymentMethodType.replace("_", " ")}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Checkbox
                    checked={invoice.reviewed}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (invoice.reviewed) {
                        handleUnmarkReviewed(invoice.id)
                      } else {
                        handleMarkReviewed(invoice.id)
                      }
                    }}
                  />
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewInvoice(invoice)
                        }}
                      >
                        View Invoice Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDF(invoice)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEmailInvoice(invoice)
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          if (invoice.reviewed) {
                            handleUnmarkReviewed(invoice.id)
                          } else {
                            handleMarkReviewed(invoice.id)
                          }
                        }}
                      >
                        {invoice.reviewed ? "Unmark as" : "Mark as"} Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Invoice Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkReviewed={handleMarkReviewed}
        onUnmarkReviewed={handleUnmarkReviewed}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        currentViewCount={filteredInvoices.length}
        totalCount={invoices.length}
        selectedInvoices={selectedInvoices.length > 0 ? selectedInvoices : undefined}
      />

      {/* Email Invoice Modal */}
      <EmailInvoiceModal
        open={emailOpen}
        onOpenChange={(open) => {
          setEmailOpen(open)
          if (!open) setEmailInvoice(null)
        }}
        invoice={emailInvoice}
        invoices={selectedInvoices.length > 1 ? selectedInvoices : undefined}
      />

      {/* Bulk Mark Reviewed Modal */}
      <BulkMarkReviewedModal
        open={bulkReviewOpen}
        onOpenChange={setBulkReviewOpen}
        invoices={selectedInvoices}
        onConfirm={handleBulkMarkReviewed}
      />
    </div>
  )
}
