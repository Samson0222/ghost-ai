"use client";

import { useOthers } from "@liveblocks/react";
import { useAuth, UserButton } from "@clerk/nextjs";

const MAX_VISIBLE = 5;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function PresenceAvatars() {
  const others = useOthers();
  const { userId } = useAuth();

  const collaborators = others.filter((other) => other.id !== userId);
  const visible = collaborators.slice(0, MAX_VISIBLE);
  const overflow = collaborators.length - MAX_VISIBLE;

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center">
      <div className="pointer-events-auto flex items-center gap-2">
        {visible.length > 0 && (
          <>
            <div className="flex items-center">
              {visible.map((other, i) => {
                const color = other.info?.color ?? "#6366f1";
                const name = other.info?.name ?? "";
                const avatar = other.info?.avatar ?? "";

                return (
                  <div
                    key={other.connectionId}
                    className="h-8 w-8 rounded-full"
                    title={name}
                    style={{
                      zIndex: MAX_VISIBLE - i,
                      marginLeft: i === 0 ? 0 : "-8px",
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="h-8 w-8 rounded-full object-cover"
                        style={{
                          boxShadow: `0 0 0 2px ${color}, 0 0 0 3.5px rgba(0,0,0,0.5)`,
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 0 2px ${color}, 0 0 0 3.5px rgba(0,0,0,0.5)`,
                        }}
                      >
                        {getInitials(name) || "?"}
                      </div>
                    )}
                  </div>
                );
              })}
              {overflow > 0 && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-elevated text-xs font-medium text-copy-secondary"
                  style={{ marginLeft: "-8px", zIndex: 0 }}
                  title={`${overflow} more`}
                >
                  +{overflow}
                </div>
              )}
            </div>
            <div className="h-5 w-px bg-border-subtle" />
          </>
        )}
        <UserButton />
      </div>
    </div>
  );
}
