import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { Sparkline } from "@/components/inventory/sparkline"
import { cn } from "@/lib/utils"

interface InventoryKPICardProps {
  icon: LucideIcon
  label: string
  value: string
  badge?: string
  subtext?: string
  trend?: string
  detail?: string
  sparklineData?: number[]
  variant?: "default" | "warning"
}

export function InventoryKPICard({
  icon: Icon,
  label,
  value,
  badge,
  subtext,
  trend,
  detail,
  sparklineData,
  variant = "default",
}: InventoryKPICardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", variant === "warning" && "border-orange-500/50")}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>

        <div className="text-3xl font-bold">{value}</div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{subtext}</span>
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.startsWith("+")
                  ? "text-success"
                  : trend.startsWith("-")
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {trend}
            </span>
          )}
        </div>

        {detail && <div className="text-xs text-muted-foreground">{detail}</div>}

        {sparklineData && (
          <div className="pt-2">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
