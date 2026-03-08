"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { getCurrentLocationId } from "@/app/actions/location";
import { useStationSettingsView } from "@/lib/hooks/useStationSettingsView";
import { useStationSettingsMutations } from "@/lib/hooks/useStationSettingsMutations";
import type { StationSettingsStation } from "@/lib/kds/stationSettingsView";
import { DisplayModeProvider } from "@/components/kds/DisplayModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function StationSettingsContent() {
  const [locationId, setLocationId] = useState<string | null>(null);
  useEffect(() => {
    getCurrentLocationId().then(setLocationId);
  }, []);

  const { view, loading, error, refresh, patch } = useStationSettingsView(locationId);
  const { createStation, updateStation, reorderStations } = useStationSettingsMutations({
    locationId,
    view,
    patch,
    refresh,
  });

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    const created = await createStation(name);
    if (created) {
      setNewName("");
    }
  }, [newName, createStation]);

  const handleStartEdit = useCallback((s: StationSettingsStation) => {
    setEditingId(s.id);
    setEditName(s.name);
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string) => {
      const name = editName.trim();
      if (!name) return;
      const ok = await updateStation(id, { name });
      if (ok) {
        setEditingId(null);
        setEditName("");
      }
    },
    [editName, updateStation]
  );

  const handleMove = useCallback(
    async (id: string, direction: "up" | "down") => {
      if (!view || movingId) return;
      const idx = view.stations.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= view.stations.length) return;
      setMovingId(id);
      const reordered = [...view.stations];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      const updates = reordered.map((s, i) => ({ id: s.id, displayOrder: i }));
      const ok = await reorderStations(updates);
      setMovingId(null);
      if (!ok) void refresh(true);
    },
    [view, movingId, reorderStations, refresh]
  );

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await updateStation(id, { isActive: !isActive });
    },
    [updateStation]
  );

  if (!locationId && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No location selected.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/kds" aria-label="Back to KDS">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Station settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage KDS stations for {view?.location?.name ?? "this location"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add, rename, reorder, and activate or deactivate stations. Inactive stations are hidden from KDS.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add station */}
            <div className="flex gap-2">
              <Input
                placeholder="Station name (e.g. Grill, Pastry)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={!newName.trim() || loading}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>

            {/* List */}
            {loading && view === null ? (
              <p className="py-8 text-center text-muted-foreground">Loading…</p>
            ) : view?.stations.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No stations yet. Add one above.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {view?.stations.map((s, idx) => (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2",
                      !s.isActive && "opacity-60"
                    )}
                  >
                    <div className="flex flex-col gap-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={movingId !== null || idx === 0}
                        onClick={() => handleMove(s.id, "up")}
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={movingId !== null || idx === view.stations.length - 1}
                        onClick={() => handleMove(s.id, "down")}
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingId === s.id ? (
                      <div className="flex flex-1 gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleSaveEdit(s.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditName("");
                            }
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSaveEdit(s.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditName(""); }}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 text-left font-medium hover:underline"
                        onClick={() => handleStartEdit(s)}
                      >
                        {s.name}
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground">{s.key}</span>
                    <Switch
                      checked={s.isActive}
                      onCheckedChange={() => handleToggleActive(s.id, s.isActive)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function KdsStationSettingsPage() {
  return (
    <DisplayModeProvider>
      <StationSettingsContent />
    </DisplayModeProvider>
  );
}
