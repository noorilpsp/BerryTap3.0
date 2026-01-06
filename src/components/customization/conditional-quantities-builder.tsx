"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Info, AlertTriangle } from "lucide-react"
import type { ConditionalQuantities, CustomizationGroup } from "@/types/customization"

interface ConditionalQuantitiesBuilderProps {
  currentGroup: CustomizationGroup
  availableGroups: CustomizationGroup[]
  value: ConditionalQuantities
  onChange: (value: ConditionalQuantities) => void
}

export function ConditionalQuantitiesBuilder({
  currentGroup,
  availableGroups,
  value,
  onChange,
}: ConditionalQuantitiesBuilderProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const baseGroup = availableGroups.find((g) => g.id === value.basedOnGroupId)

  const handleToggle = (enabled: boolean) => {
    onChange({ ...value, enabled })
  }

  const handleBaseGroupChange = (groupId: string) => {
    const group = availableGroups.find((g) => g.id === groupId)
    if (!group) return

    // Initialize rules matrix with current group's rules
    const rulesMatrix: ConditionalQuantities["rulesMatrix"] = {}
    group.options.forEach((baseOption) => {
      rulesMatrix[baseOption.id] = {
        min: currentGroup.rules.min,
        max: currentGroup.rules.max,
        required: currentGroup.rules.required,
        maxPerOption: 1,
      }
    })

    onChange({ ...value, basedOnGroupId: groupId, rulesMatrix })
  }

  const handleRuleChange = (
    baseOptionId: string,
    field: "min" | "max" | "required" | "maxPerOption",
    newValue: number | boolean,
  ) => {
    const newMatrix = { ...value.rulesMatrix }
    if (!newMatrix[baseOptionId]) {
      newMatrix[baseOptionId] = {
        min: currentGroup.rules.min,
        max: currentGroup.rules.max,
        required: currentGroup.rules.required,
        maxPerOption: 1,
      }
    }
    newMatrix[baseOptionId] = {
      ...newMatrix[baseOptionId],
      [field]: newValue,
    }
    onChange({ ...value, rulesMatrix: newMatrix })
  }

  const getValidationWarnings = (baseOptionId: string) => {
    const rules = value.rulesMatrix[baseOptionId]
    if (!rules) return []

    const warnings: string[] = []
    if (rules.min > rules.max) {
      warnings.push("Minimum cannot exceed maximum")
    }
    if (rules.max > currentGroup.options.length) {
      warnings.push("Maximum exceeds available options")
    }
    if (rules.required && rules.min === 0) {
      warnings.push("Required should have min > 0")
    }
    return warnings
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Conditional Quantities</CardTitle>
            <CardDescription>Set different selection limits based on another customization</CardDescription>
          </div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer View Preview</DialogTitle>
                <DialogDescription>How selection limits change based on customer choices</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {value.enabled && baseGroup && (
                  <div className="space-y-3">
                    {baseGroup.options.map((baseOption) => {
                      const rules = value.rulesMatrix[baseOption.id]
                      if (!rules) return null
                      return (
                        <div key={baseOption.id} className="rounded-lg border p-4">
                          <h4 className="mb-3 font-semibold">If customer selects: {baseOption.name}</h4>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">Selection range:</span> {rules.min} to {rules.max}{" "}
                              {currentGroup.name.toLowerCase()}
                            </p>
                            <p>
                              <span className="font-medium">Max per option:</span> {rules.maxPerOption}
                            </p>
                            {rules.required && (
                              <p className="text-orange-600">
                                <span className="font-medium">Required:</span> Customer must make a selection
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-conditional-quantities">Use conditional quantities</Label>
            <p className="text-sm text-muted-foreground">Enable to set different limits based on selections</p>
          </div>
          <Switch id="enable-conditional-quantities" checked={value.enabled} onCheckedChange={handleToggle} />
        </div>

        {value.enabled && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="base-group-quantities">Base rules on which customization?</Label>
              <Select value={value.basedOnGroupId} onValueChange={handleBaseGroupChange}>
                <SelectTrigger id="base-group-quantities">
                  <SelectValue placeholder="Select a customization group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups
                    .filter((g) => g.id !== currentGroup.id)
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {baseGroup && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Configure selection rules for each option in {baseGroup.name}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {baseGroup.options.map((baseOption) => {
                    const rules = value.rulesMatrix[baseOption.id] || {
                      min: currentGroup.rules.min,
                      max: currentGroup.rules.max,
                      required: currentGroup.rules.required,
                      maxPerOption: 1,
                    }
                    const warnings = getValidationWarnings(baseOption.id)

                    return (
                      <Card key={baseOption.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{baseOption.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`min-${baseOption.id}`}>Minimum selections</Label>
                              <Select
                                value={rules.min.toString()}
                                onValueChange={(v) => handleRuleChange(baseOption.id, "min", Number.parseInt(v))}
                              >
                                <SelectTrigger id={`min-${baseOption.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 11 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      {i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`max-${baseOption.id}`}>Maximum selections</Label>
                              <Select
                                value={rules.max.toString()}
                                onValueChange={(v) => handleRuleChange(baseOption.id, "max", Number.parseInt(v))}
                              >
                                <SelectTrigger id={`max-${baseOption.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 21 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      {i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${baseOption.id}`}
                              checked={rules.required}
                              onCheckedChange={(checked) =>
                                handleRuleChange(baseOption.id, "required", checked === true)
                              }
                            />
                            <Label htmlFor={`required-${baseOption.id}`} className="text-sm font-normal">
                              Customer must select
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`max-per-${baseOption.id}`}>Max per option</Label>
                            <Select
                              value={rules.maxPerOption.toString()}
                              onValueChange={(v) => handleRuleChange(baseOption.id, "maxPerOption", Number.parseInt(v))}
                            >
                              <SelectTrigger id={`max-per-${baseOption.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">How many times each option can be selected</p>
                          </div>

                          {warnings.length > 0 && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <ul className="list-disc pl-4 text-xs">
                                  {warnings.map((warning, i) => (
                                    <li key={i}>{warning}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Example: If customer selects {baseGroup.options[baseGroup.options.length - 1]?.name}, they can
                    choose up to {value.rulesMatrix[baseGroup.options[baseGroup.options.length - 1]?.id]?.max ?? 0}{" "}
                    {currentGroup.name.toLowerCase()}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
