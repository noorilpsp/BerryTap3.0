"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Receipt,
  Plus,
  Edit,
  Copy,
  Trash2,
  Download,
  Eye,
  MoreVertical,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  X,
  ChevronDown,
  Archive,
  Zap,
} from "lucide-react"
import { mockCampaignsData } from "./mock-data"
import { cn } from "@/lib/utils"

type ViewMode = "cards" | "table"
type CampaignStatus = "all" | "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed"
type ChannelFilter = "all" | "email" | "sms" | "whatsapp" | "in_app" | "receipt"
type SortOption =
  | "recent"
  | "oldest"
  | "name_az"
  | "name_za"
  | "best_performance"
  | "most_conversions"
  | "highest_revenue"
  | "worst_performance"

export default function CampaignsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>("all")
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)

  const { kpis, campaigns, segments } = mockCampaignsData

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          campaign.audience.segmentName.toLowerCase().includes(query) ||
          campaign.createdBy.toLowerCase().includes(query) ||
          campaign.channels.some((c) => c.toLowerCase().includes(query)),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    // Channel filter
    if (channelFilter !== "all") {
      filtered = filtered.filter((c) => c.channels.includes(channelFilter))
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.sentAt || b.startedAt || b.schedule?.sendAt || b.lastEditedAt || "").getTime() -
            new Date(a.sentAt || a.startedAt || a.schedule?.sendAt || a.lastEditedAt || "").getTime()
          )
        case "oldest":
          return (
            new Date(a.sentAt || a.startedAt || a.schedule?.sendAt || a.lastEditedAt || "").getTime() -
            new Date(b.sentAt || b.startedAt || b.schedule?.sendAt || b.lastEditedAt || "").getTime()
          )
        case "name_az":
          return a.name.localeCompare(b.name)
        case "name_za":
          return b.name.localeCompare(a.name)
        case "best_performance":
          return (b.metrics?.openRate || 0) - (a.metrics?.openRate || 0)
        case "most_conversions":
          return (b.metrics?.conversions || 0) - (a.metrics?.conversions || 0)
        case "highest_revenue":
          return (b.metrics?.revenue || 0) - (a.metrics?.revenue || 0)
        case "worst_performance":
          return (a.metrics?.openRate || 0) - (b.metrics?.openRate || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [campaigns, searchQuery, statusFilter, channelFilter, sortBy])

  const hasActiveFilters = statusFilter !== "all" || channelFilter !== "all" || searchQuery !== ""

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setChannelFilter("all")
  }

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaigns((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([])
    } else {
      setSelectedCampaigns(filteredCampaigns.map((c) => c.id))
    }
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaignToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    console.log("[v0] Deleting campaign:", campaignToDelete)
    // Handle delete logic here
    setDeleteDialogOpen(false)
    setCampaignToDelete(null)
  }

  // navigation handlers
  const handleNewCampaign = () => {
    router.push("/campaigns/new")
  }

  const handleViewCampaign = (id: string) => {
    router.push(`/campaigns/${id}`)
  }

  const handleEditCampaign = (id: string) => {
    router.push(`/campaigns/${id}/edit`)
  }

  const handleDuplicateCampaign = (id: string) => {
    console.log("[v0] Duplicating campaign:", id)
    // Add duplication logic here
  }

  const handleExportCampaign = (id: string) => {
    console.log("[v0] Exporting campaign:", id)
    // Add export logic here
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("[v0] Export CSV")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("[v0] Export Excel")}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("[v0] Export PDF")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleNewCampaign}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{kpis.totalSent.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{kpis.totalSentChange}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{kpis.avgOpenRate}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{kpis.avgOpenRateChange} pts</span>
              <span className="text-muted-foreground">above avg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-5">{kpis.totalConversions.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{kpis.totalConversionsChange}</span>
              <span className="text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">€{kpis.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+€{kpis.totalRevenueChange.toLocaleString()}</span>
              <span className="text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns, segments, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sending">Sending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_az">Name A-Z</SelectItem>
                  <SelectItem value="name_za">Name Z-A</SelectItem>
                  <SelectItem value="best_performance">Best Performance</SelectItem>
                  <SelectItem value="most_conversions">Most Conversions</SelectItem>
                  <SelectItem value="highest_revenue">Highest Revenue</SelectItem>
                  <SelectItem value="worst_performance">Worst Performance</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                  </Badge>
                )}
                {channelFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Channel: {channelFilter}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setChannelFilter("all")} />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Toggle & Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" onClick={() => setViewMode("cards")}>
            Cards View
          </Button>
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
            Table View
          </Button>
        </div>

        {selectedCampaigns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions ({selectedCampaigns.length})
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Selected
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            {campaigns.length === 0 ? (
              <>
                <Send className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Create your first campaign to start engaging with your customers through email, SMS, or in-app
                  messaging.
                </p>
                <Button onClick={handleNewCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Campaign
                </Button>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns match your filters</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedCampaigns.includes(campaign.id)}
              onSelect={() => handleSelectCampaign(campaign.id)}
              onDelete={() => handleDeleteCampaign(campaign.id)}
              onView={() => handleViewCampaign(campaign.id)}
              onEdit={() => handleEditCampaign(campaign.id)}
              onDuplicate={() => handleDuplicateCampaign(campaign.id)}
              onExport={() => handleExportCampaign(campaign.id)}
            />
          ))}
        </div>
      ) : (
        <CampaignsTable
          campaigns={filteredCampaigns}
          selectedCampaigns={selectedCampaigns}
          onSelectAll={handleSelectAll}
          onSelect={handleSelectCampaign}
          onDelete={handleDeleteCampaign}
          onView={handleViewCampaign}
          onEdit={handleEditCampaign}
          onDuplicate={handleDuplicateCampaign}
          onExport={handleExportCampaign}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign and all its data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Campaign Card Component
function CampaignCard({
  campaign,
  isSelected,
  onSelect,
  onDelete,
  onView,
  onEdit,
  onDuplicate,
  onExport,
}: {
  campaign: any
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onView: () => void
  onEdit: () => void
  onDuplicate: () => void
  onExport: () => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <StatusBadge status={campaign.status} />
              </div>
              <CardDescription>
                {campaign.status === "sent" && `Sent ${formatDate(campaign.sentAt)} • `}
                {campaign.status === "scheduled" && `Scheduled for ${formatDate(campaign.schedule.sendAt)} • `}
                {campaign.status === "sending" && `Started ${formatDate(campaign.startedAt)} • `}
                {campaign.status === "failed" && `Failed ${formatDate(campaign.failedAt)} • `}
                {campaign.status === "draft" && `Last edited ${formatDate(campaign.lastEditedAt)} • `}
                Created by {campaign.createdBy}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CampaignActionsMenu
                campaign={campaign}
                onDelete={onDelete}
                onView={onView}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onExport={onExport}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Channels */}
        <div className="flex items-center gap-2 flex-wrap">
          {campaign.channels.map((channel: string) => (
            <ChannelBadge key={channel} channel={channel} />
          ))}
        </div>

        {/* Audience */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{campaign.audience.count.toLocaleString()} customers</span>
          <span className="text-muted-foreground">• {campaign.audience.segmentName}</span>
        </div>

        {/* Status-specific content */}
        {campaign.status === "sent" && campaign.metrics && (
          <>
            <div className="grid grid-cols-4 gap-3 pt-4 border-t">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Delivered</div>
                <div className="text-lg font-bold">{campaign.metrics.deliveryRate}%</div>
                <div className="text-xs text-muted-foreground">
                  {campaign.metrics.delivered.toLocaleString()}/{campaign.metrics.sent.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Opens</div>
                <div className="text-lg font-bold">{campaign.metrics.openRate}%</div>
                <div className="text-xs text-muted-foreground">{campaign.metrics.opens.toLocaleString()} opens</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">CTR</div>
                <div className="text-lg font-bold">{campaign.metrics.clickRate}%</div>
                <div className="text-xs text-muted-foreground">{campaign.metrics.clicks.toLocaleString()} clicks</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Orders</div>
                <div className="text-lg font-bold">{campaign.metrics.conversions}</div>
                <div className="text-xs text-muted-foreground">conversions</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="font-semibold">€{campaign.metrics.revenue.toLocaleString()} revenue</span>
              <span className="text-muted-foreground">• ROI: {campaign.metrics.roi}x</span>
            </div>
          </>
        )}

        {campaign.status === "scheduled" && (
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertTitle>Awaiting send time</AlertTitle>
            <AlertDescription>
              {campaign.estimatedCost && <span>Estimated cost: €{campaign.estimatedCost}</span>}
            </AlertDescription>
          </Alert>
        )}

        {campaign.status === "sending" && campaign.progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning animate-pulse" />
                Sending in progress...
              </span>
              <span className="font-medium">
                {campaign.progress.sent.toLocaleString()}/{campaign.progress.total.toLocaleString()} (
                {campaign.progress.percentage}%)
              </span>
            </div>
            <Progress value={campaign.progress.percentage} />
            <div className="text-xs text-muted-foreground">
              Estimated completion: {campaign.progress.estimatedCompletion}
            </div>
          </div>
        )}

        {campaign.status === "failed" && campaign.error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Send failed: {campaign.error.message}</AlertTitle>
            <AlertDescription>
              {campaign.error.partialSent.toLocaleString()}/{campaign.error.partialTotal.toLocaleString()} sent before
              failure ({((campaign.error.partialSent / campaign.error.partialTotal) * 100).toFixed(1)}%)
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {campaign.status === "sent" && (
          <>
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </>
        )}
        {campaign.status === "scheduled" && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" onClick={() => console.log("[v0] Sending now:", campaign.id)}>
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("[v0] Pausing:", campaign.id)}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          </>
        )}
        {campaign.status === "sending" && (
          <>
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View Progress
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("[v0] Pausing:", campaign.id)}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="destructive" size="sm" onClick={() => console.log("[v0] Canceling:", campaign.id)}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
        {campaign.status === "failed" && (
          <>
            <Button variant="outline" size="sm" onClick={onView}>
              <AlertCircle className="w-4 h-4 mr-2" />
              View Error
            </Button>
            <Button size="sm" onClick={() => console.log("[v0] Retrying:", campaign.id)}>
              <Send className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit & Resend
            </Button>
          </>
        )}
        {campaign.status === "draft" && (
          <>
            <Button size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Continue Editing
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

// Campaigns Table Component
function CampaignsTable({
  campaigns,
  selectedCampaigns,
  onSelectAll,
  onSelect,
  onDelete,
  onView,
  onEdit,
  onDuplicate,
  onExport,
}: {
  campaigns: any[]
  selectedCampaigns: string[]
  onSelectAll: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onExport: (id: string) => void
}) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={selectedCampaigns.length === campaigns.length} onCheckedChange={onSelectAll} />
            </TableHead>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>CTR</TableHead>
            <TableHead>Conversions</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCampaigns.includes(campaign.id)}
                  onCheckedChange={() => onSelect(campaign.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{campaign.name}</span>
                  <StatusBadge status={campaign.status} size="sm" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {campaign.channels.map((channel: string) => (
                    <ChannelIcon key={channel} channel={channel} />
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{campaign.audience.count.toLocaleString()}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(
                    campaign.sentAt || campaign.schedule?.sendAt || campaign.startedAt || campaign.lastEditedAt,
                  )}
                </div>
              </TableCell>
              <TableCell>{campaign.metrics?.deliveryRate ? `${campaign.metrics.deliveryRate}%` : "-"}</TableCell>
              <TableCell>{campaign.metrics?.openRate ? `${campaign.metrics.openRate}%` : "-"}</TableCell>
              <TableCell>{campaign.metrics?.clickRate ? `${campaign.metrics.clickRate}%` : "-"}</TableCell>
              <TableCell>{campaign.metrics?.conversions || "-"}</TableCell>
              <TableCell>{campaign.metrics?.revenue ? `€${campaign.metrics.revenue.toLocaleString()}` : "-"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <CampaignActionsMenu
                      campaign={campaign}
                      onDelete={() => onDelete(campaign.id)}
                      onView={() => onView(campaign.id)}
                      onEdit={() => onEdit(campaign.id)}
                      onDuplicate={() => onDuplicate(campaign.id)}
                      onExport={() => onExport(campaign.id)}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// Status Badge Component
function StatusBadge({ status, size = "default" }: { status: string; size?: "sm" | "default" }) {
  const config = {
    draft: { icon: FileText, label: "Draft", variant: "secondary" as const },
    scheduled: { icon: Clock, label: "Scheduled", variant: "default" as const },
    sending: { icon: Send, label: "Sending", variant: "default" as const },
    sent: { icon: CheckCircle, label: "Sent", variant: "default" as const },
    paused: { icon: Pause, label: "Paused", variant: "secondary" as const },
    failed: { icon: XCircle, label: "Failed", variant: "destructive" as const },
  }

  const { icon: Icon, label, variant } = config[status as keyof typeof config] || config.draft

  return (
    <Badge variant={variant} className={cn("gap-1", size === "sm" && "text-xs py-0")}>
      <Icon className={cn("w-3 h-3", status === "sending" && "animate-pulse")} />
      {label}
    </Badge>
  )
}

// Channel Badge Component
function ChannelBadge({ channel }: { channel: string }) {
  const config = {
    email: { icon: Mail, label: "Email", className: "bg-primary/10 text-primary" },
    sms: { icon: MessageSquare, label: "SMS", className: "bg-success/10 text-success" },
    whatsapp: { icon: MessageCircle, label: "WhatsApp", className: "bg-success/10 text-success" },
    in_app: { icon: Smartphone, label: "In-App", className: "bg-chart-5/10 text-chart-5" },
    receipt: { icon: Receipt, label: "Receipt", className: "bg-warning/10 text-warning" },
  }

  const { icon: Icon, label, className } = config[channel as keyof typeof config] || config.email

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

// Channel Icon Component (for table view)
function ChannelIcon({ channel }: { channel: string }) {
  const config = {
    email: { icon: Mail, className: "text-primary" },
    sms: { icon: MessageSquare, className: "text-success" },
    whatsapp: { icon: MessageCircle, className: "text-success" },
    in_app: { icon: Smartphone, className: "text-chart-5" },
    receipt: { icon: Receipt, className: "text-warning" },
  }

  const { icon: Icon, className } = config[channel as keyof typeof config] || config.email

  return <Icon className={cn("w-4 h-4", className)} />
}

// Campaign Actions Menu
function CampaignActionsMenu({
  campaign,
  onDelete,
  onView,
  onEdit,
  onDuplicate,
  onExport,
}: {
  campaign: any
  onDelete: () => void
  onView: () => void
  onEdit: () => void
  onDuplicate: () => void
  onExport: () => void
}) {
  if (campaign.status === "sent") {
    return (
      <>
        <DropdownMenuItem onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          View Attribution
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate Campaign
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("[v0] Archiving:", campaign.id)}>
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </>
    )
  }

  if (campaign.status === "scheduled") {
    return (
      <>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Campaign
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("[v0] Sending now:", campaign.id)}>
          <Send className="w-4 h-4 mr-2" />
          Send Now
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Clock className="w-4 h-4 mr-2" />
          Change Send Time
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("[v0] Pausing:", campaign.id)}>
          <Pause className="w-4 h-4 mr-2" />
          Pause Campaign
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </>
    )
  }

  if (campaign.status === "sending") {
    return (
      <>
        <DropdownMenuItem onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          View Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("[v0] Pausing:", campaign.id)}>
          <Pause className="w-4 h-4 mr-2" />
          Pause Send
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => console.log("[v0] Canceling:", campaign.id)}>
          <XCircle className="w-4 h-4 mr-2" />
          Cancel Send
        </DropdownMenuItem>
      </>
    )
  }

  if (campaign.status === "failed") {
    return (
      <>
        <DropdownMenuItem onClick={onView}>
          <AlertCircle className="w-4 h-4 mr-2" />
          View Error Log
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("[v0] Retrying:", campaign.id)}>
          <Send className="w-4 h-4 mr-2" />
          Retry Send
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit & Resend
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </>
    )
  }

  // Draft
  return (
    <>
      <DropdownMenuItem onClick={onEdit}>
        <Edit className="w-4 h-4 mr-2" />
        Continue Editing
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="w-4 h-4 mr-2" />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Draft
      </DropdownMenuItem>
    </>
  )
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
