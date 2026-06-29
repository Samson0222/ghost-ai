import { useEffect } from "react";

interface Zoomable {
  zoomIn: (options?: { duration?: number }) => void;
  zoomOut: (options?: { duration?: number }) => void;
}

interface Options {
  instance: Zoomable | null;
  onUndo: () => void;
  onRedo: () => void;
}

function isEditingField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useKeyboardShortcuts({ instance, onUndo, onRedo }: Options) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || isEditingField(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl && (e.key === "+" || e.key === "=")) {
        instance?.zoomIn({ duration: 200 });
        return;
      }

      if (!ctrl && e.key === "-") {
        instance?.zoomOut({ duration: 200 });
        return;
      }

      if (ctrl && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        onUndo();
        return;
      }

      if (ctrl && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        onRedo();
        return;
      }

      if (ctrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        onRedo();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [instance, onUndo, onRedo]);
}
