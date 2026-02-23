"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDisplayMode } from "./DisplayModeContext";
import { cn } from "@/lib/utils";

/** Minimal order shape for All-Day aggregation (from page orders). */
export interface AllDayOrder {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  status: string;
  items: ReadonlyArray<{
    id: string;
    name: string;
    variant: string | null;
    quantity: number;
    customizations?: string[];
  }>;
}

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  totalCount: number;
  items: Array<{
    name: string;
    variant: string | null;
    customizations: string[];
    count: number;
    orderRefs: Array<{
      orderId: string;
      orderNumber: string;
      tableNumber: string | null;
      customerName: string | null;
      status: string;
      quantity: number;
    }>;
  }>;
}

const CATEGORY_CONFIG: Array<{
  id: string;
  name: string;
  icon: string;
  itemNames: string[];
}> = [
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "🍕",
    itemNames: [
      "Margherita",
      "Pepperoni",
      "Hawaiian",
      "BBQ Chicken",
      "Four Cheese",
      "Meat Lovers",
      "Mediterranean",
      "Veggie Supreme",
      "Seafood Deluxe",
    ],
  },
  {
    id: "salads",
    name: "Salads",
    icon: "🥗",
    itemNames: ["Caesar Salad", "Greek Salad"],
  },
  {
    id: "pasta",
    name: "Pasta",
    icon: "🍝",
    itemNames: ["Carbonara", "Bolognese", "Pad Thai"],
  },
  {
    id: "sides",
    name: "Sides",
    icon: "🍟",
    itemNames: [
      "Fries",
      "Garlic Bread",
      "Onion Rings",
      "Chicken Wings",
      "Spring Rolls",
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    icon: "🥤",
    itemNames: ["Coca-Cola", "Lemonade", "Beer", "Mojito"],
  },
  {
    id: "desserts",
    name: "Desserts",
    icon: "🍰",
    itemNames: ["Tiramisu", "Cheesecake", "Chocolate Cake"],
  },
];

function getCategoryIdForItem(itemName: string): string {
  const found = CATEGORY_CONFIG.find((c) =>
    c.itemNames.some((n) => n.toLowerCase() === itemName.toLowerCase())
  );
  return found?.id ?? "other";
}

/** Unique key for grouping: same name + variant + modifiers = same line. */
function getItemKey(item: {
  name: string;
  variant: string | null;
  customizations?: string[];
}): string {
  const mods = [...(item.customizations ?? [])].sort().join("\u0001");
  return `${item.name}\u0000${item.variant ?? ""}\u0000${mods}`;
}

export function groupItemsByCategory(
  orders: AllDayOrder[]
): CategoryGroup[] {
  type OrderRef = {
    orderId: string;
    orderNumber: string;
    tableNumber: string | null;
    customerName: string | null;
    status: string;
    quantity: number;
  };

  const byKey = new Map<
    string,
    {
      name: string;
      variant: string | null;
      customizations: string[];
      count: number;
      orderRefs: OrderRef[];
    }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = getItemKey(item);
      const existing = byKey.get(key);
      const mods = [...(item.customizations ?? [])].sort();
      if (existing) {
        existing.count += item.quantity;
        existing.orderRefs.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          status: order.status,
          quantity: item.quantity,
        });
      } else {
        byKey.set(key, {
          name: item.name,
          variant: item.variant ?? null,
          customizations: mods,
          count: item.quantity,
          orderRefs: [
            {
              orderId: order.id,
              orderNumber: order.orderNumber,
              tableNumber: order.tableNumber,
              customerName: order.customerName,
              status: order.status,
              quantity: item.quantity,
            },
          ],
        });
      }
    });
  });

  const byCategory = new Map<
    string,
    {
      name: string;
      icon: string;
      items: Map<
        string,
        {
          name: string;
          variant: string | null;
          customizations: string[];
          count: number;
          orderRefs: OrderRef[];
        }
      >;
    }
  >();

  CATEGORY_CONFIG.forEach((c) => {
    byCategory.set(c.id, {
      name: c.name,
      icon: c.icon,
      items: new Map(),
    });
  });
  byCategory.set("other", { name: "Other", icon: "📦", items: new Map() });

  byKey.forEach((value, key) => {
    const categoryId = getCategoryIdForItem(value.name);
    const group = byCategory.get(categoryId) ?? byCategory.get("other")!;
    group.items.set(key, value);
  });

  return Array.from(byCategory.entries())
    .filter(([, g]) => g.items.size > 0)
    .map(([id, g]) => {
      const itemList = Array.from(g.items.values()).sort(
        (a, b) => b.count - a.count
      );
      const totalCount = itemList.reduce((s, i) => s + i.count, 0);
      return {
        id,
        name: g.name,
        icon: g.icon,
        totalCount,
        items: itemList,
      };
    });
}

function orderRefLabel(ref: {
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  status: string;
  quantity: number;
}): string {
  const parts = [`#${ref.orderNumber}`];
  if (ref.tableNumber) parts.push(`T-${ref.tableNumber}`);
  else if (ref.customerName) parts.push(ref.customerName);
  parts.push(ref.status.toUpperCase());
  return `${parts.join(" · ")}  × ${ref.quantity}`;
}

interface AllDayViewProps {
  orders: AllDayOrder[];
}

