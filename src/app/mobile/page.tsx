"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/mobile-ordering/menu/hero-section";
import { CategoryTabs } from "@/components/mobile-ordering/menu/category-tabs";
import { MenuItemCard } from "@/components/mobile-ordering/menu/menu-item-card";
import { InfoSheet } from "@/components/mobile-ordering/menu/info-sheet";
import { ItemDetailModal } from "@/components/mobile-ordering/menu/item-detail-modal";
import { FeaturedSection } from "@/components/mobile-ordering/menu/featured-section";
import { CartBar } from "@/components/mobile-ordering/menu/cart-bar";
import { ContextPill } from "@/components/mobile-ordering/menu/context-pill";
import type { ThemePreview } from "@/components/mobile-ordering/menu/context-pill";
import { SmartBottomBar } from "@/components/mobile-ordering/menu/smart-bottom-bar";
import { CheckCircle2, Bell } from "lucide-react";
import { menuItems, categories, type MenuItem, type CartItem } from "@/lib/menu-data";

type OrderType = "dine-in" | "pickup";
type ToastType = "success" | "warning";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export default function MobileMenuPage() {
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState("5");
  const [checkRequested, setCheckRequested] = useState(false);
  const [waiterLastCalled, setWaiterLastCalled] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | MenuItem | null>(null);
  const [cartOpenSignal, setCartOpenSignal] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuTheme, setMenuTheme] = useState<ThemePreview>("classic");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [tick, setTick] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([
    { id: "1", name: "Margherita", quantity: 1, price: 12.0 },
    { id: "2", name: "Pepperoni", quantity: 1, price: 14.0 },
  ]);

  const tabsSentinelRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemePreview | null;
    if (saved && ["classic", "night", "vivid"].includes(saved)) {
      setMenuTheme(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "vivid");
    if (menuTheme === "night") root.classList.add("dark");
    else if (menuTheme === "vivid") root.classList.add("vivid");
    localStorage.setItem("theme", menuTheme);
  }, [menuTheme]);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isChrome =
      /Chrome\/\d+/.test(ua) &&
      !/Edg\/|OPR\/|Vivaldi|Brave|YaBrowser|SamsungBrowser/.test(ua);
    document.documentElement.classList.toggle("browser-chrome", isChrome);

    return () => {
      document.documentElement.classList.remove("browser-chrome");
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const nextToast: ToastState = { id: Date.now(), message, type };
    setToast(nextToast);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const waiterCooldownSeconds = waiterLastCalled
    ? Math.max(0, 60 - Math.floor((Date.now() - waiterLastCalled) / 1000))
    : 0;

  const handleCallWaiter = useCallback(() => {
    if (orderType !== "dine-in") {
      showToast("Waiter call is only available for dine-in", "warning");
      return;
    }

    if (waiterCooldownSeconds > 0) {
      showToast("Already notified — your waiter is on the way", "warning");
      return;
    }

    setWaiterLastCalled(Date.now());
    showToast("Waiter notified ✓", "success");
  }, [orderType, showToast, waiterCooldownSeconds]);

  useEffect(() => {
    if (isSearchOpen) return;
    if (!tabsContainerRef.current) return;

    const tabBtn = tabsContainerRef.current.querySelector(
      `[data-category-id="${activeCategory}"]`
    ) as HTMLElement;

    if (tabBtn) {
      const container = tabsContainerRef.current;
      const scrollLeft =
        tabBtn.offsetLeft - container.offsetWidth / 2 + tabBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory, isSearchOpen]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    if (isSearchOpen) return;
    const element = categoryRefs.current[categoryId];
    if (element) {
      const topOffset = isTabsSticky ? 70 : 126;
      const targetY = element.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
      setActiveCategory(categoryId);
    }
  }, [isSearchOpen, isTabsSticky]);

  const handleAddToCart = useCallback((item: MenuItem | CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        const isUpdatingCustomizations =
          "selectedOptions" in item || "sauceQuantities" in item || "specialInstructions" in item;
        if (isUpdatingCustomizations) {
          return prevCart.map((cartItem) =>
            cartItem.id === item.id
              ? ({ ...item, quantity: cartItem.quantity } as CartItem)
              : cartItem
          );
        }
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 } as CartItem];
    });
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter((item) => {
        if (!normalizedQuery) return true;
        const categoryName = categories.find((c) => c.id === item.categoryId)?.name ?? "";
        const haystack = [item.name, item.description, categoryName, ...item.tags].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    [normalizedQuery]
  );
  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        filteredMenuItems.some((item) => item.categoryId === category.id)
      ),
    [filteredMenuItems]
  );

  useEffect(() => {
    if (visibleCategories.length === 0) return;
    if (!visibleCategories.some((category) => category.id === activeCategory)) {
      setActiveCategory(visibleCategories[0].id);
    }
  }, [activeCategory, visibleCategories]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  }, []);

  const themedToastClass =
    menuTheme === "classic"
      ? "border border-white/24 bg-black/78 text-white ring-1 ring-white/10 shadow-[0_12px_26px_rgba(0,0,0,0.45)]"
      : menuTheme === "night"
        ? "border border-blue-300/30 bg-blue-900/60 text-blue-100"
        : "border border-white/60 bg-white/72 text-black";

  useEffect(() => {
    if (isSearchOpen || visibleCategories.length === 0) return;

    let frameId = 0;
    const updateActiveCategoryFromScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;

        const anchorY = isTabsSticky ? 86 : 170;
        let nextActiveId = visibleCategories[0].id;

        for (const category of visibleCategories) {
          const section = categoryRefs.current[category.id];
          if (!section) continue;

          if (section.getBoundingClientRect().top <= anchorY) {
            nextActiveId = category.id;
          } else {
            break;
          }
        }

        setActiveCategory((prev) => (prev === nextActiveId ? prev : nextActiveId));
      });
    };

    updateActiveCategoryFromScroll();
    window.addEventListener("scroll", updateActiveCategoryFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveCategoryFromScroll);

    return () => {
      window.removeEventListener("scroll", updateActiveCategoryFromScroll);
      window.removeEventListener("resize", updateActiveCategoryFromScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [isSearchOpen, isTabsSticky, visibleCategories]);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTabsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const categoryBarHeightClass = "h-[58px]";

  return (
    <div className="min-h-screen pb-36">
      <HeroSection
        onInfoClick={() => setIsInfoOpen(true)}
        topRightSlot={
          <ContextPill
            compact
            orderType={orderType}
            tableNumber={tableNumber}
            checkRequested={checkRequested}
            theme={menuTheme}
            onThemeChange={setMenuTheme}
            onOrderTypeChange={(next) => {
              setOrderType(next);
              if (next === "pickup") setCheckRequested(false);
            }}
            onTableNumberChange={setTableNumber}
            onToast={showToast}
          />
        }
      />

      <div ref={tabsSentinelRef} className="h-0" aria-hidden />

      {isTabsSticky && <div className={categoryBarHeightClass} aria-hidden />}

      <div
        className={
          isTabsSticky
            ? "fixed inset-x-0 top-0 z-[var(--z-sticky)] isolate"
            : "relative z-[var(--z-hero)] isolate"
        }
      >
        <div className="pointer-events-auto">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryClick}
            isSticky={isTabsSticky}
            tabsContainerRef={tabsContainerRef}
            isSearchOpen={isSearchOpen}
            searchQuery={searchQuery}
            onSearchOpenChange={setIsSearchOpen}
            onSearchQueryChange={setSearchQuery}
          />
        </div>
      </div>

      {!isSearchOpen && (
        <FeaturedSection
          items={menuItems.filter((item) => item.featured)}
          cartItems={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onItemClick={setSelectedItem}
        />
      )}

      <div className="h-px bg-border/70 mx-4" />

      <div>
        {visibleCategories.map((category, categoryIndex) => (
          <div key={category.id}>
            <div
              ref={(el) => {
                if (!isSearchOpen) categoryRefs.current[category.id] = el;
              }}
              data-category-id={category.id}
              className={`px-4 py-4 mb-2 ${isSearchOpen ? "" : "scroll-mt-16"}`}
            >
              {filteredMenuItems.filter((item) => item.categoryId === category.id).length > 0 && (
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {category.emoji} {category.name}
                </h2>
              )}

              {filteredMenuItems
                .filter((item) => item.categoryId === category.id)
                .map((item, index) => {
                  const cartItem = cart.find((c) => c.id === item.id);
                  const itemsInCategory = filteredMenuItems.filter(
                    (i) => i.categoryId === category.id
                  );
                  return (
                    <div key={item.id}>
                      <MenuItemCard
                        item={item}
                        onAddToCart={handleAddToCart}
                        onRemoveFromCart={handleRemoveFromCart}
                        onItemClick={setSelectedItem}
                        quantity={cartItem?.quantity || 0}
                      />
                      {index < itemsInCategory.length - 1 && (
                        <div className="h-px bg-border my-3" />
                      )}
                    </div>
                  );
                })}

              {filteredMenuItems.filter((item) => item.categoryId === category.id).length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No items available in this category</p>
                </div>
              )}
            </div>

            {categoryIndex < visibleCategories.length - 1 && (
              <div className="h-px bg-border/70 mx-4" />
            )}
          </div>
        ))}

        {isSearchOpen && filteredMenuItems.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-base font-semibold text-foreground">No matching items</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another keyword.</p>
          </div>
        )}
      </div>

      <InfoSheet open={isInfoOpen} onOpenChange={setIsInfoOpen} />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      <SmartBottomBar
        orderType={orderType}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        total={cartTotal}
        waiterCooldownSeconds={waiterCooldownSeconds}
        onCallWaiter={handleCallWaiter}
        onRequestCheck={() => setCheckRequested(true)}
        onViewCart={() => setCartOpenSignal((prev) => prev + 1)}
        onToast={showToast}
      />

      <CartBar
        items={cart}
        total={cartTotal}
        menuItems={menuItems}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onItemClick={(cartItem) => setSelectedItem(cartItem)}
        hideTrigger
        externalOpenSignal={cartOpenSignal}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-[var(--z-toast)] w-full max-w-[320px] -translate-x-1/2 px-3">
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`sheen-overlay relative animate-in slide-in-from-bottom-4 fade-in-0 rounded-xl px-4 py-3 text-sm font-medium shadow-xl duration-200 ${themedToastClass} backdrop-blur`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <span className="sr-only">Tick: {tick}</span>
    </div>
  );
}
