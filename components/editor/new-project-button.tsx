"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogContext } from "@/components/editor/project-dialog-context";

export function NewProjectButton() {
  const { openCreate } = useProjectDialogContext();
  return (
    <Button onClick={openCreate} className="gap-2">
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  );
}
