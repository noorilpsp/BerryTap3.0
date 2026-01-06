"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Plus, Trash2, RefreshCw, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WebhookSettingsTabProps {
  onSettingsChange: () => void
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: "active" | "failed" | "disabled"
  lastDelivery: string | null
  successRate: number
}

export function WebhookSettingsTab({ onSettingsChange }: WebhookSettingsTabProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "wh_1",
      url: "https://api.example.com/webhooks/transactions",
      events: ["transaction.succeeded", "transaction.failed", "refund.created"],
      status: "active",
      lastDelivery: "2 minutes ago",
      successRate: 99.8,
    },
    {
      id: "wh_2",
      url: "https://accounting.example.com/webhook",
      events: ["transaction.succeeded"],
      status: "active",
      lastDelivery: "1 hour ago",
      successRate: 100,
    },
  ])

  const [newWebhookUrl, setNewWebhookUrl] = useState("")

  const availableEvents = [
    { id: "transaction.created", label: "Transaction Created", description: "When a new transaction is initiated" },
    {
      id: "transaction.succeeded",
      label: "Transaction Succeeded",
      description: "When payment is successfully processed",
    },
    { id: "transaction.failed", label: "Transaction Failed", description: "When payment processing fails" },
    { id: "refund.created", label: "Refund Created", description: "When a refund is initiated" },
    { id: "refund.succeeded", label: "Refund Succeeded", description: "When refund is successfully processed" },
    { id: "refund.failed", label: "Refund Failed", description: "When refund processing fails" },
    { id: "dispute.created", label: "Dispute Created", description: "When a new dispute is filed" },
    { id: "dispute.updated", label: "Dispute Updated", description: "When dispute status changes" },
    { id: "dispute.closed", label: "Dispute Closed", description: "When dispute is resolved" },
  ]

  const handleAddWebhook = () => {
    if (newWebhookUrl) {
      const newWebhook: Webhook = {
        id: `wh_${Date.now()}`,
        url: newWebhookUrl,
        events: ["transaction.succeeded"],
        status: "active",
        lastDelivery: null,
        successRate: 100,
      }
      setWebhooks([...webhooks, newWebhook])
      setNewWebhookUrl("")
      onSettingsChange()
    }
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((wh) => wh.id !== id))
    onSettingsChange()
  }

  const handleTestWebhook = (id: string) => {
    console.log("[v0] Testing webhook:", id)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>Configure webhook URLs to receive real-time transaction events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Webhooks send HTTP POST requests to your specified URLs when events occur. Make sure your endpoints can
              handle POST requests.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Add New Webhook Endpoint</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://your-domain.com/webhooks"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
              <Button onClick={handleAddWebhook}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm">{webhook.url}</code>
                          <Badge
                            variant={
                              webhook.status === "active"
                                ? "default"
                                : webhook.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {webhook.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Last delivery: {webhook.lastDelivery || "Never"}</span>
                          <span className="flex items-center gap-1">
                            Success rate: {webhook.successRate}%
                            {webhook.successRate === 100 ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-yellow-600" />
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(webhook.id)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(webhook.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Subscribed Events ({webhook.events.length})</Label>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>Events that can trigger webhook notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableEvents.map((event) => (
              <div key={event.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium">{event.id}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Security</CardTitle>
          <CardDescription>Signing secret for verifying webhook authenticity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook Signing Secret</Label>
            <div className="flex gap-2">
              <Input value="whsec_••••••••••••••••••••••••••••" readOnly className="font-mono" />
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this secret to verify webhook signatures in your application
            </p>
          </div>

          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
