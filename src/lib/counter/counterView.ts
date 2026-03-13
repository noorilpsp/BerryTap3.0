/**
 * Counter read model. Initial menu data for /counter.
 * Draft/cart state stays client-side; this is read-only initial data.
 */

import type { MenuItem, Category } from "@/lib/take-order-data";

export interface CounterViewCustomizationOption {
  id: string;
  name: string;
  price: string | number;
  displayOrder?: number;
}

export interface CounterViewCustomizationGroup {
  id: string;
  name: string;
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number | null;
  options?: CounterViewCustomizationOption[];
}

export interface CounterView {
  location: {
    id: string;
    name?: string;
  };
  menu: {
    items: MenuItem[];
    categories: Category[];
    customizations: CounterViewCustomizationGroup[];
  };
}

export function isCounterView(value: unknown): value is CounterView {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.location || typeof v.location !== "object") return false;
  const loc = v.location as Record<string, unknown>;
  if (typeof loc.id !== "string") return false;
  if (!v.menu || typeof v.menu !== "object") return false;
  const menu = v.menu as Record<string, unknown>;
  if (!Array.isArray(menu.items) || !Array.isArray(menu.categories) || !Array.isArray(menu.customizations)) return false;
  return true;
}
