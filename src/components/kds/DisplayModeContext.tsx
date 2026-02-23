"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

export type DisplayMode = "light" | "dark" | "high-contrast" | "auto";

export type EffectiveDisplayMode = "light" | "dark" | "high-contrast";

export const displayModeThemes = {
  light: {
    background: "bg-gray-100",
    cardBg: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    divide: "divide-gray-200",
    columnDivide: "divide-x-2 divide-gray-200",
    headerSeparator: "",
    columnTitleSeparator: "",
    columnTitleSeparatorPreparing: "",
    headerOutlineButton: "",
    headerBg: "bg-white",
    urgencyBorder: "border-red-500",
    warningBorder: "border-amber-500",
    normalBorder: "border-gray-200",
    // Ticket semantic colors
    timerUrgent: "text-red-500",
    timerWarning: "text-yellow-600",
    timerNormal: "text-gray-500",
    remakeBadge: "bg-red-500/15 text-red-700",
    recalledBadge: "bg-yellow-500/15 text-yellow-800",
    modifiedBadge: "bg-amber-500/20 text-amber-800",
    snoozedBadge: "bg-yellow-500/20 text-yellow-800",
    specialInstructions: "bg-amber-500/20 border-amber-500/40 text-amber-800",
    highlightBg: "bg-yellow-100",
    batchRing: "ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    columnNewBorder: "border-l-gray-400",
    columnPreparingBorder: "border-l-blue-400",
    columnReadyBorder: "border-l-green-400",
    itemNewText: "text-green-700",
    itemModifiedText: "text-amber-700",
    batchDot: "text-amber-600",
    removalText: "text-red-500",
    additionText: "text-emerald-600",
    priorityDot: "text-red-500",
    metadataBg: "bg-gray-100",
    drawerButtonOutline: "",
    drawerInputPlaceholder: "",
    viewToggleSelected: "bg-white text-gray-900 shadow-sm hover:bg-gray-100 hover:text-gray-900",
    viewToggleUnselected: "text-gray-500 hover:bg-gray-200 hover:text-gray-900",
  },
  dark: {
    background: "bg-gray-900",
    cardBg: "bg-gray-800",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    divide: "divide-gray-700",
    columnDivide: "divide-x-2 divide-gray-700",
    headerSeparator: "",
    columnTitleSeparator: "",
    columnTitleSeparatorPreparing: "",
    headerOutlineButton: "!bg-transparent border border-gray-700 text-gray-100 hover:!bg-gray-700 hover:!text-gray-100",
    headerBg: "bg-gray-800",
    urgencyBorder: "border-red-500",
    warningBorder: "border-amber-400",
    normalBorder: "border-gray-700",
    timerUrgent: "text-red-400",
    timerWarning: "text-yellow-500",
    timerNormal: "text-gray-400",
    remakeBadge: "bg-red-500/20 text-red-300",
    recalledBadge: "bg-yellow-500/20 text-yellow-200",
    modifiedBadge: "bg-amber-500/20 text-amber-200",
    snoozedBadge: "bg-yellow-500/20 text-yellow-200",
    specialInstructions: "bg-amber-500/20 border-amber-500/40 text-amber-200",
    highlightBg: "bg-yellow-900/30",
    batchRing: "ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    columnNewBorder: "border-l-gray-500",
    columnPreparingBorder: "border-l-blue-500",
    columnReadyBorder: "border-l-green-500",
    itemNewText: "text-green-400",
    itemModifiedText: "text-amber-400",
    batchDot: "text-amber-400",
    removalText: "text-red-400",
    additionText: "text-emerald-400",
    priorityDot: "text-red-400",
    metadataBg: "bg-gray-800/50",
    drawerButtonOutline: "",
    drawerInputPlaceholder: "placeholder:text-gray-400",
    viewToggleSelected: "bg-gray-700 text-gray-100 shadow-sm hover:bg-amber-700/50 hover:text-amber-100",
    viewToggleUnselected: "text-gray-400 hover:bg-amber-700/50 hover:text-amber-100",
  },
  "high-contrast": {
    background: "bg-black",
    cardBg: "bg-gray-900",
    text: "text-white",
    textMuted: "text-white",
    border: "border border-white",
    divide: "divide-x divide-white",
    columnDivide: "divide-x-2 divide-white",
    headerSeparator: "border-b-2 border-white",
    columnTitleSeparator: "border-b-2 border-white",
    columnTitleSeparatorPreparing: "border-b-2 border-blue-400",
    headerOutlineButton: "!bg-transparent border-2 border-white text-white hover:!bg-white hover:!text-black",
    headerBg: "bg-black",
    urgencyBorder: "border-red-500",
    warningBorder: "border-amber-400",
    normalBorder: "border border-white",
    fontSize: "text-lg",
    fontWeight: "font-bold",
    timerUrgent: "text-red-400",
    timerWarning: "bg-amber-400 text-black",
    timerNormal: "text-white",
    remakeBadge: "bg-red-600 text-white",
    recalledBadge: "bg-amber-400 text-black",
    modifiedBadge: "bg-amber-400 text-black",
    snoozedBadge: "bg-amber-400 text-black",
    specialInstructions: "bg-amber-400 text-black",
    highlightBg: "bg-gray-900",
    batchRing: "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]",
    columnNewBorder: "border-l-2 border-l-white",
    columnPreparingBorder: "border-l-blue-400",
    columnReadyBorder: "border-l-green-400",
    itemNewText: "text-green-400",
    itemModifiedText: "text-amber-400",
    batchDot: "text-amber-400",
    removalText: "text-red-400",
    additionText: "text-green-400",
    priorityDot: "text-red-400",
    metadataBg: "bg-gray-900",
    drawerButtonOutline: "border-2 border-white",
    drawerInputPlaceholder: "placeholder:text-white placeholder:opacity-80",
    viewToggleSelected: "bg-white text-black border-2 border-white hover:bg-gray-200 hover:text-black",
    viewToggleUnselected: "text-white hover:bg-gray-800 hover:text-white",
  },
} as const;

type Theme = (typeof displayModeThemes)[EffectiveDisplayMode];

interface DisplayModeContextValue {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  effectiveMode: EffectiveDisplayMode;
  theme: Theme;
  isHighContrast: boolean;
}

const STORAGE_KEY = "kds-display-mode";

const DisplayModeContext = createContext<DisplayModeContextValue>({
  mode: "light",
  setMode: () => {},
  effectiveMode: "light",
  theme: displayModeThemes.light,
  isHighContrast: false,
});

export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DisplayMode>("light");
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as DisplayMode | null;
    if (saved && ["light", "dark", "high-contrast", "auto"].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = (next: DisplayMode) => setModeState(next);

  const effectiveMode: EffectiveDisplayMode =
    mode === "auto"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : mode === "high-contrast"
        ? "high-contrast"
        : mode;

  const theme = displayModeThemes[effectiveMode];
  const isHighContrast = effectiveMode === "high-contrast";

  const value = useMemo<DisplayModeContextValue>(
    () => ({ mode, setMode, effectiveMode, theme, isHighContrast }),
    [mode, effectiveMode, theme, isHighContrast]
  );

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  const ctx = useContext(DisplayModeContext);
  if (!ctx) {
    throw new Error("useDisplayMode must be used within DisplayModeProvider");
  }
  return ctx;
}
