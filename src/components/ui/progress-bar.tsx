import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value?: number
  max?: number
  current?: number
  goal?: number
  label?: string
  showPercentage?: boolean
  className?: string
  indicatorClassName?: string
}

export function ProgressBar({
  value,
  max = 100,
  current,
  goal,
  label,
  showPercentage = false,
  className,
  indicatorClassName,
}: ProgressBarProps) {
  const actualValue = current !== undefined ? current : value !== undefined ? value : 0
  const actualMax = goal !== undefined ? goal : max

  const percentage = actualMax > 0 ? Math.round((actualValue / actualMax) * 100) : 0

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="text-muted-foreground">{percentage}%</span>}
        </div>
      )}
      <Progress value={percentage} className="h-2" indicatorClassName={indicatorClassName} />
    </div>
  )
}
