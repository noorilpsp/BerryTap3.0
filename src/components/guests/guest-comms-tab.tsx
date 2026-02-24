"use client"

import { Check, CheckCheck, Eye, Send, Mail, MessageSquare, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GuestProfile, CommMessage } from "@/lib/guests-data"
import { sarahCommunications } from "@/lib/guests-data"

interface CommsTabProps {
  guest: GuestProfile
}

function StatusIndicator({ status }: { status: CommMessage["status"] }) {
  switch (status) {
    case "delivered": return <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Check className="h-3 w-3" /> Delivered</span>
    case "read": return <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><CheckCheck className="h-3 w-3" /> Read</span>
    case "opened": return <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><Eye className="h-3 w-3" /> Opened</span>
    case "sent": return <span className="flex items-center gap-0.5 text-[10px] text-zinc-400"><Check className="h-3 w-3" /> Sent</span>
    case "failed": return <span className="flex items-center gap-0.5 text-[10px] text-rose-400">Failed</span>
  }
}

function MessageCard({ msg, index }: { msg: CommMessage; index: number }) {
  const isEmail = msg.type === "email"
  return (
    <div
      className="guest-comm-stagger rounded-xl border border-border/30 bg-card/40 p-3"
      style={{ "--comm-i": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isEmail ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"
        )}>
          {isEmail ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground">
              {msg.direction === "outbound" ? "Sent" : "Received"} -- {msg.type.toUpperCase()} {msg.subject}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {" at "}
            {new Date(msg.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">&ldquo;{msg.preview}&rdquo;</p>

          <div className="mt-2 flex items-center gap-3">
            <StatusIndicator status={msg.status} />
          </div>

          {msg.reply && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-secondary/30 px-3 py-2">
              <ArrowDownLeft className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span className="text-xs text-foreground">Reply: &ldquo;{msg.reply}&rdquo;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function GuestCommsTab({ guest }: CommsTabProps) {
  const messages = guest.id === "guest_001" ? sarahCommunications : []
  const totalSent = messages.filter(m => m.direction === "outbound").length
  const totalRead = messages.filter(m => m.status === "read" || m.status === "opened").length

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Communication History
        </h3>
        <Button size="sm" className="gap-1.5 bg-primary/15 text-primary text-xs hover:bg-primary/25">
          <Send className="h-3 w-3" />
          Send Message
        </Button>
      </div>

      {messages.length > 0 ? (
        <>
          {messages.map((msg, i) => (
            <MessageCard key={msg.id} msg={msg} index={i} />
          ))}

          <div className="rounded-lg border border-border/20 bg-secondary/20 p-3 text-center text-xs text-muted-foreground">
            Total: {totalSent} messages sent / {totalRead} read / Response rate: {totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0}%
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Mail className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No communication history</p>
        </div>
      )}
    </div>
  )
}
