"use client";

import { Link } from "@/components/ui/link";
import { useCallback } from "react";

const prefetched = new Set<string>();

function preloadImage(url?: string | null) {
  if (!url) return;
  const cleaned = url.trim();
  if (!cleaned || prefetched.has(cleaned)) return;
  if (typeof window === "undefined") return;

  const img = new Image();
  img.src = cleaned;
  prefetched.add(cleaned);
}

type Props = {
  id: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
};

export function MerchantSidebarLink({ id, name, logoUrl, bannerUrl }: Props) {
  const handleHover = useCallback(() => {
    preloadImage(logoUrl);
    preloadImage(bannerUrl);
  }, [logoUrl, bannerUrl]);

  return (
    <Link
      prefetch={true}
      href={`/merchants/${id}`}
      className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
      onMouseEnter={handleHover}
      onFocus={handleHover}
    >
      {name}
    </Link>
  );
}
