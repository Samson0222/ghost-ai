"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

/**
 * Render the editor page layout with a top navigation, project sidebar, and centered canvas area.
 *
 * The component maintains local state for whether the sidebar is open and provides toggle and close
 * handlers to the `EditorNavbar` and `ProjectSidebar` respectively.
 *
 * @returns The React element for a full-height, columnar editor layout containing `EditorNavbar`, `ProjectSidebar`, and a centered main canvas area.
 */
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex flex-1 items-center justify-center pt-12 text-copy-muted text-sm">
        Canvas area
      </main>
    </div>
  );
}
