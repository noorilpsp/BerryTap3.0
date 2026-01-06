"use client"

import { AlertCircle, TrendingUp, FileText, Download, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Alert as AlertType, Suggestion, ExportTemplate, Export, SavedView } from "../types/reports.types"

interface InsightsSidebarProps {
  alerts?: AlertType[]
  suggestions?: Suggestion[]
  templates?: ExportTemplate[]
  recentExports?: Export[]
  savedViews?: SavedView[]
  onExport: () => void
  onLoadView: (filters: any) => void
}

export function InsightsSidebar({
  alerts,
  suggestions,
  templates,
  recentExports,
  savedViews,
  onExport,
  onLoadView,
}: InsightsSidebarProps) {
  return (
    <Card className="h-auto flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Insights & Tools</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-6">
          {/* Alerts */}
          {alerts && alerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Alerts ({alerts.length})
              </h3>
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === "high" ? "destructive" : "default"}>
                  <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                  {alert.action && (
                    <Button size="sm" variant="link" className="h-auto p-0 mt-2">
                      {alert.action.label}
                    </Button>
                  )}
                </Alert>
              ))}
            </div>
          )}

          <Separator />

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="text-sm p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.effort} effort
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Quick Exports */}
          {templates && templates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quick Exports
              </h3>
              <div className="space-y-2">
                {templates.slice(0, 3).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="w-full justify-start text-sm bg-transparent"
                    size="sm"
                    onClick={onExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Recent Exports */}
          {recentExports && recentExports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Recent Exports</h3>
              <div className="space-y-2">
                {recentExports.map((exp) => (
                  <div key={exp.id} className="text-xs p-2 rounded bg-muted/30 space-y-1">
                    <p className="font-medium truncate">{exp.name}</p>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{exp.size}</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Saved Views */}
          {savedViews && savedViews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4" />
                Saved Views
              </h3>
              <div className="space-y-2">
                {savedViews.map((view) => (
                  <Button
                    key={view.id}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    size="sm"
                    onClick={() => onLoadView(view.filters)}
                  >
                    {view.isPinned && <Star className="h-3 w-3 mr-2 fill-current" />}
                    {view.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
