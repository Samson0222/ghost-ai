"use client";

import type { DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { ShapePanel, SHAPE_DRAG_TYPE } from "./shape-panel";
import type { ShapeDragPayload } from "./shape-panel";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const LIVEBLOCKS_FLOW_STORAGE_KEY = "ghostCanvasFlow";

let nodeCounter = 0;

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<ShapeDragPayload>;
  return (
    typeof payload.shape === "string" &&
    NODE_SHAPES.includes(payload.shape as ShapeDragPayload["shape"]) &&
    typeof payload.label === "string" &&
    payload.label.trim().length > 0 &&
    typeof payload.width === "number" &&
    Number.isFinite(payload.width) &&
    payload.width > 0 &&
    typeof payload.height === "number" &&
    Number.isFinite(payload.height) &&
    payload.height > 0
  );
}

function ViewportIndicator() {
  const { x, y, zoom } = useViewport();
  return (
    <div className="pointer-events-none absolute bottom-6 left-3 z-10 flex items-center gap-1.5 rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-copy-muted">
      <span>{Math.round(zoom * 100)}%</span>
      <span className="text-copy-faint">·</span>
      <span>
        {Math.round(-x / zoom)}, {Math.round(-y / zoom)}
      </span>
    </div>
  );
}

function CanvasContent() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      storageKey: LIVEBLOCKS_FLOW_STORAGE_KEY,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();

    const raw =
      event.dataTransfer.getData(SHAPE_DRAG_TYPE) ||
      event.dataTransfer.getData("application/x-ghost-shape") ||
      event.dataTransfer.getData("text/plain");
    if (!raw) return;

    let payload: ShapeDragPayload;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isShapeDragPayload(parsed)) return;
      payload = parsed;
    } catch {
      return;
    }

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;

    const newNode: CanvasNode = {
      id,
      type: "canvasNode",
      position: {
        x: position.x - payload.width / 2,
        y: position.y - payload.height / 2,
      },
      data: {
        label: payload.label,
        color: NODE_COLORS[0].fill,
        shape: payload.shape,
      },
      width: payload.width,
      height: payload.height,
    };

    onNodesChange([{ type: "add", item: newNode }]);
  }

  return (
    <div
      className="relative h-full w-full bg-base"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#4a4a5a" />
        <MiniMap
          style={{ background: "#111114", border: "1px solid #3a3a42" }}
          nodeColor="#444"
          maskColor="rgba(0,0,0,0.6)"
          nodeStrokeColor="transparent"
        />
        <Cursors />
      </ReactFlow>
      <ShapePanel />
      <ViewportIndicator />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
