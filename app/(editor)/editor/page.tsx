"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogContext } from "@/components/editor/project-dialog-context";

export default function EditorPage() {
  const { openCreate } = useProjectDialogContext();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 pt-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-lg font-medium text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
      </div>
      <Button onClick={openCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </main>
  );
}
