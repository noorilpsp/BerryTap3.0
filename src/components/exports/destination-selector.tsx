"use client"

import { Download, Mail, Send, Cloud, Loader } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { destinationOptions } from "@/app/dashboard/(dashboard)/exports/data"

const iconMap = {
  Download,
  Mail,
  Send,
  Cloud,
  Loader
}

export function DestinationSelector() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">7. Delivery Method *</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="download" aria-label="Select delivery method">
          <div className="space-y-4">
            {destinationOptions.map((destination) => {
              const Icon = iconMap[destination.icon as keyof typeof iconMap]
              const isDisabled = !destination.available
              
              return (
                <div key={destination.id} className="space-y-3">
                  <div
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'
                    }`}
                  >
                    <RadioGroupItem
                      value={destination.id}
                      id={destination.id}
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Label
                          htmlFor={destination.id}
                          className={`text-sm font-medium cursor-pointer ${
                            isDisabled ? 'cursor-not-allowed' : ''
                          }`}
                        >
                          {destination.label}
                        </Label>
                        {destination.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                        {isDisabled && (
                          <Badge variant="outline" className="text-xs">Phase 2</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{destination.description}</p>
                      {destination.bestFor && (
                        <p className="text-xs text-muted-foreground">
                          💡 {destination.bestFor}
                        </p>
                      )}
                      {destination.features && (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {destination.features.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      )}
                      {destination.setupRequired && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          ℹ️ Contact support to enable {destination.label.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {destination.requiresInput && destination.id === "email" && destination.available && (
                    <div className="ml-10 space-y-2">
                      <Label htmlFor="email-recipients" className="text-sm">Recipients:</Label>
                      <Input
                        id="email-recipients"
                        placeholder={destination.inputPlaceholder}
                        aria-label="Email recipients for export delivery"
                      />
                      <p className="text-xs text-muted-foreground">
                        ℹ️ Separate multiple emails with semicolons
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
