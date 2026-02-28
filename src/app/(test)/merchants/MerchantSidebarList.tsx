"use client";

import { Link } from "@/components/ui/link";
import { useEffect } from "react";

type Merchant = {
  id: string;
  name: string;
};

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return;
  }
  try {
    const url = new URL(href, window.location.href);
    await fetch(`/api/prefetch-images${url.pathname}`, { priority: "low" });
  } catch {
    // best-effort; ignore errors
  }
}

export function MerchantSidebarList({ merchants }: { merchants: Merchant[] }) {
  useEffect(() => {
    // Fire prefetch for the first few links so images are cached even if observer doesn't run.
    merchants.slice(0, 8).forEach((m) => {
      void prefetchImages(`/merchants/${m.id}`);
    });
  }, [merchants]);

  return (
    <ul className="flex flex-col items-start justify-center">
      {merchants.map((merchant) => (
        <li key={merchant.id} className="w-full">
          <Link
            prefetch={true}
            href={`/merchants/${merchant.id}`}
            className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
          >
            {merchant.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
