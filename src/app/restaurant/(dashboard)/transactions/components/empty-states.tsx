"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Search, CheckCircle2, AlertCircle, Plug, BookOpen, MessageCircle, ArrowRight } from "lucide-react"

interface EmptyStateProps {
  type: "no-transactions" | "no-results" | "no-refunds" | "connection-error" | "no-processor"
  searchQuery?: string
  onAction?: () => void
  onSecondaryAction?: () => void
}

export function EmptyState({ type, searchQuery, onAction, onSecondaryAction }: EmptyStateProps) {
  if (type === "no-transactions") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No transactions yet</h3>
          <p className="mb-8 max-w-md text-muted-foreground">
            Your transaction history will appear here once you start accepting payments from customers.
          </p>

          <Button onClick={onAction} size="lg" className="mb-8">
            Connect Payment Processor
          </Button>

          <div className="mb-6 text-sm font-medium text-muted-foreground">Getting started:</div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-3xl">1️⃣</div>
                <h4 className="mb-2 font-semibold">Connect Processor</h4>
                <p className="mb-4 text-sm text-muted-foreground">Link your Stripe, Square, or payment processor</p>
                <Button variant="link" size="sm" onClick={onAction}>
                  Get Started <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-3xl">2️⃣</div>
                <h4 className="mb-2 font-semibold">Configure Settings</h4>
                <p className="mb-4 text-sm text-muted-foreground">Set up refund policies and notifications</p>
                <Button variant="link" size="sm" onClick={onSecondaryAction}>
                  Configure <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3 text-3xl">3️⃣</div>
                <h4 className="mb-2 font-semibold">Accept Payment</h4>
                <p className="mb-4 text-sm text-muted-foreground">Start processing your first customer transaction</p>
                <Button variant="link" size="sm">
                  Learn How <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button variant="link" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
            <Button variant="link" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "no-results") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No results found</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            We couldn't find any transactions matching {searchQuery ? `"${searchQuery}"` : "your filters"}
          </p>

          <div className="mb-8 max-w-md text-left">
            <p className="mb-2 text-sm font-medium">Try adjusting your search:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Check the transaction ID spelling</li>
              <li>• Try searching by order ID or customer email</li>
              <li>• Use broader date ranges</li>
              <li>• Clear some filters</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => (searchQuery ? onAction?.() : undefined)}>
              Clear Search
            </Button>
            <Button variant="outline" onClick={onSecondaryAction}>
              Clear All Filters
            </Button>
            <Button>Browse All</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "no-refunds") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No refunds found</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            You haven't processed any refunds yet. This is a good sign!
          </p>

          <div className="mb-8 max-w-md text-left">
            <p className="mb-2 text-sm font-medium">When you need to issue a refund:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Open any transaction</li>
              <li>• Click "Refund" button</li>
              <li>• Choose amount and reason</li>
              <li>• Confirm and process</li>
            </ul>
          </div>

          <Button variant="link">
            Learn About Refunds <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (type === "connection-error") {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Unable to load transactions</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            We're having trouble connecting to the server. Please check your internet connection.
          </p>

          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <p className="mb-1 text-sm font-medium">Error details:</p>
              <p className="text-xs text-muted-foreground">Network timeout after 30 seconds</p>
              <p className="text-xs text-muted-foreground">Code: ERR_NETWORK_TIMEOUT</p>
            </CardContent>
          </Card>

          <div className="mb-4 flex items-center gap-2">
            <Button onClick={onAction}>Try Again</Button>
            <Button variant="outline" onClick={onSecondaryAction}>
              Check Status
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Last successful sync: 5 minutes ago</p>
        </CardContent>
      </Card>
    )
  }

  if (type === "no-processor") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Plug className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No payment processor connected</h3>
          <p className="mb-8 max-w-md text-muted-foreground">
            Connect a payment processor to start viewing and managing your transactions.
          </p>

          <div className="mb-8">
            <p className="mb-4 text-sm font-medium">Supported processors:</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Stripe", "Square", "Toast", "PayPal"].map((processor) => (
                <Card key={processor}>
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 text-2xl">
                      {processor === "Stripe" && "💳"}
                      {processor === "Square" && "📱"}
                      {processor === "Toast" && "🍞"}
                      {processor === "PayPal" && "💰"}
                    </div>
                    <p className="mb-3 font-semibold">{processor}</p>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="link">Learn More</Button>
            <Button variant="link">Contact Sales</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
