"use client"

import { useState } from "react"
import { CreditCard, MoreVertical, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { PaymentMethod } from "../types"

interface PaymentMethodCardProps {
  method: PaymentMethod
}

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const { toast } = useToast()
  const [isRemoving, setIsRemoving] = useState(false)

  const getCardIcon = (brand: string) => {
    return <CreditCard className="h-5 w-5" />
  }

  const isExpiringSoon = () => {
    if (!method.card) return false
    const now = new Date()
    const expiry = new Date(method.card.expYear, method.card.expMonth - 1)
    const monthsUntilExpiry = (expiry.getFullYear() - now.getFullYear()) * 12 + (expiry.getMonth() - now.getMonth())
    return monthsUntilExpiry <= 2 && monthsUntilExpiry >= 0
  }

  const handleSetDefault = () => {
    toast({
      title: "Default payment method updated",
      description: `${method.card?.brand} ••${method.card?.last4} is now your default payment method.`,
    })
  }

  const handleRemove = () => {
    if (method.isDefault) {
      toast({
        title: "Cannot remove default card",
        description: "Please set another card as default before removing this one.",
        variant: "destructive",
      })
      return
    }
    setIsRemoving(true)
    toast({
      title: "Payment method removed",
      description: `${method.card?.brand} ••${method.card?.last4} has been removed.`,
    })
  }

  if (isRemoving) return null

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getCardIcon(method.card?.brand || "")}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">
                {method.card?.brand} ••••{method.card?.last4}
              </span>
              {method.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Expires: {method.card?.expMonth}/{method.card?.expYear}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!method.isDefault && (
              <>
                <DropdownMenuItem onClick={handleSetDefault}>Set as Default</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>Update Card Details</DropdownMenuItem>
            <DropdownMenuItem>View Payment History</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleRemove}>
              Remove Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          Added: {new Date(method.createdAt).toLocaleDateString()} by {method.addedByName}
        </p>
        {method.isDefault && <p className="font-medium">Next charge: Dec 15, 2024 • €150.00</p>}
      </div>

      {isExpiringSoon() && (
        <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>Expiring soon</span>
        </div>
      )}

      {method.isDefault && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Update Card
          </Button>
          <Button variant="outline" size="sm">
            View History
          </Button>
        </div>
      )}
      {!method.isDefault && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSetDefault}>
            Set as Default
          </Button>
          <Button variant="outline" size="sm">
            Update Card
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}
