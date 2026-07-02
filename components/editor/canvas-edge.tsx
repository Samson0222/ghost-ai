"use client";

import { useState, useCallback, useRef } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState({ dx: 0, dy: 0 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const { updateEdgeData, getViewport } = useReactFlow();

  const label = data?.label ?? "";
  const hasLabel = label.length > 0;
  const storedOffset = data?.labelOffset ?? { dx: 0, dy: 0 };
  const effectiveOffset = {
    dx: storedOffset.dx + dragDelta.dx,
    dy: storedOffset.dy + dragDelta.dy,
  };
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

  function handleLabelPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isEditing || !hasLabel) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setDragDelta({ dx: 0, dy: 0 });
  }

  function handleLabelPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !dragStartRef.current) return;
    e.stopPropagation();
    const { zoom } = getViewport();
    setDragDelta({
      dx: (e.clientX - dragStartRef.current.x) / zoom,
      dy: (e.clientY - dragStartRef.current.y) / zoom,
    });
  }

  function handleLabelPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !dragStartRef.current) return;
    e.stopPropagation();
    const { zoom } = getViewport();
    const finalOffset = {
      dx: storedOffset.dx + (e.clientX - dragStartRef.current.x) / zoom,
      dy: storedOffset.dy + (e.clientY - dragStartRef.current.y) / zoom,
    };
    dragStartRef.current = null;
    setIsDragging(false);
    setDragDelta({ dx: 0, dy: 0 });
    updateEdgeData(id, { labelOffset: finalOffset });
  }

  function handleLabelPointerCancel() {
    dragStartRef.current = null;
    setIsDragging(false);
    setDragDelta({ dx: 0, dy: 0 });
  }

  const strokeColor = selected ? "#ffffff" : "#f8fafc";
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
            transform: `translate(-50%, -50%) translate(${labelX + effectiveOffset.dx}px,${labelY + effectiveOffset.dy}px)`,
            pointerEvents: "all",
            cursor: hasLabel ? (isDragging ? "grabbing" : "grab") : undefined,
          }}
          className="nodrag nopan nowheel"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onDoubleClick={startEdit}
          onPointerDown={handleLabelPointerDown}
          onPointerMove={handleLabelPointerMove}
          onPointerUp={handleLabelPointerUp}
          onPointerCancel={handleLabelPointerCancel}
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