export function AllDayView({ orders }: AllDayViewProps) {
  const { theme, isHighContrast } = useDisplayMode();
  const categories = useMemo(
    () => groupItemsByCategory(orders),
    [orders]
  );
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const hc = isHighContrast ? "border-2 border-white" : "";
  const hcB = isHighContrast ? "border-b-2 border-b-white" : "";

  return (
    <div className={cn("h-full overflow-auto p-6 theme-transition", theme.background, theme.text)}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className={cn("text-xl 2xl:text-2xl font-semibold tracking-tight", isHighContrast && "text-lg 2xl:text-xl", theme.text)}>
          ALL-DAY TOTALS
        </h2>
        <span className={cn("text-base 2xl:text-lg theme-transition", theme.textMuted)}>
          {orders.length} active order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className={cn(
              "overflow-hidden pt-0 pb-0 gap-0 flex-none w-fit min-w-[160px] rounded-xl shadow-sm theme-transition",
              isHighContrast ? "border-2 border-l-2 border-white" : cn("border-l-4", theme.border, theme.columnNewBorder),
              theme.cardBg
            )}
          >
            {/* Header – matches KDS column title (NEW / PREPARING / READY) */}
            <div className={cn("flex items-center justify-between gap-2 px-2 pt-1.5 pb-1.5 2xl:px-3 2xl:pt-2 2xl:pb-2 theme-transition", theme.metadataBg, isHighContrast ? hcB : cn("border-b", theme.border))}>
              <span className={cn("font-semibold text-sm 2xl:text-base uppercase tracking-wide theme-transition", theme.text)}>
                {cat.icon} {cat.name}
              </span>
              <span className={cn("text-sm 2xl:text-base font-medium tabular-nums theme-transition", theme.textMuted)}>
                {cat.totalCount} total
              </span>
            </div>
            {/* Items – same spacing and typography as ticket items */}
            <div className="pt-1.5 px-2 pb-2 2xl:pt-2 2xl:px-3 2xl:pb-3 space-y-0 2xl:space-y-0.5">
              {cat.items.map((item) => {
                const rowKey = `${item.name}\u0000${item.variant ?? ""}\u0000${item.customizations.join("\u0001")}`;
                const isOpen = openItemKey === rowKey;
                const modsDisplay = item.customizations.length > 0
                  ? ` (${item.customizations.join(", ")})`
                  : "";
                const variantDisplay = item.variant ? ` (${item.variant})` : "";

                return (
                  <Popover
                    key={rowKey}
                    open={isOpen}
                    onOpenChange={(open) =>
                      setOpenItemKey(open ? rowKey : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full flex items-baseline gap-2 text-left text-lg 2xl:text-xl leading-snug transition-colors rounded-md py-0.5 2xl:py-1 theme-transition",
                          theme.text,
                          "hover:opacity-90 hover:bg-black/5 dark:hover:bg-white/10",
                          isHighContrast && "hover:bg-white/20"
                        )}
                      >
                        <span className={cn("font-bold tabular-nums theme-transition", theme.text)}>
                          ×{item.count}
                        </span>
                        <span className={cn("font-bold theme-transition", theme.text)}>
                          {item.name}
                        </span>
                        {item.variant && (
                          <span className={cn("text-base 2xl:text-lg font-medium theme-transition", theme.textMuted)}>
                            ({item.variant})
                          </span>
                        )}
                        {item.customizations.length > 0 && (
                          <span className={cn("text-base 2xl:text-lg font-medium theme-transition", theme.textMuted)}>
                            {modsDisplay}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className={cn("w-[320px] p-0 rounded-xl shadow-sm theme-transition", theme.cardBg, isHighContrast ? hc : theme.border, theme.text)}
                      side="right"
                    >
                      <div className={cn("px-2 pt-1.5 pb-2 2xl:px-3 2xl:pt-2 2xl:pb-2 font-bold text-lg 2xl:text-xl theme-transition", isHighContrast ? hcB : "border-b", !isHighContrast && theme.border, theme.text)}>
                        {item.name}
                        {item.variant && (
                          <span className={cn("text-base 2xl:text-lg font-medium theme-transition", theme.textMuted)}>
                            {variantDisplay}
                          </span>
                        )}
                        {item.customizations.length > 0 && (
                          <span className={cn("text-base 2xl:text-lg font-medium theme-transition", theme.textMuted)}>
                            {" "}({item.customizations.join(", ")})
                          </span>
                        )}
                        <span className={cn("font-medium tabular-nums theme-transition", theme.textMuted)}>
                          {" "}× {item.count}
                        </span>
                      </div>
                      <ul className="max-h-[280px] overflow-y-auto">
                        {item.orderRefs.map((ref, i) => (
                          <li
                            key={`${ref.orderId}-${i}`}
                            className={cn("px-2 py-2 2xl:px-3 2xl:py-2 text-sm 2xl:text-base last:border-0 theme-transition", isHighContrast ? hcB : "border-b", !isHighContrast && theme.border, theme.textMuted)}
                          >
                            {orderRefLabel(ref)}
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className={cn("flex flex-col items-center justify-center rounded-lg py-12 text-center theme-transition", isHighContrast ? "border-2 border-dashed border-white" : "border border-dashed", !isHighContrast && theme.border, theme.textMuted)}>
          <p className="font-medium">No items yet</p>
          <p className="text-sm">Orders will appear here as they come in.</p>
        </div>
      )}
    </div>
  );
}
