"use client"

import { useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Send,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Message } from "@/lib/comms-data"
import { formatTime, todaysMessages } from "@/lib/comms-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

type FeedFilter = "all" | "sms" | "email" | "incoming" | "outgoing" | "action"

export function LiveFeed() {
  const [filter, setFilter] = useState<FeedFilter>("all")

  const filtered = todaysMessages.filter((m) => {
    if (filter === "sms") return m.channel === "sms"
    if (filter === "email") return m.channel === "email"
    if (filter === "incoming") return m.direction === "in"
    if (filter === "outgoing") return m.direction === "out"
    if (filter === "action") return !!m.actionNeeded
    return true
  })

  const actionCount = todaysMessages.filter((m) => m.actionNeeded).length

  return (
    <div className="flex h-full flex-col">
      {/* Feed header */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/30 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Live Message Feed</h2>
        <span className="text-xs text-muted-foreground">Showing: {filter === "all" ? "All channels" : filter} / Today</span>
        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/40 bg-popover/95 backdrop-blur-sm">
              {(
                [
                  ["all", "All Messages"],
                  ["sms", "SMS Only"],
                  ["email", "Email Only"],
                  ["incoming", "Incoming"],
                  ["outgoing", "Outgoing"],
                  ["action", `Needs Action (${actionCount})`],
                ] as const
              ).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(filter === key && "bg-accent")}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Feed list */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-3" role="list" aria-label="Message feed">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-1 pb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
          </div>

          {filtered.map((msg, i) => (
            <MessageCard key={msg.id} message={msg} index={i} />
          ))}

          {/* Earlier divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Earlier Today</span>
            <div className="h-px flex-1 bg-border/30" />
          </div>

          <div className="py-4 text-center text-xs text-muted-foreground">Load more messages...</div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Message Card ──────────────────────────────────────────────────────────

function MessageCard({ message: m, index }: { message: Message; index: number }) {
  const isIn = m.direction === "in"
  const isBatch = !!m.batchCount || !!m.recipients
  const isBulkEmail = m.channel === "email" && !!m.recipients

  return (
    <div
      role="listitem"
      aria-label={`${isIn ? "Incoming" : "Outgoing"} ${m.channel} message ${isIn ? `from ${m.sender}` : `to ${m.recipient || (isBatch ? "batch" : "unknown")}`}`}
      className={cn(
        "comms-msg-enter group rounded-lg border bg-secondary/40 p-3 backdrop-blur-sm transition-colors hover:bg-secondary/60",
        m.actionNeeded
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/20",
      )}
      style={{ "--msg-index": index } as React.CSSProperties}
    >
      {/* Top row */}
      <div className="flex items-start gap-2">
        {/* Direction icon */}
        <div
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            isIn
              ? "bg-cyan-500/15 text-cyan-400"
              : "bg-emerald-500/15 text-emerald-400"
          )}
          aria-hidden="true"
        >
          {isIn ? (
            <ArrowDownLeft className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name + channel + template */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-foreground">
              {isIn
                ? m.sender
                : isBulkEmail
                  ? `${m.recipients} guests`
                  : isBatch
                    ? `${m.batchCount} guests`
                    : m.recipient}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "h-4 px-1 text-[9px] font-medium",
                m.channel === "sms"
                  ? "border-cyan-500/30 text-cyan-400"
                  : "border-violet-500/30 text-violet-400"
              )}
            >
              {m.channel === "sms" ? (
                <MessageSquare className="mr-0.5 h-2 w-2" />
              ) : (
                <Mail className="mr-0.5 h-2 w-2" />
              )}
              {m.channel.toUpperCase()}
            </Badge>
            {m.templateName && (
              <span className="text-muted-foreground">{m.templateName}</span>
            )}
            {isBatch && !isBulkEmail && (
              <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium border-border/30 text-muted-foreground">
                batch
              </Badge>
            )}
          </div>

          {/* Message preview */}
          {!isBatch && m.content && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-secondary-foreground">
              {m.content}
            </p>
          )}

          {/* Delivery status chain */}
          {m.direction === "out" && !isBatch && !isBulkEmail && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px]">
              {m.status === "delivered" ? (
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Delivered
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Send className="h-2.5 w-2.5" /> Sent
                </span>
              )}
              <span className="text-border">|</span>
              {m.read ? (
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Read
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Circle className="h-2.5 w-2.5" /> Not read yet
                </span>
              )}
            </div>
          )}

          {/* Bulk stats */}
          {isBulkEmail && m.stats && (
            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{m.stats.sent} sent</span>
              <span>{m.stats.delivered} delivered</span>
              <span>{m.stats.opened} opened</span>
              <span>{m.stats.clicked} clicked</span>
            </div>
          )}
          {isBatch && !isBulkEmail && m.stats && (
            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{m.stats.delivered} delivered</span>
              <span className="text-emerald-400">{m.stats.confirmed} confirmed</span>
              <span className="text-destructive">{m.stats.cancelled} cancelled</span>
              <span>{m.stats.noResponse} no response</span>
            </div>
          )}

          {/* Reply thread */}
          {m.replyContent && (
            <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-border/20 bg-background/50 px-2 py-1 text-[10px]">
              <ArrowDownLeft className="h-2.5 w-2.5 text-cyan-400" />
              <span className="text-muted-foreground">
                Reply: &ldquo;{m.replyContent}&rdquo;
              </span>
              {m.replyTimestamp && (
                <span className="ml-auto text-muted-foreground">
                  {formatTime(m.replyTimestamp)}
                </span>
              )}
            </div>
          )}

          {/* Auto action */}
          {m.autoAction && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px]">
              <Zap className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-emerald-400">{m.autoAction}</span>
            </div>
          )}

          {/* Action needed */}
          {m.actionNeeded && (
            <div role="alert" className="mt-2 flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] text-amber-400">
                <AlertTriangle className="h-2.5 w-2.5" />
                {m.actionNeeded}
              </div>
              <div className="flex items-center gap-1">
                {m.actionNeeded.toLowerCase().includes("cancel") && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[9px] text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      Confirm Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-foreground"
                    >
                      Contact Guest
                    </Button>
                  </>
                )}
                {m.actionNeeded.toLowerCase().includes("no confirmation") && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[9px] text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      Send Follow-up
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-foreground"
                    >
                      Mark No-Show Prep
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp + more */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(m.timestamp)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/40 bg-popover/95 backdrop-blur-sm">
              {isIn ? (
                <>
                  <DropdownMenuItem>Reply</DropdownMenuItem>
                  <DropdownMenuItem>View Reservation</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>Resend</DropdownMenuItem>
                  <DropdownMenuItem>View Conversation</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
