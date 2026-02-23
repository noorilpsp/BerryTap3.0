"use client";

import React from "react"

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/lib/menu-data";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart?: (itemId: string) => void;
  onItemClick?: (item: MenuItem) => void;
  quantity?: number;
}

export function MenuItemCard({
  item,
  onAddToCart,
  onRemoveFromCart,
  onItemClick,
  quantity = 0,
}: MenuItemCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isSoldOut = item.status === "soldout";
  const isInCart = quantity > 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onAddToCart(item);
  };

  return (
    <div
      onClick={() => onItemClick?.(item)}
      className={`flex gap-3 cursor-pointer ${
        isSoldOut ? "opacity-60" : ""
      }`}
    >
      {/* Text Content */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex flex-col gap-1">
          <h3
            className={`font-semibold text-foreground ${
              isSoldOut ? "text-muted-foreground" : ""
            }`}
          >
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          {item.tags.length > 0 && (
            <div className="flex gap-1">
              {item.tags.map((tag) => {
                let toneClass =
                  "border-zinc-400/35 bg-zinc-500/15 text-zinc-800 dark:text-zinc-200 vivid:text-zinc-100";
                const tagEmoji =
                  tag === "Vegetarian"
                    ? "🌱"
                    : tag === "Spicy"
                      ? "🌶️"
                      : "";

                if (tag === "Vegetarian") {
                  toneClass =
                    "border-emerald-400/45 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 vivid:text-emerald-100";
                } else if (tag === "Spicy") {
                  toneClass =
                    "border-rose-400/45 bg-rose-500/20 text-rose-800 dark:text-rose-200 vivid:text-rose-100";
                } else if (tag === "Gluten-Free") {
                  toneClass =
                    "border-sky-400/45 bg-sky-500/20 text-sky-800 dark:text-sky-200 vivid:text-sky-100";
                }

                return (
                  <span
                    key={tag}
                    className={`sheen-overlay relative inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md ring-1 ring-white/10 ${toneClass}`}
                  >
                    {tagEmoji}
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
          <p className="font-semibold text-foreground">
            €{item.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Image with Add/Quantity Controls */}
      <div className="menu-item-controls relative shrink-0 h-28 w-28">
        <div className="relative h-full w-full overflow-hidden rounded-lg flex items-center justify-center">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className={`object-cover ${isSoldOut ? "grayscale" : ""}`}
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge
                variant="destructive"
                className="text-xs font-semibold"
              >
                Sold Out
              </Badge>
            </div>
          )}
          {!isSoldOut && (
            <>
              {!isInCart ? (
                <button
                  type="button"
                  onClick={handleAddClick}
                  className={`sheen-overlay absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/26 bg-black/78 text-white backdrop-blur-2xl shadow-[0_10px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/10 hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84 transition-all ${
                    isPressed ? "scale-125" : "scale-100"
                  }`}
                  style={{
                    transitionDuration: "200ms",
                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  aria-label={`Add ${item.name} to cart`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : (
                <div className="sheen-overlay absolute bottom-1 right-1 flex items-center gap-1.5 rounded-full border border-white/26 bg-black/78 px-2 py-1 text-white backdrop-blur-2xl shadow-[0_10px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/10 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromCart?.(item.id);
                    }}
                    className="sheen-overlay relative flex h-6 w-6 items-center justify-center rounded-full border border-white/26 bg-black/78 text-white backdrop-blur-2xl ring-1 ring-white/10 transition-colors hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    {quantity === 1 ? (
                      <Trash2 className="h-4 w-4 text-current" />
                    ) : (
                      <Minus className="h-4 w-4 text-current" />
                    )}
                  </button>
                  <span className="w-4 text-center text-xs font-semibold text-current">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className={`sheen-overlay relative flex h-6 w-6 items-center justify-center rounded-full border border-white/26 bg-black/78 text-white backdrop-blur-2xl ring-1 ring-white/10 transition-all hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84 ${
                      isPressed ? "scale-125" : "scale-100"
                    }`}
                    style={{
                      transitionDuration: "200ms",
                      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    aria-label={`Add more ${item.name}`}
                  >
                    <Plus className="h-4 w-4 text-current" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
