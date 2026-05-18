"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Render a fixed left sidebar for project navigation containing tabbed sections and a "New Project" action.
 *
 * Displays "Projects" header with a close button, tabbed content for "My Projects" and "Shared", and an action button to create a new project.
 *
 * @param isOpen - Whether the sidebar is visible
 * @param onClose - Callback invoked when the close button is clicked
 * @returns The rendered project sidebar element
 */
export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
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
        <TabsContent value="my-projects" className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm text-copy-faint">No projects yet</p>
        </TabsContent>
        <TabsContent value="shared" className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm text-copy-faint">No shared projects</p>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
