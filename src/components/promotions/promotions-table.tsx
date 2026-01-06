"use client"

import * as React from "react"
import { useState } from "react"
import { Promotion } from "@/lib/promotions-table-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Percent, Euro, Gift, Clock, MoreVertical, Eye, Edit, Copy, Trash2, Play, Pause, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, AlertCircle, SearchIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { PromotionDetailsDrawer } from "@/components/promotions/promotion-details-drawer"

interface PromotionsTableProps {
  data: Promotion[]
}

export function PromotionsTable({ data }: PromotionsTableProps) {
  const [promotions, setPromotions] = useState<Promotion[]>(data)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<"status" | "revenue" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | undefined>()
  const { toast } = useToast()

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPromotions.length) {
      setSelectedIds(new Set())
    } else {
      const allIds = new Set(paginatedPromotions.map((p) => p.id))
      setSelectedIds(allIds)
    }
  }

  const handleSort = (column: "status" | "revenue") => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
        setSortDirection("asc")
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedPromotions = React.useMemo(() => {
    if (!sortColumn) return promotions

    return [...promotions].sort((a, b) => {
      let comparison = 0
      if (sortColumn === "status") {
        const statusOrder = { active: 1, scheduled: 2, paused: 3, expired: 4 }
        comparison = statusOrder[a.status] - statusOrder[b.status]
      } else if (sortColumn === "revenue") {
        comparison = a.performance.revenueLift - b.performance.revenueLift
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [promotions, sortColumn, sortDirection])

  const totalPages = Math.ceil(sortedPromotions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPromotions = sortedPromotions.slice(startIndex, endIndex)

  const handleBulkPause = () => {
    const updated = promotions.map((p) => {
      if (selectedIds.has(p.id) && p.status === "active") {
        return { ...p, status: "paused" as const, statusLabel: "Paused", statusSubtext: "By user", statusColor: "yellow" as const, statusDot: "🟡" }
      }
      return p
    })
    setPromotions(updated)
    setSelectedIds(new Set())
    toast({ title: `${selectedIds.size} promotions paused successfully` })
  }

  const handleBulkActivate = () => {
    const updated = promotions.map((p) => {
      if (selectedIds.has(p.id) && p.status === "paused") {
        return { ...p, status: "active" as const, statusLabel: "Active", statusSubtext: "Live now", statusColor: "green" as const, statusDot: "🟢" }
      }
      return p
    })
    setPromotions(updated)
    setSelectedIds(new Set())
    toast({ title: `${selectedIds.size} promotions activated successfully` })
  }

  const handleBulkDelete = () => {
    const updated = promotions.filter((p) => !selectedIds.has(p.id))
    setPromotions(updated)
    setSelectedIds(new Set())
    toast({ title: `${selectedIds.size} promotions deleted` })
  }

  const getTypeIcon = (typeIcon: string) => {
    switch (typeIcon) {
      case "Percent":
        return <Percent className="h-3 w-3" />
      case "Euro":
        return <Euro className="h-3 w-3" />
      case "Gift":
        return <Gift className="h-3 w-3" />
      case "Clock":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const getProgressColor = (percent: number) => {
    if (percent > 100) return "bg-purple-500"
    if (percent > 80) return "bg-green-500"
    if (percent >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleOpenDetails = (promotionId: string) => {
    setSelectedPromotionId(promotionId)
    setDetailsDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div
          className="flex items-center justify-between bg-muted border-b-2 border-primary px-6 py-3 rounded-lg animate-in slide-in-from-top duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            <Checkbox checked={true} onCheckedChange={() => setSelectedIds(new Set())} aria-label="Deselect all" />
            <span className="font-medium">{selectedIds.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkPause}>
              <Pause className="h-4 w-4 mr-2" />
              Pause Selected
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkActivate}>
              <Play className="h-4 w-4 mr-2" />
              Activate Selected
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedIds(new Set())} aria-label="Close bulk actions">
              <span className="text-xl">✕</span>
            </Button>
          </div>
        </div>
      )}

      <div className="hidden lg:block rounded-lg border overflow-hidden">
        <Table role="table" aria-label="Promotions list" aria-rowcount={sortedPromotions.length}>
          <TableHeader className="bg-muted">
            <TableRow role="row">
              <TableHead className="w-[40px]" role="columnheader">
                <Checkbox
                  checked={selectedIds.size === paginatedPromotions.length && paginatedPromotions.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all promotions on this page"
                />
              </TableHead>
              <TableHead role="columnheader" className="min-w-[300px]">
                Name
              </TableHead>
              <TableHead role="columnheader" className="w-[140px]">
                Type
              </TableHead>
              <TableHead role="columnheader" className="w-[150px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => handleSort("status")}
                  aria-label={`Sort by status${sortColumn === "status" ? `, currently sorted ${sortDirection === "asc" ? "ascending" : "descending"}` : ""}`}
                  aria-sort={sortColumn === "status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Status
                  {sortColumn === "status" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    ))}
                </Button>
              </TableHead>
              <TableHead role="columnheader" className="w-[180px]">
                Duration
              </TableHead>
              <TableHead role="columnheader" className="w-[180px]">
                Redemptions
              </TableHead>
              <TableHead role="columnheader" className="w-[140px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => handleSort("revenue")}
                  aria-label={`Sort by revenue lift${sortColumn === "revenue" ? `, currently sorted ${sortDirection === "asc" ? "ascending" : "descending"}` : ""}`}
                  aria-sort={sortColumn === "revenue" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Revenue Lift
                  {sortColumn === "revenue" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
                    ))}
                </Button>
              </TableHead>
              <TableHead role="columnheader" className="w-[120px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo, index) => (
                <TableRow
                  key={promo.id}
                  role="row"
                  aria-rowindex={startIndex + index + 1}
                  aria-selected={selectedIds.has(promo.id)}
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer transition-all duration-150",
                    "hover:bg-muted/50 hover:border-l-4 hover:border-l-primary",
                    selectedIds.has(promo.id) && "bg-muted"
                  )}
                  onClick={() => handleOpenDetails(promo.id)}
                >
                  <TableCell role="cell" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selectedIds.has(promo.id)} onCheckedChange={() => toggleSelection(promo.id)} aria-label={`Select ${promo.name}`} />
                  </TableCell>
                  <TableCell role="cell">
                    <div>
                      <div className="font-semibold text-base">{promo.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[280px]">{promo.description}</div>
                    </div>
                  </TableCell>
                  <TableCell role="cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1",
                        promo.type === "percentage" && "border-blue-500/50 text-blue-700 dark:text-blue-400",
                        promo.type === "fixed" && "border-green-500/50 text-green-700 dark:text-green-400",
                        promo.type === "bogo" && "border-orange-500/50 text-orange-700 dark:text-orange-400",
                        promo.type === "happy_hour" && "border-purple-500/50 text-purple-700 dark:text-purple-400"
                      )}
                    >
                      {getTypeIcon(promo.typeIcon)}
                      {promo.discountValue}
                      {promo.discountUnit}
                    </Badge>
                  </TableCell>
                  <TableCell role="cell" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-1 gap-2">
                          <Badge
                            variant={promo.statusColor === "green" ? "default" : "secondary"}
                            className={cn(
                              "gap-1",
                              promo.statusColor === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                              promo.statusColor === "blue" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                              promo.statusColor === "yellow" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                              promo.statusColor === "red" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {promo.statusDot} {promo.statusLabel}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => console.log("[v0] Change status to active")}>Set Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("[v0] Change status to paused")}>Set Paused</DropdownMenuItem>
                        <DropdownMenuItem disabled>Set Expired</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="text-xs text-muted-foreground mt-1">{promo.statusSubtext}</div>
                  </TableCell>
                  <TableCell role="cell">
                    <div>
                      <div className="font-medium">{promo.schedule.displayDuration}</div>
                      <div className="text-sm text-muted-foreground">{promo.schedule.displayRecurrence}</div>
                      {promo.schedule.displayTimeWindow && <div className="text-sm text-muted-foreground">{promo.schedule.displayTimeWindow}</div>}
                    </div>
                  </TableCell>
                  <TableCell role="cell">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {promo.limits.currentRedemptions} / {promo.limits.maxRedemptions}
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min(promo.limits.redemptionPercent, 100)} 
                          className="h-2" 
                          indicatorClassName={getProgressColor(promo.limits.redemptionPercent)} 
                        />
                        <div className="text-xs text-muted-foreground">{promo.limits.redemptionPercent.toFixed(1)}%</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell role="cell">
                    <div>
                      <div className={cn("font-semibold", promo.performance.revenueLift > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                        {promo.performance.revenueLift > 0 ? "+" : ""}€{promo.performance.revenueLift.toFixed(0)}
                      </div>
                      {promo.performance.revenueLiftPercent > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {promo.performance.revenueLiftPercent}%
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell role="cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit promotion">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDetails(promo.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {promo.status === "active" ? (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : promo.status === "paused" ? (
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          ) : promo.status === "expired" ? (
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Settings
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <AlertCircle className="h-12 w-12" />
                    <div>
                      <div className="font-semibold text-lg">No promotions found</div>
                      <div className="text-sm">Try adjusting your filters or create a new promotion</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {paginatedPromotions.map((promo) => (
          <Card key={promo.id} className={cn("relative", selectedIds.has(promo.id) && "border-primary")}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox checked={selectedIds.has(promo.id)} onCheckedChange={() => toggleSelection(promo.id)} aria-label={`Select ${promo.name}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{promo.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={promo.statusColor === "green" ? "default" : "secondary"}
                  className={cn(
                    "gap-1",
                    promo.statusColor === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    promo.statusColor === "blue" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    promo.statusColor === "yellow" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    promo.statusColor === "red" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {promo.statusDot} {promo.statusLabel}
                </Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{promo.statusSubtext}</span>
              </div>

              <div className="text-sm">
                <div className="text-muted-foreground">
                  {promo.schedule.displayDuration} • {promo.schedule.displayRecurrence}
                  {promo.schedule.displayTimeWindow && ` • ${promo.schedule.displayTimeWindow}`}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {promo.limits.currentRedemptions} / {promo.limits.maxRedemptions} redeemed
                  </span>
                  <span className="font-medium">{promo.limits.redemptionPercent.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(promo.limits.redemptionPercent, 100)} 
                  className="h-2" 
                  indicatorClassName={getProgressColor(promo.limits.redemptionPercent)} 
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className={cn("font-semibold", promo.performance.revenueLift > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                    {promo.performance.revenueLift > 0 ? "+" : ""}€{promo.performance.revenueLift.toFixed(0)}
                    {promo.performance.revenueLiftPercent > 0 && (
                      <span className="ml-2 text-xs">
                        <ArrowUp className="inline h-3 w-3" />
                        {promo.performance.revenueLiftPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDetails(promo.id)}>
                View Details
              </Button>
              {promo.status === "active" && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {promo.status === "paused" && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-card rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedPromotions.length)} of {sortedPromotions.length} promotions
          </div>
          <div className="flex items-center gap-4">
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <PromotionDetailsDrawer open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen} promotionId={selectedPromotionId} />
    </div>
  )
}
