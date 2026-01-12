"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, CreditCard, AlertTriangle, RotateCcw, DollarSign } from "lucide-react"
import type { TransactionFilters } from "../data"

interface SavedView {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  filters: TransactionFilters
  transactionCount: number
  lastUsed: string
}

interface SavedViewsProps {
  onLoadView: (view: SavedView) => void
  onClose: () => void
}

export function SavedViews({ onLoadView, onClose }: SavedViewsProps) {
  const savedViews: SavedView[] = [
    {
      id: "1",
      name: "Daily Reconciliation",
      description: "Today • All succeeded • All channels",
      icon: <BarChart3 className="h-4 w-4" />,
      filters: { datePreset: "today", status: ["succeeded"] },
      transactionCount: 234,
      lastUsed: "2 hours ago",
    },
    {
      id: "2",
      name: "Card Payments (Last 7 Days)",
      description: "Last 7d • Card only • Succeeded",
      icon: <CreditCard className="h-4 w-4" />,
      filters: { datePreset: "last_7_days", paymentMethod: ["card"], status: ["succeeded"] },
      transactionCount: 567,
      lastUsed: "Yesterday",
    },
    {
      id: "3",
      name: "Failed & Disputed",
      description: "Last 30d • Failed or Disputed status",
      icon: <AlertTriangle className="h-4 w-4" />,
      filters: { datePreset: "last_30_days", status: ["failed", "disputed"] },
      transactionCount: 20,
      lastUsed: "3 days ago",
    },
    {
      id: "4",
      name: "All Refunds (This Month)",
      description: "This month • Refund type only",
      icon: <RotateCcw className="h-4 w-4" />,
      filters: { datePreset: "last_30_days", type: ["refund"] },
      transactionCount: 89,
      lastUsed: "1 week ago",
    },
    {
      id: "5",
      name: "High Value (>€500)",
      description: "Last 90d • Amount >€500 • Succeeded",
      icon: <DollarSign className="h-4 w-4" />,
      filters: { datePreset: "last_90_days", amountMin: 500, status: ["succeeded"] },
      transactionCount: 45,
      lastUsed: "2 weeks ago",
    },
  ]

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Saved Views</DialogTitle>
          <DialogDescription>Load a saved filter view to quickly access common transaction reports</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {savedViews.map((view) => (
            <Card key={view.id} className="p-4 transition-colors hover:bg-accent/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-primary/10 p-2 text-primary">{view.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{view.name}</h4>
                    <p className="text-sm text-muted-foreground">{view.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {view.transactionCount} transaction{view.transactionCount !== 1 ? "s" : ""}
                      </span>
                      <span>Last used: {view.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => onLoadView(view)}>
                  Load
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
