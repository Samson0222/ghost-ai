"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 2000;
const RESET_IDLE_MS = 2500;

export function useCanvasAutosave(
  projectId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  onStatusChange?: (status: SaveStatus) => void
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const onStatusChangeRef = useRef(onStatusChange);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  onStatusChangeRef.current = onStatusChange;
  nodesRef.current = nodes;
  edgesRef.current = edges;

  function notify(next: SaveStatus) {
    setStatus(next);
    onStatusChangeRef.current?.(next);
    if (next === "saved" || next === "error") {
      if (resetRef.current) clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => {
        setStatus("idle");
        onStatusChangeRef.current?.("idle");
      }, RESET_IDLE_MS);
    }
  }

  const save = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    notify("saving");
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: nodesRef.current, edges: edgesRef.current }),
      });
      notify(res.ok ? "saved" : "error");
    } catch {
      notify("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, projectId]);

  useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, []);

  return { status, triggerSave: save };
}
