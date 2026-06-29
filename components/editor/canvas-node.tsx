"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import { NODE_COLORS, type NodeData, type NodeShape } from "@/types/canvas";

type CanvasNodeProps = NodeProps<Node<NodeData, "canvasNode">>;

const MIN_WIDTH = 60;
const MIN_HEIGHT = 40;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function ColorSwatch({
  pair,
  isActive,
  onClick,
}: {
  pair: { fill: string; text: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { r, g, b } = hexToRgb(pair.text);

  let boxShadow: string;
  if (isActive) {
    boxShadow = "0 0 0 2px #fff";
  } else if (hovered) {
    boxShadow = `0 0 0 1px rgba(${r},${g},${b},0.5), 0 0 7px 2px rgba(${r},${g},${b},0.3)`;
  } else {
    boxShadow = "0 0 0 1px rgba(255,255,255,0.08)";
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: pair.fill, boxShadow }}
      className="nodrag nopan nowheel h-4 w-4 cursor-pointer rounded-full transition-all duration-150"
    />
  );
}

function ColorToolbar({
  activeColor,
  onSelect,
}: {
  activeColor: string;
  onSelect: (fill: string) => void;
}) {
  return (
    <div
      className="nodrag nopan nowheel absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-2.5 py-2 shadow-lg"
      style={{ bottom: "calc(100% + 10px)" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => (
        <ColorSwatch
          key={pair.fill}
          pair={pair}
          isActive={pair.fill === activeColor}
          onClick={() => onSelect(pair.fill)}
        />
      ))}
    </div>
  );
}

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

export function CanvasNodeRenderer({ id, data, selected }: CanvasNodeProps) {
  const textColor = NODE_COLORS.find((c) => c.fill === data.color)?.text ?? "#EDEDED";
  const strokeColor = selected ? "rgba(255,255,255,0.55)" : "var(--border-subtle)";

  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.textContent = data.label;
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  }, [isEditing, data.label]);

  const commitEdit = useCallback(() => {
    const newLabel = editRef.current?.textContent ?? "";
    updateNodeData(id, { label: newLabel });
    setIsEditing(false);
  }, [id, updateNodeData]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(true);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") cancelEdit();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    }
  }

  function handleColorSelect(fill: string) {
    updateNodeData(id, { color: fill });
  }

  return (
    <div
      style={{ color: textColor }}
      className="relative flex h-full w-full items-center justify-center overflow-visible text-sm font-medium"
      onDoubleClick={handleDoubleClick}
    >
      {selected && (
        <ColorToolbar activeColor={data.color} onSelect={handleColorSelect} />
      )}
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        lineStyle={{ borderColor: "rgba(255,255,255,0.3)" }}
        handleStyle={{
          width: 9,
          height: 9,
          background: "#ffffff",
          border: "none",
          borderRadius: "50%",
          opacity: 0.85,
        }}
      />
      <ShapeFrame shape={data.shape} fill={data.color} stroke={strokeColor}>
        {isEditing ? (
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan nowheel flex h-full w-full items-center justify-center px-2 text-center text-sm font-medium leading-tight focus:outline-none"
            style={{ color: textColor, wordBreak: "break-word" }}
          />
        ) : (
          <span className="px-2 text-center leading-tight">
            {data.label || (
              <span style={{ opacity: 0.35 }}>Label</span>
            )}
          </span>
        )}
      </ShapeFrame>
      <Handle id="top" type="source" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="left" type="source" position={Position.Left} />
      <Handle id="right" type="source" position={Position.Right} />
    </div>
  );
}
