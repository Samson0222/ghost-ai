import type { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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

  session.allow(room, session.FULL_ACCESS);

  const { status, body: authBody } = await session.authorize();
  return new Response(authBody, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
