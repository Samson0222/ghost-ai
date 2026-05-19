import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  if (project.ownerId !== userId) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) return Response.json({ error: "Forbidden" }, { status: 403 });
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    });
    if (!collab) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  if (collaborators.length === 0) return Response.json([]);

  const emails = collaborators.map((c) => c.email);
  const clerkUserMap = new Map<string, { displayName: string | null; avatarUrl: string | null }>();

  try {
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({ emailAddress: emails });
    for (const u of clerkUsers) {
      for (const addr of u.emailAddresses) {
        const parts = [u.firstName, u.lastName].filter(Boolean);
        clerkUserMap.set(addr.emailAddress, {
          displayName: parts.length > 0 ? parts.join(" ") : null,
          avatarUrl: u.imageUrl || null,
        });
      }
    }
  } catch {
    // Clerk lookup failed — fall back to email-only
  }

  const enriched = collaborators.map((c) => ({
    id: c.id,
    email: c.email,
    displayName: clerkUserMap.get(c.email)?.displayName ?? null,
    avatarUrl: clerkUserMap.get(c.email)?.avatarUrl ?? null,
  }));

  return Response.json(enriched);
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const rawEmail: string | undefined =
    typeof body?.email === "string" && body.email.trim() ? body.email.trim() : undefined;

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = rawEmail.toLowerCase();

  const owner = await currentUser();
  const ownerEmail = owner?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (ownerEmail === email) {
    return Response.json({ error: "You are already the project owner" }, { status: 400 });
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId, email },
    });
    return Response.json(collaborator, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return Response.json({ error: "Already a collaborator" }, { status: 409 });
    }
    throw err;
  }
}
