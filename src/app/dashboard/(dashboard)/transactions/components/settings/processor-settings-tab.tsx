"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, CreditCard, Smartphone, Plus } from "lucide-react"

interface ProcessorSettingsTabProps {
  onSettingsChange: () => void
}

export function ProcessorSettingsTab({ onSettingsChange }: ProcessorSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Connected Processors */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Processors (2)</CardTitle>
          <CardDescription>Manage your payment gateway integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Stripe</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                    <Badge variant="outline">Live Mode</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account ID:</span>
                <span className="font-mono">acct_1A2B3C4D5E6F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected:</span>
                <span>Oct 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last sync:</span>
                <span>2 minutes ago</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Processing volume (last 30 days):</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions:</span>
                  <span>1,123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">€84,567.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees:</span>
                  <span>€2,536.89</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSettingsChange}>
                Configure
              </Button>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
              <Button variant="outline" size="sm">
                View in Stripe
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Disconnect
              </Button>
            </div>
          </div>

          {/* Square */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Square</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                    <Badge variant="outline">Production</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant ID:</span>
                <span className="font-mono">sq_1A2B3C4D5E6F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected:</span>
                <span>Nov 1, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last sync:</span>
                <span>5 minutes ago</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Processing volume (last 30 days):</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions:</span>
                  <span>234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">€12,345.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees:</span>
                  <span>€370.35</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSettingsChange}>
                Configure
              </Button>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
              <Button variant="outline" size="sm">
                View in Square
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Processor */}
      <Card>
        <CardHeader>
          <CardTitle>Add Processor</CardTitle>
          <CardDescription>Connect additional payment gateways</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Connect Stripe</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Connect Square</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Connect PayPal</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Connect Toast</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Connect Adyen</span>
            </Button>
            <Button variant="outline" className="h-auto justify-start gap-3 p-4 bg-transparent">
              <Plus className="h-5 w-5" />
              <span>Custom Integration</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
