"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { KDSTicket } from "./KDSTicket";
import { KDSEmptyState } from "./KDSEmptyState";
import { useDisplayMode } from "./DisplayModeContext";
import type { Station } from "./StationSwitcher";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "preparing" | "ready";
type SubStation = "grill" | "fryer" | "cold_prep";

interface OrderItem {
  id: string;
  name: string;
  variant: string | null;
  quantity: number;
  customizations: string[];
  stationId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  specialInstructions?: string;
  stationStatuses?: Record<string, OrderStatus>;
  subStation?: SubStation;
}

interface PreparingLanesProps {
  orders: Order[];
  onAction: (orderId: string, newStatus: OrderStatus) => void;
  onRefire?: (orderId: string, item: import("./KDSTicket").OrderItem, reason: string) => void;
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

const SUB_STATIONS = [
  { id: "grill" as SubStation, name: "GRILL", tint: "bg-orange-500/5" },
  { id: "fryer" as SubStation, name: "FRYER", tint: "bg-amber-500/5" },
  { id: "cold_prep" as SubStation, name: "COLD PREP", tint: "bg-teal-500/5" },
];

const COOKS = [
  { name: "Alex", color: "#3b82f6" },  // blue
  { name: "Maria", color: "#8b5cf6" }, // purple
  { name: "Jose", color: "#ec4899" },  // pink
  { name: "Kim", color: "#10b981" },   // green
];

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

/** 1-based queue position across all orders (oldest first). Shown on every ticket so chefs can track order. */
function getQueuePosition(order: Order, allOrders: Order[]): number {
  const sorted = [...allOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const index = sorted.findIndex((o) => o.id === order.id);
  return index !== -1 ? index + 1 : 0;
}

// Assign sub-station based on order characteristics (mock logic)
function assignSubStation(order: Order): SubStation {
  // Use order ID hash to consistently assign to same lane
  const hash = order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % SUB_STATIONS.length;
  return SUB_STATIONS[index].id;
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

export function PreparingLanes({
  orders,
  onAction,
  onRefire,
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

  // Detect newly arrived tickets and stage them at top
  useEffect(() => {
    const currentOrderIds = new Set(orders.map(o => o.id));
    const newlyArrived: string[] = [];

    // Find orders that just appeared (weren't in previous render)
    currentOrderIds.forEach(id => {
      if (!prevOrderIdsRef.current.has(id)) {
        // Check if this ticket is transitioning into preparing
        const transition = transitioningTickets.get(id);
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

    prevOrderIdsRef.current = currentOrderIds;
  }, [orders, transitioningTickets]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      stagedTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Assign sub-stations to orders
  const ordersWithSubStations = orders.map(order => ({
    ...order,
    subStation: assignSubStation(order),
  }));

  // After each render, store current lane order IDs so we can detect "just arrived" on next render
  useLayoutEffect(() => {
    SUB_STATIONS.forEach((ss) => {
      const ids = new Set(
        ordersWithSubStations.filter((o) => o.subStation === ss.id).map((o) => o.id)
      );
      prevLaneOrderIdsRef.current[ss.id] = ids;
    });
    hasInitializedLanesRef.current = true;
  }, [ordersWithSubStations]);

  // Delay showing "No orders" per lane so exit animation runs when last ticket leaves (preparing → ready)
  const [showEmptyByLane, setShowEmptyByLane] = useState<Record<string, boolean>>({});
  const prevCountByLaneRef = useRef<Record<string, number>>({});
  const emptyTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    SUB_STATIONS.forEach((subStation) => {
      const count = ordersWithSubStations.filter((o) => o.subStation === subStation.id).length;
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
  }, [ordersWithSubStations.length]);

  return (
    <div className={cn("flex h-full theme-transition", theme.columnDivide)}>
      {SUB_STATIONS.map((subStation) => {
        const laneOrders = ordersWithSubStations
          .filter((order) => order.subStation === subStation.id)
          .sort((a, b) => {
            // Staged tickets (just arrived) go to TOP
            const aIsStaged = stagedTickets.has(a.id);
            const bIsStaged = stagedTickets.has(b.id);
            
            if (aIsStaged && !bIsStaged) return -1; // a goes first
            if (!aIsStaged && bIsStaged) return 1;  // b goes first
            
            // Both staged or both not staged: sort by time (oldest first)
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });

        return (
          <div key={subStation.id} className="flex flex-col min-h-0 flex-1">
            {/* Lane Header with Station Load Indicator (item count, not ticket count) */}
            {(() => {
              const itemCount = laneOrders.reduce(
                (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
                0
              );
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
              {laneOrders.length === 0 && showEmptyByLane[subStation.id] && (
                <div className={cn("text-base 2xl:text-lg text-center py-8 theme-transition", theme.textMuted)}>No orders</div>
              )}
              <div className="flex flex-col gap-4 2xl:gap-5">
                <AnimatePresence mode="sync">
                  {laneOrders.map((order) => {
                    const queuePosition = getQueuePosition(order, allOrders);
                    
                    const stationStatus = currentStationId && order.stationStatuses 
                      ? order.stationStatuses[currentStationId]
                      : undefined;
                    
                    const isStationComplete = stationStatus === "ready";
                    
                    const waitingStations = currentStationId && order.stationStatuses && stations.length > 0
                      ? stations.filter(s => {
                          const status = order.stationStatuses?.[s.id];
                          return s.id !== currentStationId && status !== "ready";
                        })
                      : [];
                    
                    // Detect just arrived: not in prev lane (so we always slide-in, no jump)
                    const transition = transitioningTickets.get(order.id);
                    const wasInLane = prevLaneOrderIdsRef.current[subStation.id]?.has(order.id);
                    const justArrived = hasInitializedLanesRef.current
                      ? !wasInLane
                      : !!(transition && transition.to === "preparing");
                    const isStaged = stagedTickets.has(order.id);
                    
                    const isInBatch = highlightedBatch?.orderIds.includes(order.id) ?? false;
                    return (
                      <KDSTicket
                        key={order.id}
                        order={order}
                        onAction={onAction}
                        onRefire={onRefire}
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
                        batchBadge={isInBatch ? { label: `💡 BATCH: ${highlightedBatch?.itemName ?? ""}` } : undefined}
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
