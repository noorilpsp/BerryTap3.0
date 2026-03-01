"use client";

import { useState, useEffect, useCallback } from "react";
import type { MenuItem, Category } from "@/lib/take-order-data";

interface ApiItem {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  photoUrl?: string | null;
  status?: string;
  categories?: string[];
  tags?: string[];
  customizationGroups?: string[];
  [key: string]: unknown;
}

interface ApiCategory {
  id: string;
  name: string;
  emoji?: string | null;
  displayOrder?: number;
  [key: string]: unknown;
}

interface ApiCustomizationOption {
  id: string;
  name: string;
  price: string | number;
  displayOrder?: number;
}

interface ApiCustomizationGroup {
  id: string;
  name: string;
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number | null;
  options?: ApiCustomizationOption[];
  [key: string]: unknown;
}

const CATEGORY_ICONS: Record<string, string> = {
  drinks: "🍹",
  starters: "🥗",
  mains: "🍽️",
  desserts: "🍰",
  food: "🍽️",
  default: "📋",
};

function mapCategory(api: ApiCategory): Category {
  const nameLower = (api.name || "").toLowerCase();
  const icon =
    api.emoji?.trim() ||
    CATEGORY_ICONS[nameLower] ||
    CATEGORY_ICONS[api.id?.toLowerCase()] ||
    CATEGORY_ICONS.default;
  return {
    id: api.id,
    name: api.name || "Uncategorized",
    icon,
  };
}

function mapItem(
  api: ApiItem,
  groupMap: Map<string, ApiCustomizationGroup>
): MenuItem {
  const price = typeof api.price === "string" ? parseFloat(api.price) : Number(api.price);
  const categoryId = api.categories?.[0] ?? "uncategorized";
  const available =
    api.status !== "hidden" && api.status !== "soldout" && api.status !== "draft";

  const options: MenuItem["options"] = [];

  for (const groupId of api.customizationGroups ?? []) {
    const group = groupMap.get(groupId);
    if (!group?.options?.length) continue;

    const choices: (string | { name: string; price: number })[] = group.options
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((opt) => {
        const p = typeof opt.price === "string" ? parseFloat(opt.price) : Number(opt.price);
        if (p > 0) return { name: opt.name, price: p };
        return opt.name;
      });

    options.push({
      name: group.name || "Options",
      required: !!group.isRequired || (group.minSelections ?? 0) > 0,
      choices,
    });
  }

  const extras: { name: string; price: number }[] = [];

  const dietary = (api.tags ?? [])
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().replace(/\s+/g, "_"));

  return {
    id: api.id,
    name: api.name || "Item",
    description: api.description ?? "",
    price: Number.isFinite(price) ? price : 0,
    category: categoryId,
    image: api.photoUrl ?? "",
    dietary,
    options,
    extras: extras.length > 0 ? extras : undefined,
    available,
  };
}

export function useLocationMenu(locationId: string | null) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!locationId) {
      setMenuItems([]);
      setCategories([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [itemsRes, categoriesRes, customizationsRes] = await Promise.all([
        fetch(`/api/items?locationId=${encodeURIComponent(locationId)}`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/categories?locationId=${encodeURIComponent(locationId)}`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/customizations?locationId=${encodeURIComponent(locationId)}`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!itemsRes.ok || !categoriesRes.ok || !customizationsRes.ok) {
        const msg =
          !itemsRes.ok
            ? await itemsRes.text()
            : !categoriesRes.ok
              ? await categoriesRes.text()
              : await customizationsRes.text();
        throw new Error(msg || "Failed to load menu");
      }

      const [itemsPayload, categoriesPayload, customizationsPayload] = await Promise.all([
        itemsRes.json() as Promise<{ ok?: boolean; data?: ApiItem[] }>,
        categoriesRes.json() as Promise<{ ok?: boolean; data?: ApiCategory[] }>,
        customizationsRes.json() as Promise<{ ok?: boolean; data?: ApiCustomizationGroup[] }>,
      ]);
      const itemsList = itemsPayload?.ok && Array.isArray(itemsPayload.data) ? itemsPayload.data : [];
      const categoriesList = categoriesPayload?.ok && Array.isArray(categoriesPayload.data) ? categoriesPayload.data : [];
      const customizationsList = customizationsPayload?.ok && Array.isArray(customizationsPayload.data) ? customizationsPayload.data : [];

      const groupMap = new Map<string, ApiCustomizationGroup>();
      for (const g of customizationsList ?? []) {
        groupMap.set(g.id, g);
      }

      const mappedCategories = (categoriesList ?? []).map(mapCategory);
      const uncategorized: Category = {
        id: "uncategorized",
        name: "Uncategorized",
        icon: CATEGORY_ICONS.default,
      };
      const categoryIds = new Set(mappedCategories.map((c) => c.id));
      if (!categoryIds.has("uncategorized")) {
        mappedCategories.push(uncategorized);
      }

      const mappedItems = (itemsList ?? []).map((item) => mapItem(item, groupMap));

      setCategories(mappedCategories);
      setMenuItems(mappedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menuItems,
    categories,
    loading,
    error,
    refetch: fetchMenu,
  };
}
