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

let liveblocksClient: Liveblocks | undefined;

export function getLiveblocks(): Liveblocks {
  if (liveblocksClient) return liveblocksClient;
  if (globalThis.liveblocksClient) return globalThis.liveblocksClient;

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  }

  const client = new Liveblocks({ secret });
  liveblocksClient = client;
  globalThis.liveblocksClient = client;
  return client;
}
