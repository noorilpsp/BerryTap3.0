"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Check, Plus, Minus, Search, Camera, AlertCircle, CheckCircle, ClipboardList } from "lucide-react"

const locations = [
  { id: "loc_main", name: "Main Kitchen", emoji: "🍳", skuCount: 847, value: 47832 },
  { id: "loc_bar", name: "Bar", emoji: "🍷", skuCount: 156, value: 8945 },
  { id: "loc_prep", name: "Prep Station", emoji: "🔪", skuCount: 89, value: 2340 },
  { id: "loc_dry", name: "Dry Storage", emoji: "📦", skuCount: 234, value: 12450 },
  { id: "loc_freezer", name: "Freezer", emoji: "🧊", skuCount: 67, value: 5670 },
  { id: "loc_catering", name: "Catering Van", emoji: "🚐", skuCount: 0, value: 0 },
]

const quickRoutes = [
  { from: "loc_main", to: "loc_bar", label: "Main Kitchen → Bar", frequency: "Most frequent", lastTransfer: "Today" },
  {
    from: "loc_main",
    to: "loc_prep",
    label: "Main Kitchen → Prep Station",
    frequency: "Daily prep",
    lastTransfer: "Yesterday",
  },
  {
    from: "loc_dry",
    to: "loc_main",
    label: "Dry Storage → Main Kitchen",
    frequency: "Weekly",
    lastTransfer: "3 days ago",
  },
  {
    from: "loc_freezer",
    to: "loc_main",
    label: "Freezer → Main Kitchen",
    frequency: "As needed",
    lastTransfer: "5 days ago",
  },
]

const suggestedItems = [
  {
    id: "sku_wine",
    code: "WIN001",
    name: "House Red Wine",
    emoji: "🍷",
    unit: "btl",
    price: 12.5,
    sourceQty: 24,
    destQty: 2,
    destStatus: "low",
    suggestedQty: 6,
    reason: "Brings Bar to par level",
  },
  {
    id: "sku_prosecco",
    code: "PRO001",
    name: "Prosecco",
    emoji: "🍾",
    unit: "btl",
    price: 15.0,
    sourceQty: 18,
    destQty: 1,
    destStatus: "critical",
    suggestedQty: 4,
    alert: "Critical stock - transfer recommended ASAP",
  },
  {
    id: "sku_bourbon",
    code: "BRB001",
    name: "Bourbon Whiskey",
    emoji: "🥃",
    unit: "btl",
    price: 35.0,
    sourceQty: 6,
    destQty: 0.5,
    destStatus: "critical",
    suggestedQty: 2,
  },
]

