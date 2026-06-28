"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogContext } from "./project-dialog-context";
import { CreateProjectDialog } from "./create-project-dialog";
import { RenameProjectDialog } from "./rename-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectRecord } from "@/lib/projects";

interface EditorShellProps {
  children: React.ReactNode;
  myProjects: ProjectRecord[];
  sharedProjects: ProjectRecord[];
}

export function EditorShell({ children, myProjects, sharedProjects }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const actions = useProjectActions();

  return (
    <ProjectDialogContext.Provider value={{ openCreate: actions.openCreate }}>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          myProjects={myProjects}
          sharedProjects={sharedProjects}
          onCreateProject={actions.openCreate}
          onRenameProject={actions.openRename}
          onDeleteProject={actions.openDelete}
        />
        {children}
      </div>

      <CreateProjectDialog
        open={actions.activeDialog === "create"}
        onOpenChange={(open) => { if (!open) actions.close(); }}
        projectName={actions.projectName}
        onProjectNameChange={actions.setProjectName}
        roomId={actions.roomId}
        isLoading={actions.isLoading}
        onSubmit={actions.handleCreate}
      />

      <RenameProjectDialog
        open={actions.activeDialog === "rename"}
        onOpenChange={(open) => { if (!open) actions.close(); }}
        projectName={actions.projectName}
        onProjectNameChange={actions.setProjectName}
        targetProject={actions.targetProject}
        isLoading={actions.isLoading}
        onSubmit={actions.handleRename}
      />

      <DeleteProjectDialog
        open={actions.activeDialog === "delete"}
        onOpenChange={(open) => { if (!open) actions.close(); }}
        targetProject={actions.targetProject}
        isLoading={actions.isLoading}
        onSubmit={actions.handleDelete}
      />
    </ProjectDialogContext.Provider>
  );
}
