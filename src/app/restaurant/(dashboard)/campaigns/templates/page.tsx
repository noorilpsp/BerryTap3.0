"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Receipt,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Download,
  Upload,
  ChevronDown,
  Star,
  Archive,
  Send,
  TrendingUp,
} from "lucide-react"
import { mockTemplatesData } from "./templates-mock-data"
import { cn } from "@/lib/utils"

type ChannelFilter = "all" | "email" | "sms" | "whatsapp" | "in_app" | "receipt"
type CategoryFilter =
  | "all"
  | "welcome"
  | "promotional"
  | "win_back"
  | "announcement"
  | "seasonal"
  | "birthday"
  | "transactional"
type OwnerFilter = "all" | "my_templates" | "team" | "system"
type SortOption = "recent" | "most_used" | "highest_rated" | "best_performance"

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const { templates, categoryCounts } = mockTemplatesData

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.subjectLine?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      )
    }

    if (channelFilter !== "all") {
      filtered = filtered.filter((t) => t.channels.includes(channelFilter))
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    if (ownerFilter !== "all") {
      if (ownerFilter === "my_templates") {
        filtered = filtered.filter((t) => t.createdBy === "You")
      } else {
        filtered = filtered.filter((t) => t.owner === ownerFilter)
      }
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "most_used":
          return b.usageCount - a.usageCount
        case "highest_rated":
          return b.rating - a.rating
        case "best_performance":
          return (b.avgMetrics?.openRate || 0) - (a.avgMetrics?.openRate || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [templates, searchQuery, channelFilter, categoryFilter, ownerFilter, sortBy])

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Import
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import from HTML
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import from URL
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="w-4 h-4 mr-2" />
                Import from File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" asChild>
            <Link href="/campaigns/templates/new">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Email & SMS Templates</h1>
        <p className="text-muted-foreground">Create and manage reusable templates for your campaigns</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="win_back">Win-Back</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v as OwnerFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="my_templates">My Templates</SelectItem>
                <SelectItem value="team">Team Templates</SelectItem>
                <SelectItem value="system">System Templates</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="most_used">Most Used</SelectItem>
                <SelectItem value="highest_rated">Highest Rated</SelectItem>
                <SelectItem value="best_performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={categoryFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("all")}
        >
          All ({categoryCounts.all})
        </Button>
        <Button
          variant={categoryFilter === "welcome" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("welcome")}
        >
          Welcome ({categoryCounts.welcome})
        </Button>
        <Button
          variant={categoryFilter === "promotional" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("promotional")}
        >
          Promotional ({categoryCounts.promotional})
        </Button>
        <Button
          variant={categoryFilter === "win_back" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("win_back")}
        >
          Win-Back ({categoryCounts.win_back})
        </Button>
        <Button
          variant={categoryFilter === "announcement" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("announcement")}
        >
          Announcement ({categoryCounts.announcement})
        </Button>
        <Button
          variant={categoryFilter === "seasonal" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoryFilter("seasonal")}
        >
          Seasonal ({categoryCounts.seasonal})
        </Button>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || channelFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Create your first template to get started"}
            </p>
            <Button asChild>
              <Link href="/campaigns/templates/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onPreview={() => setPreviewTemplate(template)} />
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline">
              Load More Templates • Showing {filteredTemplates.length} of {templates.length}
            </Button>
          </div>
        </>
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <TemplatePreviewDialog
          template={previewTemplate}
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  )
}

