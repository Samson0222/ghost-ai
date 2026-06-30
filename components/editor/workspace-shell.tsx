"use client";

import { useState, useRef, useCallback } from "react";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutTemplate, CloudUpload, Check, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogContext } from "./project-dialog-context";
import { CreateProjectDialog } from "./create-project-dialog";
import { RenameProjectDialog } from "./rename-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { ShareDialog } from "./share-dialog";
import { StarterTemplatesModal } from "./starter-templates-modal";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useShareDialog } from "@/hooks/use-share-dialog";
import { CanvasRoomWrapper } from "./canvas-room-wrapper";
import { AISidebar } from "./ai-sidebar";
import type { LoadTemplateFn, SaveStatus, ManualSaveFn } from "./canvas";
import type { ProjectRecord } from "@/lib/projects";

interface WorkspaceShellProps {
  project: ProjectRecord;
  myProjects: ProjectRecord[];
  sharedProjects: ProjectRecord[];
  isOwner: boolean;
}

export function WorkspaceShell({ project, myProjects, sharedProjects, isOwner }: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const loadTemplateRef = useRef<LoadTemplateFn | null>(null);
  const saveTriggerRef = useRef<ManualSaveFn | null>(null);
  const actions = useProjectActions();
  const share = useShareDialog(project.id);

  const handleSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  return (
    <ProjectDialogContext.Provider value={{ openCreate: actions.openCreate }}>
      <div className="flex h-screen flex-col overflow-hidden bg-base">
        <header className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center gap-3 border-b border-border-subtle bg-surface px-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="shrink-0 text-copy-muted hover:text-copy-primary"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-copy-primary">
            {project.name}
          </span>
          {saveStatus !== "idle" && (
            <span
              className={`flex shrink-0 items-center gap-1 text-xs ${
                saveStatus === "error" ? "text-red-400" : "text-copy-muted"
              }`}
            >
              {saveStatus === "saving" && (
                <><CloudUpload className="h-3.5 w-3.5 animate-pulse" />Saving…</>
              )}
              {saveStatus === "saved" && (
                <><Check className="h-3.5 w-3.5" />Saved</>
              )}
              {saveStatus === "error" && (
                <><CloudOff className="h-3.5 w-3.5" />Save failed</>
              )}
            </span>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={saveStatus === "saving"}
              onClick={() => saveTriggerRef.current?.()}
            >
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setIsTemplatesOpen(true)}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Templates
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={share.open}>
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAIPanelOpen((prev) => !prev)}
              className="text-copy-muted hover:text-copy-primary"
              aria-label="Toggle AI chat"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          myProjects={myProjects}
          sharedProjects={sharedProjects}
          onCreateProject={actions.openCreate}
          onRenameProject={actions.openRename}
          onDeleteProject={actions.openDelete}
          activeProjectId={project.id}
        />

        <div className={`flex flex-1 overflow-hidden pt-12 transition-[padding] duration-200 ${isSidebarOpen ? "sm:pl-72" : ""}`}>
          <main className="flex min-w-0 flex-1 overflow-hidden bg-base">
            <CanvasRoomWrapper
              roomId={project.id}
              loadTemplateRef={loadTemplateRef}
              saveTriggerRef={saveTriggerRef}
              onSaveStatusChange={handleSaveStatusChange}
            />
          </main>
        </div>

        <AISidebar isOpen={isAIPanelOpen} onClose={() => setIsAIPanelOpen(false)} />
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
      <ShareDialog
        open={share.isOpen}
        onOpenChange={(open) => { if (!open) share.close(); }}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
        collaborators={share.collaborators}
        isLoading={share.isLoading}
        inviteEmail={share.inviteEmail}
        onInviteEmailChange={share.setInviteEmail}
        isInviting={share.isInviting}
        inviteError={share.inviteError}
        onInvite={share.handleInvite}
        onRemove={share.handleRemove}
        copied={share.copied}
        onCopyLink={share.handleCopyLink}
      />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={(template) => loadTemplateRef.current?.(template)}
      />
    </ProjectDialogContext.Provider>
  );
}
