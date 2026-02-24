"use client"

import { useCallback, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { WidgetHeader } from "@/components/booking/widget-header"
import { StepWhen } from "@/components/booking/step-when"
import { StepTime } from "@/components/booking/step-time"
import { StepDetails } from "@/components/booking/step-details"
import { StepConfirmation } from "@/components/booking/step-confirmation"
import { WaitlistFlow } from "@/components/booking/waitlist-flow"
import { type BookingState, initialBookingState } from "@/lib/booking-data"
import { cn } from "@/lib/utils"

type View = "step1" | "step2" | "step3" | "step4" | "waitlist"

export default function BookingPage() {
  const [state, setState] = useState<BookingState>(() => initialBookingState())
  const [view, setView] = useState<View>("step1")
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const stepIndex = view === "step1" ? 0 : view === "step2" ? 1 : view === "step3" ? 2 : view === "step4" ? 3 : 1

  const updateState = useCallback((patch: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const navigate = useCallback((target: View, dir: "forward" | "back" = "forward") => {
    setDirection(dir)
    setView(target)
    // Scroll to top of content on step change
    setTimeout(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
  }, [])

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false)
      navigate("step4", "forward")
    }, 1800)
  }, [navigate])

  const handleBookAnother = useCallback(() => {
    setState(initialBookingState())
    navigate("step1", "back")
  }, [navigate])

  return (
    <div className={cn(isDark ? "dark" : "")}>
      <div className="flex min-h-dvh flex-col items-center justify-start bg-zinc-100 px-0 py-0 dark:bg-zinc-950 md:justify-center md:px-4 md:py-8">
        {/* Theme toggle */}
        <div className="mb-3 hidden md:flex">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Widget Card */}
        <div className="flex w-full max-w-[520px] flex-col overflow-hidden rounded-none border-0 bg-white shadow-none dark:bg-zinc-900 md:rounded-2xl md:border md:border-zinc-200 md:shadow-xl md:shadow-zinc-900/5 dark:md:border-zinc-800 dark:md:shadow-zinc-950/30">
          {/* Header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800">
            <WidgetHeader currentStep={stepIndex} />
            {/* Mobile theme toggle */}
            <div className="flex justify-center pb-3 md:hidden">
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                {isDark ? "Light" : "Dark"}
              </button>
            </div>
          </div>

          {/* Step content */}
          <div
            ref={contentRef}
            className="relative flex-1 overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "calc(100dvh - 180px)" }}
          >
            <div
              key={view}
              className={cn(
                "px-6 py-5",
                direction === "forward" ? "booking-slide-in-right" : "booking-slide-in-left"
              )}
            >
              {view === "step1" && (
                <StepWhen
                  state={state}
                  onChange={updateState}
                  onNext={() => navigate("step2", "forward")}
                />
              )}
              {view === "step2" && (
                <StepTime
                  state={state}
                  onChange={updateState}
                  onNext={() => navigate("step3", "forward")}
                  onBack={() => navigate("step1", "back")}
                  onJoinWaitlist={() => navigate("waitlist", "forward")}
                />
              )}
              {view === "step3" && (
                <StepDetails
                  state={state}
                  onChange={updateState}
                  onSubmit={handleSubmit}
                  onBack={() => navigate("step2", "back")}
                  isSubmitting={isSubmitting}
                />
              )}
              {view === "step4" && (
                <StepConfirmation
                  state={state}
                  onBookAnother={handleBookAnother}
                  onModify={() => navigate("step1", "back")}
                />
              )}
              {view === "waitlist" && (
                <WaitlistFlow
                  state={state}
                  onBack={() => navigate("step2", "back")}
                />
              )}
            </div>
          </div>
        </div>

        {/* Powered by */}
        <p className="mt-4 hidden text-[10px] text-zinc-400 dark:text-zinc-600 md:block">
          Powered by Bella Vista POS
        </p>
      </div>
    </div>
  )
}
