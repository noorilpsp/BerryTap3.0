"use client"

import { Send, ArrowUpRight, ArrowDownLeft, Check, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Communication, formatDateTime } from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

interface DetailCommunicationsProps {
  communications: Communication[]
}

function templateLabel(template?: string): string {
  if (!template) return "Message"
  const labels: Record<string, string> = {
    confirmation: "SMS Confirmation Sent",
    reminder: "SMS Reminder Sent",
    table_ready: 'SMS "Table Ready" Sent',
  }
  return labels[template] || template
}

export function DetailCommunications({ communications }: DetailCommunicationsProps) {
  return (
    <section className="detail-section-stagger rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Communications</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300">
              <Send className="h-3 w-3" /> Send Message
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Table is ready</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Running behind -- updated wait</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Confirmation reminder</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Custom message...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {communications.map((msg, i) => {
          const isOut = msg.direction === "out"
          return (
            <div
              key={i}
              className={cn(
                "detail-msg-stagger rounded-lg border p-3",
                isOut
                  ? "border-zinc-800/50 bg-zinc-800/20"
                  : "ml-4 border-emerald-500/20 bg-emerald-500/5"
              )}
              style={{ "--msg-index": i } as React.CSSProperties}
            >
              {/* Header */}
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500">
                  {isOut ? (
                    <ArrowUpRight className="h-3 w-3 text-blue-400" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3 text-emerald-400" />
                  )}
                  {isOut ? templateLabel(msg.template) : "Guest replied"}
                </div>
                <span className="text-[10px] text-zinc-600">{formatDateTime(msg.timestamp)}</span>
              </div>

              {/* Content */}
              <p className={cn("text-xs", isOut ? "text-zinc-300" : "font-medium text-emerald-300")}>
                {isOut ? `"${msg.content}"` : `"${msg.content}"`}
              </p>

              {/* Delivery status */}
              {isOut && msg.status && (
                <div className="mt-1.5 flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-0.5 text-zinc-500">
                    <Check className="h-2.5 w-2.5" /> Delivered
                  </span>
                  {msg.read !== undefined && (
                    <span className={cn("flex items-center gap-0.5", msg.read ? "text-zinc-500" : "text-zinc-600")}>
                      <Eye className="h-2.5 w-2.5" /> {msg.read ? "Read" : "Not read yet"}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {communications.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-600">No communications</p>
        )}
      </div>
    </section>
  )
}
