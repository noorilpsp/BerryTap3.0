'use client';

import { Button } from "@/components/kds/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDisplayMode } from "./DisplayModeContext";
import { WaitingForStationsBadge } from "./WaitingForStationsBadge";
import type { Station } from "./StationSwitcher";

type OrderStatus = "pending" | "preparing" | "ready";

export interface OrderItem {
  id: string;
  name: string;
  variant: string | null;
  quantity: number;
  customizations: string[];
  stationId?: string;
  isNew?: boolean;
  isModified?: boolean;
  changeDetails?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup" | "delivery";
  tableNumber: string | null;
  customerName: string | null;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  specialInstructions?: string;
  stationStatuses?: Record<string, OrderStatus>;
  isRemake?: boolean;
  remakeReason?: string;
  originalOrderId?: string;
  isRecalled?: boolean;
  recalledAt?: string;
  isModified?: boolean;
  modifiedAt?: string;
  isSnoozed?: boolean;
  snoozedAt?: string;
  snoozeUntil?: string;
  snoozeDurationSeconds?: number;
  wasSnoozed?: boolean;
}

const REFIRE_REASONS = ["Burned", "Dropped", "Wrong", "Other"] as const;

// Allergen detection: keywords to scan in specialInstructions and item customizations
const ALLERGEN_KEYWORDS: { keywords: string[]; label: string }[] = [
  { keywords: ["peanut", "peanuts"], label: "PEANUT ALLERGY" },
  { keywords: ["tree nut", "treenut", "nuts", "nut "], label: "NUT ALLERGY" },
  { keywords: ["gluten", "celiac", "coeliac"], label: "GLUTEN ALLERGY" },
  { keywords: ["dairy", "lactose", "milk"], label: "DAIRY ALLERGY" },
  { keywords: ["shellfish", "seafood", "fish"], label: "SHELLFISH ALLERGY" },
  { keywords: ["egg", "eggs"], label: "EGG ALLERGY" },
  { keywords: ["soy", "soya"], label: "SOY ALLERGY" },
  { keywords: ["sesame"], label: "SESAME ALLERGY" },
  { keywords: ["allergy", "allergic", "allergen"], label: "ALLERGEN" },
];

function detectAllergensInText(text: string): string[] {
  if (!text || !text.trim()) return [];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const { keywords, label } of ALLERGEN_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(label);
    }
  }
  return [...new Set(found)];
}

function detectOrderAllergens(order: Order): string[] {
  const parts: string[] = [];
  if (order.specialInstructions) parts.push(order.specialInstructions);
  order.items.forEach((i) => i.customizations.forEach((c) => parts.push(c)));
  const text = parts.join(" ");
  return detectAllergensInText(text);
}

function getItemAllergenLabel(item: OrderItem, orderSpecialInstructions?: string): string | null {
  const itemText = item.customizations.join(" ");
  const orderText = orderSpecialInstructions ?? "";
  const text = `${itemText} ${orderText}`.trim();
  const labels = detectAllergensInText(text);
  // Prefer specific allergen over generic "ALLERGEN"
  const specific = labels.filter((l) => l !== "ALLERGEN");
  if (specific.length > 0) return specific[0];
  if (labels.length > 0) return labels[0];
  return null;
}

interface KDSTicketProps {
  order: Order;
  onAction: (orderId: string, newStatus: OrderStatus) => void;
  onRefire?: (orderId: string, item: OrderItem, reason: string) => void;
  onClearModified?: (orderId: string) => void;
  priority?: number | null;
  isHighlighted?: boolean;
  currentStationId?: string;
  waitingStations?: Station[];
  isStationComplete?: boolean;
  columnAccent?: 'new' | 'preparing' | 'ready';
  assignedCook?: { name: string; color: string };
  transitionDirection?: 'from-left' | 'from-right';
  isLanding?: boolean;
  landingType?: 'preparing' | 'ready';
  skipEntranceAnimation?: boolean;
  /** Batch hint: show badge and dot on matching item */
  batchBadge?: { label: string };
  batchItemKey?: string;
  isBatchHighlighted?: boolean;
  onSnooze?: (orderId: string, durationSeconds: number) => void;
  onWakeUp?: (orderId: string) => void;
}

