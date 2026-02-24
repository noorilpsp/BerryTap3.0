"use client"

import { ArrowLeft, BookOpen, Clock, Settings, MessageSquare, Brain } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GuestProfile } from "@/lib/guests-data"
import { GuestProfileHeader } from "./guest-profile-header"
import { GuestOverviewTab } from "./guest-overview-tab"
import { GuestVisitsTab } from "./guest-visits-tab"
import { GuestPreferencesTab } from "./guest-preferences-tab"
import { GuestCommsTab } from "./guest-comms-tab"
import { GuestAnalyticsSidebar } from "./guest-analytics-sidebar"

interface ProfileDetailProps {
  guest: GuestProfile
  onBack?: () => void
  showAnalyticsTab?: boolean
}

const tabs = [
  { key: "overview", label: "Overview", Icon: BookOpen },
  { key: "visits", label: "Visits", Icon: Clock },
  { key: "preferences", label: "Prefs", Icon: Settings },
  { key: "comms", label: "Comms", Icon: MessageSquare },
]

export function GuestProfileDetail({ guest, onBack, showAnalyticsTab }: ProfileDetailProps) {
  const allTabs = showAnalyticsTab
    ? [...tabs, { key: "insights", label: "AI", Icon: Brain }]
    : tabs

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Mobile back button */}
      {onBack && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border/30 px-3 py-2 lg:hidden">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Guests
          </Button>
          <span className="truncate text-sm font-medium text-foreground">{guest.name}</span>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <GuestProfileHeader guest={guest} />

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="scrollbar-none mx-4 flex w-auto justify-start gap-0.5 overflow-x-auto bg-transparent p-0 lg:mx-5">
            {allTabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all",
                  "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                )}
              >
                <tab.Icon className="h-3 w-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 guest-tab-content">
            <GuestOverviewTab guest={guest} />
          </TabsContent>
          <TabsContent value="visits" className="mt-0 guest-tab-content">
            <GuestVisitsTab guest={guest} />
          </TabsContent>
          <TabsContent value="preferences" className="mt-0 guest-tab-content">
            <GuestPreferencesTab guest={guest} />
          </TabsContent>
          <TabsContent value="comms" className="mt-0 guest-tab-content">
            <GuestCommsTab guest={guest} />
          </TabsContent>
          {showAnalyticsTab && (
            <TabsContent value="insights" className="mt-0 guest-tab-content">
              <GuestAnalyticsSidebar guest={guest} />
            </TabsContent>
          )}
        </Tabs>
      </ScrollArea>
    </div>
  )
}
