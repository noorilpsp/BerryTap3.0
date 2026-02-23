"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/kds/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDisplayMode } from "./DisplayModeContext";
import type { Station } from "./StationSwitcher";
import { cn } from "@/lib/utils";

export interface StationMessage {
  id: string;
  fromStationId: string;
  fromStationName: string;
  fromStationIcon: string;
  toStation: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export const QUICK_MESSAGES = [
  { id: "hold", template: "Hold Table {table}", needsTable: true, label: "Hold Table X" },
  { id: "fire", template: "Fire Table {table}", needsTable: true, label: "Fire Table X" },
  { id: "runner", template: "Need runner", needsTable: false, label: "Need runner" },
  { id: "86", template: "86 {item}", needsItem: true, label: "86 [item]" },
  { id: "slow", template: "Slow down please", needsTable: false, label: "Slow down" },
  { id: "ready", template: "Ready when you are", needsTable: false, label: "Ready when you are" },
] as const;

const MAX_MESSAGE_LENGTH = 100;

export function IncomingMessageToast({
  message,
  onReply,
  onDismiss,
}: {
  message: StationMessage;
  onReply: () => void;
  onDismiss: () => void;
}) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("rounded-lg border-l-4 border-blue-500 p-4 shadow-lg theme-transition", theme.cardBg, theme.text)}>
      <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
        <MessageCircle className="h-5 w-5 shrink-0" />
        Message from {message.fromStationIcon} {message.fromStationName.toUpperCase()}
      </div>
      <div className={cn("mt-2 text-base", theme.text)}>"{message.message}"</div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" onClick={onReply}>
          Reply
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function formatMessageTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1m ago";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1h ago" : `${hours}h ago`;
}

interface KDSMessageHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: StationMessage[];
  currentStationId: string;
  stations: Array<{ id: string; name: string; icon: string }>;
  onMarkRead: (id: string) => void;
  onReplyTo: (stationId: string) => void;
}

