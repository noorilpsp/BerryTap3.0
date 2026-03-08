"use client";

import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisplayMode } from "./DisplayModeContext";

interface KDSEmptyStateProps {
  /** Optional message. Default: "No orders here" */
  message?: string;
}

export function KDSEmptyState({ message = "No orders here" }: KDSEmptyStateProps) {
  const { theme } = useDisplayMode();
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 theme-transition", theme.textMuted)}>
      <ChefHat className="h-12 w-12 mb-3 opacity-50" aria-hidden />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}
