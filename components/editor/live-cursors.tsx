"use client";

import { useOthers } from "@liveblocks/react";
import { useViewport } from "@xyflow/react";

export function LiveCursors() {
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <>
      {others.map((other) => {
        const cursor = other.presence.cursor;
        if (!cursor) return null;

        const screenX = cursor.x * zoom + vpX;
        const screenY = cursor.y * zoom + vpY;
        const color = other.info?.color ?? "#6366f1";
        const name = other.info?.name ?? "Anonymous";

        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute z-50"
            style={{ left: screenX, top: screenY }}
          >
            <svg
              width="14"
              height="18"
              viewBox="0 0 14 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0L0 13L4 9.5L6.5 16L9 15L6.5 8.5L11.5 8.5Z"
                fill={color}
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
              style={{ backgroundColor: color, top: "12px", left: "10px" }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}
