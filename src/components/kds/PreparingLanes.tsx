"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { KDSTicket } from "./KDSTicket";
import { KDSColumn } from "./KDSColumn";
import { KDSEmptyState } from "./KDSEmptyState";
import { useDisplayMode } from "./DisplayModeContext";
import type { Station } from "./StationSwitcher";
import { cn } from "@/lib/utils";
import type { LaneEntry } from "@/lib/kds/derivePreparingLaneEntries";
import { getArrivalTimestamp, getAgeTimestampForColumn } from "@/lib/kds/agingHelpers";

type OrderStatus = "pending" | "preparing" | "ready";
interface OrderItem {
  id: string;
  name: string;
  variant: string | null;
  quantity: number;
  customizations: string[];
  stationId?: string;
  sentToKitchenAt?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
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
  specialInstructions?: string;
  stationStatuses?: Record<string, OrderStatus>;
  subStation?: string;
}

interface PreparingLanesProps {
  /** When false, render single column (no lane split). Only kitchen uses lanes. */
  useLanes?: boolean;
  /** Full orders (used when !useLanes or as fallback). */
  orders: Order[];
  /** Lane-split entries for kitchen. When present with useLanes, these drive lane rendering. */
  laneEntries?: LaneEntry[];
  onAction: (orderId: string, newStatus: OrderStatus | "served", itemIds?: string[]) => void;
  onRefire?: (orderId: string, item: import("./KDSTicket").OrderItem, reason: string) => void;
  onVoidItem?: (orderId: string, itemId: string) => void;
  onClearModified?: (orderId: string) => void;
  onSnooze?: (orderId: string, durationSeconds: number) => void;
  onWakeUp?: (orderId: string) => void;
  highlightedTicketId?: string | null;
  currentStationId?: string;
  stations?: Station[];
  allOrders: Order[];
  transitioningTickets?: Map<string, { from: OrderStatus; to: OrderStatus }>;
  highlightedBatch?: import("./KDSColumns").HighlightedBatch | null;
}

/**
 * Lane buckets for preparing view. When laneEntries is used, entries are grouped by lane.
 * Otherwise legacy: orders grouped by order.subStation (first item decides lane).
 */
const SUB_STATIONS = [
  { id: "grill", name: "GRILL", tint: "bg-orange-500/5" },
  { id: "fryer", name: "FRYER", tint: "bg-amber-500/5" },
  { id: "cold_prep", name: "COLD PREP", tint: "bg-teal-500/5" },
  { id: "unassigned", name: "UNASSIGNED", tint: "bg-slate-500/5" },
] as const;

const COOKS = [
  { name: "Alex", color: "#3b82f6" },  // blue
  { name: "Maria", color: "#8b5cf6" }, // purple
  { name: "Jose", color: "#ec4899" },  // pink
  { name: "Kim", color: "#10b981" },   // green
];

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

/** 1-based queue position using firedAt ?? createdAt (global arrival order). */
function getQueuePosition(order: Order, allOrders: Order[]): number {
  const sorted = [...allOrders].sort(
    (a, b) =>
      new Date(getArrivalTimestamp(a)).getTime() -
      new Date(getArrivalTimestamp(b)).getTime()
  );
  const index = sorted.findIndex((o) => o.id === order.id);
  return index !== -1 ? index + 1 : 0;
}

// Assign cook based on order (mock logic)
function assignCook(order: Order): { name: string; color: string } {
  const hash = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % COOKS.length;
  return COOKS[index];
}

function getLoadLevel(count: number): "normal" | "busy" | "overloaded" {
  if (count >= 7) return "overloaded";
  if (count >= 4) return "busy";
  return "normal";
}

