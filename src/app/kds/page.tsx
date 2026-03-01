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
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function KDSPageLayout({ children }: { children: ReactNode }) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("h-screen flex flex-col theme-transition", theme.background, theme.text)}>
      {children}
    </div>
  );
}

type OrderStatus = "pending" | "preparing" | "ready";

interface OrderItem {
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
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  isPriority?: boolean;
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

/** Response from GET /api/kds/orders (orders + order_items only). */
interface KdsOrderResponse {
  id: string;
  orderNumber: string;
  orderType: "dine_in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  status: OrderStatus;
  station: string | null;
  firedAt: string | null;
  createdAt: string;
  wave: number;
  sessionId: string | null;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes: string | null;
    status: string;
    sentToKitchenAt: string | null;
    startedAt: string | null;
    readyAt: string | null;
    servedAt: string | null;
  }>;
}

function mapKdsOrderToOrder(r: KdsOrderResponse): Order {
  const stationId = r.station ?? "kitchen";
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    orderType: r.orderType,
    tableNumber: r.tableNumber,
    customerName: r.customerName,
    status: r.status as OrderStatus,
    createdAt: r.createdAt,
    items: r.items.map((it) => ({
      id: it.id,
      name: it.name,
      variant: null,
      quantity: it.quantity,
      customizations: it.notes ? [it.notes] : [],
      stationId,
    })),
    stationStatuses: { [stationId]: r.status as OrderStatus },
  };
}

