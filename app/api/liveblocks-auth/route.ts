import type { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { LiveblocksError } from "@liveblocks/node";
import { getProjectWithAccess } from "@/lib/project-access";
import { getLiveblocks, getUserColor } from "@/lib/liveblocks";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const room =
    typeof requestBody === "object" && requestBody !== null && "room" in requestBody
      ? requestBody.room
      : null;
  if (!room || typeof room !== "string") {
    return Response.json({ error: "Room ID required" }, { status: 400 });
  }

  const project = await getProjectWithAccess(room);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveblocks = getLiveblocks();

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  // Create the "ai-chat" feed server-side (REST) before the client ever
  // connects, rather than relying on the client's websocket-based
  // createFeed(). The websocket mutation path proved unreliable for a room's
  // very first feed creation — it uses a real-time locking/timeout mechanism
  // (fixed 5s client timeout) that can fail under contention, and a client
  // read that loses the race against a not-yet-created feed gets a permanent
  // FEED_NOT_FOUND error that never self-heals. Doing it here guarantees the
  // feed exists before any client-side read/write is ever attempted.
  try {
    await liveblocks.createFeed({ roomId: room, feedId: "ai-chat" });
  } catch (err) {
    // 409 (already exists) is expected on every call after the first for this
    // room — anything else is worth knowing about.
    if (!(err instanceof LiveblocksError && err.status === 409)) {
      console.error("Failed to create ai-chat feed", err);
    }
  }

  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : (user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "Unknown");

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name,
      avatar: user.imageUrl,
      color: getUserColor(user.id),
    },
  });

  // session.FULL_ACCESS only grants ["room:write"] — Liveblocks Feeds (used by
  // the AI chat/status feeds) require the separate "feeds:write" permission.
  session.allow(room, [...session.FULL_ACCESS, "feeds:write"]);

  const { status, body: authBody } = await session.authorize();
  return new Response(authBody, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
