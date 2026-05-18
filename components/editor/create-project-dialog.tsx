import { EditorDialog } from "./editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  slug: string;
  isLoading: boolean;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  slug,
  isLoading,
  onSubmit,
}: CreateProjectDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Project"
      description="Give your project a name to get started."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!projectName.trim() || isLoading}>
            Create project
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Project name"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          autoFocus
        />
        {slug && (
          <p className="text-xs text-copy-muted font-mono">
            <span className="text-copy-faint">Slug: </span>
            {slug}
          </p>
        )}
      </div>
    </EditorDialog>
  );
}
