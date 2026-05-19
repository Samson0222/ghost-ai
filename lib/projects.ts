import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface ProjectRecord {
  id: string;
  name: string;
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
  return [];
}
