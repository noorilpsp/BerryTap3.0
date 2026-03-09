"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { DisplayModeProvider, useDisplayMode } from "@/components/kds/DisplayModeContext";
import { getCurrentLocationId } from "@/app/actions/location";
import { KDSHeader } from "@/components/kds/KDSHeader";
import { KDSColumns } from "@/components/kds/KDSColumns";
import { AllDayView } from "@/components/kds/AllDayView";
import { KDSToastContainer } from "@/components/kds/KDSNewOrderToast";
import {
  KDSModificationToastContainer,
  type ModificationToastData,
  type OrderChange,
} from "@/components/kds/KDSModificationToast";
import type { Station } from "@/components/kds/StationSwitcher";
import type { ViewMode } from "@/components/kds/KDSHeader";
import {
  KDSBatchHints,
  detectBatches,
  batchKey,
  type BatchSuggestion,
} from "@/components/kds/KDSBatchHints";
import {
  KDSMessagePanel,
  KDSMessageHistory,
  IncomingMessageToast,
  type StationMessage,
} from "@/components/kds/KDSStationMessage";
import { Button } from "@/components/kds/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useKdsView } from "@/lib/hooks/useKdsView";
import { useKdsMutations } from "@/lib/hooks/useKdsMutations";
import { KdsPageSkeleton } from "@/components/kds/KdsPageSkeleton";
import type { KdsView } from "@/lib/kds/kdsView";
import { resolveItemStation as resolveItemStationShared } from "@/lib/kds/resolveItemStation";

function KDSNoLocationState() {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("flex flex-col items-center justify-center flex-1 gap-1 theme-transition", theme.textMuted)}>
      <p className="text-base font-medium">No location selected</p>
      <p className="text-sm">Select a store in POS or KDS settings.</p>
    </div>
  );
}

function KDSErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("flex flex-col items-center justify-center flex-1 gap-4 theme-transition", theme.textMuted)}>
      <p className="text-base font-medium text-center max-w-md">{message}</p>
      <Button onClick={onRetry} variant="outline" className={cn(theme.headerOutlineButton || theme.border, theme.text)}>
        Retry
      </Button>
    </div>
  );
}

function KDSStaleBanner({ onRetry }: { onRetry: () => void }) {
  const { theme } = useDisplayMode();
  return (
    <div
      className={cn(
        "shrink-0 px-4 py-2 flex items-center justify-center gap-3 text-sm theme-transition",
        "bg-amber-500/20 text-amber-800 dark:bg-amber-500/25 dark:text-amber-200"
      )}
      role="alert"
    >
      <span>Couldn&apos;t refresh KDS. Showing last known data.</span>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className={cn("shrink-0", theme.headerOutlineButton || "border-current")}
      >
        Retry
      </Button>
    </div>
  );
}

function KDSPageLayout({ children }: { children: ReactNode }) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("h-screen flex flex-col theme-transition", theme.background, theme.text)}>
      {children}
    </div>
  );
}

type OrderStatus = "pending" | "preparing" | "ready" | "served";

interface OrderItem {
  id: string;
  name: string;
  variant: string | null;
  quantity: number;
  customizations: string[];
  stationId?: string;
  substation?: string | null;
  status?: "pending" | "preparing" | "ready" | "served";
  sentToKitchenAt?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
  voidedAt?: string | null;
  refiredAt?: string | null;
  isNew?: boolean;
  isModified?: boolean;
  changeDetails?: string;
  /** Work group for split tickets. null = main. */
  prepGroup?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  status: OrderStatus;
  createdAt: string;
  firedAt?: string | null;
  items: OrderItem[];
  isPriority?: boolean;
  specialInstructions?: string;
  stationStatuses?: Record<string, OrderStatus>;
  isRemake?: boolean;
  /** True when all non-voided items are remade; used for ticket-level REMAKE badge. */
  isFullRemake?: boolean;
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
  /** Kitchen lane for preparing view (grill, fryer, cold_prep, unassigned). */
  subStation?: string;
  /** Work group for split tickets. Set for NEW/PREPARING work-group entries. */
  prepGroup?: string | null;
}

/**
 * Derive status from item statuses.
 * Mixed state (pending + ready/preparing, e.g. one refired item) -> "preparing".
 */
