import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await getProjectWithAccess(projectId);
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Failed to save canvas" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await getProjectWithAccess(projectId);
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!record?.canvasJsonPath) {
    return NextResponse.json({ canvas: null });
  }

  const blobResponse = await fetch(record.canvasJsonPath, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!blobResponse.ok) {
    return NextResponse.json({ canvas: null });
  }

  const canvas = await blobResponse.json();
  return NextResponse.json({ canvas });
}
