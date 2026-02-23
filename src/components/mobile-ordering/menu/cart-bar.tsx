"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import type { CartItem, MenuItem } from "@/lib/menu-data";
import { restaurant } from "@/lib/menu-data";
import { customizationGroups } from "@/lib/menu-item-modal-data";

interface CartBarProps {
  items: CartItem[];
  total: number;
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onItemClick: (item: CartItem, menuItem: MenuItem) => void;
  hideTrigger?: boolean;
  externalOpenSignal?: number;
}

function getCustomizationParts(
  groupId: string,
  optionIds: string[]
): { groupName: string; optionNames: string } | null {
  const group = customizationGroups.find((entry) => entry.id === groupId);
  if (!group) return null;

  const optionNames = optionIds
    .map((optionId) => group.options.find((option) => option.id === optionId)?.name || optionId)
    .join(", ");

  return { groupName: group.name, optionNames };
}

export function CartBar({
  items,
  total,
  menuItems,
  onAddToCart,
  onRemoveFromCart,
  onItemClick,
  hideTrigger = false,
  externalOpenSignal,
}: CartBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = total;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const cartTotal = subtotal + tax;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!externalOpenSignal || externalOpenSignal <= 0) return;
    setIsOpen(true);
  }, [externalOpenSignal]);

  const cartButtonClass =
    "sheen-overlay relative flex min-h-12 w-full items-center justify-between rounded-xl border border-white/26 bg-black/78 px-4 py-3 text-white backdrop-blur-2xl shadow-[0_14px_30px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition-transform duration-200 hover:bg-black/84 active:scale-[0.99] dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84";
  const qtyWrapClass =
    "sheen-overlay relative flex h-fit flex-shrink-0 items-center gap-1 rounded-full border border-white/26 bg-black/78 px-1.5 py-1 text-white backdrop-blur-2xl shadow-[0_10px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/10 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl";
  const qtyButtonClass =
    "sheen-overlay relative flex h-7 w-7 items-center justify-center rounded-full border border-white/26 bg-black/78 text-white backdrop-blur-2xl ring-1 ring-white/10 transition-colors hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84";

  return (
    <>
      {!hideTrigger && (
        <div className="menu-item-controls fixed bottom-4 left-4 right-4 z-[var(--z-bottom-bar)]">
          <button type="button" className={cartButtonClass} onClick={() => setIsOpen(true)}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">View Cart</span>
              {itemCount > 0 ? <span className="font-semibold">({itemCount})</span> : null}
            </div>
            <span className="text-lg font-bold">
              {itemCount > 0 ? `€${cartTotal.toFixed(2)}` : "Empty"}
            </span>
          </button>
        </div>
      )}

      {mounted &&
        isOpen &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[54] bg-black/30"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart drawer"
            />

            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[55]">
              <div className="pointer-events-auto mx-auto w-full max-w-md pb-[env(safe-area-inset-bottom)]">
                <div className="liquid-glass animate-in slide-in-from-bottom-6 fade-in-0 rounded-t-2xl border-t border-border/90 bg-card/95 shadow-2xl shadow-black/45 backdrop-blur-xl duration-300">
                  <div className="flex h-8 items-center justify-center">
                    <div className="h-1 w-12 rounded-full bg-border" />
                  </div>

                  <div className="max-h-[78vh] overflow-y-auto px-4 pb-4">
                    <div className="flex items-center justify-between pb-4">
                      <ShoppingCart className="h-6 w-6 text-foreground" />
                      <p className="flex-1 text-center text-xl font-bold text-foreground">Your Cart</p>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-colors hover:bg-background/90 hover:text-foreground"
                        aria-label="Close cart"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="mb-4 text-sm font-semibold text-foreground">{restaurant.name}</p>

                    {items.length === 0 ? (
                      <div className="py-8">
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                          <div className="text-5xl">🍽️</div>
                          <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
                          <p className="text-sm text-muted-foreground">
                            Browse the menu to add items
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className={`${cartButtonClass} justify-center`}
                        >
                          Browse Menu
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 space-y-4 py-2">
                          {items.map((cartItem) => {
                            const menuItem = menuItems.find((entry) => entry.id === cartItem.id);
                            if (!menuItem) return null;

                            return (
                              <div key={cartItem.id} className="border-b border-border/70 pb-6 last:border-b-0">
                                <div
                                  className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
                                  onClick={() => {
                                    onItemClick(cartItem, menuItem);
                                    setIsOpen(false);
                                  }}
                                >
                                  <img
                                    src={menuItem.image || "/placeholder.svg"}
                                    alt={menuItem.name}
                                    className="h-16 w-16 flex-shrink-0 rounded object-cover"
                                  />

                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <p className="text-base font-semibold text-foreground">
                                      {menuItem.name}
                                    </p>

                                    {(cartItem.selectedOptions ||
                                      cartItem.sauceQuantities ||
                                      cartItem.specialInstructions) && (
                                      <div className="mt-1 space-y-1">
                                        {cartItem.selectedOptions &&
                                          Object.entries(cartItem.selectedOptions).map(
                                            ([groupId, optionIds]) => {
                                              const parts = getCustomizationParts(groupId, optionIds);
                                              return parts ? (
                                                <p key={groupId} className="text-sm">
                                                  <span className="text-foreground/80">
                                                    {parts.groupName}:
                                                  </span>
                                                  <span className="ml-1 text-muted-foreground">
                                                    {parts.optionNames}
                                                  </span>
                                                </p>
                                              ) : null;
                                            }
                                          )}
                                        {cartItem.sauceQuantities &&
                                          Object.entries(cartItem.sauceQuantities).map(
                                            ([sauceId, qty]) =>
                                              qty > 0 ? (
                                                <p key={sauceId} className="text-sm">
                                                  <span className="text-foreground/80">
                                                    Extra Sauce:
                                                  </span>
                                                  <span className="ml-1 text-muted-foreground">
                                                    {sauceId} x{qty}
                                                  </span>
                                                </p>
                                              ) : null
                                          )}
                                        {cartItem.specialInstructions && (
                                          <p className="text-sm">
                                            <span className="text-foreground/80">
                                              Special Instructions:
                                            </span>
                                            <span className="ml-1 text-muted-foreground">
                                              {cartItem.specialInstructions}
                                            </span>
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                                      €{menuItem.price.toFixed(2)}
                                    </p>
                                  </div>

                                  <div className={`menu-item-controls ${qtyWrapClass}`} onClick={(event) => event.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => onRemoveFromCart(cartItem.id)}
                                      className={qtyButtonClass}
                                      aria-label={`Remove ${menuItem.name}`}
                                    >
                                      {cartItem.quantity === 1 ? (
                                        <Trash2 className="h-4 w-4 text-current" />
                                      ) : (
                                        <Minus className="h-4 w-4 text-current" />
                                      )}
                                    </button>
                                    <span className="w-4 text-center text-xs font-semibold text-current">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onAddToCart(menuItem)}
                                      className={qtyButtonClass}
                                      aria-label={`Add ${menuItem.name}`}
                                    >
                                      <Plus className="h-4 w-4 text-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Subtotal</span>
                            <span className="text-base font-semibold text-foreground">
                              €{subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Tax</span>
                            <span className="text-base font-semibold text-foreground">
                              €{tax.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">Total</span>
                            <span className="text-lg font-bold text-foreground">
                              €{cartTotal.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`${cartButtonClass} mt-3 justify-center`}
                            onClick={() => {
                              setIsOpen(false);
                              router.push("/mobile/checkout");
                            }}
                          >
                            Proceed to Checkout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
