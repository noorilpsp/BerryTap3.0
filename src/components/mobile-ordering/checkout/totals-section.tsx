"use client";

interface TotalsSectionProps {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export function TotalsSection({
  subtotal,
  tax,
  tip,
  total,
}: TotalsSectionProps) {
  return (
    <div className="mb-0 space-y-3">
      <div className="flex justify-between text-base text-foreground">
        <span className="font-medium">Subtotal</span>
        <span className="font-medium">€{subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-base text-foreground">
        <span className="font-medium">Tax</span>
        <span className="font-medium">€{tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-base text-foreground">
        <span className="font-medium">Tip</span>
        <span className="font-medium">€{tip.toFixed(2)}</span>
      </div>

      <div className="h-px bg-gray-200 my-4" />

      <div className="flex justify-between items-center mb-0">
        <span className="text-lg font-bold text-foreground">Total</span>
        <span className="text-2xl font-bold text-foreground">
          €{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
