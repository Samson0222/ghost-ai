"use client";

import { Square, Diamond, Circle, Pill, Database, Hexagon } from "lucide-react";
import type { NodeShape } from "@/types/canvas";

interface ShapeConfig {
  shape: NodeShape;
  icon: React.FC<{ className?: string }>;
  label: string;
  width: number;
  height: number;
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", icon: Square,   label: "Rectangle", width: 160, height: 80  },
  { shape: "diamond",   icon: Diamond,  label: "Diamond",   width: 150, height: 150 },
  { shape: "circle",    icon: Circle,   label: "Circle",    width: 80,  height: 80  },
  { shape: "pill",      icon: Pill,     label: "Pill",      width: 160, height: 64  },
  { shape: "cylinder",  icon: Database, label: "Cylinder",  width: 100, height: 100 },
  { shape: "hexagon",   icon: Hexagon,  label: "Hexagon",   width: 120, height: 120 },
];

export interface ShapeDragPayload {
  shape: NodeShape;
  label: string;
  width: number;
  height: number;
}

export const SHAPE_DRAG_TYPE = "application/ghost-shape";

interface ShapePanelProps {
  onInsert?: (payload: ShapeDragPayload) => void;
}

export function ShapePanel({ onInsert }: ShapePanelProps) {
  function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
    const payload = {
      shape: config.shape,
      label: config.label,
      width: config.width,
      height: config.height,
    } satisfies ShapeDragPayload;
    const json = JSON.stringify(payload);
    e.dataTransfer.setData(SHAPE_DRAG_TYPE, json);
    e.dataTransfer.setData("application/x-ghost-shape", json);
    // text/plain is universally readable; acts as a fallback if the custom type
    // is unavailable in a given browser or security context.
    e.dataTransfer.setData("text/plain", json);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-2 shadow-lg">
        {SHAPES.map((config) => (
          <button
            key={config.shape}
            draggable
            onDragStart={(e) => handleDragStart(e, config)}
            onClick={() =>
              onInsert?.({
                shape: config.shape,
                label: config.label,
                width: config.width,
                height: config.height,
              })
            }
            title={config.label}
            aria-label={`Add ${config.label}`}
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
          >
            {/* pointer-events:none stops the SVG from being the drag target,
                ensuring dragstart always fires on the button itself. */}
            <config.icon className="h-4 w-4 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}
