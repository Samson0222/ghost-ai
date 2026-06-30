"use client";

import React from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { Canvas } from "./canvas";
import type { LoadTemplateFn, SaveStatus, ManualSaveFn } from "./canvas";

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-copy-faint">
            Unable to connect to canvas. Try refreshing.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CanvasRoomWrapperProps {
  roomId: string;
  loadTemplateRef?: React.MutableRefObject<LoadTemplateFn | null>;
  saveTriggerRef?: React.MutableRefObject<ManualSaveFn | null>;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

async function authorizeLiveblocksRoom(room?: string) {
  if (!room) {
    throw new Error("Liveblocks room ID is required");
  }

  const response = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ room }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Liveblocks auth failed with ${response.status}`);
  }

  return await response.json();
}

export function CanvasRoomWrapper({ roomId, loadTemplateRef, saveTriggerRef, onSaveStatusChange }: CanvasRoomWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint={authorizeLiveblocksRoom}>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <CanvasErrorBoundary key={roomId}>
          <ClientSideSuspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-copy-faint">Connecting…</p>
              </div>
            }
          >
            <Canvas
              loadTemplateRef={loadTemplateRef}
              saveTriggerRef={saveTriggerRef}
              projectId={roomId}
              onSaveStatusChange={onSaveStatusChange}
            />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
