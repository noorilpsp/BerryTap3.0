import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  legend?: React.ReactNode
}

export function ChartCard({ title, description, children, className, legend }: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 px-4 pt-4 md:px-5 md:pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base text-balance">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {legend && <div className="flex items-center gap-4">{legend}</div>}
        </div>
      </CardHeader>
      <CardContent className="h-60 pt-0 ml-[-35px]" >{children}</CardContent>
    </Card>
  )
}