/** Snapshot of an order when it was bumped (for Recall list). */
interface CompletedOrder {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  orderType: "dine_in" | "pickup";
  bumpedAt: string;
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

// Define stations
const STATIONS: Station[] = [
  { id: "kitchen", name: "Kitchen", icon: "🍳", color: "#f97316" },
  { id: "bar", name: "Bar", icon: "🍺", color: "#3b82f6" },
  { id: "dessert", name: "Dessert", icon: "🍰", color: "#ec4899" },
];

// Generate times relative to now for demo purposes
const now = new Date();
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

const initialOrders: Order[] = [
  {
    id: "1",
    orderNumber: "1234",
    orderType: "dine_in",
    tableNumber: "5",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(12), // Urgent - 12 minutes ago
    specialInstructions: "Extra crispy, birthday celebration",
    stationStatuses: {
      kitchen: "pending",
      bar: "pending",
      dessert: "pending",
    },
    items: [
      {
        id: "1",
        name: "Margherita",
        variant: "Large",
        quantity: 2,
        customizations: ["Extra cheese", "Mushrooms"],
        stationId: "kitchen",
      },
      {
        id: "2",
        name: "Pepperoni",
        variant: "Medium",
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "2a",
        name: "Coca-Cola",
        variant: null,
        quantity: 2,
        customizations: [],
        stationId: "bar",
      },
      {
        id: "2b",
        name: "Tiramisu",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "dessert",
      },
    ],
  },
  {
    id: "1a",
    orderNumber: "1234a",
    orderType: "dine_in",
    tableNumber: "5",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(3),
    specialInstructions: "Severe peanut allergy - please be very careful",
    stationStatuses: {
      kitchen: "pending",
      bar: "pending",
    },
    items: [
      {
        id: "1a-1",
        name: "Pad Thai",
        variant: null,
        quantity: 1,
        customizations: ["NO peanuts - ALLERGY"],
        stationId: "kitchen",
      },
      {
        id: "1a-2",
        name: "Spring Rolls",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "1235",
    orderType: "pickup",
    tableNumber: null,
    customerName: "John",
    status: "preparing",
    createdAt: minutesAgo(8),
    stationStatuses: {
      kitchen: "preparing",
    },
    items: [
      {
        id: "3",
        name: "Caesar Salad",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "1236",
    orderType: "dine_in",
    tableNumber: "9",
    customerName: null,
    status: "ready",
    createdAt: minutesAgo(5),
    stationStatuses: {
      kitchen: "ready",
    },
    items: [
      {
        id: "4",
        name: "Carbonara",
        variant: "Large",
        quantity: 1,
        customizations: ["Extra parmesan"],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "4",
    orderNumber: "1237",
    orderType: "dine_in",
    tableNumber: "3",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(7), // Warning - 7 minutes ago
    stationStatuses: {
      kitchen: "pending",
    },
    items: [
      {
        id: "5",
        name: "Hawaiian",
        variant: "Large",
        quantity: 1,
        customizations: ["Extra pineapple", "Light sauce", "Well done"],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "5",
    orderNumber: "1238",
    orderType: "pickup",
    tableNumber: null,
    customerName: "Sarah",
    status: "pending",
    createdAt: minutesAgo(3), // Normal - 3 minutes ago
    stationStatuses: {
      kitchen: "pending",
      bar: "pending",
      dessert: "ready",
    },
    items: [
      {
        id: "6",
        name: "Veggie Supreme",
        variant: "Medium",
        quantity: 2,
        customizations: ["No olives", "Extra mushrooms"],
        stationId: "kitchen",
      },
      {
        id: "6b",
        name: "Caesar Salad",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "6c",
        name: "Garlic Bread",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "6d",
        name: "Coca-Cola",
        variant: null,
        quantity: 2,
        customizations: [],
        stationId: "bar",
      },
    ],
  },
  {
    id: "6",
    orderNumber: "1239",
    orderType: "dine_in",
    tableNumber: "7",
    customerName: null,
    status: "preparing",
    createdAt: minutesAgo(6),
    stationStatuses: {
      kitchen: "preparing",
    },
    items: [
      {
        id: "7",
        name: "BBQ Chicken",
        variant: "Large",
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "8",
        name: "Garlic Bread",
        variant: null,
        quantity: 2,
        customizations: [],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "7",
    orderNumber: "1240",
    orderType: "pickup",
    tableNumber: null,
    customerName: "Mike",
    status: "pending",
    createdAt: minutesAgo(15), // Urgent - 15 minutes ago
    specialInstructions: "Gluten-free crust, no contact with regular flour",
    stationStatuses: {
      kitchen: "pending",
    },
    items: [
      {
        id: "9",
        name: "Four Cheese",
        variant: "Small",
        quantity: 1,
        customizations: ["Extra mozzarella"],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "8",
    orderNumber: "1241",
    orderType: "dine_in",
    tableNumber: "12",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(2), // Normal - 2 minutes ago
    stationStatuses: {
      kitchen: "pending",
    },
    items: [
      {
        id: "10",
        name: "Meat Lovers",
        variant: "Large",
        quantity: 1,
        customizations: ["Extra bacon"],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "9",
    orderNumber: "1242",
    orderType: "dine_in",
    tableNumber: "8",
    customerName: null,
    status: "preparing",
    createdAt: minutesAgo(4),
    stationStatuses: {
      kitchen: "preparing",
    },
    items: [
      {
        id: "11",
        name: "Mediterranean",
        variant: "Medium",
        quantity: 1,
        customizations: ["No feta"],
        stationId: "kitchen",
      },
    ],
  },
  {
    id: "10",
    orderNumber: "1243",
    orderType: "dine_in",
    tableNumber: "15",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(6), // Warning - 6 minutes ago
    stationStatuses: {
      kitchen: "pending",
      bar: "pending",
      dessert: "pending",
    },
    items: [
      {
        id: "12",
        name: "Pepperoni",
        variant: "Large",
        quantity: 2,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "13",
        name: "Chicken Wings",
        variant: "Spicy",
        quantity: 1,
        customizations: [],
        stationId: "kitchen",
      },
      {
        id: "13a",
        name: "Beer",
        variant: "Draft",
        quantity: 2,
        customizations: [],
        stationId: "bar",
      },
      {
        id: "13b",
        name: "Cheesecake",
        variant: null,
        quantity: 1,
        customizations: [],
        stationId: "dessert",
      },
    ],
  },
  {
    id: "11",
    orderNumber: "1244",
    orderType: "pickup",
    tableNumber: null,
    customerName: "Lisa",
    status: "pending",
    createdAt: minutesAgo(1), // Normal - 1 minute ago
    stationStatuses: {
      bar: "pending",
    },
    items: [
      {
        id: "14",
        name: "Lemonade",
        variant: "Large",
        quantity: 2,
        customizations: ["No ice"],
        stationId: "bar",
      },
    ],
  },
  {
    id: "12",
    orderNumber: "1245",
    orderType: "dine_in",
    tableNumber: "2",
    customerName: null,
    status: "ready",
    createdAt: minutesAgo(3),
    stationStatuses: {
      dessert: "ready",
    },
    items: [
      {
        id: "15",
        name: "Chocolate Cake",
        variant: "Slice",
        quantity: 2,
        customizations: ["Extra whipped cream"],
        stationId: "dessert",
      },
    ],
  },
  {
    id: "13",
    orderNumber: "1246",
    orderType: "dine_in",
    tableNumber: "11",
    customerName: null,
    status: "preparing",
    createdAt: minutesAgo(5),
    stationStatuses: {
      bar: "preparing",
    },
    items: [
      {
        id: "16",
        name: "Mojito",
        variant: null,
        quantity: 2,
        customizations: [],
        stationId: "bar",
      },
    ],
  },
  {
    id: "14",
    orderNumber: "1247",
    orderType: "dine_in",
    tableNumber: "6",
    customerName: null,
    status: "pending",
    createdAt: minutesAgo(11), // Urgent - 11 minutes ago
    stationStatuses: {
      kitchen: "pending",
    },
    items: [
      {
        id: "17",
        name: "Seafood Deluxe",
        variant: "Large",
        quantity: 1,
        customizations: ["No anchovies"],
        stationId: "kitchen",
      },
    ],
  },
];

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [toasts, setToasts] = useState<NewOrderToast[]>([]);
  const [modificationToasts, setModificationToasts] = useState<ModificationToastData[]>([]);
  const [highlightedTicketId, setHighlightedTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tickets");
  const [activeStationId, setActiveStationId] = useState<string>(STATIONS[0].id);
  const [kdsLoading, setKdsLoading] = useState(true);
  const [kdsLiveOrderIds, setKdsLiveOrderIds] = useState<Set<string>>(new Set());
  // Track tickets that just transitioned for animation purposes
  const [transitioningTickets, setTransitioningTickets] = useState<Map<string, { from: OrderStatus; to: OrderStatus }>>(new Map());
  const toastTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const modificationClearTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const nextOrderNumber = useRef(1248);
  const nextModificationToastId = useRef(0);
  const nextMessageId = useRef(1);

  const [stationMessages, setStationMessages] = useState<StationMessage[]>([]);
  const [messagePanelOpen, setMessagePanelOpen] = useState(false);
  const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
  const [replyToStationId, setReplyToStationId] = useState<string | null>(null);

  // Load KDS orders from API (orders + order_items only; no table-based lookup)
  useEffect(() => {
    let cancelled = false;
    getCurrentLocationId()
      .then((locationId) => {
        if (cancelled || !locationId) {
          setKdsLoading(false);
          return;
        }
        return fetch(`/api/kds/orders?locationId=${encodeURIComponent(locationId)}`)
          .then((res) => (res.ok ? res.json() : { orders: [] }))
          .then((data: { orders?: KdsOrderResponse[] }) => {
            if (cancelled) return;
            const list = Array.isArray(data.orders) ? data.orders : [];
            setOrders(list.map(mapKdsOrderToOrder));
            setKdsLiveOrderIds(new Set(list.map((o) => o.id)));
          })
          .catch(() => {
            if (!cancelled) setOrders([]);
          })
          .finally(() => {
            if (!cancelled) setKdsLoading(false);
          });
      })
      .catch(() => setKdsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

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

  const simulateNewOrder = useCallback(() => {
    const orderTypes: Array<"dine_in" | "pickup"> = ["dine_in", "pickup"];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const isPriority = Math.random() > 0.7; // 30% chance of priority
    
    // Random menu items with their stations
    const menuItems = [
      { name: "Margherita", variant: "Large", stationId: "kitchen" },
      { name: "Pepperoni", variant: "Medium", stationId: "kitchen" },
      { name: "Hawaiian", variant: "Large", stationId: "kitchen" },
      { name: "BBQ Chicken", variant: "Large", stationId: "kitchen" },
      { name: "Caesar Salad", variant: null, stationId: "kitchen" },
      { name: "Garlic Bread", variant: null, stationId: "kitchen" },
      { name: "Coca-Cola", variant: null, stationId: "bar" },
      { name: "Lemonade", variant: "Large", stationId: "bar" },
      { name: "Mojito", variant: null, stationId: "bar" },
      { name: "Beer", variant: "Draft", stationId: "bar" },
      { name: "Tiramisu", variant: null, stationId: "dessert" },
      { name: "Chocolate Cake", variant: "Slice", stationId: "dessert" },
      { name: "Cheesecake", variant: null, stationId: "dessert" },
    ];

    // Generate 1-4 random items
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const selectedItems: OrderItem[] = [];
    const stationsInOrder = new Set<string>();
    
    for (let i = 0; i < itemCount; i++) {
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      stationsInOrder.add(menuItem.stationId);
      selectedItems.push({
        id: `item-${Date.now()}-${i}`,
        name: menuItem.name,
        variant: menuItem.variant,
        quantity: Math.floor(Math.random() * 2) + 1,
        customizations: Math.random() > 0.7 ? ["Extra cheese"] : [],
        stationId: menuItem.stationId,
      });
    }

    // Create station statuses for all stations that have items in this order
    const stationStatuses: Record<string, OrderStatus> = {};
    stationsInOrder.forEach(stationId => {
      stationStatuses[stationId] = "pending";
    });
    
    const newOrder: Order = {
      id: `new-${Date.now()}`,
      orderNumber: String(nextOrderNumber.current++),
      orderType,
      tableNumber: orderType === "dine_in" ? String(Math.floor(Math.random() * 20) + 1) : null,
      customerName: orderType === "pickup" ? ["Alex", "Sam", "Jordan", "Taylor"][Math.floor(Math.random() * 4)] : null,
      status: "pending",
      createdAt: new Date().toISOString(),
      isPriority,
      stationStatuses,
      items: selectedItems,
    };

    setOrders((prev) => [...prev, newOrder]);
    addToast(newOrder);
  }, [addToast]);

  const handleAction = (orderId: string, newStatus: OrderStatus) => {
    // Find the current order to track the transition
    const currentOrder = orders.find(o => o.id === orderId);
    const previousStatus = currentOrder?.status;

    // Persist order_items status (and timestamps) to DB when this order is from the API
    if (kdsLiveOrderIds.has(orderId) && currentOrder?.items?.length) {
      currentOrder.items.forEach((item) => {
        fetch(`/api/orders/${orderId}/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).catch(() => {});
      });
    }

    // If bumping (remove), add to completedOrders for Recall
    if (newStatus === "ready" && currentOrder?.status === "ready") {
      const allStationsReady = currentOrder.stationStatuses
        ? Object.values(currentOrder.stationStatuses).every(s => s === "ready")
        : false;
      if (allStationsReady) {
        const completed: CompletedOrder = {
          id: currentOrder.id,
          orderNumber: currentOrder.orderNumber,
          tableNumber: currentOrder.tableNumber,
          customerName: currentOrder.customerName,
          orderType: currentOrder.orderType,
          bumpedAt: new Date().toISOString(),
          createdAt: currentOrder.createdAt,
          items: currentOrder.items,
          stationStatuses: currentOrder.stationStatuses,
        };
        setCompletedOrders(prev => [completed, ...prev].slice(0, 10));
      }
    }

    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.id !== orderId) return order;
        
        // Update this station's status
        const updatedStationStatuses = order.stationStatuses ? {
          ...order.stationStatuses,
          [activeStationId]: newStatus,
        } : undefined;

        // Check if ALL stations are ready (or no stationStatuses = single-station order)
        const allStationsReady = updatedStationStatuses
          ? Object.values(updatedStationStatuses).every(status => status === "ready")
          : true;

        // If bumping from ready column and all stations ready, remove order
        if (newStatus === "ready" && order.status === "ready" && allStationsReady) {
          return null as any;
        }

        // Determine overall order status
        let overallStatus: OrderStatus = order.status;
        if (allStationsReady) {
          overallStatus = "ready";
        } else if (updatedStationStatuses && Object.values(updatedStationStatuses).some(s => s === "preparing")) {
          overallStatus = "preparing";
        } else if (updatedStationStatuses && Object.values(updatedStationStatuses).every(s => s === "pending")) {
          overallStatus = "pending";
        }

        return {
          ...order,
          status: overallStatus,
          stationStatuses: updatedStationStatuses,
        };
      }).filter(Boolean) as Order[];
    });

    // Track the transition for animation based on station-specific status change
    const previousStationStatus = currentOrder?.stationStatuses?.[activeStationId];
    if (previousStationStatus && previousStationStatus !== newStatus) {
      setTransitioningTickets(prev => {
        const updated = new Map(prev);
        updated.set(orderId, { from: previousStationStatus, to: newStatus });
        return updated;
      });

      // Clear the transition state after animation completes (1200ms)
      setTimeout(() => {
        setTransitioningTickets(prev => {
          const updated = new Map(prev);
          updated.delete(orderId);
          return updated;
        });
      }, 1200);
    }
  };

  const handleSnooze = useCallback((orderId: string, durationSeconds: number) => {
    const now = new Date();
    const until = new Date(now.getTime() + durationSeconds * 1000);
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              isSnoozed: true,
              snoozedAt: now.toISOString(),
              snoozeUntil: until.toISOString(),
              snoozeDurationSeconds: durationSeconds,
            }
      )
    );
  }, []);

  const handleWakeUp = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              isSnoozed: false,
              snoozedAt: undefined,
              snoozeUntil: undefined,
              snoozeDurationSeconds: undefined,
              wasSnoozed: true,
            }
      )
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders((prev) =>
        prev.map((o) => {
          if (!o.isSnoozed || !o.snoozeUntil) return o;
          if (new Date(o.snoozeUntil).getTime() > now) return o;
          return {
            ...o,
            isSnoozed: false,
            snoozedAt: undefined,
            snoozeUntil: undefined,
            snoozeDurationSeconds: undefined,
            wasSnoozed: true,
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefire = useCallback((orderId: string, item: OrderItem, reason: string) => {
    const original = orders.find(o => o.id === orderId);
    if (!original) return;
    if (kdsLiveOrderIds.has(orderId)) {
      fetch(`/api/orders/${orderId}/items/${item.id}/refire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }).catch(() => {});
    }
    const remakeId = `${orderId}-R`;
    const remakeOrderNumber = `${original.orderNumber}-R`;
    const stationId = item.stationId ?? activeStationId;
    const stationStatuses: Record<string, OrderStatus> = { [stationId]: "pending" };
    const remakeOrder: Order = {
      id: remakeId,
      orderNumber: remakeOrderNumber,
      orderType: original.orderType,
      tableNumber: original.tableNumber,
      customerName: original.customerName,
      status: "pending",
      createdAt: new Date().toISOString(),
      items: [{ ...item, id: `${item.id}-remake` }],
      stationStatuses,
      isRemake: true,
      remakeReason: reason,
      originalOrderId: orderId,
    };
    setOrders(prev => [remakeOrder, ...prev]);
  }, [orders, activeStationId, kdsLiveOrderIds]);

  const handleRecall = useCallback((completed: CompletedOrder) => {
    const stationIds = completed.stationStatuses
      ? Object.keys(completed.stationStatuses)
      : [...new Set(completed.items.map((i) => i.stationId).filter(Boolean))] as string[];
    const stationStatuses: Record<string, OrderStatus> = Object.fromEntries(
      stationIds.map((s) => [s, "ready" as OrderStatus])
    );
    const recalled: Order = {
      ...completed,
      status: "ready",
      isRecalled: true,
      recalledAt: new Date().toISOString(),
      stationStatuses,
    };
    setOrders(prev => [recalled, ...prev]);
    setCompletedOrders(prev => prev.filter(c => c.id !== completed.id));
  }, []);

  const handleClearModified = useCallback((orderId: string) => {
    const existing = modificationClearTimeoutsRef.current.get(orderId);
    if (existing) {
      clearTimeout(existing);
      modificationClearTimeoutsRef.current.delete(orderId);
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          isModified: false,
          modifiedAt: undefined,
          items: o.items.map((item) => ({
            ...item,
            isNew: false,
            isModified: false,
            changeDetails: undefined,
          })),
        };
      })
    );
  }, []);

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

  const simulateOrderModification = useCallback(() => {
    const candidates = orders.filter(
      (o) => o.items.some((i) => i.stationId === activeStationId) && !o.isRemake
    );
    if (candidates.length === 0) return;
    const order = candidates[Math.floor(Math.random() * candidates.length)];
    const stationItems = order.items.filter((i) => i.stationId === activeStationId);
    const now = new Date().toISOString();

    const changes: OrderChange[] = [
      { type: "removed", item: { name: "Pepperoni", quantity: 1, variant: "Medium" } },
      { type: "added", item: { name: "Hawaiian", quantity: 1, variant: "Large" } },
      { type: "modified", item: { name: stationItems[0]?.name ?? "Margherita" }, details: "Medium → Large" },
    ];

    const firstStationItem = stationItems[0];
    const updatedItems = order.items.map((item) => {
      if (item.stationId !== activeStationId) return item;
      if (item.id === firstStationItem?.id) {
        return { ...item, isModified: true, changeDetails: "Medium → Large" };
      }
      return item;
    });

    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      name: "Hawaiian",
      variant: "Large",
      quantity: 1,
      customizations: [],
      stationId: activeStationId,
      isNew: true,
    };
    const finalItems = [...updatedItems, newItem];

    const toastId = `mod-${nextModificationToastId.current++}`;
    setModificationToasts((prev) =>
      [
        {
          id: toastId,
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          changes,
        },
        ...prev,
      ].slice(0, 5)
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        return { ...o, items: finalItems, isModified: true, modifiedAt: now };
      })
    );

    const timeout = setTimeout(() => {
      handleClearModified(order.id);
      modificationClearTimeoutsRef.current.delete(order.id);
    }, 2 * 60 * 1000);
    modificationClearTimeoutsRef.current.set(order.id, timeout);
  }, [orders, activeStationId, handleClearModified]);

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
  }, [orders]);

  const activeCount = filteredOrders.length;

  return (
    <DisplayModeProvider>
      <KDSPageLayout>
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
        completedOrders={completedOrders}
        onRecall={handleRecall}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
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
          <AllDayView orders={allDayOrders} />
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

      {/* Demo buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 items-end">
        <Button onClick={simulateNewOrder} size="lg" className="shadow-lg">
          Simulate New Order
        </Button>
        <Button onClick={simulateOrderModification} size="lg" variant="outline" className="shadow-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/30">
          Simulate Order Modified
        </Button>
      </div>
      </KDSPageLayout>
    </DisplayModeProvider>
  );
}
