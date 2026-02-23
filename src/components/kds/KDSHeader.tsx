"use client";

import { ChefHat, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/kds/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDisplayMode } from "./DisplayModeContext";
import { DisplayModePicker } from "./DisplayModePicker";
import type { Station } from "./StationSwitcher";
import { cn } from "@/lib/utils";

/** Minimal shape for a completed order in the Recall list (accepts OrderItem[] from page). */
export interface RecallOrderShape {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  orderType: "dine_in" | "pickup";
  bumpedAt: string;
  createdAt: string;
  items: ReadonlyArray<{ name: string; quantity: number }>;
}

export type ViewMode = "tickets" | "all-day";

interface KDSHeaderProps {
  stations: Station[];
  activeStationId: string;
  onStationChange: (stationId: string) => void;
  orderCounts: Record<string, number>;
  activeCount: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onOpenMessageHistory?: () => void;
  completedOrders?: RecallOrderShape[];
  onRecall?: (order: RecallOrderShape) => void;
}

function formatBumpedAgo(bumpedAt: string): string {
  const minutes = Math.floor((Date.now() - new Date(bumpedAt).getTime()) / 60000);
  if (minutes < 1) return "Bumped just now";
  if (minutes === 1) return "Bumped 1m ago";
  return `Bumped ${minutes}m ago`;
}

function itemsSummary(items: ReadonlyArray<{ name: string; quantity: number }>): string {
  return items
    .map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.name}` : i.name))
    .join(", ");
}

export function KDSHeader({
  stations,
  activeStationId,
  onStationChange,
  orderCounts,
  activeCount,
  viewMode = "tickets",
  onViewModeChange,
  onOpenMessages,
  unreadMessageCount = 0,
  onOpenMessageHistory,
  completedOrders = [],
  onRecall,
}: KDSHeaderProps) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("relative flex items-center justify-between border-b px-6 py-4 theme-transition", theme.headerBg, theme.border, theme.headerSeparator)}>
      <div className="flex items-center gap-2 overflow-x-auto">
        {stations.map((station) => {
          const isActive = station.id === activeStationId;
          const count = orderCounts[station.id] || 0;

          return (
            <Button
              key={station.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onStationChange(station.id)}
              className={cn(
                "flex items-center gap-2 font-medium theme-transition",
                !isActive && theme.text,
                !isActive && "hover:opacity-90"
              )}
              style={
                isActive
                  ? { backgroundColor: station.color, color: "white" }
                  : undefined
              }
            >
              <span className="text-base">{station.icon}</span>
              <span className="whitespace-nowrap">
                {station.name} ({count})
              </span>
            </Button>
          );
        })}
      </div>
      <div className={cn("flex items-center justify-center absolute left-1/2 -translate-x-1/2 theme-transition", theme.text)}>
        <ChefHat className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-3">
        {onViewModeChange && (
          <div
            role="group"
            aria-label="View mode"
            className={cn("flex rounded-md border p-0.5 theme-transition", theme.border, theme.metadataBg)}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={viewMode === "tickets"}
              className={cn(
                "h-8 flex-1 min-w-0 rounded-sm px-3 font-medium transition-colors cursor-pointer theme-transition",
                viewMode === "tickets" ? theme.viewToggleSelected : theme.viewToggleUnselected
              )}
              onClick={() => onViewModeChange(viewMode === "tickets" ? "all-day" : "tickets")}
            >
              Tickets
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={viewMode === "all-day"}
              className={cn(
                "h-8 flex-1 min-w-0 rounded-sm px-3 font-medium transition-colors cursor-pointer theme-transition",
                viewMode === "all-day" ? theme.viewToggleSelected : theme.viewToggleUnselected
              )}
              onClick={() => onViewModeChange(viewMode === "all-day" ? "tickets" : "all-day")}
            >
              All-Day
            </Button>
          </div>
        )}
        {onOpenMessages && (
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2 relative theme-transition", theme.headerOutlineButton || theme.border, !theme.headerOutlineButton && theme.text)}
            onClick={unreadMessageCount > 0 && onOpenMessageHistory ? onOpenMessageHistory : onOpenMessages}
          >
            <MessageCircle className="h-4 w-4" />
            {unreadMessageCount > 0 ? (
              <span className="font-medium">{unreadMessageCount}</span>
            ) : (
              "Message"
            )}
          </Button>
        )}
        <DisplayModePicker />
        {onRecall && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2 theme-transition", theme.headerOutlineButton || theme.border, !theme.headerOutlineButton && theme.text)}>
                <RotateCcw className="h-4 w-4" />
                Recall
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn("w-[320px] max-h-[70vh] overflow-y-auto theme-transition", theme.cardBg, theme.text, theme.border)}>
              <DropdownMenuLabel className={theme.text}>Recall Order</DropdownMenuLabel>
              <DropdownMenuSeparator className={theme.border} />
              {completedOrders.length === 0 ? (
                <div className={cn("py-4 text-center text-sm theme-transition", theme.textMuted)}>
                  No completed orders to recall
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className={cn("flex flex-col gap-1.5 px-2 py-2 rounded-md border mb-1 last:mb-0 theme-transition", theme.border, theme.metadataBg)}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className={cn("font-medium", theme.text)}>
                        #{order.orderNumber}
                        {order.tableNumber
                          ? ` · T-${order.tableNumber}`
                          : order.customerName
                            ? ` · ${order.customerName}`
                            : ""}
                      </span>
                      <span className={cn("text-xs shrink-0", theme.textMuted)}>
                        {formatBumpedAgo(order.bumpedAt)}
                      </span>
                    </div>
                    <p className={cn("text-xs line-clamp-2", theme.textMuted)}>
                      {itemsSummary(order.items)}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn("w-full mt-1 theme-transition", theme.metadataBg, theme.text)}
                      onClick={() => onRecall(order)}
                    >
                      Recall
                    </Button>
                  </div>
                ))
              )}
              <DropdownMenuSeparator className={theme.border} />
              <div className={cn("px-2 py-1.5 text-xs text-center theme-transition", theme.textMuted)}>
                {completedOrders.length > 0
                  ? `Showing last ${Math.min(completedOrders.length, 10)} completed orders`
                  : "Bump orders to see them here for recall"}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <span className={cn("theme-transition", theme.textMuted)}>
          <span className="font-medium">{activeCount}</span> active
        </span>
      </div>
    </div>
  );
}
