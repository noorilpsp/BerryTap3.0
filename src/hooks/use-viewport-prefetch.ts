"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DELAY_MS = 150;
const POLL_RESET_MS = 1000;
const MAX_PER_POLL = 4;

// Shared budget: limit viewport prefetches per second across all table nodes
let viewportBudget = { count: 0, resetAt: 0 };

function consumeBudget(): boolean {
  const now = Date.now();
  if (viewportBudget.resetAt < now) {
    viewportBudget.count = 0;
    viewportBudget.resetAt = now + POLL_RESET_MS;
  }
  if (viewportBudget.count >= MAX_PER_POLL) return false;
  viewportBudget.count += 1;
  return true;
}

/**
 * Prefetch when the element enters the viewport.
 * Dedupes by tableId (via prefetchTableData), limits rate, debounces.
 */
export function useViewportPrefetch(
  id: string,
  onPrefetch: (id: string) => void,
  enabled: boolean
): React.RefCallback<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const onPrefetchRef = useRef(onPrefetch);
  onPrefetchRef.current = onPrefetch;

  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node || !enabled) return;

    const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          if (timeoutRef.current) return;
          timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            if (consumeBudget()) {
              onPrefetchRef.current(id);
            }
          }, DELAY_MS);
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      { root: null, rootMargin: "50px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observer.disconnect();
    };
  }, [node, enabled, id]);

  return setRef;
}
