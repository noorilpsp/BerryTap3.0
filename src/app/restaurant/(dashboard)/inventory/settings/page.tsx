"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Building2,
  MapPin,
  Package,
  DollarSign,
  Calculator,
  CheckSquare,
  Bell,
  Store,
  LinkIcon,
  Upload,
  AlertTriangle,
  Star,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  Eye,
  Mail,
  Smartphone,
  MessageSquare,
  ChevronLeft,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InventorySettingsPage() {
  const [activeSection, setActiveSection] = useState("general")
  const [isDirty, setIsDirty] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your inventory settings have been updated successfully.",
    })
    setIsDirty(false)
  }

  const settingsMenu = [
    { id: "general", label: "General", icon: Building2 },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "stock", label: "Stock Levels", icon: Package },
    { id: "valuation", label: "Valuation", icon: DollarSign },
    { id: "counting", label: "Counting Rules", icon: Calculator },
    { id: "approvals", label: "Approvals", icon: CheckSquare },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "suppliers", label: "Suppliers", icon: Store },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "import_export", label: "Import/Export", icon: Upload },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center gap-4 px-6 py-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Inventory
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure inventory management preferences</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card p-4 space-y-1">
          {settingsMenu.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* General Settings */}
            {activeSection === "general" && <GeneralSettings onChange={() => setIsDirty(true)} />}

            {/* Locations Settings */}
            {activeSection === "locations" && <LocationsSettings onChange={() => setIsDirty(true)} />}

            {/* Stock Level Settings */}
            {activeSection === "stock" && <StockLevelSettings onChange={() => setIsDirty(true)} />}

            {/* Valuation Settings */}
            {activeSection === "valuation" && <ValuationSettings onChange={() => setIsDirty(true)} />}

            {/* Counting Rules */}
            {activeSection === "counting" && <CountingRulesSettings onChange={() => setIsDirty(true)} />}

            {/* Approvals */}
            {activeSection === "approvals" && <ApprovalsSettings onChange={() => setIsDirty(true)} />}

            {/* Alerts */}
            {activeSection === "alerts" && <AlertsSettings onChange={() => setIsDirty(true)} />}

            {/* Suppliers */}
            {activeSection === "suppliers" && <SuppliersSettings onChange={() => setIsDirty(true)} />}

            {/* Integrations */}
            {activeSection === "integrations" && <IntegrationsSettings onChange={() => setIsDirty(true)} />}

            {/* Import/Export */}
            {activeSection === "import_export" && <ImportExportSettings onChange={() => setIsDirty(true)} />}

            {/* Danger Zone */}
            {activeSection === "danger" && <DangerZoneSettings />}

            {/* Save Actions */}
            {activeSection !== "danger" && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDirty(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// General Settings Component
function GeneralSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          General Settings
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input defaultValue="The Blue Kitchen" onChange={onChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select defaultValue="EUR" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <Select defaultValue="January" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select defaultValue="Europe/Amsterdam" onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Amsterdam">Europe/Amsterdam (CET)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight Unit</Label>
              <Select defaultValue="kg" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="lb">Pounds (lb)</SelectItem>
                  <SelectItem value="oz">Ounces (oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Volume Unit</Label>
              <Select defaultValue="L" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Liters (L)</SelectItem>
                  <SelectItem value="mL">Milliliters (mL)</SelectItem>
                  <SelectItem value="gal">Gallons (gal)</SelectItem>
                  <SelectItem value="oz">Fluid Ounces (oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temperature Unit</Label>
              <Select defaultValue="C" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">Celsius (°C)</SelectItem>
                  <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="DD/MM/YYYY" onValueChange={onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show SKU codes in lists</Label>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show item emojis/images</Label>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Display cost values (requires permission)</Label>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable compact mode for tables</Label>
            </div>
            <Switch onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show sparkline charts in metrics</Label>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Default list page size:</Label>
            <RadioGroup defaultValue="25" onValueChange={onChange}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10" id="size-10" />
                  <Label htmlFor="size-10">10</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="25" id="size-25" />
                  <Label htmlFor="size-25">25</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50" id="size-50" />
                  <Label htmlFor="size-50">50</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100" id="size-100" />
                  <Label htmlFor="size-100">100</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Locations Settings Component
function LocationsSettings({ onChange }: { onChange: () => void }) {
  const locations = [
    {
      id: "loc_main",
      name: "Main Kitchen",
      emoji: "🍳",
      address: "123 Restaurant Street, Amsterdam",
      skuCount: 847,
      inventoryValue: 47832,
      zones: ["Walk-in Cooler", "Dry Storage", "Prep Area"],
      countSchedule: "Weekly (Monday)",
      isPrimary: true,
    },
    {
      id: "loc_bar",
      name: "Bar",
      emoji: "🍷",
      address: "Same building, Floor 1",
      skuCount: 156,
      inventoryValue: 8945,
      zones: ["Bar Fridge", "Spirits Cabinet", "Wine Cellar"],
      countSchedule: "Weekly (Tuesday)",
      isPrimary: false,
    },
    {
      id: "loc_prep",
      name: "Prep Station",
      emoji: "🔪",
      address: "Same building, Kitchen annex",
      skuCount: 89,
      inventoryValue: 2340,
      zones: ["Prep Fridge", "Prep Counter"],
      countSchedule: "Daily",
      isPrimary: false,
    },
    {
      id: "loc_dry",
      name: "Dry Storage",
      emoji: "📦",
      address: "Basement level",
      skuCount: 234,
      inventoryValue: 12450,
      zones: ["Shelf A-F", "Pallet Area"],
      countSchedule: "Monthly",
      isPrimary: false,
    },
    {
      id: "loc_freezer",
      name: "Freezer",
      emoji: "🧊",
      address: "Kitchen cold room",
      skuCount: 67,
      inventoryValue: 5670,
      zones: ["Freezer A", "Freezer B"],
      countSchedule: "Weekly (Wednesday)",
      isPrimary: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations
          </h2>
          <p className="text-sm text-muted-foreground">Manage inventory storage locations and their settings</p>
        </div>
        <Button onClick={onChange}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="space-y-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{location.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{location.name}</h3>
                      {location.isPrimary && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{location.skuCount} SKUs</span>
                  <span className="mx-2">•</span>
                  <span className="text-muted-foreground">
                    €{location.inventoryValue.toLocaleString()} inventory value
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Storage zones:</span> {location.zones.join(", ")}
                </div>
                <div>
                  <span className="text-muted-foreground">Counting schedule:</span> {location.countSchedule}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onChange}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onChange}>
                  Manage Zones
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  View Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require approval for transfers over €500</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-generate picking lists for transfers</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notify destination location on transfer creation</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require signature on transfer receipt</Label>
            <Switch onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow partial transfers</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stock Level Settings Component
function StockLevelSettings({ onChange }: { onChange: () => void }) {
  const [lowThreshold, setLowThreshold] = useState([50])
  const [criticalThreshold, setCriticalThreshold] = useState([25])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Level Settings
        </h2>
        <p className="text-sm text-muted-foreground">Configure how stock levels are calculated and displayed</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Par Level Calculation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default par level method:</Label>
            <RadioGroup defaultValue="manual" onValueChange={onChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual (set per SKU)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto-calculated (based on usage + lead time)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid">Hybrid (auto-suggest, manual override)</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <Label className="mb-4 block">When using auto-calculation:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Usage lookback period:</Label>
                <Select defaultValue="30" onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Safety stock buffer:</Label>
                <Select defaultValue="20" onValueChange={onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Status Thresholds</CardTitle>
          <CardDescription>Define when items change status based on par level percentage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Healthy</span>
                <span className="text-muted-foreground ml-auto">&gt; 50% of par</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Low</span>
                <span className="text-muted-foreground ml-auto">25-50% of par</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Critical</span>
                <span className="text-muted-foreground ml-auto">1-25% of par</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Out</span>
                <span className="text-muted-foreground ml-auto">0% (empty)</span>
              </div>
            </div>
          </div>

          <div className="relative h-3 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500 rounded-full" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Low threshold:</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="50" onChange={onChange} />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Critical threshold:</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="25" onChange={onChange} />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overstock Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Track overstock items</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>Overstock threshold (above par):</Label>
            <Select defaultValue="150" onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="120">120%</SelectItem>
                <SelectItem value="150">150%</SelectItem>
                <SelectItem value="200">200%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include overstock in low stock alerts</Label>
            <Switch onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expiry Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable expiry date tracking</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require expiry dates for perishable items</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Use FEFO (First Expired, First Out) for consumption</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Expiry warning thresholds:</Label>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Expired/Today:</span>
                <span className="text-sm text-muted-foreground ml-auto">0 days</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-sm">Expiring soon:</span>
                <div className="ml-auto flex items-center gap-2">
                  <Input type="number" defaultValue="3" className="w-20" onChange={onChange} />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Approaching:</span>
                <div className="ml-auto flex items-center gap-2">
                  <Input type="number" defaultValue="7" className="w-20" onChange={onChange} />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Valuation Settings Component
function ValuationSettings({ onChange }: { onChange: () => void }) {
  const valuationMethods = [
    {
      id: "weighted_average",
      label: "Weighted Average Cost",
      recommended: true,
      description: "Calculates cost as a weighted average of all units in stock.",
      bestFor: "Restaurants with frequent, small purchases.",
      note: "Current avg cost updates with each purchase.",
    },
    {
      id: "fifo",
      label: "FIFO (First In, First Out)",
      description: "Assumes oldest inventory is sold first.",
      bestFor: "Perishable goods, GAAP compliance.",
      note: "Ending inventory reflects most recent costs.",
    },
    {
      id: "lifo",
      label: "LIFO (Last In, First Out)",
      description: "Assumes newest inventory is sold first.",
      bestFor: "Tax optimization in inflationary periods.",
      note: "⚠️ Not permitted under IFRS.",
      warning: true,
    },
    {
      id: "specific_id",
      label: "Specific Identification",
      description: "Tracks actual cost of each specific item.",
      bestFor: "High-value items like wines, specialty ingredients.",
      note: "⚠️ Requires batch/lot tracking for all items.",
      warning: true,
    },
  ]

  const costTargets = [
    { category: "Proteins", emoji: "🥩", target: 30, warning: 32, critical: 35 },
    { category: "Dairy", emoji: "🧀", target: 28, warning: 30, critical: 33 },
    { category: "Produce", emoji: "🥬", target: 30, warning: 33, critical: 36 },
    { category: "Beverages", emoji: "🍷", target: 25, warning: 28, critical: 32 },
    { category: "Dry Goods", emoji: "🌾", target: 32, warning: 35, critical: 38 },
    { category: "Other", emoji: "📦", target: 35, warning: 38, critical: 42 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Valuation Settings
        </h2>
        <p className="text-sm text-muted-foreground">Configure how inventory is valued for accounting and reporting</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valuation Method</CardTitle>
          <CardDescription>Select how inventory costs are calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="weighted_average" onValueChange={onChange}>
            {valuationMethods.map((method) => (
              <Card key={method.id} className={method.warning ? "border-orange-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={method.id} className="font-semibold">
                          {method.label}
                        </Label>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Best for:</span> {method.bestFor}
                      </p>
                      <p className="text-sm text-muted-foreground italic">{method.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
            <p className="text-orange-800">
              ⚠️ Changing valuation method will recalculate all historical data. This should only be done at the start of
              a fiscal period.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Targets</CardTitle>
          <CardDescription>Set target food cost percentages for reporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium pb-2 border-b">
              <div>Category</div>
              <div>Target Cost %</div>
              <div>Warning</div>
              <div>Critical</div>
            </div>

            {costTargets.map((item) => (
              <div key={item.category} className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span>{item.emoji}</span>
                  <span className="text-sm">{item.category}</span>
                </div>
                <Input type="number" defaultValue={item.target} className="h-9" onChange={onChange} />
                <Input type="number" defaultValue={item.warning} className="h-9" onChange={onChange} />
                <Input type="number" defaultValue={item.critical} className="h-9" onChange={onChange} />
              </div>
            ))}

            <Separator />

            <div className="grid grid-cols-4 gap-4 items-center font-medium">
              <div>Overall</div>
              <Input type="number" defaultValue={28} className="h-9" onChange={onChange} />
              <Input type="number" defaultValue={30} className="h-9" onChange={onChange} />
              <Input type="number" defaultValue={33} className="h-9" onChange={onChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Counting Rules Settings Component
function CountingRulesSettings({ onChange }: { onChange: () => void }) {
  const countingRules = [
    {
      id: "rule_001",
      name: "Full Inventory Count",
      emoji: "📦",
      frequency: "Monthly (Last Sunday)",
      locations: ["All locations"],
      items: "All SKUs",
      itemCount: 847,
      dueBy: "6:00 PM",
      assignedTo: "Inventory Team",
      nextScheduled: "Nov 24, 2024",
      active: true,
    },
    {
      id: "rule_002",
      name: "Proteins Weekly Count",
      emoji: "🥩",
      frequency: "Weekly (Monday)",
      locations: ["Main Kitchen", "Freezer"],
      items: "Proteins category",
      itemCount: 127,
      dueBy: "10:00 AM",
      assignedTo: "Head Chef",
      nextScheduled: "Nov 18, 2024",
      active: true,
    },
    {
      id: "rule_003",
      name: "Bar Daily Count",
      emoji: "🍷",
      frequency: "Daily (except Sunday)",
      locations: ["Bar"],
      items: "High-value spirits",
      itemCount: 23,
      dueBy: "11:00 PM",
      assignedTo: "Bar Manager",
      nextScheduled: "Today",
      active: true,
    },
    {
      id: "rule_004",
      name: "Produce Spot Check",
      emoji: "🥬",
      frequency: "Every 3 days",
      locations: ["Main Kitchen"],
      items: "Random 20% of Produce",
      active: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Counting Rules
          </h2>
          <p className="text-sm text-muted-foreground">Configure scheduled counts and counting policies</p>
        </div>
        <Button onClick={onChange}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Count Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {countingRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{rule.emoji}</span>
                    <h3 className="font-semibold">{rule.name}</h3>
                  </div>
                  <Badge variant={rule.active ? "default" : "secondary"}>{rule.active ? "Active" : "Disabled"}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span> {rule.frequency}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span> {rule.locations.join(", ")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span> {rule.items}{" "}
                    {rule.itemCount && `(${rule.itemCount})`}
                  </div>
                  {rule.dueBy && (
                    <div>
                      <span className="text-muted-foreground">Due by:</span> {rule.dueBy}
                    </div>
                  )}
                  {rule.assignedTo && (
                    <div>
                      <span className="text-muted-foreground">Assigned to:</span> {rule.assignedTo}
                    </div>
                  )}
                  {rule.nextScheduled && (
                    <div>
                      <span className="text-muted-foreground">Next scheduled:</span> {rule.nextScheduled}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onChange}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={onChange}>
                    {rule.active ? "Disable" : "Enable"}
                  </Button>
                  {rule.active && (
                    <Button variant="outline" size="sm" onClick={onChange}>
                      Run Now
                    </Button>
                  )}
                  {!rule.active && (
                    <Button variant="outline" size="sm" onClick={onChange}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Counting Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Variance threshold for manager review:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="25" onChange={onChange} />
                <span className="text-sm text-muted-foreground">€ or</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="10" onChange={onChange} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Require reason for all adjustments</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require manager approval for variances over €100</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto-approve small variances (under threshold)</Label>
            <Switch onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show system quantities during count (uncheck for blind count)</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable photo verification for counts</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable barcode scanning</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require dual verification for high-value items</Label>
            <Switch onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Counting (ABC Analysis)</CardTitle>
          <CardDescription>Automatically classify items by value for counting frequency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label>Enable cycle counting</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium pb-2 border-b">
              <div>Class</div>
              <div>Criteria</div>
              <div>Frequency</div>
              <div>SKUs</div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center text-sm">
              <Badge className="w-fit">A</Badge>
              <span className="text-muted-foreground">Top 80% of value (20% of SKUs)</span>
              <Select defaultValue="weekly" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">170</span>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center text-sm">
              <Badge variant="secondary" className="w-fit">
                B
              </Badge>
              <span className="text-muted-foreground">Next 15% of value (30% of SKUs)</span>
              <Select defaultValue="monthly" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">254</span>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center text-sm">
              <Badge variant="outline" className="w-fit">
                C
              </Badge>
              <span className="text-muted-foreground">Remaining 5% (50% of SKUs)</span>
              <Select defaultValue="quarterly" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">423</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground pt-2">Last calculated: Nov 1, 2024</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Approvals Settings Component
function ApprovalsSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Approval Workflows
        </h2>
        <p className="text-sm text-muted-foreground">Configure approval requirements for various operations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium pb-2 border-b">
              <div>PO Value Range</div>
              <div>Requires Approval From</div>
              <div>Bypass Allowed</div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <span className="text-muted-foreground">€0 - €100</span>
              <span className="text-muted-foreground italic">No approval needed</span>
              <span className="text-muted-foreground">-</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <span className="text-muted-foreground">€100 - €500</span>
              <Select defaultValue="shift_manager" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shift_manager">Shift Manager</SelectItem>
                  <SelectItem value="general_manager">General Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Switch onCheckedChange={onChange} />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <span className="text-muted-foreground">€500 - €2,000</span>
              <Select defaultValue="general_manager" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_manager">General Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Switch onCheckedChange={onChange} />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <span className="text-muted-foreground">Over €2,000</span>
              <Select defaultValue="owner" onValueChange={onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner / Director</SelectItem>
                </SelectContent>
              </Select>
              <Switch onCheckedChange={onChange} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Require approval for new suppliers (regardless of amount)</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require approval for rush orders</Label>
            <Switch onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Auto-approve repeat orders under:</Label>
              <Switch defaultChecked onCheckedChange={onChange} />
            </div>
            <Input type="number" defaultValue="200" className="w-32" onChange={onChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require approval for manual adjustments</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>Approval threshold:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="50" onChange={onChange} />
                <span className="text-sm text-muted-foreground">€ or</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="5" onChange={onChange} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Approvers:</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Sarah M. - Manager</Badge>
              <Badge variant="secondary">John D. - Head Chef</Badge>
              <Button variant="outline" size="sm" onClick={onChange}>
                <Plus className="h-3 w-3 mr-1" />
                Add Approver
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Count Variance Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require approval for large variances</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>Variance threshold:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="100" onChange={onChange} />
                <span className="text-sm text-muted-foreground">€ or</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="10" onChange={onChange} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Notify management of all variances</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require recount for variances over threshold</Label>
            <Switch onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waste Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require approval for waste entries</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>Approval threshold:</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="25" className="w-32" onChange={onChange} />
              <span className="text-sm text-muted-foreground">€</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Require photo for waste over €50</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Send daily waste summary to management</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Alerts Settings Component
function AlertsSettings({ onChange }: { onChange: () => void }) {
  const alertTypes = [
    {
      id: "critical_stock",
      label: "Critical stock",
      trigger: "Item at 0 qty",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "low_stock",
      label: "Low stock",
      trigger: "Item below par",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
    {
      id: "expiring_today",
      label: "Expiring today",
      trigger: "Item expires today",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "expiring_soon",
      label: "Expiring soon",
      trigger: "Item expires in 3 days",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
    {
      id: "po_received",
      label: "PO received",
      trigger: "Delivery confirmed",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
    {
      id: "po_overdue",
      label: "PO overdue",
      trigger: "Expected date passed",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "transfer_ready",
      label: "Transfer ready",
      trigger: "Transfer awaiting pickup",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
    {
      id: "count_due",
      label: "Count due",
      trigger: "Scheduled count reminder",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "count_variance",
      label: "Count variance",
      trigger: "Large variance detected",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "approval_needed",
      label: "Approval needed",
      trigger: "Item awaiting approval",
      email: true,
      push: true,
      slack: false,
      active: true,
    },
    {
      id: "daily_summary",
      label: "Daily summary",
      trigger: "Daily at 8:00 AM",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
    {
      id: "weekly_report",
      label: "Weekly report",
      trigger: "Monday at 9:00 AM",
      email: true,
      push: false,
      slack: false,
      active: true,
    },
  ]

  const customRules = [
    {
      id: "custom_001",
      name: "Wine inventory alert",
      emoji: "🍷",
      condition: "Any wine item drops below 6 bottles",
      action: "Email sommelier@berrytap.com immediately",
      active: true,
    },
    {
      id: "custom_002",
      name: "High-value protein alert",
      emoji: "🥩",
      condition: "Any protein item > €50 reaches critical level",
      action: "Push notification to Head Chef + auto-create suggested PO",
      active: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts & Notifications
        </h2>
        <p className="text-sm text-muted-foreground">Configure how you receive inventory alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <h3 className="font-semibold">Email</h3>
                </div>
                <Switch defaultChecked onCheckedChange={onChange} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients:</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">manager@berrytap.com</Badge>
                    <Badge variant="secondary">chef@berrytap.com</Badge>
                    <Button variant="outline" size="sm" onClick={onChange}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email digest:</Label>
                  <RadioGroup defaultValue="daily" onValueChange={onChange}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instant" id="instant" />
                        <Label htmlFor="instant">Instant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Daily (8:00 AM)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Weekly</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <h3 className="font-semibold">Push Notifications</h3>
                </div>
                <Switch defaultChecked onCheckedChange={onChange} />
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Send to:</span> All managers on mobile app
                </p>
                <p>
                  <span className="text-muted-foreground">Quiet hours:</span> 10:00 PM - 7:00 AM (except critical)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="font-semibold">Slack</h3>
                </div>
                <Switch onCheckedChange={onChange} />
              </div>

              <Button variant="outline" onClick={onChange}>
                Connect Slack Workspace
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium pb-2 border-b">
              <div className="col-span-4">Alert Type</div>
              <div className="col-span-4">Trigger</div>
              <div className="col-span-1 text-center">📧</div>
              <div className="col-span-1 text-center">📱</div>
              <div className="col-span-1 text-center">💬</div>
              <div className="col-span-1 text-center">Status</div>
            </div>

            {alertTypes.map((alert) => (
              <div key={alert.id} className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-4 flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      alert.id.includes("critical") || alert.id.includes("expiring_today")
                        ? "bg-red-500"
                        : alert.id.includes("expiring") || alert.id.includes("overdue")
                          ? "bg-orange-500"
                          : "bg-muted"
                    }`}
                  />
                  {alert.label}
                </div>
                <div className="col-span-4 text-muted-foreground">{alert.trigger}</div>
                <div className="col-span-1 flex justify-center">
                  <Switch defaultChecked={alert.email} size="sm" onCheckedChange={onChange} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Switch defaultChecked={alert.push} size="sm" onCheckedChange={onChange} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Switch defaultChecked={alert.slack} size="sm" onCheckedChange={onChange} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className={`h-2 w-2 rounded-full ${alert.active ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Custom Alert Rules</CardTitle>
            <Button onClick={onChange}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {customRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{rule.emoji}</span>
                    <h3 className="font-semibold">{rule.name}</h3>
                  </div>
                  <Badge variant={rule.active ? "default" : "secondary"}>{rule.active ? "Active" : "Disabled"}</Badge>
                </div>

                <div className="space-y-1 text-sm mb-4">
                  <p>
                    <span className="text-muted-foreground">When:</span> {rule.condition}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Action:</span> {rule.action}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onChange}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={onChange}>
                    Disable
                  </Button>
                  <Button variant="outline" size="sm" onClick={onChange}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Suppliers Settings Component
function SuppliersSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Store className="h-5 w-5" />
          Supplier Defaults
        </h2>
        <p className="text-sm text-muted-foreground">Configure default settings for suppliers and purchasing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default delivery location:</Label>
            <Select defaultValue="loc_main" onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loc_main">🍳 Main Kitchen</SelectItem>
                <SelectItem value="loc_bar">🍷 Bar</SelectItem>
                <SelectItem value="loc_dry">📦 Dry Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default payment terms:</Label>
            <Select defaultValue="net30" onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net7">Net 7</SelectItem>
                <SelectItem value="net15">Net 15</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Include tax in PO totals</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto-calculate expected delivery based on lead time</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Send order confirmation email by default</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require PO number on all orders</Label>
            <Switch onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>PO number format:</Label>
            <Input defaultValue="PO-{YYYY}-{####}" onChange={onChange} />
            <p className="text-sm text-muted-foreground">Example: PO-2024-0001</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receiving Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require invoice/delivery note number</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable batch/lot tracking for perishables</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require expiry date for perishable items</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Require photo of delivery</Label>
            <Switch onCheckedChange={onChange} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Price variance tolerance:</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Flag price changes over:</span>
                <Input type="number" defaultValue="5" className="w-20" onChange={onChange} />
                <span className="text-sm text-muted-foreground">% or</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="1.00" className="w-20" onChange={onChange} />
                <span className="text-sm text-muted-foreground">€ per unit</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantity variance tolerance:</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Flag quantity differences over:</span>
                <Input type="number" defaultValue="10" className="w-20" onChange={onChange} />
                <span className="text-sm text-muted-foreground">% or</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="2" className="w-20" onChange={onChange} />
                <span className="text-sm text-muted-foreground">units</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reorder Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable auto-reorder suggestions</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="space-y-2">
            <Label>Generate suggestions when:</Label>
            <RadioGroup defaultValue="reorder_point" onValueChange={onChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reorder_point" id="reorder_point" />
                <Label htmlFor="reorder_point">Item reaches reorder point (par - lead time usage)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical">Item reaches critical level</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Item reaches low level</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Auto-create draft POs for suggestions</Label>
            <Switch onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Group suggestions by supplier</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Consider minimum order quantities</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Consider free delivery thresholds</Label>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Integrations Settings Component
function IntegrationsSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Integrations
        </h2>
        <p className="text-sm text-muted-foreground">Connect with external services and platforms</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">QuickBooks</h3>
                  <p className="text-sm text-muted-foreground">Sync inventory data with QuickBooks for accounting</p>
                </div>
                <Button variant="outline" onClick={onChange}>
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Xero</h3>
                  <p className="text-sm text-muted-foreground">Connect with Xero accounting software</p>
                </div>
                <Button variant="outline" onClick={onChange}>
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Zapier</h3>
                  <p className="text-sm text-muted-foreground">Automate workflows with thousands of apps</p>
                </div>
                <Button variant="outline" onClick={onChange}>
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// Import/Export Settings Component
function ImportExportSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import / Export
        </h2>
        <p className="text-sm text-muted-foreground">Import data or export your inventory information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-2">Drag & drop files here, or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supported formats: CSV, XLS, XLSX • Max file size: 10 MB
            </p>
            <Button variant="outline">Browse Files</Button>
          </div>

          <div className="space-y-2">
            <Label>Import type:</Label>
            <RadioGroup defaultValue="sku_list" onValueChange={onChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sku_list" id="sku_list" />
                <Label htmlFor="sku_list">SKU/Ingredient List (create new items)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stock_levels" id="stock_levels" />
                <Label htmlFor="stock_levels">Stock Levels (update quantities)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suppliers" id="suppliers" />
                <Label htmlFor="suppliers">Supplier List</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recipes" id="recipes" />
                <Label htmlFor="recipes">Recipes / BOMs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="historical" id="historical" />
                <Label htmlFor="historical">Historical Data</Label>
              </div>
            </RadioGroup>
          </div>

          <Button variant="outline">📥 Download Template</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start bg-transparent">
              All SKUs (847) • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Suppliers (24) • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Recipes (156) • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Stock Levels • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              PO History (12m) • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Count History (12m) • CSV, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Valuation • PDF, XLSX
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              Full Backup • JSON, ZIP
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduled Exports</CardTitle>
            <Button onClick={onChange}>
              <Plus className="h-4 w-4 mr-2" />
              Add Scheduled Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Weekly Stock Levels</h3>
                  <p className="text-sm text-muted-foreground">Every Monday 6:00 AM • XLSX</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Email to: accounting@berrytap.com</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onChange}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onChange}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

// Danger Zone Settings Component
function DangerZoneSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Reset All Settings</CardTitle>
          <CardDescription>Restore all inventory settings to default values</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will reset all preferences, thresholds, and configurations to factory defaults. Your inventory data
            (SKUs, stock levels, POs) will not be affected.
          </p>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            Reset Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Clear All Inventory History</CardTitle>
          <CardDescription>Delete all historical data and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete all count history, adjustment logs, and transaction records. Current inventory
            levels will be preserved.
          </p>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            Clear History
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Delete All Inventory Data</CardTitle>
          <CardDescription>Permanently delete all inventory information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">This will permanently delete:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mb-4 space-y-1">
            <li>847 SKUs and ingredients</li>
            <li>24 suppliers</li>
            <li>156 recipes and BOMs</li>
            <li>All purchase orders</li>
            <li>All count history and adjustments</li>
            <li>All settings and configurations</li>
          </ul>
          <p className="text-sm font-semibold text-destructive mb-4">
            This action cannot be undone. All data will be permanently lost.
          </p>
          <Button variant="destructive">Delete Everything</Button>
        </CardContent>
      </Card>
    </div>
  )
}
