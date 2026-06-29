"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { NODE_COLORS } from "@/types/canvas";
import { CANVAS_TEMPLATES } from "./starter-templates";
import type { CanvasTemplate } from "./starter-templates";

// ─── SVG preview ─────────────────────────────────────────────────────────────
// viewBox defines the coordinate space; SVG renders at 100% card width and
// auto height so the aspect ratio is always preserved.

const VB_W = 420;
const VB_H = 220;
const PAD = 12;

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  if (template.nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of template.nodes) {
    const w = node.width ?? 120;
    const h = node.height ?? 50;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + w);
    maxY = Math.max(maxY, node.position.y + h);
  }

  const contentW = maxX - minX || 1;
  const contentH = maxY - minY || 1;
  const scale = Math.min(
    (VB_W - PAD * 2) / contentW,
    (VB_H - PAD * 2) / contentH
  );
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const ox = PAD + ((VB_W - PAD * 2) - scaledW) / 2 - minX * scale;
  const oy = PAD + ((VB_H - PAD * 2) - scaledH) / 2 - minY * scale;

  const tx = (x: number) => x * scale + ox;
  const ty = (y: number) => y * scale + oy;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="block w-full"
      style={{ background: "#0d0d10" }}
    >
      <defs>
        <marker id="pa" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L5,2.5 z" fill="#5a5a6a" />
        </marker>
      </defs>

      {/* Edges drawn first so nodes appear on top */}
      {template.edges.map((edge) => {
        const src = template.nodes.find((n) => n.id === edge.source);
        const tgt = template.nodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return null;
        const sw = src.width ?? 120;
        const sh = src.height ?? 50;
        const tw = tgt.width ?? 120;
        const th = tgt.height ?? 50;
        return (
          <line
            key={edge.id}
            x1={tx(src.position.x + sw / 2)}
            y1={ty(src.position.y + sh / 2)}
            x2={tx(tgt.position.x + tw / 2)}
            y2={ty(tgt.position.y + th / 2)}
            stroke="#5a5a6a"
            strokeWidth={1}
            markerEnd="url(#pa)"
          />
        );
      })}

      {/* Nodes */}
      {template.nodes.map((node) => {
        const nw = (node.width ?? 120) * scale;
        const nh = (node.height ?? 50) * scale;
        const nx = tx(node.position.x);
        const ny = ty(node.position.y);
        const fill = node.data.color;
        const pair = NODE_COLORS.find((c) => c.fill === fill) ?? NODE_COLORS[0];
        const stroke = pair.text;
        const shape = node.data.shape;

        if (shape === "circle") {
          return (
            <ellipse
              key={node.id}
              cx={nx + nw / 2}
              cy={ny + nh / 2}
              rx={nw / 2}
              ry={nh / 2}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        }

        if (shape === "pill") {
          return (
            <rect
              key={node.id}
              x={nx}
              y={ny}
              width={nw}
              height={nh}
              rx={nh / 2}
              ry={nh / 2}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        }

        if (shape === "diamond") {
          const cx = nx + nw / 2;
          const cy = ny + nh / 2;
          return (
            <polygon
              key={node.id}
              points={`${cx},${ny} ${nx + nw},${cy} ${cx},${ny + nh} ${nx},${cy}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        }

        if (shape === "hexagon") {
          const cx = nx + nw / 2;
          const cy = ny + nh / 2;
          const rx = nw / 2;
          const ry = nh / 2;
          const pts = [
            `${cx},${cy - ry}`,
            `${cx + rx},${cy - ry / 2}`,
            `${cx + rx},${cy + ry / 2}`,
            `${cx},${cy + ry}`,
            `${cx - rx},${cy + ry / 2}`,
            `${cx - rx},${cy - ry / 2}`,
          ].join(" ");
          return (
            <polygon
              key={node.id}
              points={pts}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        }

        if (shape === "cylinder") {
          // Mirror canvas-node.tsx: rect body + top/bottom ellipses
          const ey = Math.max(nh * 0.2, 3);
          return (
            <g key={node.id}>
              <rect x={nx} y={ny + ey} width={nw} height={nh - ey} fill={fill} />
              <line x1={nx} y1={ny + ey} x2={nx} y2={ny + nh} stroke={stroke} strokeWidth={1} />
              <line x1={nx + nw} y1={ny + ey} x2={nx + nw} y2={ny + nh} stroke={stroke} strokeWidth={1} />
              <ellipse cx={nx + nw / 2} cy={ny + nh} rx={nw / 2} ry={ey} fill={fill} stroke={stroke} strokeWidth={1} />
              <ellipse cx={nx + nw / 2} cy={ny + ey} rx={nw / 2} ry={ey} fill={fill} stroke={stroke} strokeWidth={1} />
            </g>
          );
        }

        // Default: rectangle
        return (
          <rect
            key={node.id}
            x={nx}
            y={ny}
            width={nw}
            height={nh}
            rx={Math.min(4, nh * 0.15)}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Import Template</DialogTitle>
          <DialogDescription>
            Choose a starter template to pre-populate your canvas. Any existing nodes will be
            replaced —{" "}
            <kbd className="rounded border border-border-subtle bg-elevated px-1 py-0.5 font-mono text-xs text-copy-secondary">
              Ctrl/Cmd+Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface"
            >
              {/* Preview fills the top of the card at natural SVG aspect ratio */}
              <div className="overflow-hidden rounded-t-xl border-b border-border-subtle">
                <TemplatePreview template={template} />
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="font-semibold text-copy-primary">{template.name}</p>
                <p className="flex-1 text-sm leading-relaxed text-copy-muted">
                  {template.description}
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full gap-2"
                  onClick={() => {
                    onImport(template);
                    onOpenChange(false);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
