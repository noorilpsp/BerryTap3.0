"use client"

import {
  ArrowUpRight,
  Clock,
  Mail,
  MessageSquare,
  Send,
  Eye,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { analyticsData } from "@/lib/comms-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// ── Analytics Tab ────────────────────────────────────────────────────────

export function AnalyticsTab() {
  const d = analyticsData
  const smsPct = Math.round(
    (d.channelBreakdown.sms / (d.channelBreakdown.sms + d.channelBreakdown.email)) * 100
  )
  const emailPct = 100 - smsPct

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Communication Analytics
        </h2>
        <span className="text-[10px] text-muted-foreground">
          Period: Last 30 days
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-4">
          {/* KPI Cards */}
          <div
            className="grid grid-cols-2 gap-2 lg:grid-cols-4"
            aria-label="Key performance indicators for last 30 days"
          >
            <KPICard
              label="Sent"
              value={d.totalSent.toLocaleString()}
              change="+12%"
              positive
              icon={<Send className="h-3.5 w-3.5" />}
              color="text-cyan-400"
            />
            <KPICard
              label="Delivered"
              value={`${(d.deliveryRate * 100).toFixed(1)}%`}
              change="+0.3%"
              positive
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              color="text-emerald-400"
            />
            <KPICard
              label="Read Rate"
              value={`${(d.readRate * 100).toFixed(1)}%`}
              change="+4.1%"
              positive
              icon={<Eye className="h-3.5 w-3.5" />}
              color="text-amber-400"
            />
            <KPICard
              label="Confirm Rate"
              value={`${(d.confirmRate * 100).toFixed(1)}%`}
              change=""
              positive
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              color="text-violet-400"
            />
          </div>

          {/* Delivery Performance Chart */}
          <div className="rounded-lg border border-border/20 bg-secondary/20 p-3">
            <h3 className="mb-3 text-xs font-semibold text-foreground">
              Delivery Performance (Last 30 Days)
            </h3>
            <div
              className="h-[200px] w-full"
              aria-label={`Delivery chart: Week 1 sent ${d.weeklyData[0].sent}, Week 4 sent ${d.weeklyData[3].sent}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }}
                    axisLine={{ stroke: "hsl(220 15% 14%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 18% 8%)",
                      borderColor: "hsl(220 15% 18%)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "hsl(210 20% 95%)" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke="hsl(185 85% 45%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(185 85% 45%)", r: 3 }}
                    name="Sent"
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="hsl(160 84% 39%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(160 84% 39%)", r: 3 }}
                    name="Delivered"
                  />
                  <Line
                    type="monotone"
                    dataKey="read"
                    stroke="hsl(38 92% 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(38 92% 50%)", r: 3 }}
                    name="Read"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Template Performance Table */}
          <div className="rounded-lg border border-border/20 bg-secondary/20 p-3">
            <h3 className="mb-3 text-xs font-semibold text-foreground">
              Template Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left" aria-label="Template performance breakdown">
                <thead>
                  <tr className="border-b border-border/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-3">Template</th>
                    <th className="pb-2 pr-3 text-right">Sent</th>
                    <th className="pb-2 pr-3 text-right">Delivered</th>
                    <th className="pb-2 pr-3 text-right">Read</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.templatePerformance.map((tp) => (
                    <tr
                      key={tp.name}
                      className="border-b border-border/10 text-xs text-secondary-foreground last:border-b-0"
                    >
                      <td className="py-1.5 pr-3 font-medium text-foreground">
                        {tp.name}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">
                        {tp.sent}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">
                        {tp.delivered}{" "}
                        <span className="text-muted-foreground">
                          ({tp.deliveryPct}%)
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular-nums">
                        {tp.read}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">
                        {tp.actionPct !== "--" ? (
                          <span className="text-emerald-400">
                            {tp.actionPct} {tp.actionLabel}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Response Time */}
          <div className="rounded-lg border border-border/20 bg-secondary/20 p-3">
            <h3 className="mb-2 text-xs font-semibold text-foreground">
              Response Time
            </h3>
            <div className="flex flex-col gap-1.5 text-xs text-secondary-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  Average reply time
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {d.avgReplyTime} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confirmation replies</span>
                <span className="tabular-nums">8 min avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Late check-in replies</span>
                <span className="tabular-nums">4 min avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fastest response</span>
                <span className="tabular-nums text-emerald-400">
                  {"<"}1 min (late check-ins)
                </span>
              </div>
            </div>
          </div>

          {/* Channel Breakdown */}
          <div className="rounded-lg border border-border/20 bg-secondary/20 p-3">
            <h3 className="mb-3 text-xs font-semibold text-foreground">
              Channel Breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {/* SMS */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-secondary-foreground">
                    <MessageSquare className="h-3 w-3 text-cyan-400" />
                    SMS
                  </span>
                  <span className="tabular-nums text-foreground">
                    {d.channelBreakdown.sms.toLocaleString()} sent ({smsPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${smsPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Read rate: {Math.round(d.smsReadRate * 100)}%
                </span>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-secondary-foreground">
                    <Mail className="h-3 w-3 text-violet-400" />
                    Email
                  </span>
                  <span className="tabular-nums text-foreground">
                    {d.channelBreakdown.email.toLocaleString()} sent ({emailPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${emailPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Open rate: {Math.round(d.emailOpenRate * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  change,
  positive,
  icon,
  color,
}: {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="rounded-lg border border-border/20 bg-secondary/30 p-3">
      <div className={cn("mb-1", color)}>{icon}</div>
      <div className="text-lg font-bold tabular-nums text-foreground">
        {value}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        {change && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[9px] font-medium",
              positive ? "text-emerald-400" : "text-destructive"
            )}
          >
            <ArrowUpRight className="h-2 w-2" />
            {change}
          </span>
        )}
      </div>
    </div>
  )
}
