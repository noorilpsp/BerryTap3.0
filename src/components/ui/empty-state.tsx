"use client"

import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl opacity-30 mb-6" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="text-sm font-medium text-primary hover:underline transition-all duration-200"
            type="button"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}
