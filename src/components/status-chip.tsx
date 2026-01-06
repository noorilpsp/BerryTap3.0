"use client"

import { cn } from "@/lib/utils"

interface StatusChipProps {
  status: "live" | "draft" | "hidden" | "soldout"
  size?: "sm" | "md"
}

const statusConfig = {
  live: {
    emoji: "🟢",
    label: "Live",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  draft: {
    emoji: "📝",
    label: "Draft",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  hidden: {
    emoji: "👻",
    label: "Hidden",
    className: "bg-neutral-50 text-neutral-600 border-neutral-200",
  },
  soldout: {
    emoji: "⚠️",
    label: "Sold Out",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
}

export function StatusChip({ status, size = "md" }: StatusChipProps) {
  const config = statusConfig[status] || statusConfig.draft

  const sizeClasses = {
    sm: "text-xs px-2 py-1 rounded-md",
    md: "text-sm px-3 py-1.5 rounded-lg",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium transition-all duration-200",
        config.className,
        sizeClasses[size],
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  )
}
