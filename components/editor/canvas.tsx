"use client";

import { useRef, useEffect } from "react";
import type { DragEvent } from "react";
import type React from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
import { Minus, Plus, Maximize2, Undo2, Redo2 } from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { ShapePanel, SHAPE_DRAG_TYPE } from "./shape-panel";
import type { ShapeDragPayload } from "./shape-panel";
import type { CanvasTemplate } from "./starter-templates";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };
const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#f8fafc" },
};
const LIVEBLOCKS_FLOW_STORAGE_KEY = "ghostCanvasFlow";

export type LoadTemplateFn = (template: CanvasTemplate) => void;

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

interface CanvasControlBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const btnBase =
  "flex h-7 w-7 items-center justify-center rounded-lg text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:opacity-40 disabled:cursor-not-allowed";

function CanvasControlBar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-3 z-10">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border-subtle bg-surface px-2 py-1.5 shadow-lg">
        <button onClick={onZoomOut} title="Zoom out (−)" aria-label="Zoom out" className={btnBase}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button onClick={onFitView} title="Fit view" aria-label="Fit view" className={btnBase}>
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={onZoomIn} title="Zoom in (+)" aria-label="Zoom in" className={btnBase}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-4 w-px bg-border-subtle" />
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className={btnBase}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className={btnBase}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

interface CanvasContentProps {
  loadTemplateRef?: React.MutableRefObject<LoadTemplateFn | null>;
}

function CanvasContent({ loadTemplateRef }: CanvasContentProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      storageKey: LIVEBLOCKS_FLOW_STORAGE_KEY,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition } = instance;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ instance, onUndo: undo, onRedo: redo });

  // Keep always-fresh refs so loadTemplate never closes over stale state
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  const instanceRef = useRef(instance);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  onNodesChangeRef.current = onNodesChange;
  onEdgesChangeRef.current = onEdgesChange;
  instanceRef.current = instance;

  useEffect(() => {
    if (!loadTemplateRef) return;
    loadTemplateRef.current = (template: CanvasTemplate) => {
      const curNodes = nodesRef.current;
      const curEdges = edgesRef.current;
      // Batch: remove all existing nodes/edges then add template nodes/edges
      onNodesChangeRef.current([
        ...curNodes.map((nd) => ({ type: "remove" as const, id: nd.id })),
        ...template.nodes.map((nd) => ({ type: "add" as const, item: nd })),
      ]);
      onEdgesChangeRef.current([
        ...curEdges.map((eg) => ({ type: "remove" as const, id: eg.id })),
        ...template.edges.map((eg) => ({ type: "add" as const, item: eg })),
      ]);
      setTimeout(() => instanceRef.current.fitView({ duration: 300 }), 100);
    };
    return () => {
      loadTemplateRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTemplateRef]);

  function insertShapeAtClientPoint(payload: ShapeDragPayload, point: { x: number; y: number }) {
    const position = screenToFlowPosition(point);
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

    insertShapeAtClientPoint(payload, { x: event.clientX, y: event.clientY });
  }

  function handleInsertShape(payload: ShapeDragPayload) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    insertShapeAtClientPoint(payload, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  return (
    <div
      ref={wrapperRef}
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
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#4a4a5a" />
        <Cursors />
      </ReactFlow>
      <ShapePanel onInsert={handleInsertShape} />
      <CanvasControlBar
        onZoomIn={() => instance.zoomIn({ duration: 200 })}
        onZoomOut={() => instance.zoomOut({ duration: 200 })}
        onFitView={() => instance.fitView({ duration: 300 })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}

interface CanvasProps {
  loadTemplateRef?: React.MutableRefObject<LoadTemplateFn | null>;
}

export function Canvas({ loadTemplateRef }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent loadTemplateRef={loadTemplateRef} />
    </ReactFlowProvider>
  );
}