function getElapsedTime(createdAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

const SNOOZE_DURATIONS = [
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
] as const;

function canSnoozeOrder(order: Order): boolean {
  if (order.isSnoozed) return false;
  if (order.wasSnoozed) return false;
  const waitMinutes = getElapsedMinutes(order.createdAt);
  if (waitMinutes >= 10) return false; // Cannot snooze urgent
  return true;
}

function getSnoozeRemainingSeconds(snoozeUntil: string): number {
  return Math.max(0, Math.ceil((new Date(snoozeUntil).getTime() - Date.now()) / 1000));
}

function formatSnoozeCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type UrgencyLevel = "urgent" | "warning" | "normal";

function getUrgencyLevel(createdAt: string): UrgencyLevel {
  const minutes = getElapsedMinutes(createdAt);
  if (minutes >= 10) return "urgent";
  if (minutes >= 5) return "warning";
  return "normal";
}

function getActionButton(status: OrderStatus): {
  label: string;
  nextStatus: OrderStatus;
} {
  switch (status) {
    case "pending":
      return { label: "START", nextStatus: "preparing" };
    case "preparing":
      return { label: "READY", nextStatus: "ready" };
    case "ready":
      return { label: "BUMP", nextStatus: "ready" };
  }
}

const ORDER_TYPE_BADGE: Record<Order["orderType"], { icon: string; label: string }> = {
  dine_in: { icon: "🍽", label: "DINE-IN" },
  pickup: { icon: "🥡", label: "TAKEAWAY" },
  delivery: { icon: "🚚", label: "DELIVERY" },
};

export function KDSTicket({ 
  order, 
  onAction, 
  onRefire,
  onClearModified,
  priority, 
  isHighlighted,
  currentStationId,
  waitingStations = [],
  isStationComplete = false,
  columnAccent,
  assignedCook,
  transitionDirection,
  isLanding,
  landingType,
  skipEntranceAnimation = false,
  batchBadge,
  batchItemKey,
  isBatchHighlighted = false,
  onSnooze,
  onWakeUp,
}: KDSTicketProps) {
  const { label, nextStatus } = getActionButton(order.status);
  const orderTypeBadge = ORDER_TYPE_BADGE[order.orderType] ?? ORDER_TYPE_BADGE.pickup;
  const [elapsedTime, setElapsedTime] = useState(getElapsedTime(order.createdAt));
  const [urgencyLevel, setUrgencyLevel] = useState(getUrgencyLevel(order.createdAt));
  const [refireItem, setRefireItem] = useState<OrderItem | null>(null);
  const [refireReason, setRefireReason] = useState<string>("");
  const [snoozePickerOpen, setSnoozePickerOpen] = useState(false);
  const [snoozeCountdown, setSnoozeCountdown] = useState(0);
  const [showSnoozeContextMenu, setShowSnoozeContextMenu] = useState(false);
  const [refireContextItem, setRefireContextItem] = useState<OrderItem | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTargetRef = useRef<OrderItem | null>(null);
  const ticketLongPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickAfterLongPressRef = useRef(false);

  useEffect(() => {
    if (!order.isSnoozed || !order.snoozeUntil) return;
    const tick = () => setSnoozeCountdown(getSnoozeRemainingSeconds(order.snoozeUntil!));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order.isSnoozed, order.snoozeUntil]);

  const handleRefireConfirm = useCallback(() => {
    if (refireItem && onRefire) {
      onRefire(order.id, refireItem, refireReason || "Other");
      setRefireItem(null);
      setRefireReason("");
    }
  }, [order.id, refireItem, refireReason, onRefire]);

  const LONG_PRESS_MS = 500;
  const canShowTicketContextMenu = Boolean(onSnooze && !order.isSnoozed && !order.wasSnoozed);
  const { theme, isHighContrast } = useDisplayMode();
  const startTicketLongPress = useCallback(() => {
    if (!canShowTicketContextMenu) return;
    ticketLongPressRef.current = setTimeout(() => {
      ticketLongPressRef.current = null;
      suppressClickAfterLongPressRef.current = true;
      setShowSnoozeContextMenu(true);
      setTimeout(() => { suppressClickAfterLongPressRef.current = false; }, 300);
    }, LONG_PRESS_MS);
  }, [canShowTicketContextMenu]);
  const cancelTicketLongPress = useCallback(() => {
    if (ticketLongPressRef.current) {
      clearTimeout(ticketLongPressRef.current);
      ticketLongPressRef.current = null;
    }
  }, []);

  // Depend only on createdAt so the interval isn't recreated on every parent re-render (which would delay the next tick by up to 1s).
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(order.createdAt));
      setUrgencyLevel(getUrgencyLevel(order.createdAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const urgencyDot = urgencyLevel === "urgent" 
    ? "🔴" 
    : urgencyLevel === "warning" 
    ? "🟡" 
    : null;

  const timerColorClass = urgencyLevel === "urgent"
    ? cn(theme.timerUrgent, "font-semibold")
    : urgencyLevel === "warning"
    ? cn(theme.timerWarning, "font-medium")
    : theme.timerNormal;

  // Remake / Urgency border overrides column accent border (recalled keeps column color)
  const borderClass = order.isRemake
    ? `border-l-4 border-y-2 border-r-2 ${theme.urgencyBorder}`
    : urgencyLevel === "urgent"
    ? `border-l-4 border-y-2 border-r-2 ${theme.urgencyBorder}`
    : urgencyLevel === "warning"
    ? `border-l-4 border-y-2 border-r-2 ${theme.warningBorder}`
    : columnAccent === 'new'
    ? `border-l-4 border-y-2 border-r-2 ${theme.columnNewBorder}`
    : columnAccent === 'preparing'
    ? `border-l-4 border-y-2 border-r-2 ${theme.columnPreparingBorder}`
    : columnAccent === 'ready'
    ? `border-l-4 border-y-2 border-r-2 ${theme.columnReadyBorder}`
    : "";

  const shadowClass = urgencyLevel === "urgent"
    ? "shadow-[0_0_0_0_rgba(239,68,68,0.4)] animate-[urgentPulse_2s_ease-in-out_infinite]"
    : urgencyLevel === "warning"
    ? "shadow-[0_0_12px_rgba(234,179,8,0.3)]"
    : "";

  const highlightClass = isHighlighted ? theme.highlightBg : "";
  const batchHighlightClass = isBatchHighlighted ? cn("ring-2", theme.batchRing) : "";

  // Landing glow class based on destination
  const landingGlowClass = isLanding 
    ? landingType === "ready" 
      ? "ticket-landing-ready" 
      : "ticket-landing-preparing"
    : "";

  // Determine initial position based on transition direction / landing column
  const getInitialAnimation = () => {
    // Landing in READY: same slide-in as NEW → PREPARING (from left)
    if (columnAccent === "ready" && isLanding) {
      return { opacity: 0, x: -120, scale: 1.03 };
    }
    if (transitionDirection === "from-left") {
      return { opacity: 0, x: -120, scale: 1.03 };
    }
    if (transitionDirection === "from-right") {
      return { opacity: 0, x: 120, scale: 1.03 };
    }
    return { opacity: 0, scale: 0.95 };
  };

  // Animate to settled position
  const getAnimateState = () => {
    return { opacity: 1, x: 0, y: 0, scale: 1 };
  };

  // Transition timing for smooth directional movement
  const getTransition = () => {
    // Landing in READY: same as NEW → PREPARING slide-in
    if (columnAccent === "ready" && isLanding) {
      return {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        scale: {
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut" as const
        }
      };
    }
    if (transitionDirection) {
      return {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        scale: {
          duration: 0.5,
          delay: 0.2,
          ease: "easeOut" as const
        }
      };
    }
    return { duration: 0.3, ease: "easeOut" as const };
  };

  // Layout transition for smooth reordering when moving from staged to final position
  const layoutTransition = {
    type: "spring" as const,
    stiffness: 350,
    damping: 30,
    mass: 1,
  };

  return (
    <motion.div
      id={`ticket-${order.id}`}
      layout={!(isLanding && (columnAccent === "ready" || columnAccent === "preparing"))}
      layoutId={`${order.id}-${columnAccent ?? "preparing"}`}
      initial={skipEntranceAnimation ? getAnimateState() : getInitialAnimation()}
      animate={getAnimateState()}
      exit={
        columnAccent === "new"
          ? { opacity: 0, x: 120, transition: { duration: 0.3, ease: "easeIn" } }
          : columnAccent === "preparing"
            ? { opacity: 0, x: 120, transition: { duration: 0.3, ease: "easeIn" } }
            : columnAccent === "ready"
              ? { opacity: 0, scale: 0.96, y: 20, transition: { duration: 0.25, ease: "easeIn" } }
              : { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
      }
      transition={{
        ...getTransition(),
        layout: layoutTransition,
      }}
      className={`w-full max-w-[300px] 2xl:max-w-[340px] ${landingGlowClass}`}
    >
      <Popover open={showSnoozeContextMenu} onOpenChange={setShowSnoozeContextMenu}>
        <PopoverAnchor asChild>
      <Card
        className={cn(
          "relative overflow-hidden pt-0 pb-0 theme-transition",
          theme.cardBg,
          theme.text,
          theme.border,
          borderClass,
          shadowClass,
          highlightClass,
          batchHighlightClass,
          order.isModified && "cursor-pointer",
          order.isSnoozed && "opacity-50",
          canShowTicketContextMenu && "touch-manipulation",
          isHighContrast && "text-lg font-bold"
        )}
        onClick={order.isModified ? () => {
          if (suppressClickAfterLongPressRef.current) return;
          onClearModified?.(order.id);
        } : undefined}
        role={order.isModified ? "button" : undefined}
        tabIndex={order.isModified ? 0 : undefined}
        onKeyDown={order.isModified ? (e) => e.key === "Enter" && onClearModified?.(order.id) : undefined}
        aria-label={order.isModified ? "Order modified - tap to clear highlight" : canShowTicketContextMenu ? "Hold for ticket options" : undefined}
        onTouchStart={canShowTicketContextMenu ? startTicketLongPress : undefined}
        onTouchEnd={canShowTicketContextMenu ? cancelTicketLongPress : undefined}
        onTouchCancel={canShowTicketContextMenu ? cancelTicketLongPress : undefined}
        onMouseDown={canShowTicketContextMenu ? startTicketLongPress : undefined}
        onMouseUp={canShowTicketContextMenu ? cancelTicketLongPress : undefined}
        onMouseLeave={canShowTicketContextMenu ? cancelTicketLongPress : undefined}
      >
        {/* REMAKE / RECALLED badge */}
        {(order.isRemake || order.isRecalled) && (
          <div className={cn("px-2 pt-1.5 pb-0 2xl:px-3 2xl:pt-2 2xl:pb-0 border-b flex items-center justify-between theme-transition", theme.border, order.isRemake ? theme.remakeBadge : theme.recalledBadge)}>
            <span className="font-semibold text-sm 2xl:text-base flex items-center gap-0.5">
              <span className="inline-block translate-y-0.5 leading-none shrink-0" aria-hidden>
                {order.isRemake ? "🔄" : "↩"}
              </span>
              {order.isRemake ? "REMAKE" : "RECALLED"}
            </span>
            <span className="text-xs 2xl:text-sm font-medium opacity-90">#{order.orderNumber}</span>
          </div>
        )}
        {/* MODIFIED badge - tap ticket anywhere to clear */}
        {order.isModified && (
          <div className={cn("px-2 pt-1.5 pb-0 2xl:px-3 2xl:pt-2 2xl:pb-0 border-b flex items-center justify-between theme-transition", theme.border, theme.modifiedBadge)}>
            <span className="font-semibold text-sm 2xl:text-base flex items-center gap-0.5">
              <span className="shrink-0" aria-hidden>✏️</span>
              MODIFIED
            </span>
            <span className="text-xs 2xl:text-sm font-medium opacity-90">#{order.orderNumber}</span>
          </div>
        )}
        {/* SNOOZED banner */}
        {order.isSnoozed && (
          <div className={cn("px-2 pt-1.5 pb-0 2xl:px-3 2xl:pt-2 2xl:pb-0 border-b flex items-center justify-between theme-transition", theme.border, theme.snoozedBadge)}>
            <span className="font-semibold text-sm 2xl:text-base flex items-center gap-0.5">
              <span className="shrink-0" aria-hidden>💤</span>
              SNOOZED · Returns in {formatSnoozeCountdown(snoozeCountdown)}
            </span>
          </div>
        )}
        {/* COMPACT METADATA ROW - reduced dominance, item-focused hierarchy */}
        <div className={cn("px-2 pb-0 2xl:px-3 2xl:pb-0 border-b theme-transition", theme.metadataBg, theme.border, theme.textMuted, order.isRemake || order.isRecalled || order.isModified ? "-mt-4 pt-0 2xl:-mt-5 2xl:pt-0" : "pt-1.5 2xl:pt-2")}>
          <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm 2xl:text-base leading-snug -translate-y-0.5", theme.textMuted)}>
            <span className="min-w-0 flex items-center gap-1.5 shrink-0">
              <span className={cn("shrink-0 opacity-80", theme.textMuted)} aria-label={orderTypeBadge.label} title={orderTypeBadge.label}>{orderTypeBadge.icon}</span>
              <span className={cn("truncate font-medium", theme.text)}>
                {order.isRemake && order.originalOrderId
                  ? `T-${order.tableNumber}`
                  : order.orderType === "dine_in" && order.tableNumber
                  ? `Table ${order.tableNumber}`
                  : order.customerName}
              </span>
            </span>
            {priority != null && priority > 0 ? (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center rounded-full w-7 h-7 2xl:w-8 2xl:h-8 text-xs 2xl:text-sm font-bold tabular-nums border-2 justify-self-center text-center leading-none",
                  urgencyLevel === "urgent" && cn(theme.priorityDot, theme.urgencyBorder),
                  urgencyLevel === "warning" && cn(theme.timerWarning, theme.warningBorder),
                  urgencyLevel === "normal" && cn(theme.timerNormal, theme.normalBorder)
                )}
                title={`Queue position ${priority}`}
              >
                {priority}
              </span>
            ) : (
              <span className="min-w-0" aria-hidden />
            )}
            <div className="flex items-center gap-2 justify-self-end shrink-0">
              {assignedCook && (
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 2xl:w-2.5 2xl:h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: assignedCook.color }}
                  />
                  <span>{assignedCook.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <div className={`flex items-center gap-1.5 tabular-nums ${timerColorClass}`}>
                  <svg
                    className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 shrink-0 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline points="12,6 12,12 16,14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{elapsedTime}</span>
                </div>
                {order.wasSnoozed && (
                  <span className={cn("text-xs", theme.textMuted)}>(was snoozed)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Batch hint badge */}
        {batchBadge && (
          <div className={cn("px-2 pt-1 pb-0 2xl:px-3 2xl:pt-1.5 2xl:pb-0 border-b theme-transition", theme.border, theme.modifiedBadge)}>
            <span className="text-xs 2xl:text-sm font-semibold">
              {batchBadge.label}
            </span>
          </div>
        )}

        {/* ITEMS - tight spacing above = below */}
        <div className="-mt-1.5 pt-0 px-2 pb-0 2xl:-mt-2 2xl:px-3 2xl:pb-0 space-y-0 2xl:space-y-0.5">
          {order.items.map((item) => {
            const canRefire = Boolean(onRefire && !order.isRemake);
            const itemAllergenLabel = getItemAllergenLabel(item, order.specialInstructions);
            const itemKey = `${item.name}|${item.variant ?? ""}`;
            const isBatchItem = Boolean(batchItemKey && batchItemKey === itemKey);
            const onLongPress = () => {
              if (!canRefire) return;
              setRefireContextItem(item);
            };
            const onTouchStart = (e: React.TouchEvent) => {
              e.stopPropagation();
              if (!canRefire) return;
              longPressTargetRef.current = item;
              longPressRef.current = setTimeout(onLongPress, 300);
            };
            const onTouchEnd = (e: React.TouchEvent) => {
              e.stopPropagation();
              if (longPressRef.current) {
                clearTimeout(longPressRef.current);
                longPressRef.current = null;
              }
              longPressTargetRef.current = null;
            };
            const onMouseDown = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!canRefire) return;
              longPressTargetRef.current = item;
              longPressRef.current = setTimeout(onLongPress, 300);
            };
            const onMouseUpOrLeave = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (longPressRef.current) {
                clearTimeout(longPressRef.current);
                longPressRef.current = null;
              }
              longPressTargetRef.current = null;
            };
            return (
              <Popover open={refireContextItem?.id === item.id} onOpenChange={(open) => !open && setRefireContextItem(null)} key={item.id}>
                <PopoverAnchor asChild>
              <div
                className="group/item space-y-0.5 relative touch-manipulation"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUpOrLeave}
                onMouseLeave={onMouseUpOrLeave}
              >
                <div className={cn("flex items-baseline gap-2 text-lg 2xl:text-xl leading-snug flex-wrap", theme.text)}>
                  {isBatchItem && (
                    <span className={cn("font-bold shrink-0", theme.batchDot)} aria-label="Batch item">●</span>
                  )}
                  <span className={cn("font-bold tabular-nums", theme.text)}>{item.quantity}x</span>
                  <span className={cn(
                    "font-bold",
                    item.isNew && theme.itemNewText,
                    item.isModified && !item.isNew && theme.itemModifiedText
                  )}>
                    {item.name}
                  </span>
                  {item.variant && (
                    <span className={cn("text-base 2xl:text-lg font-medium", theme.textMuted)}>({item.variant})</span>
                  )}
                  {item.isNew && (
                    <span className={cn(theme.itemNewText, "text-sm 2xl:text-base font-semibold shrink-0")}>← NEW</span>
                  )}
                  {item.isModified && !item.isNew && (
                    <span className={cn(theme.itemModifiedText, "text-sm 2xl:text-base font-semibold shrink-0")}>
                      ← CHANGED{item.changeDetails ? ` (${item.changeDetails})` : ""}
                    </span>
                  )}
                </div>

                {/* Allergen label - red pill below item name */}
                {itemAllergenLabel && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 2xl:px-2.5 2xl:py-1 rounded-md bg-red-600 text-white text-xs 2xl:text-sm font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 shrink-0" aria-hidden />
                    {itemAllergenLabel}
                  </div>
                )}

                {/* Modifiers - work-first: visible, readable, part of cooking task */}
                {item.customizations.length > 0 && (
                  <div className="pl-4 2xl:pl-5 space-y-1">
                    {item.customizations.map((customization, index) => {
                      const lower = customization.toLowerCase();
                      const isRemoval = lower.startsWith('no ');
                      const isAddition =
                        lower.startsWith('extra ') ||
                        lower.startsWith('add ') ||
                        lower.startsWith('with ') ||
                        lower.startsWith('double ') ||
                        lower.startsWith('plus ');
                      const displayText = isRemoval
                        ? customization.replace(/^no\s+/i, '').toUpperCase()
                        : customization;
                      const prefix = isRemoval ? '−' : isAddition ? '+' : '•';
                      return (
                        <div
                          key={index}
                          className={cn(
                            "text-base 2xl:text-lg leading-snug flex items-baseline gap-2",
                            isRemoval && cn(theme.removalText, "font-semibold"),
                            isAddition && cn(theme.additionText, "font-medium"),
                            !isRemoval && !isAddition && cn(theme.text, "font-medium opacity-90")
                          )}
                        >
                          <span
                            className={cn("shrink-0", isRemoval ? theme.removalText : "opacity-90", !isRemoval && theme.text)}
                            aria-hidden
                          >
                            {prefix}
                          </span>
                          {isRemoval ? (
                            <span>
                              <span className="font-semibold">NO </span>
                              {displayText}
                            </span>
                          ) : (
                            <span>{displayText}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
                </PopoverAnchor>
                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={-60}
                  className="w-56 p-2 z-100 shadow-lg"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <p className="text-sm font-semibold px-2 py-1.5 text-foreground">Item options</p>
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start font-medium w-full"
                      onClick={() => {
                        setRefireItem(item);
                        setRefireContextItem(null);
                        setRefireReason("");
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 inline-block" aria-hidden />
                      Re-fire
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start w-full" onClick={() => setRefireContextItem(null)}>
                      Cancel
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>

        {/* SPECIAL NOTES */}
        {order.specialInstructions && (
          <div className={cn("mx-2 -mt-1 mb-2 2xl:mx-3 2xl:-mt-1.5 2xl:mb-3 px-2 py-1.5 2xl:px-3 2xl:py-2 border rounded-md theme-transition", theme.specialInstructions)}>
            <p className="text-[13px] 2xl:text-sm font-medium leading-snug">
              {order.specialInstructions}
            </p>
          </div>
        )}

        {/* Waiting stations badge */}
        {isStationComplete && waitingStations.length > 0 && (
          <div className="-mt-1 px-2 pb-2 2xl:-mt-1.5 2xl:px-3 2xl:pb-3">
            <WaitingForStationsBadge waitingStations={waitingStations} />
          </div>
        )}

        {/* ACTION BUTTON - same tight gap as above items */}
        <div className="-mt-1.5 pt-0 px-2 pb-2 2xl:-mt-2 2xl:px-3 2xl:pb-3" onClick={(e) => e.stopPropagation()}>
          {order.isSnoozed ? (
            <Button
              className="w-full font-medium text-base 2xl:text-lg h-11 2xl:h-12"
              variant="outline"
              onClick={() => onWakeUp?.(order.id)}
            >
              Wake Up
            </Button>
          ) : order.isRecalled && order.status === "ready" ? (
            <div className="flex gap-2">
              <Button
                className="flex-1 font-medium text-base 2xl:text-lg h-11 2xl:h-12"
                variant="outline"
                onClick={() => onAction(order.id, "preparing")}
              >
                Back to Prep
              </Button>
              <Button
                className="flex-1 font-semibold text-base 2xl:text-lg h-11 2xl:h-12"
                onClick={() => onAction(order.id, nextStatus)}
              >
                Bump
              </Button>
            </div>
          ) : isStationComplete && order.status !== "ready" ? (
            <Button
              className={cn("w-full font-medium text-base 2xl:text-lg h-11 2xl:h-12 bg-transparent hover:opacity-90", theme.textMuted, theme.metadataBg)}
              variant="outline"
              onClick={() => onAction(order.id, "ready")}
            >
              Complete
            </Button>
          ) : (
            <Button
              className="w-full font-semibold text-base 2xl:text-lg h-11 2xl:h-12"
              onClick={() => onAction(order.id, nextStatus)}
            >
              {label}
            </Button>
          )}
        </div>
      </Card>
        </PopoverAnchor>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={-160}
          className="w-56 p-2 z-100 shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-sm font-semibold px-2 py-1.5 text-foreground">Ticket options</p>
          <div className="flex flex-col gap-0.5">
            <Button
              variant="outline"
              size="sm"
              className="justify-start font-medium w-full"
              disabled={!canSnoozeOrder(order)}
              title={!canSnoozeOrder(order) ? "Cannot snooze urgent or already snoozed orders" : undefined}
              onClick={() => {
                setShowSnoozeContextMenu(false);
                setSnoozePickerOpen(true);
              }}
            >
              💤 Snooze
            </Button>
            <Button variant="ghost" size="sm" className="justify-start w-full" onClick={() => setShowSnoozeContextMenu(false)}>
              Cancel
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Snooze duration picker (opened from ticket options menu) */}
      <Dialog open={snoozePickerOpen} onOpenChange={setSnoozePickerOpen}>
        <DialogContent className="sm:max-w-xs" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Snooze for</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap">
            {SNOOZE_DURATIONS.map((d) => (
              <Button
                key={d.seconds}
                size="sm"
                variant="outline"
                className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50"
                onClick={() => {
                  onSnooze?.(order.id, d.seconds);
                  setSnoozePickerOpen(false);
                }}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Re-fire confirmation dialog */}
      <Dialog open={!!refireItem} onOpenChange={(open) => !open && setRefireItem(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Re-fire Item?</DialogTitle>
          </DialogHeader>
          {refireItem && (
            <>
              <div className="py-2 text-sm text-foreground">
                <span className="font-semibold tabular-nums">{refireItem.quantity}×</span>{" "}
                <span className="font-semibold">{refireItem.name}</span>
                {refireItem.variant && (
                  <span className="text-muted-foreground"> ({refireItem.variant})</span>
                )}
                {refireItem.customizations.length > 0 && (
                  <div className="mt-1 pl-4 text-muted-foreground">
                    {refireItem.customizations.map((c, i) => (
                      <div key={i}>+ {c}</div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Reason (optional):</p>
              <div className="flex flex-wrap gap-2">
                {REFIRE_REASONS.map((reason) => (
                  <Button
                    key={reason}
                    type="button"
                    variant={refireReason === reason ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRefireReason(reason)}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setRefireItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRefireConfirm}>
                  Re-fire
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
