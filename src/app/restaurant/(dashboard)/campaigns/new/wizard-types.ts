import { Settings, Users, Mail, Clock, CheckCircle, Check } from "lucide-react"

export const wizardSteps = [
  { id: "setup", name: "Setup", icon: Settings, completedIcon: Check },
  { id: "audience", name: "Audience", icon: Users, completedIcon: Check },
  { id: "message", name: "Message", icon: Mail, completedIcon: Check },
  { id: "schedule", name: "Schedule", icon: Clock, completedIcon: Check },
  { id: "review", name: "Review", icon: CheckCircle, completedIcon: Check },
]

export type Channel = "email" | "sms" | "whatsapp" | "in_app" | "receipt"

export interface CampaignDraft {
  id: string
  step1: {
    name: string
    description: string
    tags: string[]
    channels: Channel[]
    template: string | null
    utmTracking: {
      enabled: boolean
      source: string
      medium: string
      campaign: string
      term: string
      content: string
    }
  }
  step2: {
    selectionMethod: "segment" | "csv" | "individual"
    selectedSegments: string[]
    csvData: any | null
    filters: {
      removeDuplicates: boolean
      excludeUnsubscribed: boolean
      excludeBounced: boolean
      excludeRecentRecipients: boolean
    }
  }
  step3: {
    email: {
      subject: string
      previewText: string
      body: string
      plainText: string
      settings: {
        trackOpens: boolean
        trackClicks: boolean
        includeUnsubscribe: boolean
        includeViewInBrowser: boolean
      }
    }
    sms: {
      message: string
      useShortener: boolean
    }
  }
  step4: {
    sendTiming: "immediate" | "scheduled" | "recurring"
    scheduledDate: string | null
    scheduledTime: string | null
    timezone: string
    recurring: {
      frequency: "daily" | "weekly" | "monthly" | "custom"
      days: number[]
      endCondition: "never" | "after" | "on"
      endValue: number | string | null
    } | null
    throttling: {
      enabled: boolean
      rate: number
    }
    notifications: {
      onStart: boolean
      onComplete: boolean
      onError: boolean
      highUnsubscribe: boolean
      channels: string[]
    }
  }
  step5: {
    costConfirmed: boolean
    finalConfirmed: boolean
  }
}

export interface Segment {
  id: string
  name: string
  description: string
  count: number
  lastUpdated: string
  autoRefreshing: boolean
  channelAvailability: {
    email: number
    sms: number
    whatsapp: number
  }
}

export interface Template {
  id: string
  name: string
  category: string
  channels: Channel[]
  previewImage: string
  popular: boolean
  avgOpenRate?: number
  avgCTR?: number
}
