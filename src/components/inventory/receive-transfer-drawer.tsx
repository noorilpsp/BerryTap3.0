"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, XCircle, Camera } from "lucide-react"

const receivingItems = [
  {
    id: "r1",
    name: "House Red Wine",
    emoji: "🍷",
    code: "WIN001",
    sent: 6,
    unit: "btl",
    price: 12.5,
    received: 6,
    status: "match",
  },
  {
    id: "r2",
    name: "Prosecco",
    emoji: "🍾",
    code: "PRO001",
    sent: 4,
    unit: "btl",
    price: 15.0,
    received: 4,
    status: "match",
  },
  {
    id: "r3",
    name: "Bourbon Whiskey",
    emoji: "🥃",
    code: "BRB001",
    sent: 2,
    unit: "btl",
    price: 35.0,
    received: 1,
    status: "short",
    variance: -1,
    reason: "",
  },
  {
    id: "r4",
    name: "Craft IPA",
    emoji: "🍺",
    code: "IPA001",
    sent: 24,
    unit: "btl",
    price: 3.5,
    received: 24,
    status: "match",
  },
  {
    id: "r5",
    name: "Lemons",
    emoji: "🍋",
    code: "LEM001",
    sent: 2,
    unit: "kg",
    price: 3.0,
    received: 2,
    status: "match",
  },
  {
    id: "r6",
    name: "Fresh Mint",
    emoji: "🌿",
    code: "MNT001",
    sent: 0.2,
    unit: "kg",
    price: 40.0,
    received: 0,
    status: "missing",
    variance: -0.2,
    reason: "",
  },
]

interface ReceiveTransferDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transfer: any
}

