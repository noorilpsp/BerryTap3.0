"use client";

import { Pencil } from "lucide-react";
import { CallWaiterButton } from "@/components/ui/call-waiter-button";

type OrderType = "dine-in" | "pickup";

interface OrderTypeSectionProps {
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  tableNumber: string;
  onEditTable: () => void;
}

export function OrderTypeSection({
  orderType,
  onOrderTypeChange,
  tableNumber,
  onEditTable,
}: OrderTypeSectionProps) {

  return (
    <div className="px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center justify-between gap-3">
        {/* Order Type Toggle */}
        <div className="flex rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onOrderTypeChange("dine-in")}
            className={`px-3.5 py-1.75 text-sm font-medium rounded-full transition-all ${
              orderType === "dine-in"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            Dine-in
          </button>
          <button
            type="button"
            onClick={() => onOrderTypeChange("pickup")}
            className={`px-3.5 py-1.75 text-sm font-medium rounded-full transition-all ${
              orderType === "pickup"
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            Pickup
          </button>
        </div>

        {/* Dine-in Call Waiter Button / Pickup Estimate */}
        {orderType === "dine-in" && (
          <div className="shrink-0">
            <CallWaiterButton 
              className="h-8 text-sm w-auto min-w-[120px] px-3"
              onCall={async () => {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 800));
              }}
            />
          </div>
        )}
        {orderType === "pickup" && (
          <div className="text-xs font-medium text-gray-700">
            est. 30 - 40 min
          </div>
        )}
      </div>

      {/* Table Number Edit - Below Toggle */}
      {orderType === "dine-in" && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onEditTable}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-foreground transition-colors bg-gray-100 px-3.5 py-1.75 rounded-full hover:bg-gray-200"
          >
            <span>Table {tableNumber}</span>
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
