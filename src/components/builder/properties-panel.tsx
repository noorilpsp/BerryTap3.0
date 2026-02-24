"use client"

import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  ArrowUpToLine,
  ArrowDownToLine,
  RotateCw,
} from "lucide-react"
import type { PlacedElement } from "@/lib/floorplan-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

interface PropertiesPanelProps {
  element: PlacedElement
  onUpdate: (id: string, updates: Partial<PlacedElement>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onBringToFront: (id: string) => void
  onSendToBack: (id: string) => void
}

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}: PropertiesPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {element.id}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() =>
              onUpdate(element.id, { locked: !element.locked })
            }
            title={element.locked ? "Unlock" : "Lock"}
          >
            {element.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(element.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Label
        </Label>
        <Input
          value={element.customLabel ?? element.label}
          onChange={(e) =>
            onUpdate(element.id, { customLabel: e.target.value })
          }
          className="h-8 text-xs bg-card border-border/50 focus:border-primary/50"
          placeholder={element.label}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Position
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-mono">X</span>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) =>
                onUpdate(element.id, { x: Number(e.target.value) })
              }
              className="h-7 text-xs font-mono bg-card border-border/50 focus:border-primary/50"
              disabled={element.locked}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-mono">Y</span>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) =>
                onUpdate(element.id, { y: Number(e.target.value) })
              }
              className="h-7 text-xs font-mono bg-card border-border/50 focus:border-primary/50"
              disabled={element.locked}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Size
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-mono">W</span>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) =>
                onUpdate(element.id, {
                  width: Math.max(20, Number(e.target.value)),
                })
              }
              className="h-7 text-xs font-mono bg-card border-border/50 focus:border-primary/50"
              disabled={element.locked}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-mono">H</span>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) =>
                onUpdate(element.id, {
                  height: Math.max(20, Number(e.target.value)),
                })
              }
              className="h-7 text-xs font-mono bg-card border-border/50 focus:border-primary/50"
              disabled={element.locked}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Rotation
        </Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.rotation]}
            onValueChange={([v]) =>
              onUpdate(element.id, { rotation: v })
            }
            min={0}
            max={360}
            step={15}
            className="flex-1"
            disabled={element.locked}
          />
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-muted-foreground w-8 text-right">
              {element.rotation}
            </span>
            <RotateCw className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Opacity
        </Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.opacity * 100]}
            onValueChange={([v]) =>
              onUpdate(element.id, { opacity: v / 100 })
            }
            min={10}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-xs font-mono text-muted-foreground w-8 text-right">
            {Math.round(element.opacity * 100)}%
          </span>
        </div>
      </div>

      {element.seats !== undefined && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Seats
          </Label>
          <Input
            type="number"
            value={element.seats}
            onChange={(e) =>
              onUpdate(element.id, {
                seats: Math.max(0, Number(e.target.value)),
              })
            }
            className="h-7 text-xs font-mono bg-card border-border/50 focus:border-primary/50"
            min={0}
            max={20}
          />
        </div>
      )}

      <Separator className="bg-border/50" />

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Actions
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 border-border/50 bg-card hover:bg-accent text-foreground"
            onClick={() => onDuplicate(element.id)}
          >
            <Copy className="h-3 w-3" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 border-border/50 bg-card hover:bg-accent text-foreground"
            onClick={() => onBringToFront(element.id)}
          >
            <ArrowUpToLine className="h-3 w-3" />
            Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 border-border/50 bg-card hover:bg-accent text-foreground"
            onClick={() => onSendToBack(element.id)}
          >
            <ArrowDownToLine className="h-3 w-3" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 border-destructive/30 bg-card hover:bg-destructive/10 text-destructive hover:text-destructive"
            onClick={() => onDelete(element.id)}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
