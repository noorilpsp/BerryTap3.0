"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DetailAlert } from "@/lib/table-detail-data"

interface AlertCardsProps {
  alerts: DetailAlert[]
  className?: string
}

const alertConfig: Record<string, {
  icon: typeof AlertTriangle
  glowColor: string
  borderColor: string
  iconColor: string
  buttonBg: string
  buttonLabel: string
}> = {
  food_ready: {
    icon: AlertTriangle,
    glowColor: "shadow-red-500/10",
    borderColor: "border-l-red-500",
    iconColor: "text-red-400",
    buttonBg: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30",
    buttonLabel: "On My Way",
  },
  no_checkin: {
    icon: AlertTriangle,
    glowColor: "shadow-amber-500/10",
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-400",
    buttonBg: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30",
    buttonLabel: "Check In Now",
  },
  bill_requested: {
    icon: CreditCard,
    glowColor: "shadow-blue-500/10",
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-400",
    buttonBg: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30",
    buttonLabel: "View Bill",
  },
}

export function AlertCards({ alerts, className }: AlertCardsProps) {
  if (alerts.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      {alerts.map((alert, i) => {
        const cfg = alertConfig[alert.type] ?? alertConfig.food_ready
        const Icon = cfg.icon

        return (
          <div
            key={i}
            className={cn(
              "rounded-xl border border-white/[0.06] border-l-4 p-4",
              "bg-[hsl(225,15%,9%)]/80 backdrop-blur-sm shadow-lg",
              cfg.glowColor,
              cfg.borderColor,
              "animate-fade-slide-in",
            )}
            style={{ animationDelay: `${i * 80}ms` }}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cfg.iconColor)} />

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {alert.type === "food_ready" && "Food Ready"}
                  {alert.type === "no_checkin" && `No Check-in for ${getNoCheckinMinutes()}+ Minutes`}
                  {alert.type === "bill_requested" && "Bill Requested"}
                </h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {alert.message}
                </p>

                {alert.items && alert.items.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {alert.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-1.5 text-sm text-secondary-foreground">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "shrink-0 gap-1 text-xs border",
                  cfg.buttonBg,
                )}
              >
                {cfg.buttonLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getNoCheckinMinutes(): number {
  return 12
}
