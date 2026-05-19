import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AccessDenied } from "@/components/editor/access-denied";
import { getProjectWithAccess } from "@/lib/project-access";
import { getMyProjects, getSharedProjects } from "@/lib/projects";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

export default async function EditorWorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [project, myProjects, sharedProjects] = await Promise.all([
    getProjectWithAccess(roomId),
    getMyProjects(),
    getSharedProjects(),
  ]);

  if (!project) return <AccessDenied />;

  const { isOwner, ...projectRecord } = project;

  return (
    <WorkspaceShell
      project={projectRecord}
      myProjects={myProjects}
      sharedProjects={sharedProjects}
      isOwner={isOwner}
    />
  );
}