function TemplateCard({ template, onPreview }: { template: any; onPreview: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            {template.channels.includes("email") ? (
              <Mail className="w-12 h-12 text-primary/40" />
            ) : (
              <MessageSquare className="w-12 h-12 text-success/40" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold">{template.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            {template.channels.map((channel: string) => (
              <ChannelBadge key={channel} channel={channel} />
            ))}
            {template.status === "draft" && <Badge variant="secondary">Draft</Badge>}
          </div>
        </div>

        {template.subjectLine && (
          <p className="text-sm text-muted-foreground line-clamp-1">Subject: {template.subjectLine}</p>
        )}

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium">{template.rating}</span>
          </div>
          <span className="text-muted-foreground">({template.usageCount} uses)</span>
        </div>

        {template.avgMetrics && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Open Rate:</span>
              <span
                className={cn(
                  "font-medium",
                  template.avgMetrics.openRate >= 35 ? "text-success" : "text-muted-foreground",
                )}
              >
                {template.avgMetrics.openRate}%
              </span>
            </div>
            {template.avgMetrics.ctr && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg CTR:</span>
                <span className="font-medium">{template.avgMetrics.ctr}%</span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Variables: {template.variables.length}</div>
          <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
          <div>By: {template.createdBy}</div>
          {template.lastUsed && <div>Last used: {template.lastUsed}</div>}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/campaigns/new?template=${template.id}`}>
            <Send className="w-4 h-4 mr-2" />
            Use
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  const config = {
    email: { icon: Mail, label: "Email", className: "bg-primary/10 text-primary" },
    sms: { icon: MessageSquare, label: "SMS", className: "bg-success/10 text-success" },
    whatsapp: { icon: MessageCircle, label: "WhatsApp", className: "bg-success/10 text-success" },
    in_app: { icon: Smartphone, label: "In-App", className: "bg-chart-5/10 text-chart-5" },
    receipt: { icon: Receipt, label: "Receipt", className: "bg-warning/10 text-warning" },
  }

  const { icon: Icon, className } = config[channel as keyof typeof config] || config.email

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon className="w-3 h-3" />
    </Badge>
  )
}

function TemplatePreviewDialog({ template, open, onClose }: { template: any; open: boolean; onClose: () => void }) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile" | "tablet">("desktop")
  const [testEmail, setTestEmail] = useState("")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{template.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {template.channels.map((channel: string) => (
                  <ChannelBadge key={channel} channel={channel} />
                ))}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/campaigns/templates/${template.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/campaigns/new?template=${template.id}`}>
                  <Send className="w-4 h-4 mr-2" />
                  Use
                </Link>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 mt-4">
          {/* Preview */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant={deviceView === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceView("desktop")}
              >
                Desktop
              </Button>
              <Button
                variant={deviceView === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceView("mobile")}
              >
                Mobile
              </Button>
              <Button
                variant={deviceView === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceView("tablet")}
              >
                Tablet
              </Button>
            </div>

            <Card
              className={cn(
                "mx-auto",
                deviceView === "desktop" && "max-w-full",
                deviceView === "tablet" && "max-w-md",
                deviceView === "mobile" && "max-w-sm",
              )}
            >
              <CardContent className="p-6 space-y-4">
                {template.channels.includes("email") && (
                  <>
                    <div className="pb-4 border-b space-y-1">
                      <div className="text-sm text-muted-foreground">From: BerryTap Restaurant</div>
                      <div className="font-medium">Subject: {template.subjectLine}</div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p>Hi Sarah,</p>
                      <p>{template.preview}</p>
                      <div className="my-6">
                        <Button>View Offer</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">The BerryTap Team</p>
                    </div>

                    <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                      Unsubscribe | Preferences
                    </div>
                  </>
                )}

                {template.channels.includes("sms") && !template.channels.includes("email") && (
                  <div className="space-y-2">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-sm">{template.preview}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">Reply STOP to unsubscribe</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Template Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel:</span>
                  <span className="font-medium">{template.channels.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{template.category.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium">English</span>
                </div>
              </div>
            </div>

            {template.avgMetrics && (
              <div>
                <h4 className="font-semibold mb-3">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used in:</span>
                    <span className="font-medium">{template.usageCount} campaigns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg Open Rate:</span>
                    <span className="font-medium flex items-center gap-1">
                      {template.avgMetrics.openRate}%
                      <TrendingUp className="w-3 h-3 text-success" />
                    </span>
                  </div>
                  {template.avgMetrics.ctr && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg CTR:</span>
                      <span className="font-medium">{template.avgMetrics.ctr}%</span>
                    </div>
                  )}
                  {template.avgMetrics.conversions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Conversions:</span>
                      <span className="font-medium">{template.avgMetrics.conversions}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Variables ({template.variables.length})</h4>
              <div className="space-y-1 text-sm">
                {template.variables.map((variable: string) => (
                  <div key={variable} className="text-muted-foreground">
                    • {variable}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Send Test Email</h4>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button className="w-full" size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
              <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
              <div>By: {template.createdBy}</div>
              {template.lastModified && <div>Modified: {template.lastModified}</div>}
              {template.lastUsed && <div>Last used: {template.lastUsed}</div>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
