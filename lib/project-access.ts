import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { ProjectRecord } from "@/lib/projects";

export interface CurrentUser {
  userId: string;
  email: string | null;
}

export interface ProjectWithRole extends ProjectRecord {
  isOwner: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  return { userId, email };
}

export async function getProjectWithAccess(projectId: string): Promise<ProjectWithRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!project) return null;

  if (project.ownerId === userId) {
    return { id: project.id, name: project.name, isOwner: true };
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return null;

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  });

  if (!collaborator) return null;
  return { id: project.id, name: project.name, isOwner: false };
}
