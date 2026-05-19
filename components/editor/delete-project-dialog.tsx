import { EditorDialog } from "./editor-dialog";
import { Button } from "@/components/ui/button";
import type { ProjectRecord } from "@/lib/projects";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProject: ProjectRecord | null;
  isLoading: boolean;
  onSubmit: () => void;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  targetProject,
  isLoading,
  onSubmit,
}: DeleteProjectDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description={
        targetProject
          ? `Are you sure you want to delete "${targetProject.name}"? This action cannot be undone.`
          : "This action cannot be undone."
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={isLoading || !targetProject}>
            Delete project
          </Button>
        </>
      }
    />
  );
}
