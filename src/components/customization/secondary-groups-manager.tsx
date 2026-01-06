"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
import { Link2, Eye, Info, Plus, Trash2, AlertTriangle } from "lucide-react"
import type { SecondaryGroups, SecondaryGroupRule, CustomizationGroup } from "@/types/customization"

interface SecondaryGroupsManagerProps {
  currentGroup: CustomizationGroup
  availableGroups: CustomizationGroup[]
  value: SecondaryGroups
  onChange: (value: SecondaryGroups) => void
}

export function SecondaryGroupsManager({
  currentGroup,
  availableGroups,
  value,
  onChange,
}: SecondaryGroupsManagerProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [addingRule, setAddingRule] = useState(false)
  const [newRule, setNewRule] = useState<Partial<SecondaryGroupRule>>({})

  const addRule = () => {
    if (!newRule.triggerOptionId || !newRule.showGroupId) return

    const rule: SecondaryGroupRule = {
      id: `rule-${Date.now()}`,
      triggerOptionId: newRule.triggerOptionId,
      showGroupId: newRule.showGroupId,
      required: newRule.required ?? false,
    }

    onChange({ rules: [...value.rules, rule] })
    setNewRule({})
    setAddingRule(false)
  }

  const removeRule = (ruleId: string) => {
    onChange({ rules: value.rules.filter((r) => r.id !== ruleId) })
  }

  const updateRule = (ruleId: string, updates: Partial<SecondaryGroupRule>) => {
    onChange({
      rules: value.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    })
  }

  const getNestingDepth = (groupId: string, visited = new Set<string>()): number => {
    if (visited.has(groupId)) return Number.POSITIVE_INFINITY // Circular dependency
    visited.add(groupId)

    const rulesForGroup = value.rules.filter((r) => {
      const option = currentGroup.options.find((o) => o.id === r.triggerOptionId)
      return option !== undefined
    })

    if (rulesForGroup.length === 0) return 0

    const depths = rulesForGroup.map((rule) => {
      return 1 + getNestingDepth(rule.showGroupId, new Set(visited))
    })

    return Math.max(...depths)
  }

  const nestingDepth = getNestingDepth(currentGroup.id)
  const hasDeepNesting = nestingDepth > 3

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Secondary Customization Groups</CardTitle>
            <CardDescription>Show additional options based on customer selections</CardDescription>
          </div>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview Flow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Customer Flow Preview</DialogTitle>
                <DialogDescription>Step-by-step visualization of nested selections</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">Selection Tree</h4>
                  <div className="space-y-2 font-mono text-sm">
                    <div>Main Item</div>
                    <div className="pl-4">
                      ├─ {currentGroup.name} {currentGroup.rules.required && "(required)"}
                      {currentGroup.options.map((option, idx) => {
                        const rules = value.rules.filter((r) => r.triggerOptionId === option.id)
                        const isLast = idx === currentGroup.options.length - 1
                        return (
                          <div key={option.id} className="pl-4">
                            <div>
                              {isLast ? "└─" : "├─"} {option.name}
                            </div>
                            {rules.map((rule, rIdx) => {
                              const secondaryGroup = availableGroups.find((g) => g.id === rule.showGroupId)
                              if (!secondaryGroup) return null
                              return (
                                <div key={rule.id} className="pl-4 text-orange-600">
                                  <div>
                                    {rIdx === rules.length - 1 ? "└─" : "├─"} → {secondaryGroup.name}{" "}
                                    {rule.required && "(required)"}
                                  </div>
                                  {secondaryGroup.options.map((secOpt, secIdx) => (
                                    <div key={secOpt.id} className="pl-4">
                                      {secIdx === secondaryGroup.options.length - 1 ? "└─" : "├─"} {secOpt.name}
                                    </div>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can nest up to 5 levels deep. Current nesting: {nestingDepth} level{nestingDepth !== 1 ? "s" : ""}
          </AlertDescription>
        </Alert>

        {hasDeepNesting && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deep nesting (&gt;3 levels) may confuse customers and increase cart abandonment
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {value.rules.map((rule) => {
            const triggerOption = currentGroup.options.find((o) => o.id === rule.triggerOptionId)
            const secondaryGroup = availableGroups.find((g) => g.id === rule.showGroupId)

            return (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>When customer selects:</Label>
                      <div className="rounded-md border bg-muted p-3">
                        <span className="font-medium">{triggerOption?.name}</span>
                        <span className="text-sm text-muted-foreground"> (from {currentGroup.name})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                      <Label>Then show:</Label>
                      <div className="rounded-md border bg-muted p-3">
                        <span className="font-medium">{secondaryGroup?.name}</span>
                        <span className="text-sm text-muted-foreground"> (secondary group)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${rule.id}`}
                          checked={rule.required}
                          onCheckedChange={(checked) => updateRule(rule.id, { required: checked === true })}
                        />
                        <Label htmlFor={`required-${rule.id}`} className="text-sm font-normal">
                          Customer must make selection
                        </Label>
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {addingRule ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Secondary Group Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trigger-option">Trigger Option</Label>
                <Select
                  value={newRule.triggerOptionId}
                  onValueChange={(v) => setNewRule({ ...newRule, triggerOptionId: v })}
                >
                  <SelectTrigger id="trigger-option">
                    <SelectValue placeholder="Select an option from current group" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentGroup.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-group">Show This Group</Label>
                <Select value={newRule.showGroupId} onValueChange={(v) => setNewRule({ ...newRule, showGroupId: v })}>
                  <SelectTrigger id="secondary-group">
                    <SelectValue placeholder="Select a secondary group" />
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-required"
                  checked={newRule.required ?? false}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, required: checked === true })}
                />
                <Label htmlFor="new-required" className="text-sm font-normal">
                  Make this selection required
                </Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={addRule} disabled={!newRule.triggerOptionId || !newRule.showGroupId}>
                  Add Rule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingRule(false)
                    setNewRule({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setAddingRule(true)} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Secondary Group
          </Button>
        )}

        {value.rules.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Best Practice:</strong> Too many required secondary groups may cause cart abandonment. Keep the
              flow simple and intuitive.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
