"use client";

import { Button } from "@/components/ui/button";

interface FloorMapErrorStateProps {
  message: string;
  onRetry: () => void;
}

/** Shown when floor plan load fails. Offers Retry. */
export function FloorMapErrorState({ message, onRetry }: FloorMapErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100 pb-14 px-4">
      <p className="text-center text-base font-medium text-zinc-400 max-w-md">
        {message}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100"
      >
        Retry
      </Button>
    </div>
  );
}
