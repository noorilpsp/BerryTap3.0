"use client"

import { AlertCircle, XCircle, AlertTriangle, RefreshCw, HelpCircle, Lock, Mail } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorStateProps {
  type: 'network' | 'export' | 'validation' | 'permission' | 'rate_limit'
  onRetry?: () => void
  onEdit?: () => void
  onSupport?: () => void
}

export function ErrorState({ type, onRetry, onEdit, onSupport }: ErrorStateProps) {
  if (type === 'network') {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Export Center</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We're having trouble connecting to the server. This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Network connectivity issues</li>
              <li>• Server maintenance</li>
              <li>• Temporary service disruption</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="outline" onClick={onSupport} className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'export') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Export Failed</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>Unable to create export: Database connection timeout</p>
          <div>
            <p className="font-medium mb-1">This usually happens when:</p>
            <ul className="space-y-1 text-sm">
              <li>• The dataset is very large</li>
              <li>• Too many exports are running simultaneously</li>
              <li>• Database is under heavy load</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Try:</p>
            <ul className="space-y-1 text-sm">
              <li>• Reducing the date range</li>
              <li>• Adding more filters to limit data</li>
              <li>• Waiting a few minutes and trying again</li>
            </ul>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              ✏️ Edit Configuration
            </Button>
            <Button variant="ghost" size="sm" onClick={onSupport} className="gap-2">
              <HelpCircle className="h-3.5 w-3.5" />
              Get Help
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (type === 'validation') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cannot Run Export</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>Please fix the following issues:</p>
          <ul className="space-y-1 text-sm">
            <li>• Select at least one column to export</li>
            <li>• Choose an export format (CSV or XLSX)</li>
            <li>• Email delivery requires at least one recipient</li>
          </ul>
          <Button size="sm" className="gap-2">
            <AlertCircle className="h-3.5 w-3.5" />
            Fix Issues
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (type === 'permission') {
    return (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>You don't have permission to export data from the "Customer Insights" dataset.</p>
          <p className="text-sm">This dataset requires the "customer:read" permission.</p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Lock className="h-3.5 w-3.5" />
              Request Access
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="h-3.5 w-3.5" />
              Contact Administrator
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (type === 'rate_limit') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Export Limit Reached</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>You've reached the maximum number of concurrent exports (3).</p>
          <div>
            <p className="font-medium mb-1">Current exports:</p>
            <ul className="space-y-1 text-sm">
              <li>• Daily Sales Summary (Running, 45% complete)</li>
              <li>• Staff Metrics (Queued, position 2)</li>
              <li>• Weekly Revenue (Running, 78% complete)</li>
            </ul>
          </div>
          <p>Wait for one to complete or cancel an existing export.</p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="gap-2">
              👁 View Active Exports
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              ⚡ Upgrade Plan
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

export function EmptyState({ 
  type,
  onAction
}: { 
  type: 'no_exports' | 'no_search' | 'no_templates' | 'no_schedules' | 'no_history' | 'no_filter_results'
  onAction?: () => void
}) {
  const configs = {
    no_exports: {
      icon: '📊',
      title: 'No exports yet',
      description: 'Create your first export to get started',
      longDescription: 'Exports help you analyze your data in spreadsheets, share reports with your team, or integrate with external systems.',
      actions: [
        { label: 'Create First Export', variant: 'default' as const },
        { label: 'Browse Templates', variant: 'outline' as const }
      ]
    },
    no_search: {
      icon: '🔍',
      title: 'No exports match "payroll monthly"',
      description: 'Try different search terms or create a new export',
      actions: [
        { label: 'Clear Search', variant: 'outline' as const }
      ]
    },
    no_templates: {
      icon: '📁',
      title: 'No templates saved yet',
      description: 'Create your first export template to save time on repeated exports',
      actions: [
        { label: 'Create Template', variant: 'default' as const }
      ]
    },
    no_schedules: {
      icon: '📅',
      title: 'No scheduled exports yet',
      description: 'Automate your exports by creating a schedule',
      longDescription: 'Scheduled exports run automatically and can be delivered via email or stored in cloud storage.',
      actions: [
        { label: 'Create Schedule', variant: 'default' as const },
        { label: 'Learn More', variant: 'ghost' as const }
      ]
    },
    no_history: {
      icon: '📋',
      title: 'No export history yet',
      description: 'Completed exports will be saved here for 30 days',
      actions: []
    },
    no_filter_results: {
      icon: '🔍',
      title: 'No exports match your filters',
      description: 'Try adjusting your filter criteria',
      actions: [
        { label: 'Clear All Filters', variant: 'outline' as const }
      ]
    }
  }

  const config = configs[type]

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-4">
        <div className="text-5xl">{config.icon}</div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
          {config.longDescription && (
            <p className="text-sm text-muted-foreground">{config.longDescription}</p>
          )}
        </div>
        {config.actions.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {config.actions.map((action, idx) => (
              <Button 
                key={idx} 
                variant={action.variant} 
                onClick={onAction}
                className="w-full"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
