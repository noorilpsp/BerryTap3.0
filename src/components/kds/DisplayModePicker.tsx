"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/kds/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useDisplayMode, type DisplayMode } from "./DisplayModeContext";
import { cn } from "@/lib/utils";

const MODES: {
  id: DisplayMode;
  icon: string;
  label: string;
  description: string;
}[] = [
  { id: "light", icon: "☀️", label: "Light", description: "Best for bright environments" },
  { id: "dark", icon: "🌙", label: "Dark", description: "Best for dim kitchens" },
  { id: "high-contrast", icon: "💡", label: "High Contrast", description: "Maximum visibility" },
  { id: "auto", icon: "🖥️", label: "Auto", description: "Follow system settings" },
];

export function DisplayModePicker() {
  const { mode, setMode, theme } = useDisplayMode();
  const [open, setOpen] = useState(false);

  const current = MODES.find((m) => m.id === mode);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("shrink-0 theme-transition", theme.headerOutlineButton || theme.border, !theme.headerOutlineButton && theme.text)} aria-label="Display mode">
          <span className="text-lg leading-none">{current?.icon ?? "☀️"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-72 theme-transition", theme.cardBg, theme.text, theme.border)}>
        <DropdownMenuLabel className={theme.text}>Display Mode</DropdownMenuLabel>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              setOpen(false);
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors theme-transition",
              mode === m.id ? theme.metadataBg : "hover:opacity-90",
              theme.text
            )}
          >
            <span className="text-xl shrink-0">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2">
                {m.label}
                {mode === m.id && <Check className={cn("h-4 w-4 shrink-0", theme.text)} />}
              </div>
              <div className={cn("text-sm", theme.textMuted)}>{m.description}</div>
            </div>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
