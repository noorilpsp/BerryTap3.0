"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { DisplaySettingsTab } from "../components/settings/display-settings-tab"
import { NotificationSettingsTab } from "../components/settings/notification-settings-tab"
import { ProcessorSettingsTab } from "../components/settings/processor-settings-tab"
import { FeeSettingsTab } from "../components/settings/fee-settings-tab"
import { PermissionsSettingsTab } from "../components/settings/permissions-settings-tab"
import { ApiSettingsTab } from "../components/settings/api-settings-tab"
import { DataRetentionTab } from "../components/settings/data-retention-tab"
import { AuditLogTab } from "../components/settings/audit-log-tab"
import { RefundSettingsTab } from "../components/settings/refund-settings-tab"
import { DisputeSettingsTab } from "../components/settings/dispute-settings-tab"
import { WebhookSettingsTab } from "../components/settings/webhook-settings-tab"
import { AccountingSettingsTab } from "../components/settings/accounting-settings-tab"

type SettingsTab =
  | "display"
  | "notifications"
  | "processors"
  | "fees"
  | "refunds"
  | "disputes"
  | "permissions"
  | "audit"
  | "retention"
  | "api"
  | "webhooks"
  | "accounting"

const settingsMenu = [
  {
    category: "General",
    items: [
      { id: "display", label: "Display", description: "Table layout and formatting" },
      { id: "notifications", label: "Notifications", description: "Email, SMS, and in-app alerts" },
      { id: "processors", label: "Payment Processors", description: "Connected payment gateways" },
      { id: "fees", label: "Fees & Pricing", description: "Fee calculation and display" },
    ],
  },
  {
    category: "Policies",
    items: [
      { id: "refunds", label: "Refunds", description: "Refund policies and limits" },
      { id: "disputes", label: "Disputes", description: "Chargeback management" },
    ],
  },
  {
    category: "Security",
    items: [
      { id: "permissions", label: "Permissions", description: "User roles and access control" },
      { id: "audit", label: "Audit Logs", description: "Activity tracking and logging" },
      { id: "retention", label: "Data Retention", description: "Data storage policies" },
    ],
  },
  {
    category: "Integrations",
    items: [
      { id: "api", label: "API Keys", description: "API access and management" },
      { id: "webhooks", label: "Webhooks", description: "Event notifications" },
      { id: "accounting", label: "Accounting", description: "QuickBooks, Xero integration" },
    ],
  },
]

export default function TransactionSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("display")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const renderTabContent = () => {
    switch (activeTab) {
      case "display":
        return <DisplaySettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "notifications":
        return <NotificationSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "processors":
        return <ProcessorSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "fees":
        return <FeeSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "refunds":
        return <RefundSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "disputes":
        return <DisputeSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "webhooks":
        return <WebhookSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "accounting":
        return <AccountingSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "permissions":
        return <PermissionsSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "api":
        return <ApiSettingsTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      case "audit":
        return <AuditLogTab />
      case "retention":
        return <DataRetentionTab onSettingsChange={() => setHasUnsavedChanges(true)} />
      default:
        return (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Settings for {activeTab} coming soon
          </div>
        )
    }
  }

  const handleSave = () => {
    console.log("[v0] Saving all settings")
    setHasUnsavedChanges(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Transaction Settings</h1>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <Button onClick={handleSave}>Save All Settings</Button>
          </div>
        )}
      </div>

      {/* Settings Layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Settings Menu */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardContent className="p-4">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <nav className="space-y-6">
                {settingsMenu.map((section) => (
                  <div key={section.category} className="space-y-2">
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.category}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as SettingsTab)}
                          className={cn(
                            "flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent",
                            activeTab === item.id && "bg-accent font-medium",
                          )}
                        >
                          <span className="text-sm">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="space-y-4">
          {renderTabContent()}

          {activeTab !== "audit" && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Save your changes</p>
                  <p className="text-xs text-muted-foreground">Changes will be applied immediately after saving</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setHasUnsavedChanges(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
