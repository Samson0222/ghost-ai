import { createHash } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { idempotencyKeys, tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { designAgentTask } from "@/trigger/design-agent";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { prompt?: string; roomId?: string; projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt, roomId, projectId } = body;
  if (!prompt || !roomId || !projectId) {
    return NextResponse.json({ error: "Missing required fields: prompt, roomId, projectId" }, { status: 400 });
  }

  const payloadHash = createHash("sha256").update(`${userId}:${roomId}:${prompt}`).digest("hex");
  const idempotencyKey = await idempotencyKeys.create(payloadHash);
  const handle = await tasks.trigger<typeof designAgentTask>(
    "design-agent",
    { prompt, roomId },
    { idempotencyKey, idempotencyKeyTTL: "10m" }
  );

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId, userId },
  });

  return NextResponse.json({ runId: handle.id });
}
