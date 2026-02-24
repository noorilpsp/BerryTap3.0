"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  PauseCircle,
  Plus,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Template } from "@/lib/comms-data"
import {
  templates as mockTemplates,
  categoryLabels,
  allVariables,
} from "@/lib/comms-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Templates List ──────────────────────────────────────────────────────

export function TemplatesTab() {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)

  const grouped = useMemo(() => {
    const groups: Record<string, Template[]> = {}
    for (const t of mockTemplates) {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    }
    return groups
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Message Templates
        </h2>
        <Button
          size="sm"
          className="h-7 gap-1.5 bg-emerald-600 text-xs font-medium text-foreground hover:bg-emerald-700"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-3 w-3" />
          New Template
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-4">
          {Object.entries(grouped).map(([cat, tmpls]) => (
            <div key={cat}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabels[cat] ?? cat}
              </h3>
              <div className="flex flex-col gap-2">
                {tmpls.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => setEditingTemplate(t)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Edit dialog */}
      {(editingTemplate || creating) && (
        <TemplateEditorDialog
          template={editingTemplate}
          open
          onClose={() => {
            setEditingTemplate(null)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

// ── Template Card ────────────────────────────────────────────────────────

function TemplateCard({
  template: t,
  onEdit,
}: {
  template: Template
  onEdit: () => void
}) {
  function getStatLine(): string {
    const parts: string[] = [`Used ${t.usedCount.toLocaleString()} times`]
    if (t.confirmRate)
      parts.push(`${Math.round(t.confirmRate * 100)}% confirm rate`)
    if (t.cancelAfterRate)
      parts.push(`${Math.round(t.cancelAfterRate * 100)}% cancel after`)
    if (t.responseRate)
      parts.push(`${Math.round(t.responseRate * 100)}% response rate`)
    if (t.rebookRate)
      parts.push(`${Math.round(t.rebookRate * 100)}% rebook rate`)
    if (t.bookingConversion)
      parts.push(
        `${Math.round(t.bookingConversion * 100)}% booking conversion`
      )
    return parts.join(" / ")
  }

  return (
    <div className="group rounded-lg border border-border/20 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            {t.name}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "h-4 px-1 text-[9px] font-medium",
              t.channel === "sms"
                ? "border-cyan-500/30 text-cyan-400"
                : "border-violet-500/30 text-violet-400"
            )}
          >
            {t.channel === "sms" ? (
              <MessageSquare className="mr-0.5 h-2 w-2" />
            ) : (
              <Mail className="mr-0.5 h-2 w-2" />
            )}
            {t.channel.toUpperCase()}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "h-4 px-1 text-[9px] font-medium",
              t.active
                ? "border-emerald-500/30 text-emerald-400"
                : "border-muted-foreground/30 text-muted-foreground"
            )}
          >
            {t.active ? "Active" : "Disabled"}
          </Badge>
        </div>
      </div>

      {/* Body preview */}
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-secondary-foreground">
        {t.body}
      </p>

      {/* Variables */}
      {t.variables.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="text-[9px] text-muted-foreground">Variables:</span>
          {t.variables.map((v) => (
            <Badge
              key={v}
              variant="outline"
              className="h-4 px-1 text-[9px] font-mono border-border/30 text-muted-foreground"
            >
              {`{${v}}`}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats + actions */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {getStatLine()}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={onEdit}
          >
            <Edit className="h-2.5 w-2.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-2.5 w-2.5" />
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <PauseCircle className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Template Editor Dialog ──────────────────────────────────────────────

function TemplateEditorDialog({
  template,
  open,
  onClose,
}: {
  template: Template | null
  open: boolean
  onClose: () => void
}) {
  const isNew = !template
  const [name, setName] = useState(template?.name ?? "")
  const [channel, setChannel] = useState<string>(template?.channel ?? "sms")
  const [category, setCategory] = useState<string>(
    template?.category ?? "reservation"
  )
  const [body, setBody] = useState(template?.body ?? "")
  const [includeSenderId, setIncludeSenderId] = useState(true)
  const [includeBookingLink, setIncludeBookingLink] = useState(false)
  const [includeCancelLink, setIncludeCancelLink] = useState(false)

  const charCount = body.length
  const maxChars = channel === "sms" ? 160 : 5000
  const charWarning = channel === "sms" && charCount > 140

  // Sample preview
  const preview = body
    .replace(/\{guest_name\}/g, "Sarah")
    .replace(/\{restaurant\}/g, "Chez Laurent")
    .replace(/\{date\}/g, "Friday, Jan 17")
    .replace(/\{time\}/g, "7:30 PM")
    .replace(/\{party_size\}/g, "4")
    .replace(/\{table\}/g, "T12")
    .replace(/\{server\}/g, "Alex")
    .replace(/\{wait_time\}/g, "15 min")
    .replace(/\{booking_link\}/g, "book.chezlaurent.com/xyz")
    .replace(/\{cancel_link\}/g, "cancel.chezlaurent.com/xyz")

  function insertVariable(v: string) {
    setBody((prev) => prev + `{${v}}`)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-template-editor-dialog
        className="template-editor-dialog max-h-[90vh] max-w-lg overflow-y-auto border-zinc-700/60 bg-zinc-900/98 backdrop-blur-md sm:max-w-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-zinc-50">
            {isNew ? "New Template" : `Edit Template: ${template?.name ?? ""}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tmpl-name" className="text-xs text-zinc-400">
              Template Name
            </Label>
            <Input
              id="tmpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 border-zinc-600/60 bg-zinc-800/80 text-xs text-zinc-100 placeholder:text-zinc-500"
              placeholder="e.g., Confirmation"
            />
          </div>

          {/* Channel + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tmpl-channel" className="text-xs text-zinc-400">
                Channel
              </Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger
                  id="tmpl-channel"
                  className="h-8 border-zinc-600/60 bg-zinc-800/80 text-xs text-zinc-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-600 bg-zinc-800">
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tmpl-cat" className="text-xs text-zinc-400">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="tmpl-cat"
                  className="h-8 border-zinc-600/60 bg-zinc-800/80 text-xs text-zinc-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-600 bg-zinc-800">
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tmpl-body" className="text-xs text-zinc-400">
              Message Body
            </Label>
            <div className="relative">
              <Textarea
                id="tmpl-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="resize-none border-zinc-600/60 bg-zinc-800/80 pb-6 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-500"
                placeholder="Type your message..."
              />
              <span
                className={cn(
                  "absolute bottom-2 right-3 text-[10px]",
                  charWarning ? "text-amber-400" : "text-zinc-500"
                )}
              >
                {charCount}/{maxChars} chars
              </span>
            </div>
          </div>

          {/* Variable pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Insert Variable
            </span>
            <div className="flex flex-wrap gap-1">
              {allVariables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="rounded-md border border-zinc-600 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10"
                >
                  {`{${v}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {body.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Preview
              </span>
              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-3">
                <div className="mx-auto max-w-[280px]">
                  <div className="rounded-xl bg-emerald-600/20 px-3 py-2 text-xs leading-relaxed text-zinc-100">
                    {preview}
                  </div>
                  <p className="mt-1 text-center text-[9px] text-zinc-500">
                    Preview with sample data: Sarah Chen, 4p
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {channel === "sms" && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Settings
              </span>
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <Checkbox
                  checked={includeSenderId}
                  onCheckedChange={(v) => setIncludeSenderId(!!v)}
                />
                Include restaurant name as sender ID
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <Checkbox
                  checked={includeBookingLink}
                  onCheckedChange={(v) => setIncludeBookingLink(!!v)}
                />
                Include booking management link
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <Checkbox
                  checked={includeCancelLink}
                  onCheckedChange={(v) => setIncludeCancelLink(!!v)}
                />
                Include cancellation link
              </label>
              <span className="text-[10px] text-zinc-500">
                Max SMS segments: {Math.ceil(charCount / 160) || 1} ({maxChars}{" "}
                chars/segment)
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-zinc-700/50 pt-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-3 w-3" />
                Save Template
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Send Test
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
