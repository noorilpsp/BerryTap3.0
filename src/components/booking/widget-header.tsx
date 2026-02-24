"use client"

import { Check, UtensilsCrossed } from "lucide-react"
import { restaurant } from "@/lib/booking-data"
import { cn } from "@/lib/utils"

const steps = [
  { key: "when", label: "When" },
  { key: "time", label: "Time" },
  { key: "details", label: "Details" },
  { key: "done", label: "Done" },
]

interface WidgetHeaderProps {
  currentStep: number
}

export function WidgetHeader({ currentStep }: WidgetHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 pb-5 pt-6">
      {/* Restaurant branding */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {restaurant.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {restaurant.tagline}
        </p>
      </div>

      {/* Step progress indicator */}
      <nav aria-label={`Step ${currentStep + 1} of 4: ${steps[currentStep].label}`} className="flex w-full max-w-[280px] items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isUpcoming = i > currentStep

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                    isCompleted && "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500",
                    isCurrent && "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:border-emerald-500 dark:bg-emerald-500 dark:shadow-emerald-500/25",
                    isUpcoming && "border-zinc-300 bg-white text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "ml-0 h-0.5 w-8 transition-colors duration-300 sm:w-10",
                      i < currentStep
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
