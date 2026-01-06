"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockPlans } from "../data"
import type { PlanId } from "../types"

interface PlanComparisonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlanId: PlanId
}

export function PlanComparisonModal({ open, onOpenChange, currentPlanId }: PlanComparisonModalProps) {
  const [interval, setInterval] = useState<"month" | "year">("month")
  const plans = mockPlans

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Choose Your Plan</DialogTitle>
            <Badge>Current: {plans.find((p) => p.id === currentPlanId)?.name}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={interval} onValueChange={(v) => setInterval(v as "month" | "year")}>
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="year">Annual (Save 20%)</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 space-y-4 ${plan.popular ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && <Badge className="w-fit">Most Popular</Badge>}
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.id === currentPlanId ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.id === "enterprise" ? (
                  <Button className="w-full bg-transparent" variant="outline">
                    Contact Sales
                  </Button>
                ) : currentPlanId === "pro" && plan.id === "starter" ? (
                  <Button className="w-full bg-transparent" variant="outline">
                    Downgrade
                  </Button>
                ) : (
                  <Button className="w-full">
                    {plan.price > (plans.find((p) => p.id === currentPlanId)?.price || 0) ? "Upgrade" : "Select Plan"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
