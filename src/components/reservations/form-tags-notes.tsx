"use client"

import { Check, Star, Cake, Heart, ShieldAlert, Baby, Accessibility, Dog, Briefcase, PartyPopper, Crown, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { type FormTag, formTagDefs } from "@/lib/reservation-form-data"

interface FormTagsNotesProps {
  tags: FormTag[]
  allergyDetail: string
  notes: string
  onToggleTag: (tag: FormTag) => void
  onAllergyDetailChange: (detail: string) => void
  onNotesChange: (notes: string) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Cake, Heart, ShieldAlert, Baby, Accessibility, Dog, Briefcase, PartyPopper, Crown, Sparkles,
}

export function FormTagsNotes({
  tags,
  allergyDetail,
  notes,
  onToggleTag,
  onAllergyDetailChange,
  onNotesChange,
}: FormTagsNotesProps) {
  return (
    <div className="space-y-4">
      {/* Tags */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {formTagDefs.map((tag) => {
            const isActive = tags.includes(tag.id)
            const Icon = iconMap[tag.icon]
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                    : "bg-secondary/40 text-muted-foreground border border-transparent hover:bg-secondary/70 hover:text-foreground"
                }`}
                role="switch"
                aria-checked={isActive}
              >
                {isActive ? (
                  <Check className="h-3 w-3" />
                ) : (
                  Icon && <Icon className="h-3 w-3" />
                )}
                {tag.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Conditional allergy field */}
      {tags.includes("allergy") && (
        <div className="form-expand-enter">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Allergy details
          </label>
          <Input
            value={allergyDetail}
            onChange={(e) => onAllergyDetailChange(e.target.value)}
            placeholder="e.g., Shellfish, Nut allergy, Dairy-free..."
            className="bg-secondary/50 border-border/60 focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Special requests, preferences, internal notes..."
          rows={3}
          className="bg-secondary/50 border-border/60 resize-none focus:border-primary/50 focus:ring-primary/20"
        />
      </div>
    </div>
  )
}
