import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;

  const body = await request.json().catch(() => ({}));
  const name: string | undefined =
    typeof body?.name === "string" && body.name.trim() ? body.name.trim() : undefined;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const updatedCount = await prisma.project.updateMany({
    where: { id: projectId, ownerId: userId },
    data: { name },
  });

  if (updatedCount.count === 0) {
    const exists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!exists) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });
  if (!updated) {
    const exists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!exists) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;

  const deleted = await prisma.project.deleteMany({
    where: { id: projectId, ownerId: userId },
  });

  if (deleted.count === 0) {
    const exists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!exists) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return new Response(null, { status: 204 });
}