export function KDSMessageHistory({
  open,
  onOpenChange,
  messages,
  currentStationId,
  stations,
  onMarkRead,
  onReplyTo,
}: KDSMessageHistoryProps) {
  const { theme } = useDisplayMode();
  const getToLabel = (toStation: string) => {
    if (toStation === "all") return "All";
    const s = stations.find((x) => x.id === toStation);
    return s ? `${s.icon} ${s.name}` : toStation;
  };
  const sorted = [...messages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" closeButtonClassName={theme.text} className={cn("w-full sm:max-w-md flex flex-col gap-0 theme-transition", theme.cardBg, theme.text, theme.border)}>
        <SheetHeader className={cn("shrink-0 pb-3 border-b", theme.border)}>
          <SheetTitle className={cn("flex items-center gap-2", theme.text)}>
            <MessageCircle className="h-5 w-5" />
            Messages
          </SheetTitle>
        </SheetHeader>
        <div className={cn("flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-3", theme.text)}>
          {sorted.length === 0 ? (
            <p className={cn("text-sm py-4", theme.textMuted)}>No messages yet.</p>
          ) : (
            sorted.map((msg) => {
              const isIncoming = msg.toStation === currentStationId || msg.toStation === "all";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg border p-3 theme-transition",
                    theme.border,
                    !msg.isRead && isIncoming ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : theme.metadataBg
                  )}
                >
                  <div className={cn("flex items-center justify-between text-xs", theme.textMuted)}>
                    <span>
                      {isIncoming ? "From" : "To"}: {isIncoming ? `${msg.fromStationIcon} ${msg.fromStationName}` : getToLabel(msg.toStation)}
                    </span>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                  </div>
                  <p className={cn("mt-1 text-sm", theme.text)}>"{msg.message}"</p>
                  {isIncoming && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("mt-2 text-xs !bg-transparent hover:opacity-90", theme.text)}
                      onClick={() => {
                        onMarkRead(msg.id);
                        onReplyTo(msg.fromStationId);
                        onOpenChange(false);
                      }}
                    >
                      Reply
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface DestinationOption {
  id: string;
  name: string;
  icon: string;
}

interface KDSMessagePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStation: Station;
  stations: Station[];
  activeTableNumbers: string[];
  onSend: (toStation: string, message: string) => void;
  /** When opening for reply, pre-select this station id */
  replyToStationId?: string | null;
  /** Open the message history sheet (e.g. from a link in this panel) */
  onOpenHistory?: () => void;
}

export function KDSMessagePanel({
  open,
  onOpenChange,
  currentStation,
  stations,
  activeTableNumbers,
  onSend,
  replyToStationId = null,
  onOpenHistory,
}: KDSMessagePanelProps) {
  const destinationOptions: DestinationOption[] = [
    ...stations.filter((s) => s.id !== currentStation.id).map((s) => ({ id: s.id, name: s.name, icon: s.icon })),
    { id: "floor", name: "Floor", icon: "🍽️" },
    { id: "all", name: "All", icon: "📢" },
  ];

  const [toStation, setToStation] = useState<string>(destinationOptions[0]?.id ?? "all");
  useEffect(() => {
    if (open && replyToStationId && destinationOptions.some((o) => o.id === replyToStationId)) {
      setToStation(replyToStationId);
    }
  }, [open, replyToStationId]);
  const [customText, setCustomText] = useState("");
  const [tablePickerFor, setTablePickerFor] = useState<"hold" | "fire" | null>(null);

  const resetForm = useCallback(() => {
    setCustomText("");
    setTablePickerFor(null);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm();
      onOpenChange(next);
    },
    [onOpenChange, resetForm]
  );

  const handleQuickMessage = useCallback(
    (qm: (typeof QUICK_MESSAGES)[number]) => {
      if (qm.needsTable) {
        setTablePickerFor(qm.id === "hold" ? "hold" : "fire");
        setCustomText("");
        return;
      }
      if (qm.needsItem) {
        setCustomText("86 ");
        return;
      }
      setCustomText(qm.template);
      setTablePickerFor(null);
    },
    []
  );

  const insertTable = useCallback((table: string) => {
    const template = tablePickerFor === "hold" ? "Hold Table {table}" : "Fire Table {table}";
    setCustomText(template.replace("{table}", table));
    setTablePickerFor(null);
  }, [tablePickerFor]);

  const handleSend = useCallback(() => {
    const text = customText.trim();
    if (!text) return;
    onSend(toStation, text.slice(0, MAX_MESSAGE_LENGTH));
    resetForm();
    onOpenChange(false);
  }, [customText, toStation, onSend, resetForm, onOpenChange]);

  const displayText = customText.slice(0, MAX_MESSAGE_LENGTH);
  const canSend = displayText.length > 0;
  const { theme } = useDisplayMode();

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" closeButtonClassName={theme.text} className={cn("w-full sm:max-w-md flex flex-col gap-0 theme-transition", theme.cardBg, theme.text, theme.border)}>
        <SheetHeader className={cn("shrink-0 pb-3 border-b", theme.border)}>
          <SheetTitle className={cn("flex items-center gap-2", theme.text)}>
            <MessageCircle className="h-5 w-5" />
            Send Message
          </SheetTitle>
        </SheetHeader>
        <div className={cn("flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-5", theme.text)}>
          <div>
            <Label className={cn("text-sm font-medium", theme.text)}>To:</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {destinationOptions.map((opt) => {
                const selected = toStation === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToStation(opt.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors theme-transition",
                      selected
                        ? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500"
                        : cn(theme.border, theme.metadataBg, "hover:opacity-90", theme.text)
                    )}
                  >
                    <span>{opt.icon}</span>
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className={cn("text-sm font-medium", theme.text)}>Quick Messages:</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {QUICK_MESSAGES.map((qm) => (
                <Button
                  key={qm.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("h-auto py-2 text-left justify-start font-normal theme-transition !bg-transparent", theme.border, theme.drawerButtonOutline, theme.text)}
                  onClick={() => handleQuickMessage(qm)}
                >
                  {qm.label}
                </Button>
              ))}
            </div>
          </div>

          {(tablePickerFor === "hold" || tablePickerFor === "fire") && (
            <div className={cn("rounded-lg border p-3 theme-transition", theme.border, theme.metadataBg)}>
              <p className={cn("text-sm font-medium mb-1.5", theme.text)}>
                {tablePickerFor === "hold" ? "Hold Table ___" : "Fire Table ___"}
              </p>
              <p className={cn("text-xs mb-1.5", theme.textMuted)}>Active tables:</p>
              <div className="flex flex-wrap gap-2">
                {activeTableNumbers.length === 0 ? (
                  <span className={cn("text-sm", theme.textMuted)}>No active tables</span>
                ) : (
                  activeTableNumbers.map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className={cn("theme-transition", theme.border, theme.metadataBg, theme.text)}
                      onClick={() => insertTable(t)}
                    >
                      {t}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          <div>
            <Label className={cn("text-sm font-medium", theme.text)}>Or type custom:</Label>
            <div className="mt-1.5 space-y-1">
              <Textarea
                placeholder="Type your message..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={3}
                className={cn("resize-y theme-transition !bg-transparent placeholder:opacity-70", theme.border, theme.drawerButtonOutline, theme.text, theme.drawerInputPlaceholder)}
              />
              <p className={cn("text-xs text-right", theme.textMuted)}>
                {displayText.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center justify-end gap-4 pt-0">
            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenHistory();
                }}
                className={cn("text-sm underline underline-offset-2 hover:opacity-90", theme.textMuted)}
              >
                View history
              </button>
            )}
            <Button onClick={handleSend} disabled={!canSend} className="bg-blue-500 hover:bg-blue-600 text-white theme-transition disabled:opacity-50">
              Send Message
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
