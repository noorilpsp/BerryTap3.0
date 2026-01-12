"use client"

import { useState, useMemo } from "react"
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
  Download,
  SettingsIcon,
  MoreVertical,
  Eye,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChevronDown,
  Shield,
} from "lucide-react"
import { mockDisputes, getDisputeSummary } from "../transactions/data/dispute-data"
import { ManageDisputeModal } from "../transactions/components/manage-dispute-modal"
import { MultipleDisputesAlert } from "../transactions/components/dispute-alert-banner"
import type { Dispute } from "../transactions/types/dispute-types"
import { format, differenceInDays } from "date-fns"

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reasonFilter, setReasonFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("last_90_days")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [showGlobalAlert, setShowGlobalAlert] = useState(true)

  const summary = getDisputeSummary()

  const filteredDisputes = useMemo(() => {
    return mockDisputes.filter((dispute) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matches =
          dispute.disputeId.toLowerCase().includes(query) ||
          dispute.transactionId.toLowerCase().includes(query) ||
          dispute.reason.toLowerCase().includes(query)
        if (!matches) return false
      }

      if (statusFilter !== "all" && dispute.status !== statusFilter) return false
      if (reasonFilter !== "all" && !dispute.reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false

      return true
    })
  }, [searchQuery, statusFilter, reasonFilter])

  const urgentDisputes = filteredDisputes
    .filter((d) => d.status === "evidence_required")
    .map((d) => ({
      disputeId: d.disputeId,
      amount: d.amount,
      reason: d.reason,
      daysToRespond: differenceInDays(new Date(d.responseDeadline), new Date()),
    }))

  const handleSelectAll = () => {
    if (selectedRows.size === filteredDisputes.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredDisputes.map((d) => d.disputeId)))
    }
  }

  const handleSelectRow = (disputeId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(disputeId)) {
      newSelected.delete(disputeId)
    } else {
      newSelected.add(disputeId)
    }
    setSelectedRows(newSelected)
  }

  const handleManageDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setShowDisputeModal(true)
  }

  const getStatusBadge = (status: Dispute["status"]) => {
    const variants: Record<string, any> = {
      received: "secondary",
      evidence_required: "destructive",
      submitted: "secondary",
      under_review: "secondary",
      won: "success",
      lost: "destructive",
      expired: "destructive",
    }
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status === "evidence_required" && <AlertTriangle className="mr-1 h-3 w-3" />}
        {status === "under_review" && <Clock className="mr-1 h-3 w-3" />}
        {status.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Disputes & Chargebacks</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Global Alert */}
      {showGlobalAlert && urgentDisputes.length > 0 && (
        <MultipleDisputesAlert
          disputes={urgentDisputes}
          totalAtRisk={urgentDisputes.reduce((sum, d) => sum + d.amount, 0)}
          totalFees={urgentDisputes.length * 15}
          onReviewDisputes={() => setStatusFilter("evidence_required")}
          onDismiss={() => setShowGlobalAlert(false)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Disputes</CardDescription>
            <CardTitle className="text-2xl">{summary.activeDisputes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <Badge variant="destructive" className="mr-2">
                {summary.awaitingResponse} ⚠️
              </Badge>
              {summary.awaitingResponse === 1 ? "needs" : "need"} response
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-2xl">{summary.underReview}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Awaiting decision</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount at Risk</CardDescription>
            <CardTitle className="text-2xl">€{summary.amountAtRisk.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              + €{summary.potentialFees.toLocaleString()} potential fees
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl">{summary.thisMonth} total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>Win: {summary.monthlyWinRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="evidence_required">Action Required</SelectItem>
                  <SelectItem value="under_review">In Review</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="not received">Not Received</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30_days">Last 30 days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 days</SelectItem>
                  <SelectItem value="last_year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedRows.size === filteredDisputes.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline/Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => {
                  const daysRemaining = differenceInDays(new Date(dispute.responseDeadline), new Date())
                  return (
                    <TableRow
                      key={dispute.disputeId}
                      className="cursor-pointer"
                      onClick={() => handleManageDispute(dispute)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(dispute.disputeId)}
                          onCheckedChange={() => handleSelectRow(dispute.disputeId)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{dispute.disputeId}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(dispute.initiatedAt), "MMM dd")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{dispute.transactionId}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(
                              new Date(dispute.initiatedAt).setDate(new Date(dispute.initiatedAt).getDate() - 8),
                              "MMM dd",
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">€{dispute.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{dispute.reason}</div>
                          <div className="text-xs text-muted-foreground">{dispute.reasonCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>
                        {dispute.status === "evidence_required" || dispute.status === "received" ? (
                          <div className="space-y-1">
                            <Badge variant={daysRemaining <= 2 ? "destructive" : "secondary"}>
                              {daysRemaining} days left
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(dispute.responseDeadline), "MMM dd")}
                            </div>
                          </div>
                        ) : dispute.status === "under_review" ? (
                          <div className="space-y-1">
                            <div className="text-sm">Submitted</div>
                            <div className="text-xs text-muted-foreground">
                              {dispute.submittedAt && format(new Date(dispute.submittedAt), "MMM dd")}
                            </div>
                          </div>
                        ) : dispute.decidedAt ? (
                          <div className="space-y-1">
                            <div className="text-sm">{format(new Date(dispute.decidedAt), "MMM dd")}</div>
                            <div className="text-xs text-muted-foreground capitalize">{dispute.status}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageDispute(dispute)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Manage Dispute
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Evidence
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              {selectedRows.size > 0 && <span className="font-medium">{selectedRows.size} selected • </span>}
              Showing 1-{filteredDisputes.length} of {filteredDisputes.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedRows.size} selected</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedRows(new Set())}>
                  Deselect All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Dispute Modal */}
      {selectedDispute && (
        <ManageDisputeModal
          dispute={selectedDispute}
          open={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          onSubmitResponse={(data) => {
            console.log("[v0] Dispute response submitted:", data)
            setShowDisputeModal(false)
          }}
        />
      )}
    </div>
  )
}
