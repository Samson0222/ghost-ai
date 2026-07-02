import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectWithAccess } from "@/lib/project-access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await getProjectWithAccess(projectId);
  if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    specs.map((spec) => ({
      id: spec.id,
      createdAt: spec.createdAt,
      filename: `spec-${spec.id}.md`,
    }))
  );
}
