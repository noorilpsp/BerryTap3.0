"use client";

import { useState } from "react";
import { KDSColumn } from "./KDSColumn";
import { PreparingLanes } from "./PreparingLanes";
import { Button } from "@/components/kds/ui/button";
import { useDisplayMode } from "./DisplayModeContext";
import type { Station } from "./StationSwitcher";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "preparing" | "ready";

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
  stationStatuses?: Record<string, OrderStatus>;
  isRemake?: boolean;
}

export interface HighlightedBatch {
  batchKey: string;
  orderIds: string[];
  itemName: string;
  variant: string | null;
}

interface KDSColumnsProps {
  orders: Order[];
  onAction: (orderId: string, newStatus: OrderStatus) => void;
  onRefire?: (orderId: string, item: import("./KDSTicket").OrderItem, reason: string) => void;
  onClearModified?: (orderId: string) => void;
  onSnooze?: (orderId: string, durationSeconds: number) => void;
  onWakeUp?: (orderId: string) => void;
  highlightedTicketId?: string | null;
  currentStationId?: string;
  stations?: Station[];
  transitioningTickets?: Map<string, { from: OrderStatus; to: OrderStatus }>;
  highlightedBatch?: HighlightedBatch | null;
}

export function KDSColumns({ 
  orders, 
  onAction, 
  onRefire,
  onClearModified,
  onSnooze,
  onWakeUp,
  highlightedTicketId,
  currentStationId,
  stations,
  transitioningTickets = new Map(),
  highlightedBatch = null,
}: KDSColumnsProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const { theme } = useDisplayMode();

  // Filter by station-specific status if currentStationId is provided
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => {
      if (currentStationId && order.stationStatuses) {
        return order.stationStatuses[currentStationId] === status;
      }
      return order.status === status;
    });
  };

  const newOrders = getOrdersByStatus("pending");
  const preparingOrders = getOrdersByStatus("preparing");
  const readyOrders = getOrdersByStatus("ready");

  return (
    <>
      {/* Desktop/Tablet: Three columns with 20-60-20 proportions */}
      <div className={cn("hidden md:flex h-full theme-transition", theme.columnDivide)}>
        {/* NEW Column - 20% */}
        <div className="w-[20%] flex-shrink-0">
          <KDSColumn
            title="NEW"
            titleIcon="📋"
            status="pending"
            orders={orders}
            onAction={onAction}
            onRefire={onRefire}
            onClearModified={onClearModified}
            onSnooze={onSnooze}
            onWakeUp={onWakeUp}
            highlightedTicketId={highlightedTicketId}
            currentStationId={currentStationId}
            stations={stations}
            transitioningTickets={transitioningTickets}
            highlightedBatch={highlightedBatch}
          />
        </div>

        {/* PREPARING Column with Sub-Station Lanes - 60% */}
        <div className="w-[60%] flex-shrink-0 flex flex-col min-h-0">
          <div className={cn("px-1.5 py-1 2xl:px-2 2xl:py-1.5 border-b-2 border-b-blue-400 dark:border-b-blue-500 shrink-0 theme-transition", theme.cardBg, theme.text, theme.columnTitleSeparatorPreparing)}>
            <h2 className="font-semibold text-sm 2xl:text-base text-center uppercase tracking-wide">
              PREPARING ({preparingOrders.length})
            </h2>
          </div>
          <div className="flex-1 min-h-0">
            <PreparingLanes
              orders={preparingOrders}
              onAction={onAction}
              onRefire={onRefire}
              onClearModified={onClearModified}
              onSnooze={onSnooze}
              onWakeUp={onWakeUp}
              highlightedTicketId={highlightedTicketId}
              currentStationId={currentStationId}
              stations={stations}
              allOrders={orders}
              transitioningTickets={transitioningTickets}
              highlightedBatch={highlightedBatch}
            />
          </div>
        </div>

        {/* READY Column - 20% */}
        <div className="w-[20%] flex-shrink-0">
          <KDSColumn
            title="READY"
            status="ready"
            orders={orders}
            onAction={onAction}
            onRefire={onRefire}
            onClearModified={onClearModified}
            onSnooze={onSnooze}
            onWakeUp={onWakeUp}
            highlightedTicketId={highlightedTicketId}
            currentStationId={currentStationId}
            stations={stations}
            isReady={true}
            transitioningTickets={transitioningTickets}
            highlightedBatch={highlightedBatch}
          />
        </div>
      </div>

      {/* Mobile: Tab switcher + single column */}
      <div className="md:hidden flex flex-col h-full">
        {/* Tab Switcher */}
        <div className={cn("flex gap-2 p-4 border-b flex-shrink-0 theme-transition", theme.border)}>
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
            className="flex-1"
          >
            NEW ({newOrders.length})
          </Button>
          <Button
            variant={activeTab === "preparing" ? "default" : "outline"}
            onClick={() => setActiveTab("preparing")}
            className="flex-1"
          >
            PREP ({preparingOrders.length})
          </Button>
          <Button
            variant={activeTab === "ready" ? "default" : "outline"}
            onClick={() => setActiveTab("ready")}
            className="flex-1"
          >
            READY ({readyOrders.length})
          </Button>
        </div>

        {/* Single column of tickets */}
        <div className="flex-1 overflow-y-auto">
          <KDSColumn
            title={activeTab === "pending" ? "NEW" : activeTab === "preparing" ? "PREPARING" : "READY"}
            status={activeTab}
            orders={orders}
            onAction={onAction}
            onRefire={onRefire}
            onClearModified={onClearModified}
            onSnooze={onSnooze}
            onWakeUp={onWakeUp}
            highlightedTicketId={highlightedTicketId}
            currentStationId={currentStationId}
            stations={stations}
            isMobile={true}
            transitioningTickets={transitioningTickets}
            highlightedBatch={highlightedBatch}
          />
        </div>
      </div>
    </>
  );
}
