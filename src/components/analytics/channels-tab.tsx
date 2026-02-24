"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { Lightbulb, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { channelMix, channelTrend } from "@/lib/analytics-data"
import { Badge } from "@/components/ui/badge"

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-4 backdrop-blur-sm", className)}>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{title}</h3>
      {children}
    </div>
  )
}

const channelColors: Record<string, string> = {
  Direct: "#34d399",
  Phone: "#22d3ee",
  Google: "#fbbf24",
  "Walk-in": "#a78bfa",
}

export function ChannelsTab() {
  const channels = Object.entries(channelMix)

  return (
    <div className="flex flex-col gap-4">
      {/* Comparison table */}
      <ChartCard title="Channel Comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Channel performance comparison">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="px-2 py-2 text-left font-medium">Channel</th>
                <th className="px-2 py-2 text-right font-medium">Covers</th>
                <th className="px-2 py-2 text-right font-medium">Revenue</th>
                <th className="px-2 py-2 text-right font-medium">Avg Check</th>
                <th className="px-2 py-2 text-right font-medium">No-Show</th>
                <th className="px-2 py-2 text-right font-medium">Confirm</th>
                <th className="px-2 py-2 text-right font-medium">Cost/Cover</th>
                <th className="px-2 py-2 text-center font-medium" />
              </tr>
            </thead>
            <tbody>
              {channels.map(([name, data]) => (
                <tr key={name} className="border-b border-zinc-800/50">
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: channelColors[name] }} />
                      {name}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-zinc-300">{data.covers.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right font-mono text-zinc-300">${(data.revenue / 1000).toFixed(1)}K</td>
                  <td className="px-2 py-2 text-right font-mono text-zinc-300">${data.avgCheck.toFixed(2)}</td>
                  <td className={cn("px-2 py-2 text-right font-mono", data.noShowRate > 5 ? "text-rose-400" : "text-zinc-400")}>
                    {data.noShowRate}%
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-zinc-400">
                    {data.confirmRate !== null ? `${data.confirmRate}%` : "N/A"}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-zinc-400">
                    {data.costPerCover > 0 ? `$${data.costPerCover.toFixed(2)}` : "$0.00"}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {name === "Direct" && (
                      <Badge variant="outline" className="border-emerald-500/40 text-[10px] text-emerald-400">
                        <Star className="mr-0.5 h-2.5 w-2.5" /> Best
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Stacked area chart - channel trend */}
      <ChartCard title="Channel Trend (Last 12 Weeks)">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={channelTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                    <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
                    {payload.map((p) => (
                      <p key={p.name} className="text-xs" style={{ color: p.color as string }}>
                        {p.name}: {p.value as number} covers
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => <span className="text-zinc-400">{value}</span>} />
            <Area type="monotone" dataKey="direct" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.3} name="Direct" />
            <Area type="monotone" dataKey="phone" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} name="Phone" />
            <Area type="monotone" dataKey="google" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} name="Google" />
            <Area type="monotone" dataKey="walkIn" stackId="1" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} name="Walk-in" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>Direct: <span className="text-emerald-400">+5%</span></span>
          <span>Phone: <span className="text-rose-400">-3%</span></span>
          <span>Google: <span className="text-emerald-400">+12%</span></span>
          <span>Walk-in: <span className="text-zinc-400">Stable</span></span>
        </div>
      </ChartCard>

      {/* Channel ROI */}
      <ChartCard title="Channel ROI Analysis">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Google Reserve: 427 covers x $100 avg</span>
            <span className="font-mono text-zinc-300">= $42,700</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Less: Commission ($2.50 x 427)</span>
            <span className="font-mono text-rose-400">- $1,068</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Less: No-show losses (52 x $100)</span>
            <span className="font-mono text-rose-400">- $5,200</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 font-medium">
            <span className="text-zinc-300">Net value</span>
            <span className="font-mono text-emerald-400">$36,432</span>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Requiring SMS confirmation for Google could save ~$4.3K/month if no-shows matched direct booking rates.</span>
        </div>
      </ChartCard>
    </div>
  )
}
