"use client"

import { FileText, FileSpreadsheet, FileType, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { exportFormats } from "@/app/restaurant/(dashboard)/exports/data"

const iconMap = {
  FileText,
  FileSpreadsheet,
  FileType
}

export function FormatSelector() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">6. Output Format *</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="csv" aria-label="Select export format">
          <div className="space-y-4">
            {exportFormats.map((format) => {
              const Icon = iconMap[format.icon as keyof typeof iconMap]
              const isDisabled = !format.available
              
              return (
                <div
                  key={format.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'
                  }`}
                >
                  <RadioGroupItem
                    value={format.id}
                    id={format.id}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label
                        htmlFor={format.id}
                        className={`text-sm font-medium cursor-pointer ${
                          isDisabled ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        {format.label}
                      </Label>
                      {format.recommended && (
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      )}
                      {isDisabled && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Lock className="h-3 w-3" />
                          Phase 2
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {format.features.map((feature, idx) => (
                        <span key={idx}>
                          • {feature}
                        </span>
                      ))}
                    </div>
                    {format.limitations.length > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠️ {format.limitations[0]}
                      </p>
                    )}
                    {isDisabled && format.contactSupport && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        ℹ️ Coming soon - contact support to enable
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
