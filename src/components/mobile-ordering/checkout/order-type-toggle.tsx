'use client';

interface OrderTypeToggleProps {
  value: "dine-in" | "pickup";
  onChange: (type: "dine-in" | "pickup") => void;
}

export function OrderTypeToggle({ value, onChange }: OrderTypeToggleProps) {
  return (
    <div className="flex justify-center border-b border-border bg-card px-4 py-2">
      <div className="flex w-full max-w-xs rounded-full bg-gray-100 p-0.5">
        <button
          type="button"
          onClick={() => onChange("dine-in")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-all ${
            value === "dine-in"
              ? "bg-white text-foreground shadow-sm"
              : "text-gray-500 hover:text-foreground"
          }`}
        >
          Dine-in
        </button>
        <button
          type="button"
          onClick={() => onChange("pickup")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-all ${
            value === "pickup"
              ? "bg-white text-foreground shadow-sm"
              : "text-gray-500 hover:text-foreground"
          }`}
        >
          Pickup
        </button>
      </div>
    </div>
  );
}
