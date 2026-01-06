"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Star,
  Trash2,
  Calendar,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Bell,
  Truck,
  Edit,
  Download,
  FilePen,
} from "lucide-react"

const suppliers = [
  {
    id: "sup_freshfarms",
    name: "Fresh Farms",
    email: "orders@freshfarms.com",
    phone: "+31 20 555 1234",
    preferred: true,
    leadTimeDays: 2,
    minOrder: 50,
    reliability: 94,
    lowStockItems: 5,
    lowStockPreview: [
      { emoji: "🥚", name: "Eggs", currentQty: "120pc" },
      { emoji: "🥬", name: "Lettuce", currentQty: "3kg" },
      { emoji: "🍅", name: "Tomatoes", currentQty: "8kg" },
    ],
    lastOrderDate: "2024-11-12",
  },
  {
    id: "sup_dairydirect",
    name: "Dairy Direct",
    email: "orders@dairydirect.com",
    phone: "+31 20 555 3456",
    preferred: false,
    leadTimeDays: 1,
    minOrder: 30,
    reliability: 97,
    lowStockItems: 3,
    lowStockPreview: [
      { emoji: "🧀", name: "Mozzarella", currentQty: "2pc" },
      { emoji: "🥛", name: "Cream", currentQty: "14L" },
      { emoji: "🧈", name: "Butter", currentQty: "4kg" },
    ],
    lastOrderDate: "2024-11-13",
  },
  {
    id: "sup_meatmasters",
    name: "Meat Masters",
    email: "orders@meatmasters.com",
    phone: "+31 20 555 5678",
    preferred: true,
    leadTimeDays: 2.5,
    minOrder: 100,
    reliability: 91,
    lowStockItems: 2,
    lowStockPreview: [
      { emoji: "🥩", name: "Beef Tenderloin", currentQty: "0kg", status: "out" },
      { emoji: "🍗", name: "Chicken", currentQty: "12kg" },
    ],
    lastOrderDate: "2024-11-10",
  },
  {
    id: "sup_seafoodking",
    name: "Seafood King",
    email: "orders@seafoodking.com",
    phone: "+31 20 555 9012",
    preferred: true,
    leadTimeDays: 1.5,
    minOrder: 75,
    reliability: 89,
    lowStockItems: 0,
    lastOrderDate: "2024-11-13",
  },
  {
    id: "sup_grainco",
    name: "Grain Co",
    email: "orders@grainco.com",
    phone: "+31 20 555 7890",
    preferred: false,
    leadTimeDays: 4,
    minOrder: 100,
    reliability: 96,
    lowStockItems: 0,
    lastOrderDate: "2024-11-08",
  },
  {
    id: "sup_medimports",
    name: "Med Imports",
    email: "orders@medimports.com",
    phone: "+31 20 555 2345",
    preferred: false,
    leadTimeDays: 6,
    minOrder: 200,
    reliability: 92,
    lowStockItems: 0,
    lastOrderDate: "2024-10-28",
  },
]

const suggestedItems = [
  {
    skuId: "sku_eggs_fr",
    code: "EGG001",
    name: "Free-range Eggs",
    emoji: "🥚",
    currentQty: 120,
    unit: "pc",
    parLevel: 200,
    status: "low",
    suggestedQty: 150,
    pricePerUnit: 0.15,
    totalCost: 22.5,
    lastOrderDate: "2024-11-12",
    avgWeeklyUsage: 450,
    alert: null,
  },
  {
    skuId: "sku_lettuce",
    code: "LET001",
    name: "Romaine Lettuce",
    emoji: "🥬",
    currentQty: 3,
    unit: "kg",
    parLevel: 15,
    status: "critical",
    suggestedQty: 15,
    pricePerUnit: 2.8,
    totalCost: 42.0,
    lastOrderDate: "2024-11-10",
    avgWeeklyUsage: 12,
    alert: "Stock critical - Order ASAP",
  },
  {
    skuId: "sku_tomatoes",
    code: "TOM001",
    name: "Roma Tomatoes",
    emoji: "🍅",
    currentQty: 8,
    unit: "kg",
    parLevel: 20,
    status: "ok",
    suggestedQty: 12,
    pricePerUnit: 3.5,
    totalCost: 42.0,
    lastOrderDate: "2024-11-08",
    avgWeeklyUsage: 15,
    alert: null,
  },
]

