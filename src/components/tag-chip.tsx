"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface TagChipProps {
  label: string
  variant: "dietary" | "attribute" | "custom" | "allergen"
  icon?: string
  onRemove?: () => void
}

const variantConfig = {
  dietary: "bg-green-50 text-green-700 hover:bg-green-100",
  attribute: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  custom: "bg-gray-50 text-gray-700 hover:bg-gray-100",
  allergen: "bg-red-50 text-red-700 hover:bg-red-100",
}

export function TagChip({ label, variant, icon, onRemove }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-all duration-200",
        variantConfig[variant],
      )}
      role="listitem"
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label} tag`}
          type="button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
