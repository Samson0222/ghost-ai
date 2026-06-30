import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface ProjectRecord {
  id: string;
  name: string;
  ownerName?: string | null;
}

export async function getMyProjects(): Promise<ProjectRecord[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSharedProjects(): Promise<ProjectRecord[]> {
  const user = await currentUser();
  if (!user) return [];
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return [];

  const collaborations = await prisma.projectCollaborator.findMany({
    where: { email },
    select: {
      project: { select: { id: true, name: true, ownerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (collaborations.length === 0) return [];

  const ownerIds = [...new Set(collaborations.map((c) => c.project.ownerId))];
  const ownerNameMap = new Map<string, string>();

  const CHUNK_SIZE = 100;
  try {
    const client = await clerkClient();
    for (let i = 0; i < ownerIds.length; i += CHUNK_SIZE) {
      const chunk = ownerIds.slice(i, i + CHUNK_SIZE);
      const { data: owners } = await client.users.getUserList({ userId: chunk, limit: chunk.length });
      for (const o of owners) {
        const parts = [o.firstName, o.lastName].filter(Boolean);
        ownerNameMap.set(
          o.id,
          parts.length > 0 ? parts.join(" ") : (o.primaryEmailAddress?.emailAddress ?? o.id)
        );
      }
    }
  } catch {
    // Clerk lookup failed — fall back to no owner name
  }

  return collaborations.map((c) => ({
    id: c.project.id,
    name: c.project.name,
    ownerName: ownerNameMap.get(c.project.ownerId) ?? null,
  }));
}