const supplierCatalog = [
  { skuId: "sku_carrots", code: "CAR001", name: "Carrots", emoji: "🥕", pricePerUnit: 1.2, unit: "kg" },
  { skuId: "sku_onions", code: "ONI001", name: "Onions", emoji: "🧅", pricePerUnit: 0.9, unit: "kg" },
  { skuId: "sku_potatoes", code: "POT001", name: "Potatoes", emoji: "🥔", pricePerUnit: 0.85, unit: "kg" },
  { skuId: "sku_peppers", code: "PEP001", name: "Peppers", emoji: "🫑", pricePerUnit: 4.2, unit: "kg" },
  { skuId: "sku_cucumbers", code: "CUC001", name: "Cucumbers", emoji: "🥒", pricePerUnit: 2.3, unit: "kg" },
]

interface CreatePODrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePODrawer({ open, onOpenChange }: CreatePODrawerProps) {
  const [step, setStep] = useState(1)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState("loc_main")
  const [expectedDate, setExpectedDate] = useState("2024-11-18")
  const [orderItems, setOrderItems] = useState<any[]>([
    { ...suggestedItems[0], selected: true },
    { ...suggestedItems[1], selected: true },
  ])
  const [orderNotes, setOrderNotes] = useState("Please deliver before 10 AM. Call 30 mins before arrival.")
  const [internalNotes, setInternalNotes] = useState("Reordering eggs earlier due to weekend rush expected.")
  const [emailOption, setEmailOption] = useState("send_now")

  const handleNext = () => {
    if (step === 1 && !selectedSupplier) return
    setStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier(supplier)
  }

  const toggleItemSelection = (skuId: string) => {
    setOrderItems((prev) => prev.map((item) => (item.skuId === skuId ? { ...item, selected: !item.selected } : item)))
  }

