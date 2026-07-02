import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await clerkAuth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { runId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { runId } = body;
  if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 });

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });
  if (!taskRun || taskRun.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
  });

  return NextResponse.json({ token: publicToken });
}
