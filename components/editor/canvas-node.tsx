"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import { NODE_COLORS, type NodeData, type NodeShape } from "@/types/canvas";

type CanvasNodeProps = NodeProps<Node<NodeData, "canvasNode">>;

function ShapeFrame({
  shape,
  fill,
  stroke,
  children,
}: {
  shape: NodeShape;
  fill: string;
  stroke: string;
  children: React.ReactNode;
}) {
  if (shape === "diamond") {
    return (
      <div className="relative h-full w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
        <div className="relative flex h-full w-full items-center justify-center">{children}</div>
      </div>
    );
  }

  if (shape === "hexagon") {
    return (
      <div className="relative h-full w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
        <div className="relative flex h-full w-full items-center justify-center">{children}</div>
      </div>
    );
  }

  if (shape === "cylinder") {
    return (
      <div className="relative h-full w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="0" y="15" width="100" height="70" fill={fill} />
          <line x1="0" y1="15" x2="0" y2="85" stroke={stroke} strokeWidth="1.5" />
          <line x1="100" y1="15" x2="100" y2="85" stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="50" cy="85" rx="50" ry="15" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="50" cy="15" rx="50" ry="15" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
        <div className="relative flex h-full w-full items-center justify-center">{children}</div>
      </div>
    );
  }

  const borderRadius =
    shape === "circle" ? "9999px" : shape === "pill" ? "9999px" : "0.75rem";

  return (
    <div
      style={{ backgroundColor: fill, borderColor: stroke, borderRadius }}
      className="flex h-full w-full items-center justify-center border"
    >
      {children}
    </div>
  );
}

export function CanvasNodeRenderer({ data, selected }: CanvasNodeProps) {
  const textColor = NODE_COLORS.find((c) => c.fill === data.color)?.text ?? "#EDEDED";
  const strokeColor = selected ? "var(--accent-primary)" : "var(--border-subtle)";

  return (
    <div
      style={{ color: textColor }}
      className="flex h-full w-full items-center justify-center text-sm font-medium"
    >
      <ShapeFrame shape={data.shape} fill={data.color} stroke={strokeColor}>
        <span className="px-2 text-center leading-tight">{data.label}</span>
      </ShapeFrame>
      <Handle id="top" type="source" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="left" type="source" position={Position.Left} />
      <Handle id="right" type="source" position={Position.Right} />
    </div>
  );
}
