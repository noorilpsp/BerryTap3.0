"use client"

import { Database, Clock, HardDrive, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ExportSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Export Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estimated Rows</p>
            <p className="text-lg font-semibold">~1,847</p>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
              <CheckCircle className="h-3 w-3" />
              <span>Within limits</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">File Size</p>
            <p className="text-lg font-semibold">~924 KB</p>
            <Badge variant="secondary" className="text-xs">📦 CSV format</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Processing Time</p>
            <p className="text-lg font-semibold">&lt; 1 minute</p>
            <Badge variant="secondary" className="text-xs">⚡ Fast export</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Valid Until</p>
            <p className="text-lg font-semibold">Nov 22</p>
            <p className="text-xs text-muted-foreground">7 days</p>
          </div>
        </div>

        <Separator />

        {/* Configuration Summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Configuration:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Dataset: Orders (2.8M total records)</li>
            <li>• Date Range: Nov 1 - Nov 30, 2024 (30 days)</li>
            <li>• Columns: 8 selected</li>
            <li>• Filters: 3 active (reduces from 2,847 to ~1,847 rows)</li>
            <li>• Format: CSV</li>
            <li>• Delivery: Download Now</li>
          </ul>
        </div>

        <Separator />

        {/* Important Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <p className="text-sm font-medium">Important Notes:</p>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Export file will expire and be deleted after 7 days</li>
            <li>• This estimate may vary by ±10% based on actual data</li>
            <li>• 3 columns contain PII - ensure you have permission</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
