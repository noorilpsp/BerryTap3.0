"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { CampaignSetupStep } from "./steps/step-1-setup"
import { AudienceSelectionStep } from "./steps/step-2-audience"
import { MessageCompositionStep } from "./steps/step-3-message"
import { ScheduleStep } from "./steps/step-4-schedule"
import { ReviewStep } from "./steps/step-5-review"
import { wizardSteps, type CampaignDraft } from "./wizard-types"

export default function NewCampaignPage() {
  console.log("[v0] NewCampaignPage component is loading")

  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Campaign draft state
  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft>({
    id: `draft_${Date.now()}`,
    step1: {
      name: "",
      description: "",
      tags: [],
      channels: [],
      template: null,
      utmTracking: {
        enabled: false,
        source: "berrytap",
        medium: "email",
        campaign: "",
        term: "",
        content: "",
      },
    },
    step2: {
      selectionMethod: "segment",
      selectedSegments: [],
      csvData: null,
      filters: {
        removeDuplicates: true,
        excludeUnsubscribed: true,
        excludeBounced: true,
        excludeRecentRecipients: false,
      },
    },
    step3: {
      email: {
        subject: "",
        previewText: "",
        body: "",
        plainText: "",
        settings: {
          trackOpens: true,
          trackClicks: true,
          includeUnsubscribe: true,
          includeViewInBrowser: true,
        },
      },
      sms: {
        message: "",
        useShortener: true,
      },
    },
    step4: {
      sendTiming: "immediate",
      scheduledDate: null,
      scheduledTime: null,
      timezone: "Europe/Malta",
      recurring: null,
      throttling: {
        enabled: true,
        rate: 500,
      },
      notifications: {
        onStart: true,
        onComplete: true,
        onError: true,
        highUnsubscribe: true,
        channels: ["email"],
      },
    },
    step5: {
      costConfirmed: false,
      finalConfirmed: false,
    },
  })

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveDraft()
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [campaignDraft])

  const saveDraft = async () => {
    setIsSaving(true)
    // Simulate saving to backend
    await new Promise((resolve) => setTimeout(resolve, 500))
    setLastSaved(new Date())
    setIsSaving(false)
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Can only go back to completed steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex)
      window.scrollTo(0, 0)
    }
  }

  const handleSaveDraft = async () => {
    await saveDraft()
  }

  const getLastSavedText = () => {
    if (isSaving) return "Saving..."
    if (!lastSaved) return ""

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
    if (seconds < 60) return `Auto-saved ${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    return `Auto-saved ${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }

  console.log("[v0] NewCampaignPage rendering, currentStep:", currentStep)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getLastSavedText()}
              {isSaving && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-background border-b py-6">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="hidden md:flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" style={{ left: "40px", right: "40px" }}>
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / (wizardSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {wizardSteps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isPending = index > currentStep
              const Icon = step.icon

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 relative z-10 flex-1"
                  onClick={() => handleStepClick(index)}
                  role={isCompleted ? "button" : undefined}
                  style={{ cursor: isCompleted ? "pointer" : "default" }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isPending && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <step.completedIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-primary",
                        isPending && "text-muted-foreground",
                      )}
                    >
                      {index + 1}. {step.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isCompleted && "✅ Complete"}
                      {isCurrent && "Current"}
                      {isPending && "Pending"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile stepper */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {wizardSteps.length}: {wizardSteps[currentStep].name}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / wizardSteps.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStep + 1) / wizardSteps.length) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {currentStep === 0 && (
          <CampaignSetupStep
            data={campaignDraft.step1}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step1: data })}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
          />
        )}
        {currentStep === 1 && (
          <AudienceSelectionStep
            data={campaignDraft.step2}
            selectedChannels={campaignDraft.step1.channels}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step2: data })}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
          />
        )}
        {currentStep === 2 && (
          <MessageCompositionStep
            data={campaignDraft.step3}
            selectedChannels={campaignDraft.step1.channels}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step3: data })}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
          />
        )}
        {currentStep === 3 && (
          <ScheduleStep
            data={campaignDraft.step4}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step4: data })}
            onNext={handleNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            campaignDraft={campaignDraft}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step5: data })}
            onBack={handleBack}
            onEdit={(step) => setCurrentStep(step)}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </div>
  )
}
