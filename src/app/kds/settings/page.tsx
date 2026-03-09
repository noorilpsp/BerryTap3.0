"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { getCurrentLocationId } from "@/app/actions/location";
import { useStationSettingsView } from "@/lib/hooks/useStationSettingsView";
import { useStationSettingsMutations } from "@/lib/hooks/useStationSettingsMutations";
import type {
  StationSettingsStation,
  StationSettingsSubstation,
} from "@/lib/kds/stationSettingsView";
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
  const {
    createStation,
    updateStation,
    reorderStations,
    createSubstation,
    updateSubstation,
    deleteSubstation,
    reorderSubstations,
  } = useStationSettingsMutations({
    locationId,
    view,
    patch,
    refresh,
  });

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [subEditingId, setSubEditingId] = useState<string | null>(null);
  const [subEditName, setSubEditName] = useState("");
  const [subMovingId, setSubMovingId] = useState<string | null>(null);
  const [subNewNameByStation, setSubNewNameByStation] = useState<Record<string, string>>({});

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

  const handleAddSubstation = useCallback(
    async (stationId: string) => {
      const name = subNewNameByStation[stationId]?.trim();
      if (!name) return;
      const created = await createSubstation(stationId, name);
      if (created) {
        setSubNewNameByStation((prev) => ({ ...prev, [stationId]: "" }));
      }
    },
    [subNewNameByStation, createSubstation]
  );

  const handleStartEditSub = useCallback((ss: StationSettingsSubstation) => {
    setSubEditingId(ss.id);
    setSubEditName(ss.name);
  }, []);

  const handleSaveEditSub = useCallback(
    async (id: string) => {
      const name = subEditName.trim();
      if (!name) return;
      const ok = await updateSubstation(id, { name });
      if (ok) {
        setSubEditingId(null);
        setSubEditName("");
      }
    },
    [subEditName, updateSubstation]
  );

  const handleDeleteSub = useCallback(
    async (id: string) => {
      await deleteSubstation(id);
    },
    [deleteSubstation]
  );

  const handleMoveSub = useCallback(
    async (stationId: string, subId: string, direction: "up" | "down") => {
      const station = view?.stations.find((s) => s.id === stationId);
      if (!station || subMovingId || station.substations.length < 2) return;
      const idx = station.substations.findIndex((ss) => ss.id === subId);
      if (idx < 0) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= station.substations.length) return;
      setSubMovingId(subId);
      const reordered = [...station.substations];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      const updates = reordered.map((ss, i) => ({ id: ss.id, displayOrder: i }));
      const ok = await reorderSubstations(stationId, updates);
      setSubMovingId(null);
      if (!ok) void refresh(true);
    },
    [view, subMovingId, reorderSubstations, refresh]
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
            <CardTitle>Stations & Lanes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add, rename, reorder, and activate or deactivate stations. Add lanes (substations) per station for KDS preparing view. Inactive stations are hidden from KDS.
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
                  <li key={s.id} className={cn(!s.isActive && "opacity-60")}>
                    <div className="flex items-center gap-2 px-3 py-2">
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
                    </div>
                    {/* Substations (lanes) for this station */}
                    <div className="ml-10 mr-3 mb-2 space-y-1 rounded border-l-2 border-muted pl-3">
                      {s.substations.map((ss, ssIdx) => (
                        <div key={ss.id} className="flex items-center gap-2 py-1">
                          <div className="flex flex-col gap-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={subMovingId !== null || ssIdx === 0}
                              onClick={() => handleMoveSub(s.id, ss.id, "up")}
                              aria-label="Move lane up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={
                                subMovingId !== null ||
                                ssIdx === s.substations.length - 1
                              }
                              onClick={() => handleMoveSub(s.id, ss.id, "down")}
                              aria-label="Move lane down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          {subEditingId === ss.id ? (
                            <div className="flex flex-1 gap-2">
                              <Input
                                value={subEditName}
                                onChange={(e) => setSubEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void handleSaveEditSub(ss.id);
                                  if (e.key === "Escape") {
                                    setSubEditingId(null);
                                    setSubEditName("");
                                  }
                                }}
                                className="h-8"
                                autoFocus
                              />
                              <Button size="sm" className="h-8" onClick={() => handleSaveEditSub(ss.id)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8"
                                onClick={() => {
                                  setSubEditingId(null);
                                  setSubEditName("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="flex-1 text-left text-sm hover:underline"
                                onClick={() => handleStartEditSub(ss)}
                              >
                                {ss.name}
                              </button>
                              <span className="text-xs text-muted-foreground">{ss.key}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSub(ss.id)}
                                aria-label="Delete lane"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <Input
                          placeholder="Add lane (e.g. Grill)"
                          value={subNewNameByStation[s.id] ?? ""}
                          onChange={(e) =>
                            setSubNewNameByStation((prev) => ({
                              ...prev,
                              [s.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddSubstation(s.id)
                          }
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => handleAddSubstation(s.id)}
                          disabled={!subNewNameByStation[s.id]?.trim()}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add lane
                        </Button>
                      </div>
                    </div>
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
