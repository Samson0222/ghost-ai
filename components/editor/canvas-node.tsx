"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import { NODE_COLORS, type NodeData } from "@/types/canvas";

type CanvasNodeProps = NodeProps<Node<NodeData, "canvasNode">>;

export function CanvasNodeRenderer({ data, selected }: CanvasNodeProps) {
  const textColor = NODE_COLORS.find((c) => c.fill === data.color)?.text ?? "#EDEDED";

  return (
    <div
      style={{ backgroundColor: data.color, color: textColor }}
      className={`flex h-full w-full items-center justify-center rounded-xl border text-sm font-medium ${
        selected ? "border-brand" : "border-border-subtle"
      }`}
    >
      <span className="px-2 text-center leading-tight">{data.label}</span>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
