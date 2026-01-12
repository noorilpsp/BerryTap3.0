"use client"

import type React from "react"
import { useEffect } from "react"
import { useState, useMemo } from "react"
import { getPayoutsData } from "./data"
import type { Payout, PayoutStatus } from "./types"
import { PayoutDetailDrawer } from "./components/payout-detail-drawer"
import { ExportModal } from "./components/export-modal"
import { SettingsModal } from "./components/settings-modal"
import { KeyboardShortcuts } from "./components/keyboard-shortcuts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
} from "lucide-react"

type SortField = "date" | "amount" | "status"
type SortOrder = "asc" | "desc"

export default function PayoutsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false)
  const [payoutToReconcile, setPayoutToReconcile] = useState<Payout | null>(null)
  const [reconcileNote, setReconcileNote] = useState("")
  const [reconciledPayouts, setReconciledPayouts] = useState<Set<string>>(new Set())
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const payoutsData = useMemo(() => {
    const locationIds = locationFilter === "all" ? undefined : [locationFilter]
    const statuses = statusFilter === "all" ? undefined : [statusFilter as PayoutStatus]

    return getPayoutsData(1, 100, {
      search: searchQuery,
      locationId: locationIds,
      status: statuses,
    })
  }, [searchQuery, locationFilter, statusFilter])

  const sortedPayouts = useMemo(() => {
    const payouts = [...payoutsData.data]

    payouts.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "date":
          comparison = new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
          break
        case "amount":
          comparison = b.netAmount - a.netAmount
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === "asc" ? -comparison : comparison
    })

    return payouts
  }, [payoutsData.data, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const handleRowClick = (payout: Payout) => {
    setSelectedPayout(payout)
    setDetailDrawerOpen(true)
  }

  const handleReconcileClick = (payout: Payout, e: React.MouseEvent) => {
    e.stopPropagation()
    if (payout.reconciled || reconciledPayouts.has(payout.payoutId)) {
      // Unreconcile
      const newReconciled = new Set(reconciledPayouts)
      newReconciled.delete(payout.payoutId)
      setReconciledPayouts(newReconciled)
    } else {
      setPayoutToReconcile(payout)
      setReconcileDialogOpen(true)
    }
  }

  const handleReconcileConfirm = () => {
    if (payoutToReconcile) {
      const newReconciled = new Set(reconciledPayouts)
      newReconciled.add(payoutToReconcile.payoutId)
      setReconciledPayouts(newReconciled)
      setReconcileDialogOpen(false)
      setPayoutToReconcile(null)
      setReconcileNote("")
    }
  }

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 opacity-30" />
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts dialog
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setShortcutsOpen(true)
      }
      // Focus search
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
      }
      // Export
      if (e.key === "e" || e.key === "E") {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault()
          setExportModalOpen(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Payouts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSettingsModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payoutsData.summary.totalPayouts} payouts</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +3 this week
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {payoutsData.summary.paidCount} paid, {payoutsData.summary.pendingCount} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{payoutsData.summary.totalDeposited.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +€8,234.50 today
            </p>
            <p className="text-xs text-muted-foreground mt-1">{payoutsData.summary.reconciledCount} reconciled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{payoutsData.summary.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{payoutsData.summary.pendingCount} pending payouts</p>
            <p className="text-xs text-muted-foreground mt-1">Est. arrival: Nov 21</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{payoutsData.summary.averagePayout.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by payout ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="loc_01">Valletta Main</SelectItem>
            <SelectItem value="loc_02">Sliema Branch</SelectItem>
            <SelectItem value="loc_03">Mdina Location</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        {(searchQuery || locationFilter !== "all" || statusFilter !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("")
              setLocationFilter("all")
              setStatusFilter("all")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-2">
                    Date & Time
                    <SortIcon field="date" />
                  </div>
                </TableHead>
                <TableHead>Payout ID</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end gap-2">
                    Net
                    <SortIcon field="amount" />
                  </div>
                </TableHead>
                <TableHead className="text-center w-[50px]">
                  <CheckCircle className="h-4 w-4 mx-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-medium">No payouts found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedPayouts.map((payout) => (
                  <TableRow
                    key={payout.payoutId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(payout)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(payout.settledAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          ,{" "}
                          {new Date(payout.settledAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{payout.locationName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{payout.payoutId}</p>
                        <p className="text-xs text-muted-foreground">{payout.transactionCount} transactions</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-right">€{payout.grossAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{payout.feesAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">€{payout.netAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={payout.reconciled || reconciledPayouts.has(payout.payoutId)}
                        onClick={(e) => handleReconcileClick(payout, e)}
                        disabled={payout.status !== "paid"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {payoutsData.meta.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}

      {/* Detail Drawer */}
      <PayoutDetailDrawer
        payout={selectedPayout}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        onReconcile={(payoutId, note) => {
          const newReconciled = new Set(reconciledPayouts)
          newReconciled.add(payoutId)
          setReconciledPayouts(newReconciled)
        }}
        onUnreconcile={(payoutId) => {
          const newReconciled = new Set(reconciledPayouts)
          newReconciled.delete(payoutId)
          setReconciledPayouts(newReconciled)
        }}
      />

      {/* Reconcile Dialog */}
      <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Reconciled?</DialogTitle>
            <DialogDescription>Confirm this payout has been reconciled with your bank statement.</DialogDescription>
          </DialogHeader>
          {payoutToReconcile && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Payout:</span> {payoutToReconcile.payoutId}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> €{payoutToReconcile.netAmount.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Add note (optional):</Label>
                <Textarea
                  id="note"
                  placeholder="Reconciled with bank statement..."
                  value={reconcileNote}
                  onChange={(e) => setReconcileNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReconcileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReconcileConfirm}>Mark Reconciled</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        payoutsCount={sortedPayouts.length}
        dateRange="Nov 1 - Nov 30, 2024"
      />

      {/* Settings Modal */}
      <SettingsModal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
