"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogContext } from "./project-dialog-context";
import { CreateProjectDialog } from "./create-project-dialog";
import { RenameProjectDialog } from "./rename-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs();

  return (
    <ProjectDialogContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          myProjects={dialogs.myProjects}
          onCreateProject={dialogs.openCreate}
          onRenameProject={dialogs.openRename}
          onDeleteProject={dialogs.openDelete}
        />
        {children}
      </div>

      <CreateProjectDialog
        open={dialogs.activeDialog === "create"}
        onOpenChange={(open) => { if (!open) dialogs.close(); }}
        projectName={dialogs.projectName}
        onProjectNameChange={dialogs.setProjectName}
        slug={dialogs.slug}
        isLoading={dialogs.isLoading}
        onSubmit={dialogs.handleCreate}
      />

      <RenameProjectDialog
        open={dialogs.activeDialog === "rename"}
        onOpenChange={(open) => { if (!open) dialogs.close(); }}
        projectName={dialogs.projectName}
        onProjectNameChange={dialogs.setProjectName}
        targetProject={dialogs.targetProject}
        isLoading={dialogs.isLoading}
        onSubmit={dialogs.handleRename}
      />

      <DeleteProjectDialog
        open={dialogs.activeDialog === "delete"}
        onOpenChange={(open) => { if (!open) dialogs.close(); }}
        targetProject={dialogs.targetProject}
        isLoading={dialogs.isLoading}
        onSubmit={dialogs.handleDelete}
      />
    </ProjectDialogContext.Provider>
  );
}
