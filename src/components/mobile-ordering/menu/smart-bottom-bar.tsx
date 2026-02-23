"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Bell,
  CreditCard,
  Droplets,
  FileText,
  GripHorizontal,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type OrderType = "dine-in" | "pickup";
type ToastType = "success" | "warning";

interface SmartBottomBarProps {
  orderType: OrderType;
  cartCount: number;
  total: number;
  waiterCooldownSeconds: number;
  onCallWaiter: () => void;
  onRequestCheck: () => void;
  onViewCart: () => void;
  onToast: (message: string, type?: ToastType) => void;
}

function formatEuro(value: number) {
  return `€${value.toFixed(2)}`;
}

export function SmartBottomBar({
  orderType,
  cartCount,
  total,
  waiterCooldownSeconds,
  onCallWaiter,
  onRequestCheck,
  onViewCart,
  onToast,
}: SmartBottomBarProps) {
  const [mounted, setMounted] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [requestCheckOpen, setRequestCheckOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [specialOpen, setSpecialOpen] = useState(false);
  const [specialRequest, setSpecialRequest] = useState("");
  const [waterOpen, setWaterOpen] = useState(false);

  const handleRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  const perPerson = useMemo(() => {
    if (splitCount <= 0) return 0;
    return total / splitCount;
  }, [splitCount, total]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (trayOpen) {
      const timeout = setTimeout(() => firstActionRef.current?.focus(), 120);
      return () => clearTimeout(timeout);
    }
    handleRef.current?.focus();
  }, [trayOpen]);

  useEffect(() => {
    if (!trayOpen) {
      setSpecialOpen(false);
      setWaterOpen(false);
    }
  }, [trayOpen]);

  const handleTouchEnd = (touchY: number) => {
    if (touchStartY === null) return;
    const diff = touchStartY - touchY;
    if (diff > 50) setTrayOpen(true);
    if (diff < -50) setTrayOpen(false);
    setTouchStartY(null);
  };

  const ActionRow = ({
    icon,
    title,
    subtitle,
    onClick,
    destructive,
    buttonRef,
    ariaLabel,
  }: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
    destructive?: boolean;
    buttonRef?: RefObject<HTMLButtonElement | null>;
    ariaLabel?: string;
  }) => (
    <button
      ref={buttonRef}
      type="button"
      className={`w-full min-h-14 rounded-xl px-3 py-3 text-left transition-colors ${
        destructive ? "hover:bg-rose-500/10" : "hover:bg-emerald-500/10"
      }`}
      onClick={onClick}
      aria-label={ariaLabel ?? title}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${destructive ? "text-rose-500" : "text-muted-foreground"}`}>{icon}</span>
        <div>
          <p className={`text-sm font-semibold ${destructive ? "text-rose-500" : "text-foreground"}`}>{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </button>
  );

  if (!mounted) return null;

  const portalTarget = document.body;

  return createPortal(
    <>
      {trayOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[49] bg-black/35"
          onClick={() => setTrayOpen(false)}
          aria-label="Close actions tray"
        />
      )}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-bottom-bar)]"
        style={{ position: "fixed", left: 0, right: 0, bottom: 0 }}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-md pb-[env(safe-area-inset-bottom)]">
          <div
            className={`smart-bottom-bar liquid-glass rounded-t-2xl border-t backdrop-blur-xl ${
              trayOpen
                ? "border-border/90 bg-card/95 shadow-2xl shadow-black/45"
                : "border-border/70 bg-card/85 shadow-lg shadow-black/30"
            }`}
          >
            {trayOpen && (
              <div className="animate-in slide-in-from-bottom-6 fade-in-0 max-h-[360px] overflow-y-auto px-2 pb-2 pt-2 duration-300">
                {orderType === "dine-in" ? (
                  <>
                    <ActionRow
                      buttonRef={firstActionRef}
                      icon={<Bell className="h-4 w-4" />}
                      title={waiterCooldownSeconds > 0 ? "Waiter called" : "Call Waiter"}
                      subtitle={
                        waiterCooldownSeconds > 0
                          ? `${60 - waiterCooldownSeconds}s ago`
                          : "Tap to notify your server"
                      }
                      ariaLabel={
                        waiterCooldownSeconds > 0
                          ? `Waiter already called, ${60 - waiterCooldownSeconds} seconds ago`
                          : "Call waiter"
                      }
                      onClick={() => {
                        onCallWaiter();
                        setTrayOpen(false);
                      }}
                    />
                    <Separator className="bg-border/70" />

                    <ActionRow
                      icon={<CreditCard className="h-4 w-4" />}
                      title="Request Check"
                      subtitle="Ask for the bill"
                      onClick={() => setRequestCheckOpen(true)}
                    />
                    <Separator className="bg-border/70" />

                    <ActionRow
                      icon={<Users className="h-4 w-4" />}
                      title="Split Bill"
                      subtitle="Divide by seat or custom"
                      onClick={() => setSplitOpen(true)}
                    />
                    <Separator className="bg-border/70" />

                    <div>
                      <ActionRow
                        icon={<Droplets className="h-4 w-4" />}
                        title="Order Water"
                        subtitle="Still, sparkling, or tap"
                        onClick={() => setWaterOpen((prev) => !prev)}
                      />
                      {waterOpen && (
                        <div className="animate-in slide-in-from-bottom-2 fade-in-0 mb-2 flex gap-2 px-3">
                          {[
                            { id: "still", label: "Still", icon: "💧" },
                            { id: "sparkling", label: "Sparkling", icon: "✨" },
                            { id: "tap", label: "Tap", icon: "🚰" },
                          ].map((option) => (
                            <Button
                              key={option.id}
                              type="button"
                              className="h-9 rounded-full border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                onToast(`${option.label} water on the way ✓`);
                                setWaterOpen(false);
                                setTrayOpen(false);
                              }}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Separator className="bg-border/70" />

                    <div>
                      <ActionRow
                        icon={<FileText className="h-4 w-4" />}
                        title="Special Request"
                        subtitle="Send a note to the kitchen"
                        onClick={() => setSpecialOpen((prev) => !prev)}
                      />
                      {specialOpen && (
                        <div className="animate-in slide-in-from-bottom-2 fade-in-0 space-y-2 px-3 pb-2">
                          <Textarea
                            value={specialRequest}
                            onChange={(event) => setSpecialRequest(event.target.value)}
                            maxLength={150}
                            placeholder="E.g., extra napkins, less spicy, allergy alert..."
                            className="min-h-20 border-input bg-background text-foreground"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{specialRequest.length}/150</span>
                            <Button
                              type="button"
                              className="sheen-overlay relative h-9 border border-white/26 bg-black/78 text-white backdrop-blur-2xl shadow-[0_10px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/10 hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84"
                              onClick={() => {
                                if (!specialRequest.trim()) return;
                                onToast("Request sent to kitchen ✓");
                                setSpecialRequest("");
                                setSpecialOpen(false);
                                setTrayOpen(false);
                              }}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <ActionRow
                      buttonRef={firstActionRef}
                      icon={<Phone className="h-4 w-4" />}
                      title="Call Restaurant"
                      subtitle="+32 2 123 4567"
                      onClick={() => {
                        onToast("Calling restaurant...");
                        setTrayOpen(false);
                      }}
                    />
                    <Separator className="bg-border/70" />

                    <ActionRow
                      icon={<CreditCard className="h-4 w-4" />}
                      title="Update Pickup Time"
                      subtitle="Change your arrival time"
                      onClick={() => {
                        onToast("Pickup time update coming soon", "warning");
                        setTrayOpen(false);
                      }}
                    />
                    <Separator className="bg-border/70" />

                    <ActionRow
                      icon={<FileText className="h-4 w-4" />}
                      title="Special Request"
                      subtitle="Send a note to the kitchen"
                      onClick={() => setSpecialOpen((prev) => !prev)}
                    />
                    {specialOpen && (
                      <div className="animate-in slide-in-from-bottom-2 fade-in-0 space-y-2 px-3 pb-2">
                        <Textarea
                          value={specialRequest}
                          onChange={(event) => setSpecialRequest(event.target.value)}
                          maxLength={150}
                          placeholder="E.g., ring when outside, add cutlery"
                          className="min-h-20 border-input bg-background text-foreground"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{specialRequest.length}/150</span>
                          <Button
                            type="button"
                            className="sheen-overlay relative h-9 border border-white/26 bg-black/78 text-white backdrop-blur-2xl shadow-[0_10px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/10 hover:bg-black/84 dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84"
                            onClick={() => {
                              if (!specialRequest.trim()) return;
                              onToast("Request sent to kitchen ✓");
                              setSpecialRequest("");
                              setSpecialOpen(false);
                              setTrayOpen(false);
                            }}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                    <Separator className="bg-border/70" />

                    <ActionRow
                      icon={<XCircle className="h-4 w-4" />}
                      title="Cancel Order"
                      subtitle="Cancel your pickup order"
                      destructive
                      onClick={() => {
                        onToast("Cancel flow coming soon", "warning");
                        setTrayOpen(false);
                      }}
                    />
                  </>
                )}

                <Separator className="my-2 h-px bg-border/80" />
              </div>
            )}

            <button
              ref={handleRef}
              type="button"
              role="button"
              aria-label="Swipe up for table actions"
              className="smart-bottom-bar-grip flex h-8 w-full items-center justify-center"
              onClick={() => setTrayOpen((prev) => !prev)}
              onTouchStart={(event) => setTouchStartY(event.touches[0].clientY)}
              onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientY)}
            >
              <GripHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="px-4 pb-4 pt-1">
              {cartCount > 0 ? (
                <button
                  type="button"
                  role="button"
                  aria-label={`View cart, ${cartCount} items, ${formatEuro(total)}`}
                  className="sheen-overlay relative flex min-h-[52px] w-full items-center justify-between rounded-xl border border-white/26 bg-black/78 px-4 py-3 text-white backdrop-blur-2xl shadow-[0_14px_30px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition-transform duration-200 hover:bg-black/84 active:scale-[0.99] dark:border-blue-300/25 dark:bg-blue-900/55 dark:text-blue-100 dark:backdrop-blur-xl dark:hover:bg-blue-900/70 vivid:border-white/55 vivid:bg-white/72 vivid:text-black vivid:backdrop-blur-xl vivid:hover:bg-white/84"
                  onClick={onViewCart}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm font-semibold">View Cart ({cartCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{formatEuro(total)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
                  onClick={onCallWaiter}
                >
                  <Bell className="bell-wobble h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-sm">Need anything? Call your waiter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={requestCheckOpen} onOpenChange={setRequestCheckOpen}>
        <DialogContent
          showCloseButton={false}
          className="bottom-0 top-auto max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-0 rounded-t-2xl border-border bg-card text-foreground"
        >
          <DialogHeader>
            <DialogTitle>Request your check?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              We will notify your server and update your table status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setRequestCheckOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                onRequestCheck();
                onToast("Check requested ✓");
                setRequestCheckOpen(false);
                setTrayOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
        <DialogContent
          showCloseButton={false}
          className="bottom-0 top-auto max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-0 rounded-t-2xl border-border bg-card text-foreground"
        >
          <DialogHeader>
            <DialogTitle>Split bill</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Split equally now, other split modes are coming soon.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-background/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Split equally</p>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">Available</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-2">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setSplitCount((prev) => Math.max(2, prev - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{splitCount} people</span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setSplitCount((prev) => Math.min(8, prev + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Per person: {formatEuro(perPerson)}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-left"
              onClick={() => onToast("Split by items is coming soon", "warning")}
            >
              <span className="text-sm text-muted-foreground">Split by items</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-left"
              onClick={() => onToast("Pay my share is coming soon", "warning")}
            >
              <span className="text-sm text-muted-foreground">Pay my share</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </button>
          </div>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setSplitOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                onToast(`Split equally by ${splitCount} ✓`);
                setSplitOpen(false);
                setTrayOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>,
    portalTarget
  );
}
