import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";
import type { generateSpecTask, GenerateSpecPayload } from "@/trigger/generate-spec";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<GenerateSpecPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { roomId, chatHistory, nodes, edges } = body;
  if (!roomId) {
    return NextResponse.json({ error: "Missing required field: roomId" }, { status: 400 });
  }

  const project = await getProjectWithAccess(roomId);
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory: chatHistory ?? [],
    nodes: nodes ?? [],
    edges: edges ?? [],
  });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId: project.id, userId },
  });

  return NextResponse.json({ runId: handle.id });
}
