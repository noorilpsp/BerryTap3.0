"use client"

import { Bell, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ServerInfo } from "@/lib/my-tables-data"

interface MyTablesTopBarProps {
  server: ServerInfo
  alertCount: number
}

export function MyTablesTopBar({ server, alertCount }: MyTablesTopBarProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:px-6">
      {/* Greeting */}
      <div className="flex-1">
        <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
          Hi {server.name}
        </h1>
        <p className="text-xs text-muted-foreground">
          Section {server.section}
        </p>
      </div>

      {/* Alerts */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        aria-label={`${alertCount} alerts`}
      >
        <Bell className="h-4.5 w-4.5" />
        {alertCount > 0 && (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-card",
              alertCount > 0 && "animate-pulse-ring"
            )}
          >
            {alertCount}
          </span>
        )}
      </Button>

      {/* Messages */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Messages"
      >
        <MessageSquare className="h-4.5 w-4.5" />
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Settings"
      >
        <Settings className="h-4.5 w-4.5" />
      </Button>
    </header>
  )
}
