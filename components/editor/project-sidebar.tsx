"use client";

import Link from "next/link";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectRecord } from "@/lib/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  myProjects: ProjectRecord[];
  sharedProjects: ProjectRecord[];
  onCreateProject: () => void;
  onRenameProject: (project: ProjectRecord) => void;
  onDeleteProject: (project: ProjectRecord) => void;
  activeProjectId?: string;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  myProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  activeProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-12 z-40 flex h-[calc(100vh-3rem)] w-72 flex-col bg-surface border-r border-border transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-copy-muted hover:text-copy-primary"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden min-h-0">
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex flex-1 flex-col overflow-hidden min-h-0 mt-0 p-2">
            {myProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <p className="text-sm text-copy-faint">No projects yet</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-1">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      onOpen={onClose}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="shared" className="flex flex-1 flex-col overflow-hidden min-h-0 mt-0 p-2">
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <p className="text-sm text-copy-faint">No shared projects</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-0.5 p-1">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      onOpen={onClose}
                      showOwner
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full gap-2" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}

interface ProjectItemProps {
  project: ProjectRecord;
  isActive?: boolean;
  onOpen?: () => void;
  onRename?: (project: ProjectRecord) => void;
  onDelete?: (project: ProjectRecord) => void;
  showOwner?: boolean;
}

function ProjectItem({ project, isActive, onOpen, onRename, onDelete, showOwner }: ProjectItemProps) {
  return (
    <div className={`group flex items-center justify-between rounded-lg ${isActive ? "bg-subtle" : "hover:bg-subtle"}`}>
      <Link
        href={`/editor/${project.id}`}
        onClick={() => {
          if (window.matchMedia("(max-width: 639px)").matches) {
            onOpen?.();
          }
        }}
        aria-current={isActive ? "page" : undefined}
        className={`min-w-0 flex-1 truncate px-2 py-1.5 ${isActive ? "font-medium text-copy-primary" : "text-copy-secondary"}`}
      >
        <span className="block truncate text-sm">{project.name}</span>
        {showOwner && (
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className="truncate text-xs text-copy-faint">
              {project.ownerName ? `by ${project.ownerName}` : "Shared with you"}
            </span>
            <span className="shrink-0 rounded-full bg-brand/15 px-1.5 py-px text-[10px] font-medium text-brand">
              Collaborator
            </span>
          </span>
        )}
      </Link>
      {(onRename || onDelete) && (
        <div className="mr-1 flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onRename && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onRename(project);
              }}
              className="text-copy-muted hover:text-copy-primary"
              aria-label={`Rename ${project.name}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="text-copy-muted hover:text-destructive"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
