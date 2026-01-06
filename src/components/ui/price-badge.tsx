"use client"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceBadgeProps {
  price: number
  currency?: string
  variant?: "default" | "varied" | "multi"
  orderTypePrices?: { delivery?: number; pickup?: number; dineIn?: number }
}

export function PriceBadge({ price, currency = "$", variant = "default", orderTypePrices }: PriceBadgeProps) {
  if (variant === "varied") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 font-mono text-lg font-semibold text-foreground">
              Varies
              <Info className="w-4 h-4 text-muted-foreground" aria-label="Price varies by options" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Price varies based on selected options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === "multi" && orderTypePrices) {
    return (
      <div className="space-y-1">
        {orderTypePrices.delivery !== undefined && (
          <div className="text-sm text-foreground">
            <span className="font-medium">Delivery:</span>{" "}
            <span className="font-mono font-semibold">
              {currency}
              {orderTypePrices.delivery.toFixed(2)}
            </span>
          </div>
        )}
        {orderTypePrices.pickup !== undefined && (
          <div className="text-sm text-foreground">
            <span className="font-medium">Pickup:</span>{" "}
            <span className="font-mono font-semibold">
              {currency}
              {orderTypePrices.pickup.toFixed(2)}
            </span>
          </div>
        )}
        {orderTypePrices.dineIn !== undefined && (
          <div className="text-sm text-foreground">
            <span className="font-medium">Dine-In:</span>{" "}
            <span className="font-mono font-semibold">
              {currency}
              {orderTypePrices.dineIn.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <span className="font-mono text-lg font-semibold text-foreground">
      {currency}
      {price.toFixed(2)}
    </span>
  )
}
