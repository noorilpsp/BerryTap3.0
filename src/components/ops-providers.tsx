"use client";

import { useState, useEffect, type ReactNode } from "react";
import { PermissionsProvider, usePermissionsContext } from "@/lib/contexts/PermissionsContext";
import { TenantProvider } from "@/lib/contexts/TenantContext";
import { LocationProvider } from "@/lib/contexts/LocationContext";
import { RestaurantHydrationRunner } from "@/components/restaurant-hydration-runner";

const LoadingFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-zinc-950">
    <span className="text-zinc-400">Loading...</span>
  </div>
);

function OpsProvidersInner({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { sessionPermissions, loading } = usePermissionsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  if (loading || !sessionPermissions) {
    return <LoadingFallback />;
  }

  const merchantMemberships = sessionPermissions.merchantMemberships.map((m) => ({
    merchantId: m.merchantId,
    merchantName: m.merchantName,
    role: m.role,
    isActive: m.isActive,
    membershipCreatedAt: m.membershipCreatedAt,
  }));
  const userId = sessionPermissions.userId;

  if (merchantMemberships.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950">
        <span className="text-zinc-400">No merchants found.</span>
      </div>
    );
  }

  return (
    <TenantProvider initialMerchants={merchantMemberships} userId={userId}>
      <LocationProvider>
        <RestaurantHydrationRunner />
        {children}
      </LocationProvider>
    </TenantProvider>
  );
}

export function OpsProviders({ children }: { children: ReactNode }) {
  return (
    <PermissionsProvider>
      <OpsProvidersInner>{children}</OpsProvidersInner>
    </PermissionsProvider>
  );
}