/** Convert LaneEntry to order-like shape for KDSTicket. */
function laneEntryToOrderLike(entry: LaneEntry): Order & { ageTimestamp: string } {
  return {
    id: entry.orderId,
    orderNumber: entry.orderNumber,
    orderType: entry.orderType,
    tableNumber: entry.tableNumber,
    customerName: entry.customerName,
    status: entry.stationStatuses[Object.keys(entry.stationStatuses)[0] ?? ""] ?? "preparing",
    createdAt: entry.createdAt,
    ageTimestamp: entry.ageTimestamp,
    items: entry.items,
    specialInstructions: entry.specialInstructions,
    stationStatuses: entry.stationStatuses,
    isRemake: entry.isRemake,
    isFullRemake: entry.isFullRemake,
    remakeReason: entry.remakeReason,
    originalOrderId: entry.originalOrderId,
    isRecalled: entry.isRecalled,
    recalledAt: entry.recalledAt,
    isModified: entry.isModified,
    modifiedAt: entry.modifiedAt,
    isSnoozed: entry.isSnoozed,
    snoozedAt: entry.snoozedAt,
    snoozeUntil: entry.snoozeUntil,
    snoozeDurationSeconds: entry.snoozeDurationSeconds,
    wasSnoozed: entry.wasSnoozed,
  };
}

