"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";

/**
 * Mobile layout: applies liquid-glass background system and checkout-button-design
 * font setup (Geist from next/font). Each app section keeps its own design.
 */
const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const isMobile = pathname?.startsWith("/mobile");
    const root = document.documentElement;
    if (isMobile) {
      root.classList.add("liquid-glass-page");
    } else {
      root.classList.remove("liquid-glass-page");
    }
    return () => root.classList.remove("liquid-glass-page");
  }, [pathname]);

  return (
    <div
      className={`mobile-ordering-root ${geist.variable} ${geistMono.variable} font-sans antialiased min-h-full`}
    >
      {children}
    </div>
  );
}
