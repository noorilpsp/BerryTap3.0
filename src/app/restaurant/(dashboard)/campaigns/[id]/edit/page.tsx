"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { CampaignSetupStep } from "../../new/steps/step-1-setup"
import { AudienceSelectionStep } from "../../new/steps/step-2-audience"
import { MessageCompositionStep } from "../../new/steps/step-3-message"
import { ScheduleStep } from "../../new/steps/step-4-schedule"
import { ReviewStep } from "../../new/steps/step-5-review"
import { wizardSteps, type CampaignDraft } from "../../new/wizard-types"
import { mockCampaignsData } from "../../mock-data"

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [currentStep, setCurrentStep] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft | null>(null)

  useEffect(() => {
    // Find the existing campaign
    const existingCampaign = mockCampaignsData.campaigns.find((c) => c.id === campaignId)

    if (existingCampaign) {
      // Convert existing campaign to draft format
      setCampaignDraft({
        id: existingCampaign.id,
        step1: {
          name: existingCampaign.name,
          description: "",
          tags: existingCampaign.tags || [], // Default to empty array if undefined
          channels: existingCampaign.channels,
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
          selectedSegments: [existingCampaign.audience],
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
            subject: existingCampaign.subject || "",
            previewText: existingCampaign.previewText || "",
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
          sendTiming: existingCampaign.scheduledFor ? "scheduled" : "immediate",
          scheduledDate: existingCampaign.scheduledFor || null,
          scheduledTime: existingCampaign.scheduledFor || null,
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
    }
  }, [campaignId])

  // Auto-save functionality
  useEffect(() => {
    if (!campaignDraft) return

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
    if (currentStep < 4) {
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
    if (stepIndex < 5) {
      setCurrentStep(stepIndex)
      window.scrollTo(0, 0)
    }
  }

  const handleSaveDraft = async () => {
    await saveDraft()
  }

  const handleSaveAndClose = () => {
    console.log("[v0] Saving campaign changes:", campaignDraft)
    router.push(`/campaigns/${campaignId}`)
  }

  const getLastSavedText = () => {
    if (isSaving) return "Saving..."
    if (!lastSaved) return ""

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
    if (seconds < 60) return `Auto-saved ${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    return `Auto-saved ${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }

  if (!campaignDraft) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading campaign...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your campaign data.</p>
        </div>
      </div>
    )
  }

  const editSteps = wizardSteps

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/campaigns/${campaignId}`)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Campaign
              </Button>
              <div>
                <h1 className="text-xl font-bold">Edit Campaign</h1>
                <p className="text-sm text-muted-foreground">{campaignDraft.step1.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {getLastSavedText()}
                {isSaving && <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />}
              </div>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button onClick={handleSaveAndClose}>Save & Close</Button>
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
                style={{ width: `${(currentStep / (editSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {editSteps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isPending = index > currentStep
              const Icon = step.icon

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 relative z-10 flex-1 cursor-pointer"
                  onClick={() => handleStepClick(index)}
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
                Step {currentStep + 1} of {editSteps.length}: {editSteps[currentStep].name}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / editSteps.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStep + 1) / editSteps.length) * 100} className="h-2" />
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
            data={campaignDraft.step5}
            campaignDraft={campaignDraft}
            onChange={(data) => setCampaignDraft({ ...campaignDraft, step5: data })}
            onBack={handleBack}
            onSubmit={handleSaveAndClose}
            onSaveDraft={handleSaveDraft}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  )
}
