"use client"

import { useState } from "react"
import {
  CreditCard,
  Settings,
  TrendingUp,
  MapPin,
  Users,
  Package,
  Database,
  Mail,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { mockSubscription, mockUsage, mockPaymentMethods, mockInvoices } from "./data"
import { PlanComparisonModal } from "./components/plan-comparison-modal"
import { AddPaymentMethodModal } from "./components/add-payment-method-modal"
import { CancelSubscriptionModal } from "./components/cancel-subscription-modal"
import { BillingSettingsModal } from "./components/billing-settings-modal"
import { PaymentMethodCard } from "./components/payment-method-card"

export default function SubscriptionPage() {
  const { toast } = useToast()
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showCancelSubscription, setShowCancelSubscription] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const subscription = mockSubscription
  const usage = mockUsage
  const paymentMethods = mockPaymentMethods
  const invoices = mockInvoices

  const getUsagePercentage = (used: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0
    return (used / limit) * 100
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return "danger"
    if (percentage >= 70) return "warning"
    return "normal"
  }

  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat("en-MT", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    // Use a consistent format that works on both server and client
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const downloadInvoice = (invoice: (typeof invoices)[0]) => {
    toast({
      title: "Downloading invoice",
      description: `Invoice ${invoice.number} is being downloaded.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, payment methods, and billing history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <CardTitle className="text-2xl">{subscription.planName} Plan</CardTitle>
              </div>
              <p className="text-muted-foreground mt-1">Perfect for growing restaurants</p>
            </div>
            <Button onClick={() => setShowPlanComparison(true)}>Upgrade to Enterprise</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Price</p>
              <p className="text-2xl font-bold">{formatCurrency(subscription.billing.amount)}/month</p>
              <p className="text-xs text-muted-foreground">{subscription.limits.locations} locations</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="text-lg font-semibold">Monthly</p>
              <p className="text-xs text-muted-foreground">Renews automatically</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Next Billing</p>
              <p className="text-lg font-semibold">{formatDate(subscription.nextBillingDate)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(subscription.nextBillingAmount)} due</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPlanComparison(true)}>
              Change Plan
            </Button>
            <Button variant="outline" onClick={() => setShowPlanComparison(true)}>
              View All Plans
            </Button>
            <Button variant="ghost" className="text-red-600" onClick={() => setShowCancelSubscription(true)}>
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage This Period */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usage This Period ({formatDate(usage.period.start)} - {formatDate(usage.period.end)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Locations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Locations</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.locations.used} of {usage.locations.limit} used
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.locations.used, usage.locations.limit)} className="h-2" />
              <div className="flex items-center gap-1 text-sm">
                {usage.locations.used >= usage.locations.limit ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Limit reached</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {usage.locations.limit - usage.locations.used} available
                  </span>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Team Members</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.teamMembers.used} of {usage.teamMembers.limit} used
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.teamMembers.used, usage.teamMembers.limit)} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {usage.teamMembers.limit - usage.teamMembers.used} seats available
              </div>
            </div>

            {/* Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Orders</span>
                </div>
                <span className="text-sm text-muted-foreground">{usage.orders.used.toLocaleString()} orders</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="text-sm text-muted-foreground">Unlimited ✨</div>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Storage</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.storage.used} GB of {usage.storage.limit} GB
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.storage.used, usage.storage.limit)} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {usage.storage.limit - usage.storage.used} GB remaining
              </div>
            </div>

            {/* API Calls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">API Calls</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.apiCalls.used.toLocaleString()} of{" "}
                  {typeof usage.apiCalls.limit === "number"
                    ? usage.apiCalls.limit.toLocaleString()
                    : usage.apiCalls.limit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit)} className="h-2" />
              {getUsagePercentage(usage.apiCalls.used, usage.apiCalls.limit) >= 90 && (
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>89% used</span>
                </div>
              )}
            </div>

            {/* Email Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email Credits</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.emailCredits.used} of {usage.emailCredits.limit}
                </span>
              </div>
              <Progress value={getUsagePercentage(usage.emailCredits.used, usage.emailCredits.limit)} className="h-2" />
              {getUsagePercentage(usage.emailCredits.used, usage.emailCredits.limit) >= 90 && (
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>89% used</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Methods</CardTitle>
            <Button onClick={() => setShowAddPayment(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline">View All Invoices</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatDate(invoice.date)}</span>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {invoice.status === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => downloadInvoice(invoice)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Upcoming Charges */}
          <div>
            <h3 className="font-semibold mb-3">Upcoming Charges</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{formatDate(subscription.nextBillingDate)} • Pro Plan Monthly Renewal</span>
                  <span className="font-semibold">{formatCurrency(subscription.nextBillingAmount)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Will be charged to {paymentMethods.find((m) => m.isDefault)?.card?.brand} ••
                  {paymentMethods.find((m) => m.isDefault)?.card?.last4}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PlanComparisonModal
        open={showPlanComparison}
        onOpenChange={setShowPlanComparison}
        currentPlanId={subscription.planId}
      />
      <AddPaymentMethodModal open={showAddPayment} onOpenChange={setShowAddPayment} />
      <CancelSubscriptionModal
        open={showCancelSubscription}
        onOpenChange={setShowCancelSubscription}
        subscription={subscription}
      />
      <BillingSettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