interface CreateTransferDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTransferDrawer({ open, onOpenChange }: CreateTransferDrawerProps) {
  const [step, setStep] = useState(1)
  const [transferType, setTransferType] = useState("internal")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [priority, setPriority] = useState("normal")

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setStep(1)
      setFromLocation("")
      setToLocation("")
      setSelectedItems([])
    }, 300)
  }

  const fromLoc = locations.find((l) => l.id === fromLocation)
  const toLoc = locations.find((l) => l.id === toLocation)

  const totalValue = selectedItems.reduce((sum, item) => sum + item.qty * item.price, 0)
  const totalItems = selectedItems.length

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create Transfer</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      s < step
                        ? "bg-primary text-primary-foreground"
                        : s === step
                          ? "border-2 border-primary bg-background"
                          : "border-2 border-muted bg-muted"
                    }`}
                  >
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 4 && <div className={`h-0.5 flex-1 ${s < step ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Locations</span>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Select Items</span>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Review</span>
              <span className={step >= 4 ? "font-medium" : "text-muted-foreground"}>Confirm</span>
            </div>
          </div>

          {/* Step 1: Locations */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Transfer Type</Label>
                <RadioGroup value={transferType} onValueChange={setTransferType}>
                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="internal" id="internal" />
                    <div className="flex-1">
                      <Label htmlFor="internal" className="font-medium cursor-pointer">
                        🔄 Internal Transfer
                      </Label>
                      <p className="text-sm text-muted-foreground">Move stock between your locations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="catering" id="catering" />
                    <div className="flex-1">
                      <Label htmlFor="catering" className="font-medium cursor-pointer">
                        🚐 Catering / Off-site
                      </Label>
                      <p className="text-sm text-muted-foreground">Send stock to an event or temporary location</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="return" id="return" />
                    <div className="flex-1">
                      <Label htmlFor="return" className="font-medium cursor-pointer">
                        ↩️ Return to Supplier
                      </Label>
                      <p className="text-sm text-muted-foreground">Return items to a vendor</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>FROM (Source)</Label>
                  <Select value={fromLocation} onValueChange={setFromLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.emoji} {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromLoc && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{fromLoc.skuCount} SKUs available</div>
                      <div>€{fromLoc.value.toLocaleString()} inventory value</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>TO (Destination)</Label>
                  <Select value={toLocation} onValueChange={setToLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter((l) => l.id !== fromLocation)
                        .map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.emoji} {loc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromLocation && toLocation && (
                <>
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Quick Transfers</Label>
                    <div className="text-sm text-muted-foreground mb-3">Common routes:</div>
                    <div className="space-y-2">
                      {quickRoutes.map((route, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left rounded-lg border p-3 hover:bg-muted transition-colors"
                          onClick={() => {
                            setFromLocation(route.from)
                            setToLocation(route.to)
                          }}
                        >
                          <div className="font-medium">{route.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {route.frequency} • Last transfer: {route.lastTransfer}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason / Note (optional)</Label>
                    <Textarea placeholder="Bar restocking for weekend" />
                  </div>

                  <div>
                    <Label className="mb-3 block">Priority</Label>
                    <RadioGroup value={priority} onValueChange={setPriority}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="urgent" id="urgent" />
                          <Label htmlFor="urgent" className="cursor-pointer">
                            🔴 Urgent (ASAP)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="normal" />
                          <Label htmlFor="normal" className="cursor-pointer">
                            🟡 Normal
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low" className="cursor-pointer">
                            🟢 Low
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setStep(2)} disabled={!fromLocation || !toLocation}>
                  Continue to Select Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Items */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {fromLoc?.emoji} {fromLoc?.name}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium">
                    {toLoc?.emoji} {toLoc?.name}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Suggested Items ({toLoc?.name} is low on these)</Label>
                </div>

                <div className="space-y-3">
                  {suggestedItems.map((item) => {
                    const isSelected = selectedItems.some((i) => i.id === item.id)
                    const qty = selectedItems.find((i) => i.id === item.id)?.qty || item.suggestedQty

                    return (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, { ...item, qty: item.suggestedQty }])
                              } else {
                                setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
                              }
                            }}
                          />
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="font-medium">
                                {item.emoji} {item.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.code} • {toLoc?.name}: {item.destQty} {item.unit}{" "}
                                <Badge variant="destructive" className="ml-2">
                                  {item.destStatus}
                                </Badge>
                                {" • "}
                                {fromLoc?.name}: {item.sourceQty} {item.unit} available
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-4">
                                <Label>Transfer qty:</Label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 bg-transparent"
                                    onClick={() => {
                                      const newQty = Math.max(0, qty - 1)
                                      setSelectedItems(
                                        selectedItems.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i)),
                                      )
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={qty}
                                    onChange={(e) => {
                                      const newQty = Number.parseInt(e.target.value) || 0
                                      setSelectedItems(
                                        selectedItems.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i)),
                                      )
                                    }}
                                    className="w-20 text-center"
                                  />
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 bg-transparent"
                                    onClick={() => {
                                      const newQty = qty + 1
                                      setSelectedItems(
                                        selectedItems.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i)),
                                      )
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm">{item.unit}</span>
                                  <span className="text-sm text-muted-foreground ml-4">
                                    @€{item.price.toFixed(2)} = €{(qty * item.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {item.alert && (
                              <div className="flex items-center gap-2 text-sm text-yellow-600">
                                <AlertCircle className="h-4 w-4" />
                                {item.alert}
                              </div>
                            )}

                            {item.reason && isSelected && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {item.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Button variant="outline" className="w-full mt-3 bg-transparent" size="sm">
                  Select All Suggestions
                </Button>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Add More Items</Label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search items in Main Kitchen..." className="pl-9" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <Label className="text-base font-semibold mb-3 block">Transfer Summary</Label>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">ITEMS</div>
                      <div className="text-xl font-bold">{totalItems} selected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">TOTAL VALUE</div>
                      <div className="text-xl font-bold">€{totalValue.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">WEIGHT</div>
                      <div className="text-xl font-bold">~2.5 kg</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Selected items:{" "}
                    {selectedItems.map((item, idx) => (
                      <span key={item.id}>
                        {item.emoji} {item.name} ({item.qty}){idx < selectedItems.length - 1 && " • "}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedItems.length === 0}>
                  Continue to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="text-lg font-semibold mb-4">Transfer #TR-2024-159 (Draft)</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground mb-1">📤 FROM</div>
                    <div className="font-semibold">
                      {fromLoc?.emoji} {fromLoc?.name}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground mb-1">📥 TO</div>
                    <div className="font-semibold">
                      {toLoc?.emoji} {toLoc?.name}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Priority: 🟡 {priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Items to Transfer ({selectedItems.length})</Label>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">ITEM</th>
                        <th className="p-2 text-right">QTY</th>
                        <th className="p-2 text-right">VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, idx) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">
                            {item.emoji} {item.name}
                            <div className="text-xs text-muted-foreground">{item.code}</div>
                          </td>
                          <td className="p-2 text-right">
                            {item.qty} {item.unit}
                          </td>
                          <td className="p-2 text-right">€{(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t font-semibold">
                        <td colSpan={3} className="p-2 text-right">
                          TOTAL:
                        </td>
                        <td className="p-2 text-right">€{totalValue.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Save as Draft
                  </Button>
                  <Button onClick={() => setStep(4)}>
                    Create Transfer
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/10 p-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Transfer Created Successfully!</h3>
                <p className="text-muted-foreground">Transfer #TR-2024-159 has been created and is ready for pickup</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">Items</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-2xl font-bold">€{totalValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleClose} className="w-full">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Picking List
                </Button>
                <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
                  Create Another Transfer
                </Button>
                <Button variant="ghost" onClick={handleClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
