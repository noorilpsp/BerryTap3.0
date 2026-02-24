"use client"

import { useState } from "react"
import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  GitBranch,
  Pause,
  Play,
  Plus,
  Send,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { AutomationFlow, FlowStep } from "@/lib/comms-data"
import { automationFlows } from "@/lib/comms-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AutomationsTab() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Automated Flows</h2>
        <Button
          size="sm"
          className="h-7 gap-1.5 bg-emerald-600 text-xs font-medium text-foreground hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          New Flow
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {automationFlows.map((flow) => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Flow Card ────────────────────────────────────────────────────────────

function FlowCard({ flow }: { flow: AutomationFlow }) {
  const [expanded, setExpanded] = useState(false)
  const isActive = flow.status === "active"

  function getStatLine(): string {
    const parts: string[] = [
      `Triggered: ${flow.triggeredCount.toLocaleString()} times`,
    ]
    if (flow.successRate)
      parts.push(`Success rate: ${Math.round(flow.successRate * 100)}%`)
    if (flow.cancelRate)
      parts.push(`${Math.round(flow.cancelRate * 100)}% cancel after`)
    if (flow.responseRate)
      parts.push(`${Math.round(flow.responseRate * 100)}% response rate`)
    if (flow.rebookRate)
      parts.push(`${Math.round(flow.rebookRate * 100)}% rebooked within 2 weeks`)
    if (flow.bookingConversion)
      parts.push(
        `${Math.round(flow.bookingConversion * 100)}% booking conversion`
      )
    return parts.join(" / ")
  }

  return (
    <div className="rounded-lg border border-border/20 bg-secondary/30 transition-colors hover:bg-secondary/40">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 p-3 text-left"
        aria-expanded={expanded}
      >
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            isActive
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {flow.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "h-4 px-1.5 text-[9px] font-semibold uppercase",
                isActive
                  ? "border-emerald-500/30 text-emerald-400"
                  : "border-amber-500/30 text-amber-400"
              )}
            >
              {flow.status}
            </Badge>
          </div>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {getStatLine()}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Expanded flow diagram */}
      {expanded && (
        <div className="border-t border-border/20 px-3 pb-3 pt-3">
          <FlowDiagram steps={flow.steps} />

          {/* Actions */}
          <div className="mt-3 flex items-center gap-1.5 border-t border-border/10 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-2.5 w-2.5" />
              Edit Flow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 gap-1 px-2 text-[10px]",
                isActive
                  ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                  : "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              )}
            >
              {isActive ? (
                <>
                  <Pause className="h-2.5 w-2.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-2.5 w-2.5" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-2.5 w-2.5" />
              View Stats
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Flow Diagram (CSS/SVG) ──────────────────────────────────────────────

function FlowDiagram({ steps }: { steps: FlowStep[] }) {
  return (
    <div
      className="flex flex-col items-center gap-0"
      role="img"
      aria-label={`Flow with ${steps.length} steps: ${steps.map((s) => s.label).join(", ")}`}
    >
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-col items-center">
          {/* Connector line (except first) */}
          {i > 0 && (
            <div className="comms-flow-line flex h-6 flex-col items-center" style={{ "--flow-index": i } as React.CSSProperties}>
              <div className="h-full w-px bg-border/40" />
              <ArrowDown className="h-3 w-3 -mt-1 text-muted-foreground" />
            </div>
          )}

          {/* Step node */}
          <StepNode step={step} />

          {/* Branches */}
          {step.branches && step.branches.length > 0 && (
            <div className="mt-0 flex flex-col items-center">
              <div className="flex h-4 flex-col items-center">
                <div className="h-full w-px bg-border/40" />
              </div>
              <div className="flex items-start gap-2">
                {step.branches.map((branch, bi) => (
                  <div key={bi} className="flex flex-col items-center gap-1">
                    {/* Branch connector */}
                    <div className="flex h-3 flex-col items-center">
                      <ArrowDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    {/* Branch label */}
                    <span className="text-[9px] font-medium text-cyan-400">
                      {branch.label}
                    </span>
                    {/* Outcome box */}
                    <div className="rounded-md border border-border/30 bg-background/50 px-2 py-1">
                      <span className="text-[10px] leading-tight text-secondary-foreground">
                        {branch.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StepNode({ step }: { step: FlowStep }) {
  const icons: Record<string, typeof Zap> = {
    trigger: Zap,
    action: Send,
    wait: Clock,
    condition: GitBranch,
  }
  const colors: Record<string, string> = {
    trigger: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    action: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    wait: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
    condition: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  }
  const Icon = icons[step.type] ?? Zap

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5",
        colors[step.type] ?? "border-border/30 bg-secondary/30"
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="text-[10px] font-medium">{step.label}</span>
    </div>
  )
}
