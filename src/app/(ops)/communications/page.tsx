"use client"

import { useState } from "react"
import {
  Bell,
  CheckCircle2,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { getTodayStats } from "@/lib/comms-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveFeed } from "@/components/comms/live-feed"
import { TemplatesTab } from "@/components/comms/templates-tab"
import { AutomationsTab } from "@/components/comms/automations-tab"
import { AnalyticsTab } from "@/components/comms/analytics-tab"
import { ComposeDialog } from "@/components/comms/compose-dialog"

export default function CommunicationsPage() {
  const [composeOpen, setComposeOpen] = useState(false)
  const [channelFilter, setChannelFilter] = useState<"all" | "sms" | "email">("all")
  const stats = getTodayStats()

  return (
    <div className="comms-page flex h-full flex-col">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md">
        {/* Row 1: Title + search + new message */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-400" />
            <h1 className="text-sm font-bold text-zinc-100 sm:text-base">
              Communications
            </h1>
          </div>

          {/* Search */}
          <div className="relative ml-auto hidden max-w-[260px] flex-1 sm:block">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
            <Input
              className="h-7 border-zinc-700 bg-zinc-800/80 pl-7 text-xs text-zinc-100 placeholder:text-zinc-500"
              placeholder="Search messages..."
            />
          </div>

          {/* New message */}
          <Button
            size="sm"
            className="h-7 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500"
            onClick={() => setComposeOpen(true)}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">New Message</span>
          </Button>
        </div>

        {/* Row 2: Quick stats + channel filter */}
        <div className="flex items-center gap-3 px-4 pb-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-zinc-400">
            <span>
              Today:{" "}
              <span className="font-semibold tabular-nums text-zinc-100">
                {stats.sent}
              </span>{" "}
              sent
            </span>
            <span className="hidden sm:inline">
              <span className="font-semibold tabular-nums text-zinc-100">
                {stats.delivered}
              </span>{" "}
              delivered
            </span>
            <span>
              <span className="font-semibold tabular-nums text-zinc-100">
                {stats.read}
              </span>{" "}
              read
            </span>
            <span>
              <span className="font-semibold tabular-nums text-zinc-100">
                {stats.replies}
              </span>{" "}
              replies
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {(
              [
                ["all", "All"],
                ["sms", "SMS"],
                ["email", "Email"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setChannelFilter(key)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  channelFilter === key
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {key === "sms" && <MessageSquare className="h-2.5 w-2.5" />}
                {key === "email" && <Mail className="h-2.5 w-2.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Tabs (Live Feed, Templates, Automations, Analytics) ───── */}
      <Tabs
        defaultValue="feed"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="comms-tabs-bar shrink-0 border-b border-zinc-800/50 px-4">
          <TabsList className="h-8 w-full justify-start gap-1 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger
              value="feed"
              className="comms-tab-trigger relative h-8 gap-1.5 rounded-none border-b-2 border-transparent px-3 text-xs text-zinc-500 transition-colors hover:text-zinc-300 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
            >
              <Send className="h-3 w-3" />
              Live Feed
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 rounded-full border-0 bg-zinc-700/80 px-1 text-[9px] font-semibold text-zinc-200"
              >
                {stats.sent}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="comms-tab-trigger relative h-8 gap-1.5 rounded-none border-b-2 border-transparent px-3 text-xs text-zinc-500 transition-colors hover:text-zinc-300 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
            >
              <MessageSquare className="h-3 w-3" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="automations"
              className="comms-tab-trigger relative h-8 gap-1.5 rounded-none border-b-2 border-transparent px-3 text-xs text-zinc-500 transition-colors hover:text-zinc-300 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="hidden sm:inline">Automations</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="comms-tab-trigger relative h-8 gap-1.5 rounded-none border-b-2 border-transparent px-3 text-xs text-zinc-500 transition-colors hover:text-zinc-300 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <TabsContent value="feed" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <LiveFeed />
        </TabsContent>
        <TabsContent value="templates" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="automations" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <AutomationsTab />
        </TabsContent>
        <TabsContent value="analytics" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      {/* ── Compose Dialog ──────────────────────────────────── */}
      <ComposeDialog open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  )
}
