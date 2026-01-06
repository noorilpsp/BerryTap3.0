"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Mail, MessageSquare, MessageCircle, Smartphone, Receipt, X, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { CampaignDraft, Channel } from "../wizard-types"

interface Props {
  data: CampaignDraft["step1"]
  onChange: (data: CampaignDraft["step1"]) => void
  onNext: () => void
  onSaveDraft: () => void
}

const channelConfig = {
  email: {
    icon: Mail,
    label: "Email",
    description: "Most popular",
    details: "Best for rich content",
    cost: "Free",
    available: true,
  },
  sms: {
    icon: MessageSquare,
    label: "SMS",
    description: "High engagement",
    details: "Immediate delivery",
    cost: "€0.20/msg",
    available: true,
  },
  whatsapp: {
    icon: MessageCircle,
    label: "WhatsApp",
    description: "2-way conversations",
    details: "Requires Business Account setup",
    cost: "€0.15/msg",
    available: true,
  },
  in_app: {
    icon: Smartphone,
    label: "In-App",
    description: "App users only",
    details: "Push notifications",
    cost: "Free",
    available: true,
  },
  receipt: {
    icon: Receipt,
    label: "Receipt",
    description: "POS integration",
    details: "Prints on receipts",
    cost: "Free",
    available: true,
  },
}

const mockTemplates = [
  { id: "blank", name: "Blank Template", category: "Custom", popular: false },
  { id: "welcome", name: "Welcome Email", category: "Welcome", popular: true, avgOpenRate: 45 },
  { id: "promo", name: "Promotional Email", category: "Promotional", popular: true, avgOpenRate: 38 },
  { id: "winback", name: "Win-back Email", category: "Re-engagement", popular: false, avgOpenRate: 28 },
]

export function CampaignSetupStep({ data, onChange, onNext, onSaveDraft }: Props) {
  const [newTag, setNewTag] = useState("")

  const handleChannelToggle = (channel: Channel) => {
    const channels = data.channels.includes(channel)
      ? data.channels.filter((c) => c !== channel)
      : [...data.channels, channel]
    onChange({ ...data, channels })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      onChange({ ...data, tags: [...data.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    onChange({ ...data, tags: data.tags.filter((t) => t !== tag) })
  }

  const handleSelectTemplate = (templateId: string) => {
    onChange({ ...data, template: templateId })
  }

  const canProceed = data.name.length >= 3 && data.channels.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Step 1: Campaign Setup</h2>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">
              Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Welcome Series - New Customers"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Give your campaign a descriptive name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description (optional)</Label>
            <Textarea
              id="campaign-description"
              placeholder="Describe the purpose of this campaign..."
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows={3}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">{data.description.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">Add tags to organize and find campaigns easily</p>
          </div>
        </CardContent>
      </Card>

      {/* Channel Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            Channel Selection <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription>Select one or more channels for this campaign:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(channelConfig) as Channel[]).map((channel) => {
              const config = channelConfig[channel]
              const Icon = config.icon
              const isSelected = data.channels.includes(channel)

              return (
                <Card
                  key={channel}
                  className={cn("cursor-pointer transition-all hover:shadow-md", isSelected && "ring-2 ring-primary")}
                  onClick={() => handleChannelToggle(channel)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isSelected} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{config.label}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">{config.description}</p>
                          <p className="text-muted-foreground">{config.details}</p>
                          <p className="font-medium mt-2">Est. cost: {config.cost}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {data.channels.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Selected: {data.channels.length} channels</span>
                {" • "}
                <span className="text-muted-foreground">
                  Estimated cost:{" "}
                  {data.channels.includes("sms") || data.channels.includes("whatsapp") ? "€0.20" : "Free"} per recipient
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Template Selection (optional)</CardTitle>
          <CardDescription>Start from a template or build from scratch:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  data.template === template.id && "ring-2 ring-primary",
                )}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{template.name}</span>
                      {template.popular && <Star className="w-3 h-3 fill-warning text-warning" />}
                    </div>
                    {template.avgOpenRate && (
                      <p className="text-xs text-muted-foreground">{template.avgOpenRate}% avg open rate</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UTM Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>UTM Tracking (optional)</CardTitle>
          <CardDescription>Add UTM parameters for detailed analytics tracking:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={data.utmTracking.enabled}
              onCheckedChange={(enabled) => onChange({ ...data, utmTracking: { ...data.utmTracking, enabled } })}
            />
            <Label>Enable UTM tracking</Label>
          </div>

          {data.utmTracking.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>Campaign Source</Label>
                <Input
                  value={data.utmTracking.source}
                  onChange={(e) => onChange({ ...data, utmTracking: { ...data.utmTracking, source: e.target.value } })}
                  placeholder="berrytap"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Medium</Label>
                <Input
                  value={data.utmTracking.medium}
                  onChange={(e) => onChange({ ...data, utmTracking: { ...data.utmTracking, medium: e.target.value } })}
                  placeholder="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={data.utmTracking.campaign}
                  onChange={(e) =>
                    onChange({ ...data, utmTracking: { ...data.utmTracking, campaign: e.target.value } })
                  }
                  placeholder="welcome_series"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Term (optional)</Label>
                <Input
                  value={data.utmTracking.term}
                  onChange={(e) => onChange({ ...data, utmTracking: { ...data.utmTracking, term: e.target.value } })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Campaign Content (optional)</Label>
                <Input
                  value={data.utmTracking.content}
                  onChange={(e) => onChange({ ...data, utmTracking: { ...data.utmTracking, content: e.target.value } })}
                />
              </div>

              {data.utmTracking.source && data.utmTracking.medium && (
                <div className="md:col-span-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Preview URL:</p>
                  <p className="text-sm font-mono break-all">
                    https://berrytap.com/?utm_source={data.utmTracking.source}&utm_medium={data.utmTracking.medium}
                    {data.utmTracking.campaign && `&utm_campaign=${data.utmTracking.campaign}`}
                    {data.utmTracking.term && `&utm_term=${data.utmTracking.term}`}
                    {data.utmTracking.content && `&utm_content=${data.utmTracking.content}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onSaveDraft}>
              Save Draft
            </Button>
            <Button onClick={onNext} disabled={!canProceed}>
              Next: Audience →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
