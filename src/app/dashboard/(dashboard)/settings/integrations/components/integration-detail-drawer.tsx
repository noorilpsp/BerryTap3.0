"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { mockIntegrations } from "../data"
import { Check, ExternalLink, TestTube, Trash2, RotateCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface IntegrationDetailDrawerProps {
  integrationId: string
  open: boolean
  onClose: () => void
}

export function IntegrationDetailDrawer({ integrationId, open, onClose }: IntegrationDetailDrawerProps) {
  const integration = mockIntegrations.find((i) => i.id === integrationId)
  const { toast } = useToast()
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [disconnectConfirmation, setDisconnectConfirmation] = useState("")
  const [features, setFeatures] = useState(integration?.features || [])

  if (!integration) return null

  const handleTestConnection = () => {
    toast({
      title: "Testing connection...",
      description: "Please wait while we verify the connection.",
    })

    setTimeout(() => {
      toast({
        title: "Connection successful!",
        description: `${integration.name} is working correctly.`,
      })
    }, 1500)
  }

  const handleSync = () => {
    toast({
      title: "Syncing data...",
      description: `Synchronizing with ${integration.name}`,
    })

    setTimeout(() => {
      toast({
        title: "Sync complete!",
        description: "All data is up to date.",
      })
    }, 2000)
  }

  const handleDisconnect = () => {
    if (disconnectConfirmation !== "DISCONNECT") {
      toast({
        title: "Type DISCONNECT to confirm",
        variant: "destructive",
      })
      return
    }

    toast({
      title: `${integration.name} disconnected`,
      description: "The integration has been removed.",
    })
    setShowDisconnect(false)
    onClose()
  }

  const toggleFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures[index].enabled = !newFeatures[index].enabled
    setFeatures(newFeatures)
    toast({
      title: "Feature updated",
      description: `${newFeatures[index].name} ${newFeatures[index].enabled ? "enabled" : "disabled"}`,
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <span className="text-3xl">{integration.logo}</span>
              {integration.name} Integration
            </SheetTitle>
            <SheetDescription>
              {integration.status === "connected" ? (
                <Badge className="bg-green-500/10 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Connected & Healthy
                </Badge>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Connection Info */}
            {integration.status === "connected" && (
              <div>
                <h3 className="font-semibold mb-3">Connection Info</h3>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-medium">BerryTap Restaurant</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account ID:</span>
                      <span className="font-mono text-xs">{integration.config?.accountId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge variant={integration.config?.mode === "live" ? "default" : "secondary"}>
                        {integration.config?.mode}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected:</span>
                      <span>
                        {new Date(integration.connectedAt!).toLocaleDateString()} by {integration.connectedByName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last sync:</span>
                      <span>{new Date(integration.lastSyncAt!).toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleTestConnection}>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSync}>
                        <RotateCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                      {integration.documentation && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(integration.documentation, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Stats */}
            {integration.stats && (
              <div>
                <h3 className="font-semibold mb-3">Activity (Last 24 Hours)</h3>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transactions:</span>
                      <span className="font-semibold">{integration.stats.todayCount}</span>
                    </div>
                    {integration.stats.todayValue && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total processed:</span>
                        <span className="font-semibold">€{integration.stats.todayValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success rate:</span>
                      <span className="font-semibold">{integration.stats.successRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features & Settings */}
            <div>
              <h3 className="font-semibold mb-3">Features & Settings</h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{feature.name}</span>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeature(index)}
                        disabled={integration.status !== "connected"}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Webhooks */}
            {integration.webhookUrl && (
              <div>
                <h3 className="font-semibold mb-3">Webhooks</h3>
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Webhook URL:</span>
                      <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">{integration.webhookUrl}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Listening for:</span>
                      <ul className="mt-2 space-y-1">
                        {integration.webhookEvents?.map((event, i) => (
                          <li key={i} className="text-xs">
                            • {event}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Danger Zone */}
            {integration.status === "connected" && (
              <div>
                <h3 className="font-semibold mb-3 text-destructive">Danger Zone</h3>
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Disconnect {integration.name}</p>
                        <p className="text-sm text-muted-foreground">This will stop all integration functionality</p>
                      </div>
                      <Button variant="destructive" onClick={() => setShowDisconnect(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {integration.name}?</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-4 py-2">
              <div>This action will immediately:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Stop processing new transactions</li>
                <li>Disable all integration features</li>
                <li>Stop webhook events</li>
                <li>Preserve historical data</li>
              </ul>
              <div className="pt-4">
                <label className="text-sm font-medium">Type DISCONNECT to confirm:</label>
                <Input
                  value={disconnectConfirmation}
                  onChange={(e) => setDisconnectConfirmation(e.target.value)}
                  placeholder="DISCONNECT"
                  className="mt-2"
                />
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisconnectConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect Integration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
