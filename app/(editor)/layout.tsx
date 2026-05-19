import { EditorShell } from "@/components/editor/editor-shell";
import { getMyProjects, getSharedProjects } from "@/lib/projects";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [myProjects, sharedProjects] = await Promise.all([
    getMyProjects(),
    getSharedProjects(),
  ]);

  return (
    <EditorShell myProjects={myProjects} sharedProjects={sharedProjects}>
      {children}
    </EditorShell>
  );
}
