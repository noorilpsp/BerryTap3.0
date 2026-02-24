"use client"

import { AlertTriangle, Edit, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GuestProfile } from "@/lib/guests-data"

interface PreferencesTabProps {
  guest: GuestProfile
}

function SectionTitle({ children, onEdit }: { children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
      {onEdit && (
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground">
          <Edit className="h-2.5 w-2.5" /> Edit
        </Button>
      )}
    </div>
  )
}

function PreferenceRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", highlight && "font-medium")}>{value}</span>
    </div>
  )
}

export function GuestPreferencesTab({ guest }: PreferencesTabProps) {
  const isSarah = guest.id === "guest_001"

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Dietary & Allergies */}
      <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
        <SectionTitle onEdit={() => {}}>Dietary & Allergies</SectionTitle>
        {guest.allergies.length > 0 ? (
          <div className="flex flex-col gap-2">
            {guest.allergies.map((a) => (
              <div key={a.type} className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5" role="alert">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <div>
                  <div className="text-sm font-medium text-rose-300">{a.type} -- {a.severity.toUpperCase()}</div>
                  {a.severity === "severe" && (
                    <div className="text-xs text-rose-400/70">Kitchen auto-alerted on every reservation</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No allergies recorded</p>
        )}
        {guest.dietary.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Dietary: {guest.dietary.join(", ")}
          </div>
        )}
      </div>

      {/* Seating Preferences */}
      <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
        <SectionTitle onEdit={() => {}}>Seating Preferences</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {guest.preferences.seating && (
            <PreferenceRow label="Seating:" value={`${guest.preferences.seating} -- ${isSarah ? "strong preference (requested 10/12)" : "preferred"}`} highlight />
          )}
          {guest.preferences.zone && (
            <PreferenceRow label="Zone:" value={`${guest.preferences.zone} preferred`} />
          )}
          {!guest.preferences.seating && !guest.preferences.zone && (
            <p className="text-sm text-muted-foreground">No seating preferences recorded</p>
          )}
        </div>
      </div>

      {/* Service Preferences */}
      <div className="guest-profile-section rounded-xl border border-border/30 bg-card/40 p-4">
        <SectionTitle onEdit={() => {}}>Service Preferences</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {guest.preferences.welcomeDrink && (
            <PreferenceRow label="Welcome drink:" value={guest.preferences.welcomeDrink} highlight />
          )}
          {guest.preferences.server && (
            <PreferenceRow label="Preferred server:" value={guest.preferences.server} />
          )}
          {guest.avgPartySize && (
            <PreferenceRow label="Typical party size:" value={`${guest.avgPartySize} guests`} />
          )}
          {guest.preferredDays && guest.preferredDays.length > 0 && (
            <PreferenceRow label="Preferred days:" value={guest.preferredDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")} />
          )}
          {guest.preferredTime && (
            <PreferenceRow label="Preferred time:" value={guest.preferredTime} />
          )}
          {!guest.preferences.welcomeDrink && !guest.preferences.server && !guest.preferredDays && (
            <p className="text-sm text-muted-foreground">No service preferences recorded</p>
          )}
        </div>
      </div>

      {/* Auto-Detected Patterns (Sarah only) */}
      {isSarah && (
        <div className="guest-profile-section rounded-xl border border-primary/20 bg-primary/5 p-4">
          <SectionTitle>Auto-Detected Patterns</SectionTitle>
          <div className="flex flex-col gap-3">
            {[
              "Sarah typically visits every 2-3 weeks on Fridays. Next predicted visit: Jan 31 or Feb 7.",
              "Spending has increased 12% over last 6 visits. She's exploring more of the menu -- upsell potential.",
              "Birthday is March 15. She asked about the private room. Proactively reach out in February?",
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
