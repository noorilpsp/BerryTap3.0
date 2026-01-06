"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ColumnCustomizationProps {
  visibleColumns: Record<string, boolean>
  onColumnsChange: (columns: Record<string, boolean>) => void
  onClose: () => void
}

export function ColumnCustomization({ visibleColumns, onColumnsChange, onClose }: ColumnCustomizationProps) {
  const columns = [
    { key: "date", label: "Date & Time", default: true },
    { key: "type", label: "Transaction Type", default: true },
    { key: "status", label: "Status", default: true },
    { key: "amount", label: "Amount (Gross)", default: true },
    { key: "fees", label: "Fees", default: true },
    { key: "net", label: "Net Amount", default: true },
    { key: "paymentMethod", label: "Payment Method", default: true },
    { key: "channel", label: "Channel", default: true },
    { key: "orderId", label: "Order ID", default: true },
    { key: "customer", label: "Customer", default: false },
  ]

  const toggleColumn = (key: string) => {
    onColumnsChange({
      ...visibleColumns,
      [key]: !visibleColumns[key],
    })
  }

  const resetToDefault = () => {
    const defaultColumns: Record<string, boolean> = {}
    columns.forEach((col) => {
      defaultColumns[col.key] = col.default
    })
    onColumnsChange(defaultColumns)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>Toggle columns to show or hide in the table</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {columns.map((column) => (
            <div key={column.key} className="flex items-center space-x-2">
              <Checkbox
                id={column.key}
                checked={visibleColumns[column.key]}
                onCheckedChange={() => toggleColumn(column.key)}
              />
              <Label htmlFor={column.key} className="cursor-pointer text-sm font-normal">
                {column.label}
                {column.default && <span className="ml-2 text-xs text-muted-foreground">(Default)</span>}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
          <Button onClick={onClose}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