function statusFromItems(items: { status: string }[]): OrderStatus {
  if (items.length === 0) return "pending";
  const hasPending = items.some((i) => i.status === "pending");
  const hasPreparing = items.some((i) => i.status === "preparing");
  const hasReady = items.some((i) => i.status === "ready");
  if (hasPending && !hasPreparing && !hasReady) return "pending";
  if (hasPending && (hasReady || hasPreparing)) return "preparing";
  if (hasPreparing) return "preparing";
  if (hasReady) return "ready";
  return "served";
}

/** Use shared station resolution for consistency with useKdsMutations. */
const resolveItemStation = resolveItemStationShared;

const LANE_CAPABLE_STATION = "kitchen";

/**
 * Lane assignment rule: subStation = first item that routes to the current tab's station.
 * Only kitchen supports lanes; other stations return "unassigned".
 */
function resolveOrderSubStation(
  rawItems: Array<{ stationOverride?: string | null; substation?: string | null }>,
  order: { station?: string | null },
  activeStationId: string,
  fallbackStationId: string
): string {
  if (activeStationId !== LANE_CAPABLE_STATION) {
    const first = rawItems.find(
      (i) => resolveItemStation(i, order, fallbackStationId) === activeStationId
    );
    if (first?.substation && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(
        "[KDS] Item has defaultSubstation but station is not lane-capable (kitchen); ignoring substation",
        { station: activeStationId, substation: first.substation }
      );
    }
    return "unassigned";
  }
  const first = rawItems.find(
    (i) => resolveItemStation(i, order, fallbackStationId) === activeStationId
  );
  return first?.substation ?? "unassigned";
}

