"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface DisplaySettingsTabProps {
  onSettingsChange: () => void
}

export function DisplaySettingsTab({ onSettingsChange }: DisplaySettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Table Display */}
      <Card>
        <CardHeader>
          <CardTitle>Table Display</CardTitle>
          <CardDescription>Configure how transactions are displayed in the table</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Default View</Label>
            <RadioGroup defaultValue="standard" onValueChange={onSettingsChange}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <div className="grid gap-1">
                  <Label htmlFor="standard" className="font-normal">
                    Standard table (recommended)
                  </Label>
                  <p className="text-sm text-muted-foreground">Shows all key information in a clean table</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <div className="grid gap-1">
                  <Label htmlFor="compact" className="font-normal">
                    Compact view
                  </Label>
                  <p className="text-sm text-muted-foreground">Reduces row height to show more data on screen</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="expanded" id="expanded" />
                <div className="grid gap-1">
                  <Label htmlFor="expanded" className="font-normal">
                    Expanded view
                  </Label>
                  <p className="text-sm text-muted-foreground">Shows additional details inline without clicking</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Pagination</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="rowsPerPage" className="w-32">
                  Rows per page:
                </Label>
                <Select defaultValue="50" onValueChange={onSettingsChange}>
                  <SelectTrigger id="rowsPerPage" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <RadioGroup defaultValue="infinite" onValueChange={onSettingsChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="infinite" id="infinite" />
                  <Label htmlFor="infinite" className="font-normal">
                    Load more (infinite scroll)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pagination" id="pagination" />
                  <Label htmlFor="pagination" className="font-normal">
                    Traditional pagination with page numbers
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="showTotal" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="showTotal" className="font-normal">
                    Show total count at top
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showRange" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="showRange" className="font-normal">
                    Show range indicator (e.g., "1-50 of 1,234")
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Row Behavior</Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rowClick" className="text-sm">
                  On row click:
                </Label>
                <RadioGroup defaultValue="drawer" className="mt-2" onValueChange={onSettingsChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="drawer" id="drawer" />
                    <Label htmlFor="drawer" className="font-normal">
                      Open detail drawer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="newtab" id="newtab" />
                    <Label htmlFor="newtab" className="font-normal">
                      Open in new tab
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expand" id="expand" />
                    <Label htmlFor="expand" className="font-normal">
                      Expand inline
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="highlightHover" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="highlightHover" className="font-normal">
                    Highlight row on hover
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="quickActions" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="quickActions" className="font-normal">
                    Show quick actions on hover
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="rowSelection" defaultChecked onCheckedChange={onSettingsChange} />
                  <Label htmlFor="rowSelection" className="font-normal">
                    Enable row selection checkbox
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Format */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time Format</CardTitle>
          <CardDescription>Customize how dates and times are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select defaultValue="yyyy-mm-dd" onValueChange={onSettingsChange}>
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2024-11-20)</SelectItem>
                  <SelectItem value="dd-mm-yyyy">DD/MM/YYYY (20/11/2024)</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/YYYY (11/20/2024)</SelectItem>
                  <SelectItem value="dd-mmm-yyyy">DD MMM YYYY (20 Nov 2024)</SelectItem>
                  <SelectItem value="mmm-dd-yyyy">MMM DD, YYYY (Nov 20, 2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="europe-malta" onValueChange={onSettingsChange}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe-malta">Europe/Malta (CET)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="america-ny">America/New_York (EST)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Format</Label>
            <RadioGroup defaultValue="24h" onValueChange={onSettingsChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="font-normal">
                  24-hour (19:24)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12h" id="12h" />
                <Label htmlFor="12h" className="font-normal">
                  12-hour (7:24 PM)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="showTimezone" defaultChecked onCheckedChange={onSettingsChange} />
              <Label htmlFor="showTimezone" className="font-normal">
                Always show timezone in tables
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="relativeTime" defaultChecked onCheckedChange={onSettingsChange} />
              <Label htmlFor="relativeTime" className="font-normal">
                Show relative time (e.g., "2 hours ago")
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstDay">First day of week</Label>
            <Select defaultValue="monday" onValueChange={onSettingsChange}>
              <SelectTrigger id="firstDay" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Number & Currency Format */}
      <Card>
        <CardHeader>
          <CardTitle>Number & Currency Format</CardTitle>
          <CardDescription>Configure how monetary values are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Primary currency</Label>
              <Select defaultValue="eur" onValueChange={onSettingsChange}>
                <SelectTrigger id="currency" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Symbol position</Label>
              <RadioGroup defaultValue="before" onValueChange={onSettingsChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="before" id="before" />
                  <Label htmlFor="before" className="font-normal">
                    Before amount (€45.50)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="after" />
                  <Label htmlFor="after" className="font-normal">
                    After amount (45.50€)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="decimalPlaces">Decimal places</Label>
                <Select defaultValue="2" onValueChange={onSettingsChange}>
                  <SelectTrigger id="decimalPlaces" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thousands separator</Label>
                <RadioGroup defaultValue="comma" onValueChange={onSettingsChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comma" id="comma" />
                    <Label htmlFor="comma" className="font-normal">
                      Comma (1,234.56)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="period" id="period" />
                    <Label htmlFor="period" className="font-normal">
                      Period (1.234,56)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium">Examples:</p>
              <ul className="space-y-1 text-sm">
                <li>Small: €45.50</li>
                <li>Medium: €1,234.56</li>
                <li>Large: €123,456.78</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remember Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Remember Preferences</CardTitle>
          <CardDescription>Automatically save your view preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Save between sessions:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberFilters" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="rememberFilters" className="font-normal">
                  Last used filters
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberColumns" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="rememberColumns" className="font-normal">
                  Column visibility and order
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberSort" onCheckedChange={onSettingsChange} />
                <Label htmlFor="rememberSort" className="font-normal">
                  Sort direction
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberPageSize" defaultChecked onCheckedChange={onSettingsChange} />
                <Label htmlFor="rememberPageSize" className="font-normal">
                  Page size (rows per page)
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Reset all display settings to defaults</p>
            <Button variant="outline" size="sm">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
