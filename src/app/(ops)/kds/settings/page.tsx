"use client";

import { useState, useEffect } from "react";
import { getCurrentLocationId } from "@/app/actions/location";
import { DisplayModeProvider } from "@/components/kds/DisplayModeContext";
import { StationSettingsPanel } from "@/components/kds/station-settings-panel";

function StationSettingsContent() {
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocationId().then(setLocationId);
  }, []);

  return (
    <StationSettingsPanel
      locationId={locationId}
      backHref="/kds"
      backAriaLabel="Back to KDS"
    />
  );
}

export default function KdsStationSettingsPage() {
  return (
    <DisplayModeProvider>
      <div className="min-h-screen">
        <StationSettingsContent />
      </div>
    </DisplayModeProvider>
  );
}
