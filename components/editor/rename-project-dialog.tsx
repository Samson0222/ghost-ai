import { EditorDialog } from "./editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/mock-projects";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  targetProject: Project | null;
  isLoading: boolean;
  onSubmit: () => void;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  targetProject,
  isLoading,
  onSubmit,
}: RenameProjectDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename Project"
      description={targetProject ? `Renaming "${targetProject.name}"` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!projectName.trim() || isLoading}>
            Rename
          </Button>
        </>
      }
    >
      <Input
        placeholder="Project name"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && projectName.trim()) onSubmit();
        }}
        autoFocus
      />
    </EditorDialog>
  );
}
