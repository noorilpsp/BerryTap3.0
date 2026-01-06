"use client"

import type React from "react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"

interface AlertBannerProps {
  variant?: "default" | "destructive" | "warning" | "success"
  title?: string
  message: string
  icon?: React.ReactNode
  action?: { label: string; onClick: () => void }
  dismissible?: boolean
  className?: string
  actionWidthClass?: string
  minHeightClass?: string
}

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
}

export function AlertBanner({
  variant = "default",
  title,
  message,
  icon,
  action,
  dismissible = false,
  className,
  actionWidthClass = "w-32",
  minHeightClass = "min-h-[96px]",
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  if (!isVisible) return null

  const Icon = icon || variantIcons[variant]
  const IconComponent = typeof Icon === "function" ? Icon : null

  const variantShell = {
    default:
      "border-border bg-background dark:border-neutral-700 dark:bg-neutral-900",
    destructive:
      "border-destructive/60 bg-destructive/10 dark:border-red-800 dark:bg-red-950/40",
    warning:
      "border-amber-500/60 bg-amber-100/60 dark:border-amber-700 dark:bg-amber-950/40",
    success:
      "border-green-500/60 bg-green-100/60 dark:border-green-700 dark:bg-green-950/40",
  } as const

  const titleColor = {
    default: "text-foreground",
    destructive: "text-destructive dark:text-red-200",
    warning: "text-amber-900 dark:text-amber-100",
    success: "text-green-900 dark:text-green-100",
  } as const

  const descColor = {
    default: "text-muted-foreground dark:text-neutral-300",
    destructive: "text-foreground dark:text-neutral-300",
    warning: "text-amber-900/90 dark:text-amber-200/90",
    success: "text-green-900/90 dark:text-green-200/90",
  } as const

  const iconColor =
    variant === "warning"
      ? "text-amber-700 dark:text-amber-400"
      : variant === "success"
      ? "text-green-700 dark:text-green-400"
      : variant === "destructive"
      ? "text-destructive dark:text-red-400"
      : "text-foreground/70 dark:text-foreground/70"

  return (
    <Alert
      className={cn(
        "relative p-4 rounded-lg border transition-colors duration-200",
        "grid grid-cols-[auto,1fr,auto] gap-4 items-baseline sm:items-center",
        "flex flex-col sm:grid sm:grid-cols-[auto,1fr,auto]", // ✅ stack on mobile
        variantShell[variant],
        minHeightClass,
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      {IconComponent && (
        <IconComponent className={cn("h-5 w-5 shrink-0 self-start sm:self-baseline mt-[2px]", iconColor)} />
      )}

      <div className="min-w-0 w-full sm:w-auto">
        {title && (
          <AlertTitle className={cn("mb-1 text-sm font-medium whitespace-normal break-words", titleColor[variant])}>
            {title}
          </AlertTitle>
        )}
        <AlertDescription className={cn("text-sm leading-relaxed whitespace-normal break-words", descColor[variant])}>
          {message}
        </AlertDescription>
      </div>

      {(action || dismissible) && (
        <div
          className={cn(
            "flex flex-wrap gap-2 w-full sm:w-auto mt-3 sm:mt-0",
            "justify-center sm:justify-end items-center", // ✅ Center on mobile, right on desktop
          )}
        >
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={cn(
                "h-9 justify-center font-medium transition-colors duration-200 border",
                actionWidthClass,
                // ✅ Light mode outlined
                // 🌙 Dark mode transparent
                variant === "destructive"
                  ? "border-destructive/70 text-destructive hover:bg-destructive/15 dark:border-transparent dark:text-red-300 dark:hover:bg-red-500/10"
                  : variant === "warning"
                  ? "border-amber-500/70 text-amber-800 hover:bg-amber-100/60 dark:border-transparent dark:text-amber-200 dark:hover:bg-amber-400/10"
                  : variant === "success"
                  ? "border-green-500/70 text-green-800 hover:bg-green-100/60 dark:border-transparent dark:text-green-200 dark:hover:bg-green-400/10"
                  : "border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:border-transparent dark:text-neutral-200 dark:hover:bg-white/5"
              )}
            >
              {action.label}
            </Button>
          )}

          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className={cn(
                "h-9 w-9 p-0 rounded-full transition-colors duration-200",
                "bg-transparent dark:bg-transparent",
                variant === "destructive"
                  ? "text-destructive hover:bg-destructive/10 dark:hover:bg-red-500/10 dark:text-red-300"
                  : variant === "warning"
                  ? "text-amber-700 hover:bg-amber-100/60 dark:text-amber-300 dark:hover:bg-amber-400/10"
                  : variant === "success"
                  ? "text-green-700 hover:bg-green-100/60 dark:text-green-300 dark:hover:bg-green-400/10"
                  : "hover:bg-accent/50 dark:hover:bg-white/5 dark:text-neutral-300"
              )}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Alert>
  )
}
