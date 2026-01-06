"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { mockWebhooks, mockWebhookDeliveries } from "../data"
import { Check, X, Clock, Copy, RotateCw, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WebhookDetailModalProps {
  webhookId: string
  open: boolean
  onClose: () => void
}

export function WebhookDetailModal({ webhookId, open, onClose }: WebhookDetailModalProps) {
  const webhook = mockWebhooks.find((w) => w.id === webhookId)
  const deliveries = mockWebhookDeliveries.filter((d) => d.webhookId === webhookId)
  const { toast } = useToast()
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)

  if (!webhook) return null

  const delivery = deliveries.find((d) => d.id === selectedDelivery)

  const handleTest = () => {
    toast({
      title: "Sending test webhook...",
      description: "A test event will be sent to your endpoint",
    })

    setTimeout(() => {
      toast({
        title: "Test successful!",
        description: "Webhook endpoint responded with 200 OK",
      })
    }, 1500)
  }

  const handleRetry = (deliveryId: string) => {
    toast({
      title: "Retrying delivery...",
      description: "Attempting to resend the webhook event",
    })

    setTimeout(() => {
      toast({
        title: "Retry successful!",
        description: "Webhook delivery completed",
      })
    }, 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Webhook Details</DialogTitle>
          <DialogDescription>{webhook.name || webhook.url}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliveries">Delivery Logs ({deliveries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Configuration</h4>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted p-2 rounded">{webhook.url}</code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhook.url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Events</p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {event === "*" ? "All events" : event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Retry Strategy</p>
                      <p className="text-sm font-medium">{webhook.retryConfig.strategy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Max Attempts</p>
                      <p className="text-sm font-medium">{webhook.retryConfig.maxAttempts}</p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" onClick={handleTest}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Send Test Event
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Statistics</h4>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold">{webhook.stats.totalDeliveries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Success</p>
                      <p className="text-2xl font-bold text-green-600">{webhook.stats.successfulDeliveries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{webhook.stats.failedDeliveries}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-lg font-bold">{webhook.stats.successRate}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-3">
            {deliveries.map((d) => (
              <Card key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDelivery(d.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {d.status === "success" ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : d.status === "pending" ? (
                        <Clock className="h-5 w-5 text-orange-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{d.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.createdAt).toLocaleString()} •
                          {d.response
                            ? ` ${d.response.status} ${d.response.statusText} • ${d.response.time}ms`
                            : " No response"}
                        </p>
                      </div>
                    </div>
                    {d.status === "failed" && (
                      <Button size="sm" variant="outline" onClick={() => handleRetry(d.id)}>
                        <RotateCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                  {d.error && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {d.error.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {deliveries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No delivery logs yet</p>
                <p className="text-sm">Events will appear here once they start triggering</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delivery Detail View */}
        {delivery && selectedDelivery && (
          <div className="mt-4 p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Delivery Details</h4>
              <Button size="sm" variant="ghost" onClick={() => setSelectedDelivery(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Request</p>
              <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(delivery.request, null, 2)}</pre>
              </div>
            </div>

            {delivery.response && (
              <div>
                <p className="text-sm font-medium mb-2">Response</p>
                <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify(delivery.response, null, 2)}</pre>
                </div>
              </div>
            )}

            {delivery.retryHistory && delivery.retryHistory.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Retry History</p>
                <div className="space-y-2">
                  {delivery.retryHistory.map((retry, i) => (
                    <div key={i} className="text-xs p-2 bg-muted rounded">
                      Attempt {retry.attempt}: {retry.status} at {new Date(retry.timestamp).toLocaleTimeString()}
                      {retry.error && ` - ${retry.error}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
