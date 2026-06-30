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
  grabOffsetX: number;
  grabOffsetY: number;
}

export const SHAPE_DRAG_TYPE = "application/ghost-shape";

const PREVIEW_FILL = "#1F1F1F";
const PREVIEW_STROKE = "#3a3a42";

function buildSvgPreview(shape: NodeShape, fill: string, stroke: string): string {
  if (shape === "diamond") {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="50,0 100,50 50,100 0,50" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
  }
  if (shape === "hexagon") {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
  }
  if (shape === "cylinder") {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="15" width="100" height="70" fill="${fill}"/><line x1="0" y1="15" x2="0" y2="85" stroke="${stroke}" stroke-width="1.5"/><line x1="100" y1="15" x2="100" y2="85" stroke="${stroke}" stroke-width="1.5"/><ellipse cx="50" cy="85" rx="50" ry="15" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><ellipse cx="50" cy="15" rx="50" ry="15" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
  }
  return "";
}

interface ShapePanelProps {
  onInsert?: (payload: ShapeDragPayload) => void;
}

export function ShapePanel({ onInsert }: ShapePanelProps) {
  function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
    // Record where inside the button the user grabbed so the drop handler
    // can place the node exactly where the cursor is, not offset by grab position.
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grabOffsetX = e.clientX - btn.left;
    const grabOffsetY = e.clientY - btn.top;

    const payload = {
      shape: config.shape,
      label: config.label,
      width: config.width,
      height: config.height,
      grabOffsetX,
      grabOffsetY,
    } satisfies ShapeDragPayload;
    const json = JSON.stringify(payload);
    e.dataTransfer.setData(SHAPE_DRAG_TYPE, json);
    e.dataTransfer.setData("application/x-ghost-shape", json);
    // text/plain is universally readable; acts as a fallback if the custom type
    // is unavailable in a given browser or security context.
    e.dataTransfer.setData("text/plain", json);
    e.dataTransfer.effectAllowed = "copy";

    // Build a temporary off-screen element that matches the shape being dragged
    // and use it as the browser's drag image so the cursor carries the shape ghost.
    const preview = document.createElement("div");
    Object.assign(preview.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      width: `${config.width}px`,
      height: `${config.height}px`,
      opacity: "0.8",
      pointerEvents: "none",
    });

    if (config.shape === "rectangle") {
      Object.assign(preview.style, {
        backgroundColor: PREVIEW_FILL,
        borderRadius: "0.75rem",
        border: `1.5px solid ${PREVIEW_STROKE}`,
      });
    } else if (config.shape === "pill" || config.shape === "circle") {
      Object.assign(preview.style, {
        backgroundColor: PREVIEW_FILL,
        borderRadius: "9999px",
        border: `1.5px solid ${PREVIEW_STROKE}`,
      });
    } else {
      preview.innerHTML = buildSvgPreview(config.shape, PREVIEW_FILL, PREVIEW_STROKE);
    }

    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, config.width / 2, config.height / 2);
    requestAnimationFrame(() => document.body.removeChild(preview));
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
                grabOffsetX: config.width / 2,
                grabOffsetY: config.height / 2,
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
