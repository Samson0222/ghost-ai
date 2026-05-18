"use client";

import { createContext, useContext } from "react";

interface ProjectDialogContextValue {
  openCreate: () => void;
}

export const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null);

export function useProjectDialogContext() {
  const ctx = useContext(ProjectDialogContext);
  if (!ctx) throw new Error("useProjectDialogContext must be used inside ProjectDialogContext.Provider");
  return ctx;
}