export function PreparingLanes({
  useLanes = true,
  orders,
  laneEntries = [],
  onAction,
  onRefire,
  onVoidItem,
  onClearModified,
  onSnooze,
  onWakeUp,
  highlightedTicketId,
  currentStationId,
  stations = [],
  allOrders,
  transitioningTickets = new Map(),
  highlightedBatch = null,
}: PreparingLanesProps) {
  const { theme } = useDisplayMode();
  // Track tickets that are in "staged" position (at top, before sliding to final position)
  const [stagedTickets, setStagedTickets] = useState<Set<string>>(new Set());
  const stagedTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  // Per-lane: detect orders that just appeared so we always slide-in (no jump)
  const prevLaneOrderIdsRef = useRef<Record<string, Set<string>>>({});
  const hasInitializedLanesRef = useRef(false);

  const useLaneEntries = useLanes; // Kitchen uses lane-based rendering (laneEntries from parent)
  const LANE_KEY_SEP = "::";
  const currentTicketIds = useLaneEntries
    ? new Set(laneEntries.map((e) => `${e.orderId}${LANE_KEY_SEP}${e.lane}`))
    : new Set(orders.map((o) => o.id));

  // Detect newly arrived tickets and stage them at top
  useEffect(() => {
    const newlyArrived: string[] = [];
    currentTicketIds.forEach((id) => {
      if (!prevOrderIdsRef.current.has(id)) {
        const orderId = useLaneEntries ? id.split(LANE_KEY_SEP)[0] ?? id : id;
        const transition = transitioningTickets.get(orderId);
        if (transition && transition.to === "preparing") {
          newlyArrived.push(id);
        }
      }
    });

    // Stage newly arrived tickets
    if (newlyArrived.length > 0) {
      setStagedTickets(prev => {
        const updated = new Set(prev);
        newlyArrived.forEach(id => updated.add(id));
        return updated;
      });

      // After highlight period, release to final sorted position
      newlyArrived.forEach(id => {
        // Clear any existing timeout
        const existingTimeout = stagedTimeoutsRef.current.get(id);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          setStagedTickets(prev => {
            const updated = new Set(prev);
            updated.delete(id);
            return updated;
          });
          stagedTimeoutsRef.current.delete(id);
        }, 1100); // Release after ~1 second highlight

        stagedTimeoutsRef.current.set(id, timeout);
      });
    }

    prevOrderIdsRef.current = currentTicketIds;
  }, [orders, laneEntries, useLaneEntries, transitioningTickets]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      stagedTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Use lane entries when available; otherwise legacy orders with subStation (memoized to avoid re-render loops)
  const ordersWithSubStations = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        subStation: order.subStation ?? "unassigned",
      })),
    [orders]
  );

  // Hide UNASSIGNED lane when empty (UI polish); derivation keeps it so tickets with missing/invalid substations stay visible
  const visibleSubStations = useMemo(
    () =>
      SUB_STATIONS.filter((ss) => {
        if (ss.id !== "unassigned") return true;
        return useLaneEntries
          ? laneEntries.some((e) => e.lane === "unassigned")
          : ordersWithSubStations.some((o) => o.subStation === "unassigned");
      }),
    [useLaneEntries, laneEntries, ordersWithSubStations]
  );

  // Per-lane counts (stable key for effect deps) to avoid effect loops from new object refs
  const countByLaneKey = useMemo(
    () =>
      SUB_STATIONS.map((ss) =>
        useLaneEntries
          ? laneEntries.filter((e) => e.lane === ss.id).length
          : ordersWithSubStations.filter((o) => o.subStation === ss.id).length
      ).join(","),
    [useLaneEntries, laneEntries, ordersWithSubStations]
  );

  // Per-lane ticket IDs for "just arrived" detection (memoized to avoid effect loops)
  const laneTicketIdsByLane = useMemo(() => {
    if (!useLaneEntries) return null;
    const m: Record<string, Set<string>> = {};
    SUB_STATIONS.forEach((ss) => {
      m[ss.id] = new Set(
        laneEntries
          .filter((e) => e.lane === ss.id)
          .map((e) => `${e.orderId}${LANE_KEY_SEP}${e.lane}`)
      );
    });
    return m;
  }, [useLaneEntries, laneEntries]);

  // After each render, store current lane ticket IDs so we can detect "just arrived" on next render
  useLayoutEffect(() => {
    if (useLaneEntries && laneTicketIdsByLane) {
      SUB_STATIONS.forEach((ss) => {
        prevLaneOrderIdsRef.current[ss.id] = laneTicketIdsByLane[ss.id] ?? new Set();
      });
    } else {
      SUB_STATIONS.forEach((ss) => {
        const ids = new Set(
          ordersWithSubStations.filter((o) => o.subStation === ss.id).map((o) => o.id)
        );
        prevLaneOrderIdsRef.current[ss.id] = ids;
      });
    }
    hasInitializedLanesRef.current = true;
  }, [useLaneEntries, laneTicketIdsByLane, ordersWithSubStations]);

  // Delay showing "No orders" per lane so exit animation runs when last ticket leaves (preparing → ready)
  const [showEmptyByLane, setShowEmptyByLane] = useState<Record<string, boolean>>({});
  const prevCountByLaneRef = useRef<Record<string, number>>({});
  const emptyTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Stability check: this effect should run only when countByLaneKey changes, not every render
      // eslint-disable-next-line no-console
      console.log("[KDS PreparingLanes] empty-lane effect ran", { countByLaneKey });
    }
    SUB_STATIONS.forEach((subStation) => {
      const count = useLaneEntries
        ? laneEntries.filter((e) => e.lane === subStation.id).length
        : ordersWithSubStations.filter((o) => o.subStation === subStation.id).length;
      const prevCount = prevCountByLaneRef.current[subStation.id] ?? null;
      if (count === 0) {
        if (prevCount !== null && prevCount > 0) {
          const t = setTimeout(() => {
            setShowEmptyByLane((prev) => ({ ...prev, [subStation.id]: true }));
            delete emptyTimeoutsRef.current[subStation.id];
          }, 400);
          emptyTimeoutsRef.current[subStation.id] = t;
        } else {
          setShowEmptyByLane((prev) => ({ ...prev, [subStation.id]: true }));
        }
      } else {
        if (emptyTimeoutsRef.current[subStation.id]) {
          clearTimeout(emptyTimeoutsRef.current[subStation.id]);
          delete emptyTimeoutsRef.current[subStation.id];
        }
        setShowEmptyByLane((prev) => ({ ...prev, [subStation.id]: false }));
      }
      prevCountByLaneRef.current[subStation.id] = count;
    });
    return () => {
      Object.values(emptyTimeoutsRef.current).forEach(clearTimeout);
      emptyTimeoutsRef.current = {};
    };
  }, [useLaneEntries, countByLaneKey]);

  if (!useLanes) {
    return (
      <KDSColumn
        title="PREPARING"
        titleIcon="🍳"
        status="preparing"
        orders={allOrders}
        onAction={onAction}
        onRefire={onRefire}
        onVoidItem={onVoidItem}
        onClearModified={onClearModified}
        onSnooze={onSnooze}
        onWakeUp={onWakeUp}
        highlightedTicketId={highlightedTicketId}
        currentStationId={currentStationId}
        stations={stations}
        transitioningTickets={transitioningTickets}
        highlightedBatch={highlightedBatch}
        hideHeader={true}
      />
    );
  }

  return (
    <div className={cn("flex h-full theme-transition", theme.columnDivide)}>
      {visibleSubStations.map((subStation) => {
        const laneEntriesForLane = useLaneEntries
          ? (laneEntries.filter((e) => e.lane === subStation.id)
              .sort((a, b) => {
                const aKey = `${a.orderId}${LANE_KEY_SEP}${a.lane}`;
                const bKey = `${b.orderId}${LANE_KEY_SEP}${b.lane}`;
                const aIsStaged = stagedTickets.has(aKey);
                const bIsStaged = stagedTickets.has(bKey);
                if (aIsStaged && !bIsStaged) return -1;
                if (!aIsStaged && bIsStaged) return 1;
                if (a.isSnoozed && !b.isSnoozed) return 1;
                if (!a.isSnoozed && b.isSnoozed) return -1;
                return (
                  new Date(a.ageTimestamp).getTime() - new Date(b.ageTimestamp).getTime()
                );
              }))
          : [];

        const laneOrders = useLaneEntries
          ? []
          : ordersWithSubStations
              .filter((order) => order.subStation === subStation.id)
              .sort((a, b) => {
                const aIsStaged = stagedTickets.has(a.id);
                const bIsStaged = stagedTickets.has(b.id);
                if (aIsStaged && !bIsStaged) return -1;
                if (!aIsStaged && bIsStaged) return 1;
                if (a.isSnoozed && !b.isSnoozed) return 1;
                if (!a.isSnoozed && b.isSnoozed) return -1;
                const aTs = getAgeTimestampForColumn(
                  a,
                  "preparing",
                  currentStationId ?? ""
                );
                const bTs = getAgeTimestampForColumn(
                  b,
                  "preparing",
                  currentStationId ?? ""
                );
                return new Date(aTs).getTime() - new Date(bTs).getTime();
              });

        const itemsToRender = useLaneEntries ? laneEntriesForLane : laneOrders;
        const itemCount = useLaneEntries
          ? laneEntriesForLane.reduce((s, e) => s + e.items.reduce((t, i) => t + i.quantity, 0), 0)
          : laneOrders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.quantity, 0), 0);

        return (
          <div key={subStation.id} className="flex flex-col min-h-0 flex-1">
            {/* Lane Header with Station Load Indicator (item count, not ticket count) */}
            {(() => {
              const loadLevel = getLoadLevel(itemCount);
              return (
                <div className={cn("px-1.5 py-1 2xl:px-2 2xl:py-1.5 border-b shrink-0 theme-transition flex items-center justify-center gap-1", theme.cardBg, theme.border, theme.text, theme.columnTitleSeparator)}>
                  <span className="font-semibold text-sm 2xl:text-base uppercase tracking-wide text-center">
                    {subStation.name}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1 tabular-nums theme-transition",
                      "text-sm 2xl:text-base",
                      loadLevel === "normal" && cn(theme.text, "font-semibold"),
                      loadLevel === "busy" && theme.timerWarning,
                      loadLevel === "overloaded" && cn(theme.removalText, "font-bold")
                    )}
                  >
                    {loadLevel === "overloaded" && <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />}
                    {loadLevel === "busy" && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" aria-hidden />
                    )}
                    <span>{loadLevel === "normal" ? `(${itemCount})` : itemCount}</span>
                  </div>
                </div>
              );
            })()}

            {/* Lane Content - Independently Scrollable with subtle tint */}
            <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 2xl:p-5 min-h-0 relative ${subStation.tint}`}>
              {itemsToRender.length === 0 && showEmptyByLane[subStation.id] && (
                <div className={cn("text-base 2xl:text-lg text-center py-8 theme-transition", theme.textMuted)}>No orders</div>
              )}
              <div className="flex flex-col gap-4 2xl:gap-5">
                <AnimatePresence mode="sync">
                  {useLaneEntries
                    ? laneEntriesForLane.map((entry) => {
                        const orderLike = laneEntryToOrderLike(entry);
                        const entryKey = `${entry.orderId}${LANE_KEY_SEP}${entry.lane}`;
                        const fullOrder = allOrders.find((o) => o.id === entry.orderId);
                        const queuePosition = fullOrder
                          ? getQueuePosition(fullOrder, allOrders)
                          : 0;
                        const stationStatus = entry.stationStatuses[currentStationId ?? ""];
                        const isStationComplete = stationStatus === "ready";
                        const waitingStations =
                          currentStationId && entry.stationStatusesFull && stations.length > 0
                            ? stations.filter((s) => {
                                const status = entry.stationStatusesFull?.[s.id];
                                return s.id !== currentStationId && status !== "ready";
                              })
                            : [];
                        const transition = transitioningTickets.get(entry.orderId);
                        const wasInLane = prevLaneOrderIdsRef.current[subStation.id]?.has(entryKey);
                        const justArrived = hasInitializedLanesRef.current
                          ? !wasInLane
                          : !!(transition && transition.to === "preparing");
                        const isStaged = stagedTickets.has(entryKey);
                        const isInBatch = highlightedBatch?.orderIds.includes(entry.orderId) ?? false;
                        const laneItemIds = entry.items.map((i) => i.id);
                        const boundOnAction = (
                          oid: string,
                          status: OrderStatus,
                          ids?: string[]
                        ) => onAction(oid, status, ids ?? laneItemIds);
                        return (
                          <KDSTicket
                            key={entryKey}
                            order={orderLike}
                            ageTimestamp={entry.ageTimestamp}
                            onAction={boundOnAction}
                            onRefire={onRefire}
                            onVoidItem={onVoidItem}
                            onClearModified={onClearModified}
                            priority={queuePosition > 0 ? queuePosition : undefined}
                            isHighlighted={entry.orderId === highlightedTicketId}
                            currentStationId={currentStationId}
                            waitingStations={waitingStations}
                            isStationComplete={isStationComplete}
                            columnAccent="preparing"
                            assignedCook={assignCook(orderLike)}
                            transitionDirection={justArrived ? "from-left" : undefined}
                            isLanding={justArrived || isStaged}
                            landingType={(justArrived || isStaged) ? "preparing" : undefined}
                            batchBadge={
                              isInBatch
                                ? { label: `💡 BATCH: ${highlightedBatch?.itemName ?? ""}` }
                                : undefined
                            }
                            batchItemKey={isInBatch ? highlightedBatch?.batchKey : undefined}
                            isBatchHighlighted={isInBatch}
                            onSnooze={onSnooze}
                            onWakeUp={onWakeUp}
                          />
                        );
                      })
                    : laneOrders.map((order) => {
                        const queuePosition = getQueuePosition(order, allOrders);
                        const stationStatus =
                          currentStationId && order.stationStatuses
                            ? order.stationStatuses[currentStationId]
                            : undefined;
                        const isStationComplete = stationStatus === "ready";
                        const waitingStations =
                          currentStationId && order.stationStatuses && stations.length > 0
                            ? stations.filter((s) => {
                                const status = order.stationStatuses?.[s.id];
                                return s.id !== currentStationId && status !== "ready";
                              })
                            : [];
                        const transition = transitioningTickets.get(order.id);
                        const wasInLane = prevLaneOrderIdsRef.current[subStation.id]?.has(order.id);
                        const justArrived = hasInitializedLanesRef.current
                          ? !wasInLane
                          : !!(transition && transition.to === "preparing");
                        const isStaged = stagedTickets.has(order.id);
                        const isInBatch =
                          highlightedBatch?.orderIds.includes(order.id) ?? false;
                        return (
                          <KDSTicket
                            key={order.id}
                            order={order}
                            ageTimestamp={getAgeTimestampForColumn(
                              order,
                              "preparing",
                              currentStationId ?? ""
                            )}
                            onAction={onAction}
                            onRefire={onRefire}
                            onVoidItem={onVoidItem}
                            onClearModified={onClearModified}
                            priority={queuePosition > 0 ? queuePosition : undefined}
                            isHighlighted={order.id === highlightedTicketId}
                            currentStationId={currentStationId}
                            waitingStations={waitingStations}
                            isStationComplete={isStationComplete}
                            columnAccent="preparing"
                            assignedCook={assignCook(order)}
                            transitionDirection={justArrived ? "from-left" : undefined}
                            isLanding={justArrived || isStaged}
                            landingType={(justArrived || isStaged) ? "preparing" : undefined}
                            batchBadge={
                              isInBatch
                                ? { label: `💡 BATCH: ${highlightedBatch?.itemName ?? ""}` }
                                : undefined
                            }
                            batchItemKey={isInBatch ? highlightedBatch?.batchKey : undefined}
                            isBatchHighlighted={isInBatch}
                            onSnooze={onSnooze}
                            onWakeUp={onWakeUp}
                          />
                        );
                      })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
