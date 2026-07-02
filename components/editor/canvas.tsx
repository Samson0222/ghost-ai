"use client";

import { useRef, useEffect, useCallback } from "react";
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
  useNodes,
  useEdges,
  type Connection,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useUpdateMyPresence, useEventListener } from "@liveblocks/react";
import { LiveCursors } from "./live-cursors";
import { PresenceAvatars } from "./presence-avatars";
import { Minus, Plus, Maximize2, Undo2, Redo2 } from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas";
import { CanvasNodeRenderer } from "./canvas-node";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { ShapePanel, SHAPE_DRAG_TYPE } from "./shape-panel";
import type { ShapeDragPayload } from "./shape-panel";
import type { CanvasTemplate } from "./starter-templates";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

export type ManualSaveFn = () => void;
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
export type { SaveStatus };

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
    // grabOffsetX/Y are optional for backwards compatibility with older payloads
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
  saveTriggerRef?: React.MutableRefObject<ManualSaveFn | null>;
  projectId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

function CanvasContent({ loadTemplateRef, saveTriggerRef, projectId, onSaveStatusChange }: CanvasContentProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      storageKey: LIVEBLOCKS_FLOW_STORAGE_KEY,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const flowNodes = useNodes<CanvasNode>();
  const flowEdges = useEdges<CanvasEdge>();
  const { screenToFlowPosition } = instance;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const updateMyPresence = useUpdateMyPresence();

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ instance, onUndo: undo, onRedo: redo });

  // Keep always-fresh refs so loadTemplate never closes over stale state
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const flowNodesRef = useRef(flowNodes);
  const flowEdgesRef = useRef(flowEdges);
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  const onDeleteRef = useRef(onDelete);
  const instanceRef = useRef(instance);
  instanceRef.current = instance;

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    flowNodesRef.current = flowNodes;
    flowEdgesRef.current = flowEdges;
    onNodesChangeRef.current = onNodesChange;
    onEdgesChangeRef.current = onEdgesChange;
    onDeleteRef.current = onDelete;
  }, [nodes, edges, flowNodes, flowEdges, onNodesChange, onEdgesChange, onDelete]);

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

  // Load saved canvas from blob if the Liveblocks room is empty on mount
  useEffect(() => {
    if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return;

    let cancelled = false;

    async function loadSavedCanvas() {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`);
        if (!res.ok || cancelled) return;

        const data = (await res.json()) as { canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null };
        if (!data?.canvas || cancelled) return;

        const savedNodes = data.canvas.nodes ?? [];
        const savedEdges = data.canvas.edges ?? [];
        if (savedNodes.length === 0 && savedEdges.length === 0) return;

        onNodesChangeRef.current(savedNodes.map((nd) => ({ type: "add" as const, item: nd })));
        onEdgesChangeRef.current(savedEdges.map((eg) => ({ type: "add" as const, item: eg })));
        setTimeout(() => instanceRef.current.fitView({ duration: 300 }), 100);
      } catch {
        // silently skip if the load fails
      }
    }

    loadSavedCanvas();
    return () => { cancelled = true; };
  // Intentionally empty — runs once on mount; refs used for stable callbacks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { triggerSave } = useCanvasAutosave(projectId, nodes, edges, onSaveStatusChange);

  useEffect(() => {
    if (!saveTriggerRef) return;
    saveTriggerRef.current = triggerSave;
    return () => { saveTriggerRef.current = null; };
  }, [saveTriggerRef, triggerSave]);

  // AI-generated canvas updates are applied via Liveblocks events. Status/thinking
  // display lives entirely in the AI sidebar (ai-sidebar.tsx) — not on the canvas.
  useEventListener(({ event }) => {
    if (event.type === "AI_CANVAS_BATCH") {
      const parsed = JSON.parse(event.data) as { nodes: CanvasNode[]; edges: CanvasEdge[] };
      const newNodes = parsed.nodes;
      const newEdges = parsed.edges;

      if (event.replace) {
        const curNodes = nodesRef.current;
        const curEdges = edgesRef.current;
        onNodesChangeRef.current([
          ...curNodes.map((n) => ({ type: "remove" as const, id: n.id })),
          ...newNodes.map((n) => ({ type: "add" as const, item: n })),
        ]);
        onEdgesChangeRef.current([
          ...curEdges.map((e) => ({ type: "remove" as const, id: e.id })),
          ...newEdges.map((e) => ({ type: "add" as const, item: e })),
        ]);
      } else {
        onNodesChangeRef.current(newNodes.map((n) => ({ type: "add" as const, item: n })));
        onEdgesChangeRef.current(newEdges.map((e) => ({ type: "add" as const, item: e })));
      }

      setTimeout(() => instanceRef.current.fitView({ duration: 300 }), 100);
    }
  });

  // Delete/Backspace removes selected nodes and edges through Liveblocks.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) return;

      const selectedNodes = flowNodesRef.current.filter((n) => n.selected);
      const selectedEdges = flowEdgesRef.current.filter((eg) => eg.selected);
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      e.preventDefault();
      e.stopPropagation();

      const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
      const selectedEdgeIds = new Set(selectedEdges.map((edge) => edge.id));
      const connectedEdges = flowEdgesRef.current.filter(
        (edge) =>
          !selectedEdgeIds.has(edge.id) &&
          (selectedNodeIds.has(edge.source) || selectedNodeIds.has(edge.target))
      );

      onDeleteRef.current({
        nodes: selectedNodes,
        edges: [...selectedEdges, ...connectedEdges],
      });
    }

    wrapper.addEventListener("keydown", handleKeyDown, true);
    return () => wrapper.removeEventListener("keydown", handleKeyDown, true);
  // refs are stable — no deps needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDownCapture(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable
    ) return;

    wrapperRef.current?.focus({ preventScroll: true });
  }

  const reconnectSuccessful = useRef(true);

  const handleReconnectStart = useCallback(() => {
    reconnectSuccessful.current = false;
  }, []);

  const handleReconnect = useCallback(
    (oldEdge: CanvasEdge, newConnection: Connection) => {
      reconnectSuccessful.current = true;
      const updatedEdge: CanvasEdge = {
        ...oldEdge,
        source: newConnection.source ?? oldEdge.source,
        target: newConnection.target ?? oldEdge.target,
        sourceHandle: newConnection.sourceHandle ?? null,
        targetHandle: newConnection.targetHandle ?? null,
      };
      onEdgesChange([
        { type: "remove", id: oldEdge.id },
        { type: "add", item: updatedEdge },
      ]);
    },
    [onEdgesChange]
  );

  const handleReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: CanvasEdge) => {
      if (!reconnectSuccessful.current) {
        onEdgesChange([{ type: "remove", id: edge.id }]);
      }
      reconnectSuccessful.current = true;
    },
    [onEdgesChange]
  );

  function insertShapeAtClientPoint(payload: ShapeDragPayload, point: { x: number; y: number }) {
    // Adjust cursor position by grab offset so the node's top-left lands where
    // the user originally grabbed inside the drag button, then recenter to cursor.
    const grabX = payload.grabOffsetX ?? payload.width / 2;
    const grabY = payload.grabOffsetY ?? payload.height / 2;
    const topLeft = screenToFlowPosition({
      x: point.x - grabX,
      y: point.y - grabY,
    });
    const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;

    const newNode: CanvasNode = {
      id,
      type: "canvasNode",
      position: topLeft,
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

  function handleMouseMove(event: React.MouseEvent) {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    updateMyPresence({ cursor: position });
  }

  function handleMouseLeave() {
    updateMyPresence({ cursor: null });
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
      className="relative h-full w-full bg-base outline-none"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDownCapture={handlePointerDownCapture}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        reconnectRadius={20}
        onReconnectStart={handleReconnectStart}
        onReconnect={handleReconnect}
        onReconnectEnd={handleReconnectEnd}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#4a4a5a" />
      </ReactFlow>
      <LiveCursors />
      <PresenceAvatars />
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
  saveTriggerRef?: React.MutableRefObject<ManualSaveFn | null>;
  projectId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

export function Canvas({ loadTemplateRef, saveTriggerRef, projectId, onSaveStatusChange }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent
        loadTemplateRef={loadTemplateRef}
        saveTriggerRef={saveTriggerRef}
        projectId={projectId}
        onSaveStatusChange={onSaveStatusChange}
      />
    </ReactFlowProvider>
  );
}
