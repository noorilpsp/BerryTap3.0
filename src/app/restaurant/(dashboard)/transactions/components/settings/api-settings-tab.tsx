"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Copy, RotateCw, Trash2, Plus, CheckCircle, BookOpen, Download, ExternalLink } from "lucide-react"

interface ApiSettingsTabProps {
  onSettingsChange: () => void
}

export function ApiSettingsTab({ onSettingsChange }: ApiSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API access to your transaction data</CardDescription>
            </div>
            <Button size="sm" onClick={onSettingsChange}>
              <Plus className="mr-2 h-4 w-4" />
              Create New API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Production API Key */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Production API Key</h3>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Key:</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">bt_live_••••••••••••1234</code>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>Oct 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last used:</span>
                <span>2 minutes ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions:</span>
                <span>Read/Write</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate limit:</span>
                <span>1,000 requests/hour</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Recent activity:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last hour:</span>
                  <span>234 requests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last 24 hours:</span>
                  <span>5,678 requests</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                Reveal
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={onSettingsChange}>
                <RotateCw className="mr-2 h-3 w-3" />
                Rotate
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-3 w-3" />
                Revoke
              </Button>
            </div>
          </div>

          {/* Development API Key */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Development API Key</h3>
              <Badge variant="outline">Test Mode</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Key:</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">bt_test_••••••••••••5678</code>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>Nov 1, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last used:</span>
                <span>3 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions:</span>
                <span>Read only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate limit:</span>
                <span>100 requests/hour</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                Reveal
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={onSettingsChange}>
                <RotateCw className="mr-2 h-3 w-3" />
                Rotate
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-3 w-3" />
                Revoke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Access comprehensive guides and references</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Base URL:</p>
            <code className="rounded bg-muted px-3 py-2 text-sm">https://api.berrytap.com/v1</code>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Available Endpoints:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">GET</code>
                <span>/transactions - List all transactions</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">GET</code>
                <span>/transactions/:id - Get transaction details</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">POST</code>
                <span>/transactions/:id/refund - Issue refund</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">POST</code>
                <span>/transactions/:id/dispute - Manage dispute</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">GET</code>
                <span>/transactions/export - Export transactions</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              View Full API Documentation
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download OpenAPI Spec
            </Button>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Try in Postman
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Configure event notifications to your systems</CardDescription>
            </div>
            <Button size="sm" onClick={onSettingsChange}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Accounting System Webhook</h3>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">URL:</span>
                <code className="font-mono text-xs">https://accounting.berrytap.com/webhooks/transactions</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>Oct 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last delivery:</span>
                <span>2 minutes ago (✅ 200 OK)</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Delivery stats (last 30 days):</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span>5,678 deliveries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success:</span>
                  <span className="text-success">5,654 (99.6%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed:</span>
                  <span className="text-destructive">24 (0.4%)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSettingsChange}>
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Test
              </Button>
              <Button variant="outline" size="sm">
                View Logs
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Disable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
