"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { restaurant } from "@/lib/menu-data";

interface HeroSectionProps {
  onInfoClick: () => void;
  topRightSlot?: ReactNode;
}

export function HeroSection({ onInfoClick, topRightSlot }: HeroSectionProps) {
  const ratingValue = "4.8";

  return (
    <div className="relative">
      <div className="relative h-72 w-full">
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800">
          <Image
            src={restaurant.bannerUrl || "/placeholder.svg"}
            alt={`${restaurant.name} banner`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />
          <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_100%_0%,rgba(80,160,255,0.2),transparent_58%)]" />
        </div>

        <button
          type="button"
          className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/45"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {topRightSlot ? (
          <div className="absolute right-3 top-3 z-[120]">{topRightSlot}</div>
        ) : null}

        <button
          type="button"
          onClick={onInfoClick}
          aria-label="Open restaurant information"
          className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 text-left"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="logo-float h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border border-white/25 bg-white/10 shadow-[0_8px_22px_rgba(0,0,0,0.28)] backdrop-blur-sm">
                <Image
                  src={restaurant.logoUrl || "/placeholder.svg"}
                  alt={`${restaurant.name} logo`}
                  width={88}
                  height={88}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="liquid-glass inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-[15px] font-semibold text-white">
                  <span className="truncate">{restaurant.name}</span>
                </div>

                {restaurant.description ? (
                  <div className="liquid-glass inline-flex w-fit max-w-full rounded-full px-3 py-1.5 text-[13px] text-white/90">
                    <p className="max-w-full truncate">{restaurant.description}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex max-w-full items-center gap-2">
              <div className="liquid-glass shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-emerald-200">
                Open now
              </div>
              <div className="liquid-glass inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs text-white/90">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  {ratingValue}
                </span>
              </div>
              <div className="liquid-glass min-w-0 max-w-[min(66vw,22rem)] rounded-full px-3 py-1 text-xs text-white/85">
                <span className="block truncate">{restaurant.address}</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