export function ReceiveTransferDrawer({ open, onOpenChange, transfer }: ReceiveTransferDrawerProps) {
  const [items, setItems] = useState(receivingItems)
  const [resolutionMethod, setResolutionMethod] = useState("replacement")
  const [notifySender, setNotifySender] = useState(true)

  const updateReceived = (id: string, value: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const variance = value - item.sent
          const status = variance === 0 ? "match" : variance < 0 ? "short" : "over"
          return { ...item, received: value, status, variance }
        }
        return item
      }),
    )
  }

  const updateReason = (id: string, reason: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, reason } : item)))
  }

  const sentValue = items.reduce((sum, item) => sum + item.sent * item.price, 0)
  const receivedValue = items.reduce((sum, item) => sum + item.received * item.price, 0)
  const varianceValue = receivedValue - sentValue
  const variancePercent = ((varianceValue / sentValue) * 100).toFixed(1)
  const issuesCount = items.filter((i) => i.status !== "match").length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Receive Transfer #{transfer?.transferNumber}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6">
            {/* Transfer Info */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {transfer?.fromLocation.emoji} {transfer?.fromLocation.name}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {transfer?.toLocation.emoji} {transfer?.toLocation.name} (You)
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Shipped: {transfer?.shippedAt} • By: {transfer?.shippedBy}
                </div>
                <div className="text-muted-foreground">
                  Items: {transfer?.itemCount} items • Value: €{transfer?.totalValue.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setItems(
                    items.map((item) => ({
                      ...item,
                      received: item.sent,
                      status: "match",
                      variance: 0,
                    })),
                  )
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Receive All as Sent
              </Button>
              <Button size="sm" variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Scan Items
              </Button>
            </div>

            {/* Items Verification */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Verify Items</Label>
              <div className="text-sm text-muted-foreground mb-4">Check items as you verify them:</div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={item.status !== "pending"} onCheckedChange={() => {}} />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {item.emoji} {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.code}</div>
                          </div>
                          {item.status === "match" && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Match
                            </Badge>
                          )}
                          {item.status === "short" && (
                            <Badge variant="secondary" className="bg-yellow-500 text-white">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Short ({item.variance} {item.unit})
                            </Badge>
                          )}
                          {item.status === "missing" && (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Missing
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Sent</div>
                            <div className="font-medium">
                              {item.sent} {item.unit}
                            </div>
                            <div className="text-muted-foreground">€{(item.sent * item.price).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Received</div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={item.received}
                                onChange={(e) => updateReceived(item.id, Number.parseFloat(e.target.value) || 0)}
                                className="w-20 h-8"
                                step="0.1"
                              />
                              <span className="text-sm">{item.unit}</span>
                            </div>
                            <div className="text-muted-foreground">€{(item.received * item.price).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Status</div>
                            <div
                              className={`font-medium ${
                                item.status === "match"
                                  ? "text-green-500"
                                  : item.status === "short"
                                    ? "text-yellow-600"
                                    : "text-red-500"
                              }`}
                            >
                              {item.status === "match"
                                ? "✅ Match"
                                : item.status === "short"
                                  ? `⚠️ Short (${item.variance} ${item.unit})`
                                  : "❌ Missing"}
                            </div>
                            {item.variance && (
                              <div className="text-muted-foreground">
                                {item.variance > 0 ? "+" : ""}€{(item.variance * item.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.status !== "match" && (
                          <div className="space-y-2">
                            <Label className="text-sm">Reason:</Label>
                            <Select value={item.reason} onValueChange={(value) => updateReason(item.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="broken">Broken in transit</SelectItem>
                                <SelectItem value="not_packed">Not included in delivery</SelectItem>
                                <SelectItem value="damaged">Damaged/Unusable</SelectItem>
                                <SelectItem value="wrong_item">Wrong item sent</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receiving Summary */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <Label className="text-base font-semibold mb-3 block">Receiving Summary</Label>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">SENT</div>
                  <div className="text-lg font-bold">€{sentValue.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{items.length} items</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">RECEIVING</div>
                  <div className="text-lg font-bold">€{receivedValue.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {items.filter((i) => i.received > 0).length} items
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">VARIANCE</div>
                  <div className={`text-lg font-bold ${varianceValue < 0 ? "text-red-500" : "text-green-500"}`}>
                    {varianceValue > 0 ? "+" : ""}€{varianceValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {varianceValue > 0 ? "+" : ""}
                    {variancePercent}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">MISSING</div>
                  <div className="text-lg font-bold">{issuesCount} items</div>
                  <div className="text-xs text-muted-foreground">
                    €
                    {items
                      .filter((i) => i.status !== "match")
                      .reduce((sum, i) => sum + Math.abs((i.variance || 0) * i.price), 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>

              {issuesCount > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Issues found:</div>
                  {items
                    .filter((i) => i.status !== "match")
                    .map((item) => (
                      <div key={item.id} className="text-muted-foreground">
                        • {item.emoji} {item.name}:{" "}
                        {item.status === "missing"
                          ? "Not included in delivery"
                          : `${Math.abs(item.variance || 0)} ${item.unit} ${item.status}`}{" "}
                        (-€{(Math.abs(item.variance || 0) * item.price).toFixed(2)})
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Documentation */}
            {issuesCount > 0 && (
              <>
                <div>
                  <Label className="text-base font-semibold mb-3 block">Documentation</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox />
                      <Label className="text-sm cursor-pointer">Attach photo of damaged item(s)</Label>
                    </div>
                    <div className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag & drop photos, or click to browse</p>
                    </div>
                    <div>
                      <Label className="text-sm">Notes:</Label>
                      <Textarea
                        placeholder="Bourbon bottle was cracked, contents leaked. Mint was not packed."
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Missing Items Resolution */}
                <div className="rounded-lg border p-4">
                  <Label className="text-base font-semibold mb-3 block">Missing Items Resolution</Label>
                  <p className="text-sm text-muted-foreground mb-3">How should missing items be handled?</p>
                  <RadioGroup value={resolutionMethod} onValueChange={setResolutionMethod}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="replacement" id="replacement" />
                        <Label htmlFor="replacement" className="cursor-pointer">
                          Request replacement transfer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="writeoff" id="writeoff" />
                        <Label htmlFor="writeoff" className="cursor-pointer">
                          Mark as lost/damaged (write off)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="return" id="return" />
                        <Label htmlFor="return" className="cursor-pointer">
                          Return to source location inventory
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-4 flex items-center gap-2">
                    <Checkbox
                      checked={notifySender}
                      onCheckedChange={(checked) => setNotifySender(checked as boolean)}
                    />
                    <Label className="text-sm cursor-pointer">Notify sender about discrepancies</Label>
                  </div>
                </div>
              </>
            )}

            {/* Footer Actions */}
            <div className="flex justify-between gap-2 pb-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {issuesCount > 0 && <Button variant="outline">Save as Partial</Button>}
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Receiving
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
