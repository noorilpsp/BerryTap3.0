"use client"

import { useState, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormMobileWizardProps {
  steps: { label: string; content: React.ReactNode }[]
  onSave: () => void
  isSaving: boolean
  isSaved: boolean
  isEdit: boolean
}

export function FormMobileWizard({ steps, onSave, isSaving, isSaved, isEdit }: FormMobileWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("left")
  const containerRef = useRef<HTMLDivElement>(null)

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection("left")
      setCurrentStep((p) => p + 1)
    }
  }, [currentStep, steps.length])

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection("right")
      setCurrentStep((p) => p - 1)
    }
  }, [currentStep])

  const isLast = currentStep === steps.length - 1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <h2 className="text-sm font-semibold text-foreground">
          {isEdit ? "Edit Reservation" : "New Reservation"}
        </h2>
        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1}/{steps.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3" role="tablist" aria-label="Form steps">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentStep ? "left" : "right")
              setCurrentStep(i)
            }}
            className={`h-2 rounded-full transition-all ${
              i === currentStep
                ? "w-6 bg-primary"
                : i < currentStep
                ? "w-2 bg-primary/50"
                : "w-2 bg-secondary"
            }`}
            role="tab"
            aria-selected={i === currentStep}
            aria-label={`${step.label} - Step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-4" role="tabpanel" aria-label={`Step ${currentStep + 1}: ${steps[currentStep].label}`}>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {steps[currentStep].label}
        </h3>
        <div
          key={currentStep}
          className={direction === "left" ? "form-step-slide-left" : "form-step-slide-right"}
        >
          {steps[currentStep].content}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        {currentStep > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        {!isLast ? (
          <Button
            size="sm"
            onClick={goNext}
            className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || isSaved}
            className="gap-1.5 bg-emerald-600 text-foreground hover:bg-emerald-700 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              isEdit ? "Update Reservation" : "Save Reservation"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
