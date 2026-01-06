"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Download,
  SettingsIcon,
  Plus,
  X,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Eye,
  Copy,
  RefreshCw,
  Save,
  Keyboard,
} from "lucide-react"
import { mockTransactions, calculateSummary, type TransactionFilters } from "./data"
import { TransactionFiltersPanel } from "./components/transaction-filters-panel"
import { ColumnCustomization } from "./components/column-customization"
import { SavedViews } from "./components/saved-views"
import { getTransactionIcon, getStatusBadge, getPaymentMethodDisplay, getChannelDisplay } from "./utils"
import { TransactionDetailDrawer } from "./components/transaction-detail-drawer"
import { getTransactionDetail } from "./data/detail-data"
import type { TransactionDetail } from "./types/detail-types"
import { ExportDropdown } from "./components/export-dropdown"
import { CustomExportBuilder } from "./components/custom-export-builder"
import { EmptyState } from "./components/empty-states"
import { KeyboardShortcutsDialog } from "./components/keyboard-shortcuts-dialog"
import { SuccessCelebration } from "./components/success-celebrations"
import { useRouter } from "next/navigation"

export default function TransactionsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<TransactionFilters>({
    datePreset: "last_30_days",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [showSavedViews, setShowSavedViews] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    type: true,
    status: true,
    amount: true,
    fees: true,
    net: true,
    paymentMethod: true,
    channel: true,
    orderId: true,
    customer: false,
  })
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState<"refund" | "dispute-won" | "milestone" | "first-transaction">(
    "refund",
  )

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          transaction.transactionId.toLowerCase().includes(query) ||
          transaction.orderId?.toLowerCase().includes(query) ||
          transaction.paymentMethod.last4?.includes(query) ||
          transaction.customerEmail?.toLowerCase().includes(query) ||
          transaction.customerPhone?.includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(transaction.status)) return false
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(transaction.type)) return false
      }

      // Channel filter
      if (filters.channel && filters.channel.length > 0) {
        if (!filters.channel.includes(transaction.channel)) return false
      }

      // Payment method filter
      if (filters.paymentMethod && filters.paymentMethod.length > 0) {
        if (!filters.paymentMethod.includes(transaction.paymentMethod.type)) return false
      }

      // Card brand filter
      if (filters.cardBrand && filters.cardBrand.length > 0) {
        if (!transaction.paymentMethod.brand || !filters.cardBrand.includes(transaction.paymentMethod.brand)) {
          return false
        }
      }

      return true
    })
  }, [mockTransactions, searchQuery, filters])

  const summary = useMemo(() => calculateSummary(filteredTransactions), [filteredTransactions])

  const handleSelectAll = () => {
    if (selectedRows.size === filteredTransactions.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredTransactions.map((t) => t.transactionId)))
    }
  }

  const handleSelectRow = (transactionId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedRows(newSelected)
  }

  const clearFilters = () => {
    setFilters({ datePreset: "last_30_days" })
    setSearchQuery("")
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (filters.status && filters.status.length > 0) count++
    if (filters.type && filters.type.length > 0) count++
    if (filters.channel && filters.channel.length > 0) count++
    if (filters.paymentMethod && filters.paymentMethod.length > 0) count++
    if (filters.cardBrand && filters.cardBrand.length > 0) count++
    return count
  }, [searchQuery, filters])

  const handleViewDetails = (transactionId: string) => {
    const detail = getTransactionDetail(transactionId)
    setSelectedTransaction(detail)
    setShowDetailDrawer(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleExport = (format: "csv" | "xlsx" | "pdf", scope: "current" | "selected") => {
    console.log("[v0] Exporting", format, scope)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts
      if ((e.key === "?" || (e.shiftKey && e.key === "/")) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }

      // Focus search
      if ((e.key === "/" && (e.metaKey || e.ctrlKey)) || (e.key === "f" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }

      // Toggle filters
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        setShowFilters((prev) => !prev)
      }

      // Navigation with J/K
      if ((e.key === "j" || e.key === "k") && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        // Implement row navigation logic
        console.log("[v0] Navigate", e.key === "j" ? "down" : "up")
      }

      // Escape to close modals
      if (e.key === "Escape") {
        setShowFilters(false)
        setShowColumnSettings(false)
        setShowSavedViews(false)
        setShowDetailDrawer(false)
        setShowCustomBuilder(false)
        setShowKeyboardShortcuts(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (mockTransactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <EmptyState
          type="no-transactions"
          onAction={() => console.log("[v0] Connect processor")}
          onSecondaryAction={() => router.push("/transactions/settings")}
        />
      </div>
    )
  }

  const showNoResults = filteredTransactions.length === 0 && (searchQuery || activeFilterCount > 0)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/transactions/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <ExportDropdown
            filteredCount={filteredTransactions.length}
            selectedCount={selectedRows.size}
            onExport={handleExport}
            onOpenCustomBuilder={() => setShowCustomBuilder(true)}
            onOpenDownloadCenter={() => router.push("/downloads")}
            onOpenScheduleExport={() => console.log("[v0] Open schedule export")}
          />
          <Button variant="outline" size="sm" onClick={() => setShowColumnSettings(true)}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Columns
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order, transaction ID, card last4, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filters.datePreset || "last_30_days"}
                  onValueChange={(value) => setFilters({ ...filters, datePreset: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last_7_days">Last 7 days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSavedViews(!showSavedViews)}>
                  <Save className="mr-2 h-4 w-4" />
                  Views
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.datePreset && filters.datePreset !== "last_30_days" && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.datePreset.replace(/_/g, " ")}
                    <button onClick={() => setFilters({ ...filters, datePreset: "last_30_days" })} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showNoResults && (
        <EmptyState
          type="no-results"
          searchQuery={searchQuery}
          onAction={() => setSearchQuery("")}
          onSecondaryAction={clearFilters}
        />
      )}

      {!showNoResults && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Volume</CardDescription>
                <CardTitle className="text-2xl">{summary.totalVolume.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{summary.comparisonPeriod.volumeChange}% vs prev</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gross Amount</CardDescription>
                <CardTitle className="text-2xl">€{summary.grossAmount.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{summary.comparisonPeriod.amountChange}% vs prev</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Net Amount</CardDescription>
                <CardTitle className="text-2xl">€{summary.netAmount.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fees: €{summary.fees.toLocaleString()} ({((summary.fees / summary.grossAmount) * 100).toFixed(2)}%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Refunds</CardDescription>
                <CardTitle className="text-2xl">€{summary.refundAmount.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {summary.refundCount} refunds ({((summary.refundAmount / summary.grossAmount) * 100).toFixed(1)}%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedRows.size === filteredTransactions.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      {visibleColumns.date && <TableHead>Date</TableHead>}
                      {visibleColumns.type && <TableHead>Type</TableHead>}
                      {visibleColumns.status && <TableHead>Status</TableHead>}
                      {visibleColumns.amount && <TableHead className="text-right">Amount</TableHead>}
                      {visibleColumns.fees && <TableHead className="text-right">Fees</TableHead>}
                      {visibleColumns.net && <TableHead className="text-right">Net</TableHead>}
                      {visibleColumns.paymentMethod && <TableHead>Payment</TableHead>}
                      {visibleColumns.channel && <TableHead>Channel</TableHead>}
                      {visibleColumns.orderId && <TableHead>Order</TableHead>}
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 50).map((transaction) => (
                      <TableRow
                        key={transaction.transactionId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(transaction.transactionId)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(transaction.transactionId)}
                            onCheckedChange={() => handleSelectRow(transaction.transactionId)}
                          />
                        </TableCell>
                        {visibleColumns.date && (
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.type && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="capitalize">{transaction.type}</span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.status && <TableCell>{getStatusBadge(transaction.status)}</TableCell>}
                        {visibleColumns.amount && (
                          <TableCell className="text-right font-medium">
                            {transaction.type === "refund" ? "-" : ""}€{transaction.amount.toFixed(2)}
                          </TableCell>
                        )}
                        {visibleColumns.fees && (
                          <TableCell className="text-right">€{transaction.fees.toFixed(2)}</TableCell>
                        )}
                        {visibleColumns.net && (
                          <TableCell className="text-right font-medium">€{transaction.net.toFixed(2)}</TableCell>
                        )}
                        {visibleColumns.paymentMethod && (
                          <TableCell>{getPaymentMethodDisplay(transaction.paymentMethod)}</TableCell>
                        )}
                        {visibleColumns.channel && <TableCell>{getChannelDisplay(transaction.channel)}</TableCell>}
                        {visibleColumns.orderId && (
                          <TableCell>
                            <Button variant="link" className="h-auto p-0 text-xs">
                              {transaction.orderId}
                            </Button>
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(transaction.transactionId)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyToClipboard(transaction.transactionId)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Transaction ID
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Issue Refund
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  {selectedRows.size > 0 && <span className="font-medium">{selectedRows.size} selected • </span>}
                  Showing 1-{Math.min(50, filteredTransactions.length)} of {filteredTransactions.length}
                </div>
                <Button variant="outline" size="sm">
                  Load More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedRows.size} transaction{selectedRows.size > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Tags
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <TransactionFiltersPanel filters={filters} onFiltersChange={setFilters} onClose={() => setShowFilters(false)} />
      )}

      {/* Column Settings */}
      {showColumnSettings && (
        <ColumnCustomization
          visibleColumns={visibleColumns}
          onColumnsChange={setVisibleColumns}
          onClose={() => setShowColumnSettings(false)}
        />
      )}

      {/* Saved Views */}
      {showSavedViews && (
        <SavedViews
          onLoadView={(view) => {
            setFilters(view.filters)
            setShowSavedViews(false)
          }}
          onClose={() => setShowSavedViews(false)}
        />
      )}

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      />

      {/* Custom Export Builder Modal */}
      <CustomExportBuilder
        open={showCustomBuilder}
        onOpenChange={setShowCustomBuilder}
        filteredCount={filteredTransactions.length}
        selectedCount={selectedRows.size}
      />

      <KeyboardShortcutsDialog open={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      <SuccessCelebration
        open={showSuccessCelebration}
        onClose={() => setShowSuccessCelebration(false)}
        type={celebrationType}
        data={{
          amount: 45.5,
          message: "1,000 Transactions Processed!",
          stats: [
            { label: "Total volume", value: "€87,456.50" },
            { label: "Success rate", value: "98.7%" },
          ],
        }}
      />

      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>
    </div>
  )
}
