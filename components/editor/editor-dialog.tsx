import { type ComponentProps, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditorDialogProps extends Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Render a modal dialog with a title, optional description, optional body content, and optional footer.
 *
 * @param open - Controlled open state for the dialog.
 * @param onOpenChange - Callback invoked when the dialog open state changes; receives the new open value.
 * @param title - The dialog title text.
 * @param description - Optional description text shown under the title.
 * @param children - Optional body content rendered between the header and footer.
 * @param footer - Optional footer content rendered inside the dialog footer.
 * @returns A React element representing the configured dialog.
 */
export function EditorDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: EditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="bg-elevated border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-copy-muted">{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
