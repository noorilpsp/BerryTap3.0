"use client"

import { useState, useMemo } from "react"
import { Calendar, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { GuestProfile, StaffNote } from "@/lib/guests-data"
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell,
} from "recharts"

interface OverviewTabProps {
  guest: GuestProfile
  onRefresh?: () => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
}

/* ── Visit Frequency Chart ────────────────────────────────── */
function VisitFrequencyChart({ guest }: { guest: GuestProfile }) {
  const { data, avgPerMonth } = useMemo(() => {
    const visits = guest.visitHistory ?? []
    const byMonth = new Map<string, number>()
    for (const v of visits) {
      const d = new Date(v.date)
      const key = d.toLocaleDateString("en-US", { month: "short" })
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1)
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = months
      .filter((m) => byMonth.get(m))
      .map((m) => ({ month: m, visits: byMonth.get(m) ?? 0 }))
      .slice(-6)
    const avg = visits.length > 0 && data.length > 0
      ? (visits.length / data.length).toFixed(1)
      : "0"
    return { data, avgPerMonth: avg }
  }, [guest.visitHistory])

  if (data.length === 0) return null

  return (
    <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
      <SectionTitle>Visit Frequency</SectionTitle>
      <div className="h-[120px]" aria-label={`Visit frequency chart showing average ${avgPerMonth} visits per month`}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 15% 14%)", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "hsl(210 20% 95%)" }}
            />
            <Scatter data={data} dataKey="visits" fill="hsl(185 85% 45%)">
              {data.map((_, i) => (
                <Cell key={i} className="guest-freq-dot" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Avg: {avgPerMonth} visits/month</span>
      </div>
    </div>
  )
}

/* ── Spend History Chart ──────────────────────────────────── */
function SpendHistoryChart({ guest }: { guest: GuestProfile }) {
  const data = useMemo(() => {
    const visits = guest.visitHistory ?? []
    return visits
      .filter((v) => v.status === "completed")
      .map((v, i) => ({
        visit: i + 1,
        amount: v.total,
        date: v.date,
      }))
      .reverse()
  }, [guest.visitHistory])

  if (data.length === 0) return null

  return (
    <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
      <SectionTitle>Spend History</SectionTitle>
      <div className="h-[140px]" aria-label={`Spend history chart showing average spend of $${guest.avgSpend}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(185 85% 45%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(185 85% 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
            <XAxis dataKey="visit" tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }} axisLine={false} tickLine={false} label={{ value: "Visit #", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(220 10% 48%)" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(220 10% 48%)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 15% 14%)", borderRadius: 8, fontSize: 11 }}
              formatter={(value: number) => [`$${value}`, "Spend"]}
            />
            <Area type="monotone" dataKey="amount" stroke="hsl(185 85% 45%)" fill="url(#spendGradient)" strokeWidth={2} className="guest-spend-line" dot={{ r: 3, fill: "hsl(185 85% 45%)", stroke: "hsl(220 18% 8%)", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Favorite Items ───────────────────────────────────────── */
function FavoriteItems({ guest }: { guest: GuestProfile }) {
  const items = guest.favoriteItems || []
  if (items.length === 0) return null

  return (
    <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
      <SectionTitle>Favorite Items</SectionTitle>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs font-medium text-muted-foreground">{i + 1}.</span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-secondary/50">
                <div className="h-full rounded-full bg-primary/60 guest-fav-bar" style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="w-20 text-right text-[11px] text-muted-foreground">
                {item.frequency}/{item.total} ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Key Dates ────────────────────────────────────────────── */
function KeyDates({ guest }: { guest: GuestProfile }) {
  const dates: { icon: string; label: string; value: string }[] = []
  if (guest.birthday) {
    const d = new Date(guest.birthday)
    dates.push({ icon: "cake", label: "Birthday", value: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) })
  }
  if (guest.anniversary) {
    const d = new Date(guest.anniversary)
    dates.push({ icon: "ring", label: "Anniversary", value: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) })
  }
  dates.push({ icon: "first", label: "First visit", value: new Date(guest.firstVisit).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })
  dates.push({ icon: "last", label: "Last visit", value: new Date(guest.lastVisit).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })

  return (
    <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
      <SectionTitle>Key Dates</SectionTitle>
      <div className="flex flex-col gap-2">
        {dates.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{d.label}:</span>
            <span className="text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Staff Notes ──────────────────────────────────────────── */
function StaffNotesSection({
  guest,
  onNoteAdded,
}: {
  guest: GuestProfile
  onNoteAdded?: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [saving, setSaving] = useState(false)
  const notes: StaffNote[] = guest.staffNotes ?? []

  async function handleSaveNote() {
    const text = noteText.trim()
    if (!text || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${guest.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Failed to add note")
      toast.success("Note added")
      setShowAdd(false)
      setNoteText("")
      onNoteAdded?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
      <SectionTitle>Staff Notes</SectionTitle>
      {notes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-border/20 bg-secondary/20 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{note.author}</span>
                {note.role && <span>({note.role})</span>}
                <span className="text-border">--</span>
                <span>{new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{note.text}&rdquo;</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No notes yet</p>
      )}

      {showAdd ? (
        <div className="mt-3 flex flex-col gap-2 guest-note-expand">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="rounded-lg border border-border/30 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
            rows={2}
            placeholder="Add a note about this guest..."
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNoteText("") }} className="text-xs" disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" className="bg-primary/20 text-primary text-xs hover:bg-primary/30" onClick={handleSaveNote} disabled={saving || !noteText.trim()}>
              {saving ? "Saving…" : "Save Note"}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} className="mt-2 gap-1 text-xs text-muted-foreground hover:text-primary">
          <Plus className="h-3 w-3" /> Add Note
        </Button>
      )}
    </div>
  )
}

/* ── Main Overview ────────────────────────────────────────── */
export function GuestOverviewTab({ guest, onRefresh }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <VisitFrequencyChart guest={guest} />
      <SpendHistoryChart guest={guest} />
      <FavoriteItems guest={guest} />
      <KeyDates guest={guest} />
      <StaffNotesSection guest={guest} onNoteAdded={onRefresh} />
    </div>
  )
}