/** Adapter: KdsView -> Order[] for KDSColumns. Derives order status from item statuses. */
function kdsViewToOrders(
  view: KdsView | null,
  activeStationId: string
): Order[] {
  if (!view) return [];
  const fallbackStationId = view.stations[0]?.id ?? "kitchen";

  return view.orders
    .map((o) => {
      const allItems = view.orderItems.filter((i) => i.orderId === o.id);
      const rawItems = allItems.filter((i) => i.voidedAt == null);
      const items: OrderItem[] = allItems.map((i) => ({
        id: i.id,
        name: i.itemName,
        variant: null,
        quantity: i.quantity,
        customizations: i.notes ? [i.notes] : [],
        stationId: resolveItemStation(i, o, fallbackStationId),
        substation: i.substation ?? null,
        status: i.status,
        sentToKitchenAt: i.sentToKitchenAt ?? null,
        startedAt: i.startedAt ?? null,
        readyAt: i.readyAt ?? null,
        voidedAt: i.voidedAt ?? null,
        refiredAt: i.refiredAt ?? null,
        prepGroup: i.prepGroup ?? null,
      }));
      if (items.length === 0) return null;
      if (rawItems.length === 0) return null;
      const status = statusFromItems(rawItems);

      // Compute stationStatuses per station from non-voided items only
      const stationStatuses: Record<string, OrderStatus> = {};
      const byStation = new Map<string, typeof rawItems>();
      for (const item of rawItems) {
        const sid = resolveItemStation(item, o, fallbackStationId);
        const list = byStation.get(sid) ?? [];
        list.push(item);
        byStation.set(sid, list);
      }
      for (const [sid, stationItems] of byStation) {
        stationStatuses[sid] = statusFromItems(stationItems);
      }

      const subStation = resolveOrderSubStation(
        rawItems,
        o,
        activeStationId,
        fallbackStationId
      );

      const isRemake = rawItems.some((i) => i.refiredAt != null);
      const isFullRemake =
        rawItems.length > 0 && rawItems.every((i) => i.refiredAt != null);

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        orderType: o.orderType as "dine_in" | "pickup",
        tableNumber: o.tableNumber,
        customerName: o.customerName,
        status,
        createdAt: o.createdAt,
        firedAt: o.firedAt ?? null,
        items,
        stationStatuses,
        subStation,
        isRemake,
        isFullRemake,
        isSnoozed: o.isSnoozed ?? false,
        snoozedAt: o.snoozedAt ?? undefined,
        snoozeUntil: o.snoozeUntil ?? undefined,
        wasSnoozed: o.wasSnoozed ?? false,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o != null);
}

/** Snapshot of an order when it was bumped (for Recall list). */
interface CompletedOrder {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  orderType: "dine_in" | "pickup";
  bumpedAt: string;
  bumpedFromStationId: string;
  createdAt: string;
  items: OrderItem[];
  stationStatuses?: Record<string, OrderStatus>;
}

interface NewOrderToast {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  itemCount: number;
  isPriority?: boolean;
}

/** Display metadata for known stations. Used when view.stations has real data. */
const KNOWN_STATION_DISPLAY: Record<string, { icon: string; color: string }> = {
  kitchen: { icon: "🍳", color: "#f97316" },
  bar: { icon: "🍺", color: "#3b82f6" },
  dessert: { icon: "🍰", color: "#ec4899" },
};

/** Fallback stations only before real view data exists (loading). Never override real API stations. */
const DEFAULT_STATIONS: Station[] = [
  { id: "kitchen", name: "Kitchen", icon: "🍳", color: "#f97316" },
  { id: "bar", name: "Bar", icon: "🍺", color: "#3b82f6" },
  { id: "dessert", name: "Dessert", icon: "🍰", color: "#ec4899" },
];

function stationsFromView(view: KdsView | null): Array<Station & { substations?: Array<{ id: string; key: string; name: string; displayOrder: number }> }> {
  // Only use DEFAULT_STATIONS when view has not loaded. Once we have view data, use it (may be empty).
  if (view === null || view === undefined) return DEFAULT_STATIONS;
  return view.stations.map((s) => {
    const known = KNOWN_STATION_DISPLAY[s.id];
    return {
      id: s.id,
      name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      icon: known?.icon ?? "📋",
      color: known?.color ?? "#64748b",
      substations: s.substations ?? [],
    };
  });
}

const RECALL_MAX_AGE_MS = 4 * 60 * 60 * 1000;

/**
 * Derive completed orders from KDS view. An order is completed for a station when all
 * non-voided items for that order/station are status "served". bumpedAt = max(servedAt)
 * of those items. Survives refresh since view comes from the API.
 */
function deriveCompletedOrdersFromView(view: KdsView | null): CompletedOrder[] {
  if (!view) return [];
  const fallbackStationId = view.stations[0]?.id ?? "kitchen";
  const cutoff = Date.now() - RECALL_MAX_AGE_MS;
  const result: CompletedOrder[] = [];

  for (const order of view.orders) {
    const items = view.orderItems.filter(
      (i) => i.orderId === order.id && i.voidedAt == null
    );
    if (items.length === 0) continue;

    const byStation = new Map<string, typeof items>();
    for (const item of items) {
      const sid = resolveItemStation(item, order, fallbackStationId);
      const list = byStation.get(sid) ?? [];
      list.push(item);
      byStation.set(sid, list);
    }

    for (const [stationId, stationItems] of byStation) {
      if (!stationItems.every((i) => i.status === "served")) continue;

      const servedAts = stationItems
        .map((i) => (i.servedAt ? new Date(i.servedAt).getTime() : 0))
        .filter((t) => t > 0);
      const bumpedAt =
        servedAts.length > 0
          ? new Date(Math.max(...servedAts)).toISOString()
          : new Date().toISOString();

      if (new Date(bumpedAt).getTime() < cutoff) continue;

      result.push({
        id: order.id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        orderType: order.orderType as "dine_in" | "pickup",
        bumpedAt,
        bumpedFromStationId: stationId,
        createdAt: order.createdAt,
        items: stationItems.map((i) => ({
          id: i.id,
          name: i.itemName,
          variant: null,
          quantity: i.quantity,
          customizations: i.notes ? [i.notes] : [],
          stationId,
        })),
      });
    }
  }

  return result
    .sort((a, b) => new Date(b.bumpedAt).getTime() - new Date(a.bumpedAt).getTime())
    .slice(0, 20);
}

export default function KDSPage() {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationIdResolved, setLocationIdResolved] = useState(false);
  useEffect(() => {
    getCurrentLocationId().then((id) => {
      setLocationId(id);
      setLocationIdResolved(true);
    });
  }, []);

  const { view, loading: kdsLoading, error: kdsError, staleError: kdsStaleError, refresh, patch } = useKdsView(locationId);
  const [activeStationId, setActiveStationId] = useState<string>("");

  const orders = useMemo(
    () => kdsViewToOrders(view, activeStationId),
    [view, activeStationId]
  );
  const STATIONS = useMemo(() => stationsFromView(view), [view]);

  // Sync activeStationId when stations change: if current selection invalid, switch to first active
  const stationIds = useMemo(() => new Set(STATIONS.map((s) => s.id)), [STATIONS]);
  useEffect(() => {
    setActiveStationId((prev) => {
      if (stationIds.has(prev)) return prev;
      const first = STATIONS[0]?.id;
      return first ?? "";
    });
  }, [stationIds, STATIONS]);

  const [toasts, setToasts] = useState<NewOrderToast[]>([]);
  const [modificationToasts, setModificationToasts] = useState<ModificationToastData[]>([]);
  const [highlightedTicketId, setHighlightedTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tickets");
  // Track tickets that just transitioned for animation purposes
  const [transitioningTickets, setTransitioningTickets] = useState<Map<string, { from: OrderStatus; to: OrderStatus }>>(new Map());
  const toastTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const modificationClearTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const nextOrderNumber = useRef(1248);
  const nextModificationToastId = useRef(0);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const recentModToastKeysRef = useRef<Map<string, number>>(new Map());
  const prevViewSnapshotRef = useRef<string>("");
  const hasInitializedNotificationsRef = useRef(false);
  const nextMessageId = useRef(1);

  const [stationMessages, setStationMessages] = useState<StationMessage[]>([]);
  const [messagePanelOpen, setMessagePanelOpen] = useState(false);
  const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
  const [replyToStationId, setReplyToStationId] = useState<string | null>(null);

  // KDS data comes from useKdsView (GET /api/kds/view). No separate fetch.

  const addToast = useCallback((order: Order) => {
    const toast: NewOrderToast = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      itemCount: order.items.length,
      isPriority: order.isPriority,
    };

    setToasts((prev) => {
      const updated = [toast, ...prev];
      return updated.slice(0, 3); // Max 3 toasts
    });

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      toastTimeoutRefs.current.delete(toast.id);
    }, 5000);

    toastTimeoutRefs.current.set(toast.id, timeout);
  }, []);

  const handleToastView = useCallback((orderId: string) => {
    // Dismiss toast
    setToasts((prev) => prev.filter((t) => t.id !== orderId));
    
    // Clear timeout
    const timeout = toastTimeoutRefs.current.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutRefs.current.delete(orderId);
    }

    // Scroll to ticket
    const ticketElement = document.getElementById(`ticket-${orderId}`);
    ticketElement?.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight briefly
    setHighlightedTicketId(orderId);
    setTimeout(() => setHighlightedTicketId(null), 1000);
  }, []);

  const handleToastDismiss = useCallback((orderId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== orderId));
    
    // Clear timeout
    const timeout = toastTimeoutRefs.current.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutRefs.current.delete(orderId);
    }
  }, []);

  const suppressModificationForOrderIdsRef = useRef<Set<string>>(new Set());
  const suppressModificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLocalAction = useCallback((orderId: string) => {
    suppressModificationForOrderIdsRef.current.add(orderId);
    if (suppressModificationTimeoutRef.current) {
      clearTimeout(suppressModificationTimeoutRef.current);
    }
    suppressModificationTimeoutRef.current = setTimeout(() => {
      suppressModificationForOrderIdsRef.current.clear();
      suppressModificationTimeoutRef.current = null;
    }, 1500);
  }, []);

  const fallbackStationId = view?.stations[0]?.id ?? "kitchen";
  const {
    handleMarkPreparing,
    handleMarkReady,
    handleMarkServed,
    handleVoidItem,
    handleRecallOrder,
    handleRefireItem,
    handleSplitToNewTicket,
    handleUnsplitToMain,
    handleSnooze,
    handleWakeUp,
  } = useKdsMutations({
      patch,
      refresh,
      view,
      currentStationId: activeStationId,
      fallbackStationId,
      onLocalAction: handleLocalAction,
    });

  const handleAction = useCallback(
    (
      orderId: string,
      newStatus: OrderStatus | "served",
      itemIds?: string[]
    ) => {
      if (newStatus === "preparing") void handleMarkPreparing(orderId, itemIds);
      else if (newStatus === "ready") void handleMarkReady(orderId, itemIds);
      else if (newStatus === "served") void handleMarkServed(orderId, itemIds);
    },
    [handleMarkPreparing, handleMarkReady, handleMarkServed]
  );

  const handleVoidItemForOrder = useCallback(
    (orderId: string, itemId: string) => void handleVoidItem(orderId, itemId),
    [handleVoidItem]
  );

  const handleRefire = useCallback(
    async (orderId: string, item: OrderItem, reason: string) => {
      const ok = await handleRefireItem(orderId, item.id, reason);
      if (ok) {
        setHighlightedTicketId(orderId);
        setTimeout(() => {
          const el = document.getElementById(`ticket-${orderId}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        setTimeout(() => setHighlightedTicketId(null), 2000);
      }
    },
    [handleRefireItem]
  );

  const handleRecall = useCallback(
    async (completed: CompletedOrder) => {
      const ok = await handleRecallOrder(completed.id, completed.bumpedFromStationId);
      if (!ok) return;
      // Completed list is derived from view; patch will update view, so dropdown updates on next render
      if (activeStationId !== completed.bumpedFromStationId) {
        setActiveStationId(completed.bumpedFromStationId);
      }
      setHighlightedTicketId(completed.id);
      setTimeout(() => {
        const el = document.getElementById(`ticket-${completed.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      setTimeout(() => setHighlightedTicketId(null), 2000);
    },
    [handleRecallOrder, activeStationId]
  );

  const handleClearModified = useCallback((orderId: string) => {
    const existing = modificationClearTimeoutsRef.current.get(orderId);
    if (existing) {
      clearTimeout(existing);
      modificationClearTimeoutsRef.current.delete(orderId);
    }
    // First slice: no local modified state; refresh to get latest from server if needed
    refresh(true);
  }, [refresh]);

  const handleModificationToastView = useCallback((orderId: string) => {
    setModificationToasts((prev) => prev.filter((t) => t.orderId !== orderId));
    const ticketElement = document.getElementById(`ticket-${orderId}`);
    ticketElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedTicketId(orderId);
    setTimeout(() => setHighlightedTicketId(null), 1000);
  }, []);

  const handleModificationToastDismiss = useCallback((toastId: string) => {
    setModificationToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);


  // --- New order detection: toast when orders appear (after refresh) ---
  const orderIdsForStation = useMemo(() => {
    return new Set(
      orders
        .filter((o) => o.items.some((i) => i.stationId === activeStationId))
        .map((o) => o.id)
    );
  }, [orders, activeStationId]);

  const prevStationIdRef = useRef<string>(activeStationId);
  useEffect(() => {
    if (!view || !activeStationId) return;
    const currentIds = orderIdsForStation;
    const stationChanged = prevStationIdRef.current !== activeStationId;
    prevStationIdRef.current = activeStationId;
    if (stationChanged || !hasInitializedNotificationsRef.current) {
      prevOrderIdsRef.current = currentIds;
      hasInitializedNotificationsRef.current = true;
      return;
    }
    const prev = prevOrderIdsRef.current;
    const newlyAppeared: Order[] = [];
    currentIds.forEach((id) => {
      if (!prev.has(id)) {
        const order = orders.find((o) => o.id === id);
        if (order && order.items.some((i) => i.stationId === activeStationId)) {
          const stationStatus = order.stationStatuses?.[activeStationId] ?? order.status;
          if (stationStatus === "pending") newlyAppeared.push(order);
        }
      }
    });
    prevOrderIdsRef.current = currentIds;
    newlyAppeared.forEach((order) => addToast(order));
  }, [orderIdsForStation, orders, activeStationId, view, addToast]);

  // --- Modification detection: toast when existing orders change (station-scoped) ---
  const fallbackStationForSnapshot = view?.stations[0]?.id ?? "kitchen";
  const viewSnapshot = useMemo(() => {
    if (!view || !activeStationId) return "";
    const parts: string[] = [];
    for (const o of view.orders) {
      const items = view.orderItems.filter((i) => i.orderId === o.id && i.voidedAt == null);
      const itemStationId = (i: { stationOverride: string | null }) =>
        i.stationOverride ?? o.station ?? fallbackStationForSnapshot;
      const stationItems = items.filter((i) => itemStationId(i) === activeStationId);
      if (stationItems.length === 0) continue;
      parts.push(`${o.id}:${stationItems.map((i) => `${i.id}:${i.status}`).join(",")}`);
    }
    return parts.join("|");
  }, [view, activeStationId, fallbackStationForSnapshot]);

  const prevModStationIdRef = useRef<string>(activeStationId);
  useEffect(() => {
    if (!view || !activeStationId) return;
    const stationChanged = prevModStationIdRef.current !== activeStationId;
    prevModStationIdRef.current = activeStationId;
    if (stationChanged) {
      prevViewSnapshotRef.current = viewSnapshot;
      return;
    }
    if (!hasInitializedNotificationsRef.current) return;
    const prev = prevViewSnapshotRef.current;
    prevViewSnapshotRef.current = viewSnapshot;
    if (prev === "" || prev === viewSnapshot) return;

    const prevByOrder = new Map<string, Map<string, string>>();
    for (const part of prev.split("|")) {
      const colonIdx = part.indexOf(":");
      const orderId = part.slice(0, colonIdx);
      const rest = part.slice(colonIdx + 1);
      if (!orderId) continue;
      const m = new Map<string, string>();
      for (const itemPart of rest.split(",")) {
        const [itemId, status] = itemPart.split(":");
        if (itemId && status) m.set(itemId, status);
      }
      prevByOrder.set(orderId, m);
    }

    const fallbackStationId = view.stations[0]?.id ?? "kitchen";
    const itemStation = (i: { stationOverride: string | null }, o: { station?: string | null }) =>
      i.stationOverride ?? o.station ?? fallbackStationId;

    const currentByOrder = new Map<string, Map<string, string>>();
    for (const o of view.orders) {
      const items = view.orderItems.filter((i) => i.orderId === o.id && i.voidedAt == null);
      const stationItems = items.filter((i) => itemStation(i, o) === activeStationId);
      if (stationItems.length === 0) continue;
      const m = new Map<string, string>();
      for (const i of stationItems) m.set(i.id, i.status);
      currentByOrder.set(o.id, m);
    }

    const orderMap = new Map(view.orders.map((o) => [o.id, o]));
    currentByOrder.forEach((currentItems, orderId) => {
      const prevItems = prevByOrder.get(orderId);
      if (!prevItems) return;
      const changes: import("@/components/kds/KDSModificationToast").OrderChange[] = [];
      let hasChange = false;
      const changeSigs: string[] = [];
      currentItems.forEach((status, itemId) => {
        const prevStatus = prevItems.get(itemId);
        if (prevStatus === undefined) {
          const item = view.orderItems.find((i) => i.id === itemId);
          if (item) {
            changes.push({ type: "added", item: { name: item.itemName, quantity: item.quantity } });
            changeSigs.push(`added:${itemId}`);
            hasChange = true;
          }
        }
        // Do NOT treat status changes (preparing, ready, served, bump, recall) as "modified".
        // Lifecycle transitions are normal workflow, not order modifications.
      });
      prevItems.forEach((_, itemId) => {
        if (!currentItems.has(itemId)) {
          const item = view.orderItems.find((i) => i.id === itemId);
          if (item) {
            changes.push({ type: "removed", item: { name: item.itemName } });
            changeSigs.push(`removed:${itemId}`);
            hasChange = true;
          }
        }
      });
      if (hasChange && changes.length > 0) {
        if (suppressModificationForOrderIdsRef.current.has(orderId)) return;
        const changesSig = changeSigs.sort().join(",");
        const modKey = `${orderId}:${changesSig}`;
        const now = Date.now();
        const recent = recentModToastKeysRef.current;
        const recentAt = recent.get(modKey);
        if (recentAt != null && now - recentAt < 8000) return;
        for (const [k, t] of recent) {
          if (now - t >= 8000) recent.delete(k);
        }
        recent.set(modKey, now);
        const order = orderMap.get(orderId);
        if (order) {
          setModificationToasts((prev) => {
            const id = `mod-${nextModificationToastId.current++}`;
            const toast: ModificationToastData = {
              id,
              orderId,
              orderNumber: order.orderNumber,
              tableNumber: order.tableNumber,
              customerName: order.customerName,
              changes,
            };
            return [...prev.slice(-4), toast];
          });
        }
      }
    });
  }, [viewSnapshot, view, activeStationId]);

  // --- Completed order recall: derive from view (survives refresh) ---
  const completedOrdersForRecall = useMemo(
    () => deriveCompletedOrdersFromView(view),
    [view]
  );

  // Filter orders to only show items for current station
  const filteredOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      items: order.items.filter(item => item.stationId === activeStationId),
    })).filter(order => order.items.length > 0);
  }, [orders, activeStationId]);

  // All-Day: only orders in NEW for this station, and only this station's items
  const allDayOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const stationStatus = activeStationId && order.stationStatuses
          ? order.stationStatuses[activeStationId]
          : order.status;
        return stationStatus === "pending";
      })
      .filter((order) => order.items.some((item) => item.stationId === activeStationId))
      .map((order) => ({
        ...order,
        items: order.items.filter((item) => item.stationId === activeStationId),
      }));
  }, [orders, activeStationId]);

  // Batching: items that appear in 3+ NEW orders (same station as All-Day)
  const batchSuggestions = useMemo(
    () => detectBatches(allDayOrders, 3),
    [allDayOrders]
  );
  const [dismissedBatchKeys, setDismissedBatchKeys] = useState<Set<string>>(new Set());
  const [highlightedBatch, setHighlightedBatch] = useState<{
    batchKey: string;
    orderIds: string[];
    itemName: string;
    variant: string | null;
  } | null>(null);
  const batchHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBatchDismiss = useCallback((key: string) => {
    setDismissedBatchKeys((prev) => new Set([...prev, key]));
  }, []);

  const handleBatchHighlight = useCallback(
    (batch: BatchSuggestion) => {
      if (batchHighlightTimeoutRef.current) {
        clearTimeout(batchHighlightTimeoutRef.current);
        batchHighlightTimeoutRef.current = null;
      }
      const k = batchKey(batch);
      setHighlightedBatch({
        batchKey: k,
        orderIds: batch.orderIds,
        itemName: batch.itemName,
        variant: batch.variant,
      });
      const firstOrderId = batch.orderIds[0];
      const ticketEl = document.getElementById(`ticket-${firstOrderId}`);
      ticketEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      batchHighlightTimeoutRef.current = setTimeout(() => {
        setHighlightedBatch(null);
        batchHighlightTimeoutRef.current = null;
      }, 30_000);
    },
    []
  );

  const getOrderLabel = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return `#${orderId}`;
      const num = order.orderNumber;
      if (order.orderType === "dine_in" && order.tableNumber)
        return `#${num} (T-${order.tableNumber})`;
      if (order.orderType === "pickup" && order.customerName)
        return `#${num} (${order.customerName})`;
      return `#${num} (${order.orderType === "pickup" ? "Pickup" : "Dine-in"})`;
    },
    [orders]
  );

  const activeTableNumbers = useMemo(() => {
    const tables = new Set<string>();
    orders.forEach((o) => {
      if (o.orderType === "dine_in" && o.tableNumber) tables.add(o.tableNumber);
    });
    return Array.from(tables).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [orders]);

  const incomingUnreadMessages = useMemo(() => {
    return stationMessages.filter(
      (m) =>
        (m.toStation === activeStationId || m.toStation === "all") &&
        m.fromStationId !== activeStationId &&
        !m.isRead
    );
  }, [stationMessages, activeStationId]);

  const unreadMessageCount = useMemo(
    () => incomingUnreadMessages.length,
    [incomingUnreadMessages]
  );

  const handleSendMessage = useCallback(
    (toStation: string, message: string) => {
      const current = STATIONS.find((s) => s.id === activeStationId);
      if (!current) return;
      const id = `msg-${nextMessageId.current++}`;
      const newMsg: StationMessage = {
        id,
        fromStationId: current.id,
        fromStationName: current.name,
        fromStationIcon: current.icon,
        toStation,
        message,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setStationMessages((prev) => [...prev, newMsg]);
    },
    [activeStationId]
  );

  const handleMarkMessageRead = useCallback((id: string) => {
    setStationMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  }, []);

  const handleReplyToStation = useCallback((stationId: string) => {
    setReplyToStationId(stationId);
    setMessageHistoryOpen(false);
    setMessagePanelOpen(true);
  }, []);

  const handleMessagePanelOpenChange = useCallback((open: boolean) => {
    setMessagePanelOpen(open);
    if (!open) setReplyToStationId(null);
  }, []);

  // Calculate order counts per station
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATIONS.forEach(station => {
      counts[station.id] = orders.filter(order => 
        order.items.some(item => item.stationId === station.id)
      ).length;
    });
    return counts;
  }, [orders, STATIONS]);

  const activeCount = filteredOrders.length;

  const isLoading =
    !locationIdResolved || (locationId !== null && view === null && kdsError === null);

  if (isLoading) {
    return <KdsPageSkeleton />;
  }

  if (locationIdResolved && !locationId) {
    return (
      <DisplayModeProvider>
        <KDSPageLayout>
          <KDSNoLocationState />
        </KDSPageLayout>
      </DisplayModeProvider>
    );
  }

  if (kdsError) {
    return (
      <DisplayModeProvider>
        <KDSPageLayout>
          <KDSErrorState message={kdsError} onRetry={() => refresh()} />
        </KDSPageLayout>
      </DisplayModeProvider>
    );
  }

  return (
    <DisplayModeProvider>
      <KDSPageLayout>
      {kdsStaleError && <KDSStaleBanner onRetry={() => refresh()} />}
      <KDSHeader
        stations={STATIONS}
        activeStationId={activeStationId}
        onStationChange={setActiveStationId}
        orderCounts={orderCounts}
        activeCount={activeCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenMessages={() => setMessagePanelOpen(true)}
        unreadMessageCount={unreadMessageCount}
        onOpenMessageHistory={() => setMessageHistoryOpen(true)}
        completedOrders={completedOrdersForRecall}
        onRecall={handleRecall}
        settingsHref="/kds/settings"
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        {STATIONS.length === 0 && (
          <div className={cn("shrink-0 px-4 py-3 text-center text-sm theme-transition", "bg-amber-500/20 text-amber-800 dark:bg-amber-500/25 dark:text-amber-200")}>
            No stations configured.{" "}
            <Link href="/kds/settings" className="underline font-medium hover:no-underline">
              Add stations in KDS settings
            </Link>
          </div>
        )}
        {viewMode === "tickets" ? (
          <>
            {batchSuggestions.length > 0 && batchSuggestions.some((b) => !dismissedBatchKeys.has(batchKey(b))) && (
              <KDSBatchHints
                batches={batchSuggestions}
                dismissedKeys={dismissedBatchKeys}
                onDismiss={handleBatchDismiss}
                onHighlight={handleBatchHighlight}
                getOrderLabel={getOrderLabel}
              />
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
              <KDSColumns
                orders={filteredOrders}
                onAction={handleAction}
                onRefire={handleRefire}
                onVoidItem={handleVoidItemForOrder}
                onSplitToNewTicket={handleSplitToNewTicket}
                onUnsplitToMain={handleUnsplitToMain}
                onClearModified={handleClearModified}
                onSnooze={handleSnooze}
                onWakeUp={handleWakeUp}
                highlightedTicketId={highlightedTicketId}
                currentStationId={activeStationId}
                stations={STATIONS}
                transitioningTickets={transitioningTickets}
                highlightedBatch={highlightedBatch}
              />
            </div>
          </>
        ) : (
          <AllDayView orders={allDayOrders} stationId={activeStationId} />
        )}
      </div>
      
      <KDSModificationToastContainer
        toasts={modificationToasts}
        onDismiss={handleModificationToastDismiss}
        onView={handleModificationToastView}
      />

      <KDSToastContainer 
        toasts={toasts}
        onView={handleToastView}
        onDismiss={handleToastDismiss}
      />

      <KDSMessagePanel
        open={messagePanelOpen}
        onOpenChange={handleMessagePanelOpenChange}
        currentStation={STATIONS.find((s) => s.id === activeStationId) ?? STATIONS[0]}
        stations={STATIONS}
        activeTableNumbers={activeTableNumbers}
        onSend={handleSendMessage}
        replyToStationId={replyToStationId}
        onOpenHistory={() => {
          setMessagePanelOpen(false);
          setMessageHistoryOpen(true);
        }}
      />

      <KDSMessageHistory
        open={messageHistoryOpen}
        onOpenChange={setMessageHistoryOpen}
        messages={stationMessages}
        currentStationId={activeStationId}
        stations={STATIONS}
        onMarkRead={handleMarkMessageRead}
        onReplyTo={handleReplyToStation}
      />

      {incomingUnreadMessages.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {incomingUnreadMessages.map((msg) => (
            <IncomingMessageToast
              key={msg.id}
              message={msg}
              onReply={() => handleReplyToStation(msg.fromStationId)}
              onDismiss={() => handleMarkMessageRead(msg.id)}
            />
          ))}
        </div>
      )}

      </KDSPageLayout>
    </DisplayModeProvider>
  );
}
