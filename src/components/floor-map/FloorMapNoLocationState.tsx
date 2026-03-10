"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

/** Shown when location is resolved but no store/location is selected. */
export function FloorMapNoLocationState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100 pb-14 px-4">
      <MapPin className="h-12 w-12 text-zinc-500" strokeWidth={1.5} />
      <p className="text-center text-base font-medium text-zinc-400 max-w-sm">
        No location selected. Select a store in dashboard or settings.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
