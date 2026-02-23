"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, Smartphone } from "lucide-react";

interface PaymentMethodSectionProps {
  orderType: "dine-in" | "pickup";
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export function PaymentMethodSection({
  orderType,
  selectedMethod,
  onMethodChange,
}: PaymentMethodSectionProps) {
  const methods =
    orderType === "dine-in"
      ? [
          { id: "pay-now", label: "Pay Now (Card)", icon: CreditCard },
          { id: "pay-counter", label: "Pay at Counter", icon: DollarSign },
          { id: "pay-table", label: "Pay at Table", icon: Smartphone },
        ]
      : [
          { id: "pay-now", label: "Pay Now (Card)", icon: CreditCard },
          { id: "pay-pickup", label: "Pay at Pickup", icon: DollarSign },
        ];

  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-foreground mb-3">Payment Method</h2>

      <div className="mt-0 space-y-3">
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        <div className="space-y-2">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            return (
              <label
                key={method.id}
                htmlFor={method.id}
                className={`flex items-center gap-2.5 rounded-md border-2 px-3 py-2.5 transition-colors bg-transparent cursor-pointer ${
                  isSelected
                    ? "text-foreground border-foreground"
                    : "text-foreground border-border hover:border-foreground shadow-md"
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                }`} />
                <span className="text-sm font-medium flex-1">
                  {method.label}
                </span>
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div className="flex-shrink-0">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-1 w-1 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </RadioGroup>
      </div>
    </div>
  );
}
