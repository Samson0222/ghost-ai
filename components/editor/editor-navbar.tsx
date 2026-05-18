"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

/**
 * Render the editor's fixed top navigation bar with a sidebar toggle button.
 *
 * @param isSidebarOpen - When `true`, the toggle shows the "close sidebar" icon; when `false`, it shows the "open sidebar" icon.
 * @param onSidebarToggle - Click handler invoked when the sidebar toggle button is pressed.
 * @returns A JSX element representing the editor's top navigation header.
 */
export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center px-3 bg-surface border-b border-border-subtle">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="text-copy-muted hover:text-copy-primary"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center" />
    </header>
  );
}
