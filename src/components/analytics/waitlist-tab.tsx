"use client"

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { waitlistAnalysis } from "@/lib/analytics-data"

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-4 backdrop-blur-sm", className)}>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{title}</h3>
      {children}
    </div>
  )
}

const wl = waitlistAnalysis

const waitlistKpis = [
  { label: "Waitlist Parties", value: wl.kpis.totalParties.value, change: wl.kpis.totalParties.change, positive: true },
  { label: "Conversion Rate", value: `${wl.kpis.conversionRate.value}%`, change: wl.kpis.conversionRate.change, positive: true },
  { label: "Avg Wait Time", value: `${wl.kpis.avgWaitTime.value} min`, change: wl.kpis.avgWaitTime.change, positive: true },
  { label: "Quote Accuracy", value: `${wl.kpis.quoteAccuracy.value}%`, change: wl.kpis.quoteAccuracy.change, positive: true },
]

const quoteData = [
  { name: "Early", value: wl.quoteAccuracy.early, fill: "#34d399" },
  { name: "On Time", value: wl.quoteAccuracy.onTime, fill: "#22d3ee" },
  { name: "Late", value: wl.quoteAccuracy.late, fill: "#fb7185" },
]

const abandonment = wl.abandonment

export function WaitlistTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {waitlistKpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{k.label}</p>
            <p className="text-xl font-bold text-foreground">{k.value}</p>
            <p className={cn("flex items-center gap-0.5 text-xs", k.positive ? "text-emerald-400" : "text-rose-400")}>
              {k.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {k.change > 0 ? "+" : ""}{k.change}{typeof k.change === "number" && !String(k.value).includes("min") ? "%" : " min"}
            </p>
          </div>
        ))}
      </div>

      {/* Wait distribution */}
      <ChartCard title="Wait Time Distribution">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={wl.waitDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="range" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = wl.waitDistribution.find((w) => w.range === label)
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                    <p className="text-xs text-zinc-400">{label}</p>
                    <p className="text-xs text-cyan-400">{payload[0].value} parties ({d?.percentage}%)</p>
                    {d?.abandonRate && <p className="text-xs text-rose-400">{d.abandonRate}% abandoned</p>}
                  </div>
                )
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              barSize={32}
            >
              {wl.waitDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.abandonRate ? "#fb7185" : "#22d3ee"} fillOpacity={entry.abandonRate ? 0.7 : 0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Quote accuracy + bar spend */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Quote Accuracy">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={quoteData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {quoteData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="text-xs" style={{ color: d.payload.fill }}>{d.name}: {d.value}%</p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 text-xs text-zinc-500">
            <p>Target: 90% within +/- 10 min</p>
            <p>Current: <span className="text-cyan-400">84.6%</span></p>
            <p>Avg overquote: +{wl.quoteAccuracy.avgOverquote} min | Avg underquote: {wl.quoteAccuracy.avgUnderquote} min</p>
          </div>
        </ChartCard>

        <ChartCard title="Bar Spend While Waiting">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-xs">
              <span className="text-zinc-400">Parties at bar</span>
              <span className="font-mono font-medium text-zinc-300">{wl.barSpend.partiesAtBar}%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-xs">
              <span className="text-zinc-400">Avg bar spend</span>
              <span className="font-mono font-medium text-emerald-400">${wl.barSpend.avgSpend.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-xs">
              <span className="text-zinc-400">Total bar revenue (waitlist)</span>
              <span className="font-mono font-medium text-zinc-300">${wl.barSpend.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-xs">
              <span className="text-zinc-400">Avg tab transferred to table</span>
              <span className="font-mono font-medium text-zinc-400">${wl.barSpend.avgTransferred} ({wl.barSpend.transferRate}%)</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Waitlist drives <span className="text-emerald-400">2.1%</span> of total revenue via bar spending.
          </p>
        </ChartCard>
      </div>

      {/* Abandonment */}
      <ChartCard title="Abandonment Analysis">
        <div className="mb-3 text-xs text-zinc-400">
          Parties who left without being seated: <span className="font-medium text-rose-400">{abandonment.total} ({abandonment.rate}%)</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Left before quoted time</span>
            <span className="font-mono text-zinc-300">{abandonment.beforeQuote} (32%) -- impatient or found alternatives</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Left at quoted time</span>
            <span className="font-mono text-zinc-300">{abandonment.atQuote} (41%) -- quote was too long</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Left after quoted time</span>
            <span className="font-mono text-zinc-300">{abandonment.afterQuote} (27%) -- underquoted, lost patience</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>Avg wait before leaving: <span className="text-zinc-300">{abandonment.avgWaitBeforeLeaving} min</span></span>
          <span>Worst party size: <span className="text-rose-400">{abandonment.worstPartySize} guests (28% abandon rate)</span></span>
        </div>
        <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Parties of 5-6 abandon most. Consider proactive merge suggestions for 5-tops.</span>
        </div>
      </ChartCard>
    </div>
  )
}
