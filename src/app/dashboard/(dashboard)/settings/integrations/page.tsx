"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Settings, TestTube, MoreVertical, Check, X, AlertTriangle, Clock, Zap } from "lucide-react"
import { mockIntegrations, mockWebhooks } from "./data"
import type { IntegrationCategory, IntegrationStatus } from "./types"
import { IntegrationDetailDrawer } from "./components/integration-detail-drawer"
import { ConnectIntegrationModal } from "./components/connect-integration-modal"
import { AddWebhookModal } from "./components/add-webhook-modal"
import { WebhookDetailModal } from "./components/webhook-detail-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function TimeDisplay({ date }: { date: Date | string }) {
  const [timeString, setTimeString] = useState<string>("")

  useEffect(() => {
    setTimeString(new Date(date).toLocaleTimeString())
  }, [date])

  return <>{timeString || "--:--:--"}</>
}

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | IntegrationCategory>("all")
  const [selectedStatus, setSelectedStatus] = useState<"all" | IntegrationStatus>("all")
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  const [showAddWebhook, setShowAddWebhook] = useState(false)

  const connectedIntegrations = mockIntegrations.filter((i) => i.status === "connected")
  const availableIntegrations = mockIntegrations.filter((i) => i.status === "not_connected")

  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || integration.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const groupedIntegrations = filteredIntegrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = []
      }
      acc[integration.category].push(integration)
      return acc
    },
    {} as Record<IntegrationCategory, typeof mockIntegrations>,
  )

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "setup_needed":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Setup Needed
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="secondary">Not Connected</Badge>
    }
  }

  const getCategoryIcon = (category: IntegrationCategory) => {
    const icons = {
      payment: "💳",
      delivery: "🚚",
      messaging: "💬",
      accounting: "📊",
      analytics: "📈",
    }
    return icons[category] || "🔌"
  }

  const getCategoryLabel = (category: IntegrationCategory) => {
    const labels = {
      payment: "Payments",
      delivery: "Delivery & Logistics",
      messaging: "Messaging",
      accounting: "Accounting",
      analytics: "Analytics",
    }
    return labels[category] || category
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect external services to extend BerryTap's functionality</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddWebhook(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Webhook
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{connectedIntegrations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">All healthy ✅</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{availableIntegrations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to connect</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Webhooks</p>
                <p className="text-2xl font-bold">{mockWebhooks.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                <p className="text-2xl font-bold">5m ago</p>
                <p className="text-xs text-muted-foreground mt-1">Stripe</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="payment">💳 Payments</SelectItem>
            <SelectItem value="delivery">🚚 Delivery</SelectItem>
            <SelectItem value="messaging">💬 Messaging</SelectItem>
            <SelectItem value="accounting">📊 Accounting</SelectItem>
            <SelectItem value="analytics">📈 Analytics</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="not_connected">Not Connected</SelectItem>
            <SelectItem value="setup_needed">Setup Needed</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, integrations]) => {
        const connectedCount = integrations.filter((i) => i.status === "connected").length
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {getCategoryIcon(category as IntegrationCategory)} {getCategoryLabel(category as IntegrationCategory)} (
                {connectedCount}/{integrations.length} connected)
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{integration.logo}</div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedIntegration(integration.id)}>
                            View Details
                          </DropdownMenuItem>
                          {integration.documentation && (
                            <DropdownMenuItem onClick={() => window.open(integration.documentation, "_blank")}>
                              Documentation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                    {integration.status === "connected" && integration.stats && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Activity Today</p>
                        <p className="text-sm font-medium">
                          {integration.stats.todayCount} transactions
                          {integration.stats.todayValue && ` • €${integration.stats.todayValue.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: <TimeDisplay date={integration.lastSyncAt!} />
                        </p>
                      </div>
                    )}

                    {integration.status === "setup_needed" && (
                      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          API credentials expired
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {integration.status === "connected" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedIntegration(integration.id)}
                          >
                            Configure
                          </Button>
                          <Button size="sm" variant="outline">
                            <TestTube className="h-4 w-4" />
                          </Button>
                        </>
                      ) : integration.status === "setup_needed" ? (
                        <Button size="sm" className="flex-1" onClick={() => setConnectingIntegration(integration.key)}>
                          Reconnect
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => setConnectingIntegration(integration.key)}
                          >
                            Connect
                          </Button>
                          <Button size="sm" variant="outline">
                            Learn More
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Custom Webhooks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">🪝 Custom Webhooks ({mockWebhooks.length} active)</h2>
          <Button onClick={() => setShowAddWebhook(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        <div className="space-y-3">
          {mockWebhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-mono text-sm truncate">{webhook.url}</h3>
                      <Badge variant={webhook.enabled ? "default" : "secondary"} className="shrink-0">
                        {webhook.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Events: {webhook.events.includes("*") ? "All events" : webhook.events.join(", ")} • Last:{" "}
                      {new Date(webhook.lastDeliveryAt!).toLocaleTimeString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedWebhook(webhook.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedWebhook(webhook.id)}>
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals and Drawers */}
      {selectedIntegration && (
        <IntegrationDetailDrawer
          integrationId={selectedIntegration}
          open={!!selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}

      {connectingIntegration && (
        <ConnectIntegrationModal
          integrationKey={connectingIntegration}
          open={!!connectingIntegration}
          onClose={() => setConnectingIntegration(null)}
        />
      )}

      {showAddWebhook && <AddWebhookModal open={showAddWebhook} onClose={() => setShowAddWebhook(false)} />}

      {selectedWebhook && (
        <WebhookDetailModal
          webhookId={selectedWebhook}
          open={!!selectedWebhook}
          onClose={() => setSelectedWebhook(null)}
        />
      )}
    </div>
  )
}
