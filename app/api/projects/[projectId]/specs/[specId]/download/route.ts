import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, specId } = await params;

  const project = await getProjectWithAccess(projectId);
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const spec = await prisma.projectSpec.findUnique({ where: { id: specId } });
  if (!spec || spec.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const blobResponse = await fetch(spec.filePath, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!blobResponse.ok) {
    return NextResponse.json({ error: "Spec file not found" }, { status: 404 });
  }

  const content = await blobResponse.text();
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  });
}
