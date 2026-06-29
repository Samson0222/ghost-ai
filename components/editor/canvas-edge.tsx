"use client";

import { useState, useCallback } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from "@xyflow/react";
import type { EdgeProps, Edge } from "@xyflow/react";
import type { EdgeData } from "@/types/canvas";

type CanvasEdgeProps = EdgeProps<Edge<EdgeData, "canvasEdge">>;

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: CanvasEdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [hovered, setHovered] = useState(false);
  const { updateEdgeData } = useReactFlow();

  const label = data?.label ?? "";
  const isActive = selected || hovered;

  const commitEdit = useCallback(() => {
    updateEdgeData(id, { label: editValue });
    setIsEditing(false);
  }, [id, updateEdgeData, editValue]);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditValue(label);
    setIsEditing(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Enter" || e.key === "Escape") commitEdit();
  }

  const strokeColor = selected ? "var(--accent-primary)" : "#f8fafc";
  const strokeOpacity = isActive ? 1 : 0.38;

  return (
    <>
      {/* Wide invisible hit area — makes the edge easy to hover/click without thickening the visible line */}
      <path
        d={edgePath}
        fill="none"
        stroke="white"
        strokeOpacity={0}
        strokeWidth={16}
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={startEdit}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeOpacity,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          transition: "stroke-opacity 0.15s ease, stroke 0.15s ease",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan nowheel"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onDoubleClick={startEdit}
        >
          {isEditing ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag nopan nowheel rounded border border-border-subtle bg-surface px-2 py-0.5 text-center text-xs text-copy-primary focus:outline-none"
              style={{ width: `${Math.max(6, editValue.length + 2)}ch` }}
            />
          ) : label ? (
            <span className="select-none rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs text-copy-muted">
              {label}
            </span>
          ) : isActive ? (
            <span className="select-none rounded-full border border-dashed border-border-subtle px-2 py-0.5 text-xs text-copy-faint opacity-60">
              label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
