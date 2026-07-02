import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name: string = typeof body?.name === "string" && body.name.trim()
    ? body.name.trim()
    : "Untitled Project";

  // Accept the client-generated human-readable slug (e.g. "my-project-x3k9z").
  // Validate it strictly: lowercase alphanumeric + hyphens, 3–64 chars, no leading/trailing hyphens.
  const roomId: string | undefined =
    typeof body?.roomId === "string" &&
    /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(body.roomId)
      ? body.roomId
      : undefined;

  const project = await prisma.project.create({
    data: { ...(roomId ? { id: roomId } : {}), ownerId: userId, name },
  });

  return Response.json(project, { status: 201 });
}
