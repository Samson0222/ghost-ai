import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#7986CB",
  "#64B5F6",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#FFD54F",
  "#FF8A65",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

declare global {
  // eslint-disable-next-line no-var
  var liveblocksClient: Liveblocks | undefined;
}

export function getLiveblocks(): Liveblocks {
  if (globalThis.liveblocksClient) return globalThis.liveblocksClient;
  const client = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! });
  if (process.env.NODE_ENV !== "production") {
    globalThis.liveblocksClient = client;
  }
  return client;
}