  const updateItemQty = (skuId: string, qty: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.skuId === skuId ? { ...item, suggestedQty: qty, totalCost: qty * item.pricePerUnit } : item,
      ),
    )
  }

  const removeItem = (skuId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.skuId !== skuId))
  }

  const subtotal = orderItems.filter((item) => item.selected).reduce((sum, item) => sum + item.totalCost, 0)
  const deliveryFee = subtotal >= 150 ? 0 : 15.0
  const total = subtotal + deliveryFee

  const handleClose = () => {
    setStep(1)
    setSelectedSupplier(null)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Purchase Order</SheetTitle>
          <SheetDescription>
            {step === 1 && "Select supplier and delivery details"}
            {step === 2 && "Add items to your purchase order"}
            {step === 3 && "Review order before sending"}
            {step === 4 && "Send order to supplier"}
          </SheetDescription>
        </SheetHeader>

        {/* Progress Bar */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      s < step
                        ? "bg-primary text-primary-foreground"
                        : s === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  <div className="text-xs mt-1 text-center">
                    {s === 1 && "Supplier"}
                    {s === 2 && "Add Items"}
                    {s === 3 && "Review"}
                    {s === 4 && "Send"}
                  </div>
                </div>
                {idx < 3 && <div className={`h-px flex-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Select Supplier */}
          {step === 1 && (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search suppliers..." className="pl-9" />
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">SUPPLIERS WITH LOW STOCK ITEMS</h3>
                  <RadioGroup
                    value={selectedSupplier?.id}
                    onValueChange={(value) => {
                      const supplier = suppliers.find((s) => s.id === value)
                      handleSupplierSelect(supplier)
                    }}
                    className="space-y-3"
                  >
                    {suppliers
                      .filter((s) => s.lowStockItems > 0)
                      .map((supplier) => (
                        <Card
                          key={supplier.id}
                          className={`cursor-pointer ${
                            selectedSupplier?.id === supplier.id ? "border-primary ring-2 ring-primary" : ""
                          }`}
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={supplier.id} />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{supplier.name}</span>
                                  {supplier.preferred && (
                                    <Badge variant="secondary" className="gap-1">
                                      <Star className="h-3 w-3 fill-current" />
                                      Preferred
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {supplier.lowStockItems} items need reorder • Last order:{" "}
                                  {new Date(supplier.lastOrderDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Lead time: {supplier.leadTimeDays} days • Min order: €{supplier.minOrder}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {supplier.lowStockPreview.map((item, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {item.emoji} {item.name} ({item.currentQty})
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-sm">
                                  Reliability: <span className="font-medium">{supplier.reliability}% on-time</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">ALL SUPPLIERS</h3>
                  <RadioGroup
                    value={selectedSupplier?.id}
                    onValueChange={(value) => {
                      const supplier = suppliers.find((s) => s.id === value)
                      handleSupplierSelect(supplier)
                    }}
                    className="space-y-2"
                  >
                    {suppliers
                      .filter((s) => s.lowStockItems === 0)
                      .map((supplier) => (
                        <Card
                          key={supplier.id}
                          className={`cursor-pointer ${
                            selectedSupplier?.id === supplier.id ? "border-primary ring-2 ring-primary" : ""
                          }`}
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={supplier.id} />
                              <div className="flex-1">
                                <span className="font-medium">{supplier.name}</span>
                                <div className="text-sm text-muted-foreground">
                                  Lead time: {supplier.leadTimeDays} days • Min order: €{supplier.minOrder} •{" "}
                                  {supplier.reliability}% on-time
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </RadioGroup>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold">Delivery Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Delivery Location</Label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="loc_main">Main Kitchen</SelectItem>
                            <SelectItem value="loc_bar">Bar</SelectItem>
                            <SelectItem value="loc_prep">Prep Station</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Delivery Date</Label>
                        <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                      </div>
                    </div>
                    {selectedSupplier && (
                      <div className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        Based on {selectedSupplier.name}'s {selectedSupplier.leadTimeDays}-day lead time
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Step 2: Add Items */}
          {step === 2 && selectedSupplier && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">Supplier: {selectedSupplier.name}</div>
                      <div className="text-muted-foreground">{selectedSupplier.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Location: Main Kitchen</div>
                      <div className="text-muted-foreground">
                        Expected: {new Date(expectedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold">SUGGESTED ITEMS (Based on low stock)</h3>
                {orderItems.map((item) => (
                  <Card key={item.skuId}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={item.selected} onCheckedChange={() => toggleItemSelection(item.skuId)} />
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="font-medium">
                              {item.emoji} {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.code} • Current: {item.currentQty}
                              {item.unit} ({item.status}) • Par: {item.parLevel}
                              {item.unit} • Suggested: {item.suggestedQty}
                              {item.unit}
                            </div>
                          </div>

                          {item.alert && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              {item.alert}
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <Label className="text-sm">Qty:</Label>
                            <Input
                              type="number"
                              value={item.suggestedQty}
                              onChange={(e) => updateItemQty(item.skuId, Number.parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                            <span className="text-sm">{item.unit}</span>
                            <span className="text-sm text-muted-foreground">
                              @€{item.pricePerUnit.toFixed(2)}/{item.unit}
                            </span>
                            <span className="text-sm font-medium">= €{item.totalCost.toFixed(2)}</span>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Last ordered: {new Date(item.lastOrderDate).toLocaleDateString()} • Avg weekly usage:{" "}
                            {item.avgWeeklyUsage}
                            {item.unit}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">ADD MORE ITEMS</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search SKUs to add..." className="pl-9" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {supplierCatalog.map((item) => (
                    <Badge key={item.skuId} variant="outline" className="cursor-pointer hover:bg-accent">
                      {item.emoji} {item.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="cursor-pointer">
                    +8 more
                  </Badge>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">CURRENT ORDER</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ITEM</TableHead>
                        <TableHead>QTY</TableHead>
                        <TableHead>UNIT</TableHead>
                        <TableHead>PRICE</TableHead>
                        <TableHead>TOTAL</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems
                        .filter((item) => item.selected)
                        .map((item) => (
                          <TableRow key={item.skuId}>
                            <TableCell>
                              {item.emoji} {item.name}
                            </TableCell>
                            <TableCell>{item.suggestedQty}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>€{item.pricePerUnit.toFixed(2)}</TableCell>
                            <TableCell>€{item.totalCost.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeItem(item.skuId)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>€{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>TOTAL:</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {subtotal >= selectedSupplier.minOrder ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Minimum order: €{selectedSupplier.minOrder} ✓
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Minimum order: €{selectedSupplier.minOrder} (€
                        {(selectedSupplier.minOrder - subtotal).toFixed(2)} more needed)
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="mt-1">
                        Free delivery over €150 (€
                        {(150 - subtotal).toFixed(2)} more)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">NOTES</h3>
                  <div className="space-y-2">
                    <Label>Order Notes (visible to supplier)</Label>
                    <Textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Add any special instructions..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes (not visible to supplier)</Label>
                    <Textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && selectedSupplier && (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-lg font-semibold">PO #1857 (Draft)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold text-sm">SUPPLIER</div>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{selectedSupplier.name}</div>
                          <div className="text-muted-foreground">{selectedSupplier.email}</div>
                          <div className="text-muted-foreground">{selectedSupplier.phone}</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold text-sm">DELIVERY</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            Main Kitchen
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(expectedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Before 10 AM
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">ORDER ITEMS</h3>
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Items
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>ITEM</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>QTY</TableHead>
                        <TableHead>UNIT</TableHead>
                        <TableHead>PRICE</TableHead>
                        <TableHead>TOTAL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems
                        .filter((item) => item.selected)
                        .map((item, idx) => (
                          <TableRow key={item.skuId}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              {item.emoji} {item.name}
                            </TableCell>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.suggestedQty}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>€{item.pricePerUnit.toFixed(2)}</TableCell>
                            <TableCell>€{item.totalCost.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-end gap-32 text-sm">
                      <span>Subtotal:</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-32 text-sm">
                      <span>Delivery:</span>
                      <span>€{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-32 text-lg font-semibold border-t pt-2">
                      <span>TOTAL:</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">STOCK IMPACT PREVIEW</h3>
                  <p className="text-sm text-muted-foreground">After this order is received:</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ITEM</TableHead>
                        <TableHead>CURRENT</TableHead>
                        <TableHead>+ ORDER</TableHead>
                        <TableHead>= PROJECTED</TableHead>
                        <TableHead>STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems
                        .filter((item) => item.selected)
                        .map((item) => {
                          const projected = item.currentQty + item.suggestedQty
                          const percentage = Math.round((projected / item.parLevel) * 100)
                          return (
                            <TableRow key={item.skuId}>
                              <TableCell>
                                {item.emoji} {item.name}
                              </TableCell>
                              <TableCell>
                                {item.currentQty} {item.unit}{" "}
                                <Badge
                                  variant={
                                    item.status === "critical"
                                      ? "destructive"
                                      : item.status === "low"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                +{item.suggestedQty} {item.unit}
                              </TableCell>
                              <TableCell>
                                {projected} {item.unit}
                              </TableCell>
                              <TableCell>
                                <Badge variant="default" className="bg-green-500">
                                  Good ({percentage}%)
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    All items will be at healthy stock levels after receiving
                  </div>
                </CardContent>
              </Card>

              {orderNotes && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Order Notes</h3>
                    <p className="text-sm text-muted-foreground">{orderNotes}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 4: Send */}
          {step === 4 && selectedSupplier && (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-lg font-semibold">Ready to send PO #1857</div>
                    <div className="text-sm text-muted-foreground">
                      Total: €{total.toFixed(2)} • {orderItems.filter((i) => i.selected).length} items
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">How would you like to send this PO?</h3>
                  <RadioGroup value={emailOption} onValueChange={setEmailOption}>
                    <Card
                      className={`cursor-pointer ${
                        emailOption === "send_now" ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setEmailOption("send_now")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="send_now" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="h-4 w-4" />
                              <span className="font-medium">Send Email Now</span>
                              <Badge variant="secondary">Recommended</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Automatically email PO to {selectedSupplier.email}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer ${
                        emailOption === "send_manual" ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setEmailOption("send_manual")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="send_manual" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Download className="h-4 w-4" />
                              <span className="font-medium">Download & Send Manually</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Download PDF and send yourself</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer ${
                        emailOption === "save_draft" ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setEmailOption("save_draft")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="save_draft" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FilePen className="h-4 w-4" />
                              <span className="font-medium">Save as Draft</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Save and send later</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">Set Reminders</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox id="reminder-followup" defaultChecked />
                      <Label htmlFor="reminder-followup" className="text-sm">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Follow-up if not confirmed (1 day before expected)
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="reminder-arrival" defaultChecked />
                      <Label htmlFor="reminder-arrival" className="text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Notify on expected arrival date
                        </div>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center space-y-4">
                  <PartyPopper className="h-12 w-12 mx-auto text-green-600" />
                  <div className="space-y-2">
                    <div className="text-xl font-semibold">Purchase Order Created!</div>
                    <div className="text-sm text-muted-foreground">
                      PO #1857 • €{total.toFixed(2)} • {orderItems.filter((i) => i.selected).length} items
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Email sent to {selectedSupplier.email}</div>
                      <div>Expected delivery: {new Date(expectedDate).toLocaleDateString()}</div>
                      <div>Reminders set for follow-up and receiving</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
                    <Button variant="outline">View Order</Button>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Create Another PO
                    </Button>
                    <Button onClick={handleClose}>Back to PO List</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        {step < 4 && (
          <div className="flex justify-between gap-4 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button onClick={handleNext} disabled={step === 1 && !selectedSupplier}>
                {step === 3 ? "Continue to Send" : "Continue"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
